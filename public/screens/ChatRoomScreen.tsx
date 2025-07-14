// 폴리필 import (컴포넌트 파일 맨 위에 추가)
import 'react-native-url-polyfill/auto';
import 'text-encoding';

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Alert, Image,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// 이미지 선택을 위한 라이브러리
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { chatPostStore } from '../store/zustandboard/chatPostStore'; // API 함수 import
import { SearchChatRoomParams } from  '../store/zustandboard/types'; // 타입 import

type Message = {
  id: string;
  message: string;
  sender: string;
  timestamp: Date;
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'IMAGE' | 'TALK';
  imageUrl?: string;
  profileImage?: string; 
};

type Props = {
  roomId: string;
  onBack: () => void;
  userId?: string;
  userName?: string;
  serverUrl?: string;
  userProfileImage?: string; 
};

const ChatRoomScreen: React.FC<Props> = ({ 
  roomId, 
  onBack, 
  userId = 'test', 
  userName = "사용자" + Math.floor(Math.random() * 1000),
  serverUrl = 'http://132.226.225.178:8888/ws-stomp'
}) => {

  const { success, chatFileUpload } = chatPostStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [previewImageUri, setPreviewImageUri] = useState<string>('');
  const [previewImageFileName, setPreviewImageFileName] = useState<string>('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<{[key: string]: {width: number, height: number}}>({});

  const stompClient = useRef<Client | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // 유틸리티 함수들
  const getStorageKey = () => `chat_messages_${roomId}`;
  const getFullImageUrl = (url: string) => url.startsWith('http') ? url : `http://132.226.225.178:8888${url}`;
  
 const normalizeTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'number') return new Date(timestamp);
  if (typeof timestamp === 'string') {
    // ISO 문자열 형태인지 확인 (예: "2024-01-01T12:00:00.000Z")
    if (timestamp.includes('T') && timestamp.includes(':')) {
      const date = new Date(timestamp);
      // 유효한 날짜인지 확인
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // 숫자 문자열인지 확인 (타임스탬프)
    const parsed = parseInt(timestamp);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }
    // 마지막 시도로 Date 생성자에 직접 전달
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  console.warn('Invalid timestamp format:', timestamp);
  return new Date();
};

  const formatTime = (timestamp: Date | number | string) => {
    try {
      const date = normalizeTimestamp(timestamp);
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Seoul'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Seoul'
      });
    }
  };

  // 스토리지 관련 함수들
  const saveMessagesToStorage = async (messagesToSave: Message[]) => {
    try {
      const messagesToStore = messagesToSave.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      }));
      
      await AsyncStorage.setItem(getStorageKey(), JSON.stringify(messagesToStore));
      console.log('Messages saved to storage:', messagesToSave.length);
    } catch (error) {
      console.error('Error saving messages to storage:', error);
    }
  };

  const loadMessagesFromStorage = async () => {
    try {
      setIsLoadingMessages(true);
      const jsonValue = await AsyncStorage.getItem(getStorageKey());
      
      if (jsonValue !== null) {
        const savedMessages: Message[] = JSON.parse(jsonValue);
        const processedMessages = savedMessages.map(msg => ({
          ...msg,
          timestamp: normalizeTimestamp(msg.timestamp)
        }));
        
        setMessages(processedMessages);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
      }
    } catch (error) {
      console.error('Error loading messages from storage:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const clearChatHistory = async () => {
    try {
      await AsyncStorage.removeItem(getStorageKey());
      setMessages([]);
      Alert.alert('알림', '채팅 기록이 삭제되었습니다.');
    } catch (error) {
      console.error('Error clearing chat history:', error);
      Alert.alert('오류', '채팅 기록 삭제에 실패했습니다.');
    }
  };

  // 이미지 관련 함수들
  const getImageDimensions = (imageUri: string, messageIndex: number) => {
    Image.getSize(imageUri, (width, height) => {
      const maxWidth = 200;
      const aspectRatio = width / height;
      const calculatedHeight = maxWidth / aspectRatio;
      
      setImageDimensions(prev => ({
        ...prev,
        [messageIndex]: { width: maxWidth, height: calculatedHeight }
      }));
    }, (error) => {
      console.error('Failed to get image dimensions:', error);
    });
  };

  const selectImage = () => {
    Alert.alert(
      '이미지 선택',
      '이미지를 선택하는 방법을 선택하세요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '갤러리에서 선택', onPress: () => openImagePicker('library') },
        { text: '카메라로 촬영', onPress: () => openImagePicker('camera') },
      ]
    );
  };

  const openImagePicker = (type: 'library' | 'camera') => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };
    
    const callback = (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) return;
      
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setPreviewImageUri(asset.uri);
          setPreviewImageFileName(asset.fileName || 'image.jpg');
        }
      }
    };
    
    if (type === 'library') {
      launchImageLibrary(options, callback);
    } else {
      launchCamera(options, callback);
    }
  };

  const removePreviewImage = () => {
    setPreviewImageUri('');
    setPreviewImageFileName('');
  };

  const uploadImageToServer = async (imageUri: string, fileName: string) => {
    try {
      const uploadParams: SearchChatRoomParams = {
        imageFiles: [{
          uri: imageUri,
          type: 'image/jpeg',
          name: fileName,
        }],
        roomId: roomId,
        userId: userId,
      };

      const response = await chatFileUpload(uploadParams);
      
      if (response.success && response.files && response.files.length > 0) {
        const fileUrl = response.files[0].fileUrl;
        return { 
          imageUrl: getFullImageUrl(fileUrl),
          success: true,
          fileInfo: response.files[0]
        };
      } else {
        throw new Error(response.errorMsg || '업로드 실패');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  };

  // 메시지 전송 관련 함수들
  const sendMessage = () => {
    if (!messageInput.trim() || !stompClient.current || !isConnected) return;

    const messageToSend = {
      sender: userId,
      message: messageInput.trim(),
      timestamp: new Date().getTime(),
      sessionId,
      username: userName,
      roomId,
      type: 'TALK',
      profileImage : "http://132.226.225.178:8888/uploads/profile/profileimg.jpg",
    };

    stompClient.current.publish({
      destination: `/pub/chat/message`,
      body: JSON.stringify(messageToSend)
    });

    setMessageInput('');
  };

  const sendImageMessage = async (imageUri: string, fileName: string) => {
    if (!stompClient.current || !isConnected) return;

    setIsUploading(true);
    try {
      const uploadResponse = await uploadImageToServer(imageUri, fileName);
      
      if (uploadResponse.success) {
        const messageToSend = {
          sender: userId,
          message: '이미지를 전송했습니다.',
          timestamp: new Date().getTime(),
          sessionId,
          username: userName,
          roomId,
          type: 'IMAGE',
          imageUrl: uploadResponse.imageUrl,
          profileImage : "http://132.226.225.178:8888/uploads/profile/profileimg.jpg",
        };

        stompClient.current.publish({
          destination: `/pub/chat/message`,
          body: JSON.stringify(messageToSend)
        });
      } else {
        throw new Error('이미지 업로드 실패');
      }
    } catch (error) {
      console.error('이미지 전송 실패:', error);
      Alert.alert('오류', '이미지 전송에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (previewImageUri) {
      await sendImageMessage(previewImageUri, previewImageFileName);
      removePreviewImage();
    } else if (messageInput.trim()) {
      sendMessage();
    }
  };

  // WebSocket 관련 함수들
  const connectToWebSocket = () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    
    try {
      const socket = new SockJS(serverUrl);
      
      stompClient.current = new Client({
        webSocketFactory: () => socket,
        debug: (str) => console.log('STOMP Debug:', str),
        onConnect: (frame) => {
          console.log('Connected:', frame);
          setSessionId(`session-${Date.now()}`);
          setIsConnected(true);
          setIsConnecting(false);
          subscribeToRoom();
          sendJoinMessage();
        },
        onDisconnect: () => {
          console.log('Disconnected');
          setIsConnected(false);
          setIsConnecting(false);
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
          setIsConnecting(false);
          Alert.alert('연결 오류', '서버 연결에 실패했습니다.');
        },
        onWebSocketError: (event) => {
          console.error('WebSocket Error:', event);
          setIsConnecting(false);
          Alert.alert('연결 오류', 'WebSocket 연결에 실패했습니다.');
        }
      });

      stompClient.current.activate();
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnecting(false);
      Alert.alert('연결 오류', '서버 연결 중 오류가 발생했습니다.');
    }
  };

  const subscribeToRoom = () => {
    if (!stompClient.current) return;

    stompClient.current.subscribe(`/sub/chat/room/${roomId}`, (message) => {
      const receivedMessage: Message = JSON.parse(message.body);
      
      // 이미지 URL 정규화
      if (receivedMessage.imageUrl) {
        receivedMessage.imageUrl = getFullImageUrl(receivedMessage.imageUrl);
      }

      // 중복 메시지 방지
      setMessages(prev => {
        const receivedTimestamp = normalizeTimestamp(receivedMessage.timestamp).getTime();
        
        const isDuplicate = prev.some(msg => {
          const msgTimestamp = normalizeTimestamp(msg.timestamp).getTime();
          return msgTimestamp === receivedTimestamp && 
                 msg.sender === receivedMessage.sender &&
                 msg.message === receivedMessage.message;
        });
        
        if (isDuplicate) return prev;
        return [...prev, receivedMessage];
      });
      
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });
  };

  const sendJoinMessage = () => {
    if (!stompClient.current || !isConnected) return;

    const joinMessage = {
      roomId,
      sender: userId,
      content: `${userName}님이 입장했습니다.`,
      type: 'JOIN'
    };

    stompClient.current.publish({
      destination: `/sub/chat/room/${roomId}`,
      body: JSON.stringify(joinMessage)
    });
  };

  const disconnect = () => {
    if (stompClient.current) {
      if (isConnected) {
        const leaveMessage = {
          roomId,
          sender: userId,
          content: `${userName}님이 퇴장했습니다.`,
          type: 'LEAVE'
        };

        stompClient.current.publish({
          destination: `/app/chat/${roomId}/leave`,
          body: JSON.stringify(leaveMessage)
        });
      }

      stompClient.current.deactivate();
      stompClient.current = null;
    }
  };

  // 렌더링 함수들
  const renderProfileImage = (isMyMessage: boolean, message: Message) => {
    if (isMyMessage) return null;
    
    return (
      <View style={styles.profileImageContainer}>
        <Image 
          source={{ 
            uri: message.profileImage || 'https://via.placeholder.com/40x40.png?text=User'
          }}
          style={styles.profileImage}
          resizeMode="contain"
        />
      </View>
    );
  };

  const renderMessage = (message: Message, index: number) => {
    const isMyMessage = message.sender === userId;
    const isSystemMessage = message.type === 'JOIN' || message.type === 'LEAVE';
    const isImageMessage = message.type === 'IMAGE';
    
    if (isSystemMessage) {
      return (
        <View key={index} style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{message.message}</Text>
        </View>
      );
    }

    const messageTime = formatTime(message.timestamp);
    const timeElement = (
      <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.otherMessageTime]}>
        {messageTime}
      </Text>
    );

    if (isImageMessage && message.imageUrl) {
      const dimensions = imageDimensions[index];
      
      if (!dimensions) {
        getImageDimensions(message.imageUrl, index);
      }

      return (
        <View key={index} style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}>
          <View style={styles.messageRowContainer}>
            {renderProfileImage(isMyMessage, message)}
            <View style={styles.messageContentContainer}>
              {!isMyMessage && <Text style={styles.senderName}>{message.sender}</Text>}
              <View style={[
                styles.messageWithTimeContainer,
                isMyMessage ? styles.myMessageWithTimeContainer : styles.otherMessageWithTimeContainer
              ]}>
                {isMyMessage && timeElement}
                <View style={[
                  styles.imageMessageContainer,
                  dimensions && { width: dimensions.width, height: dimensions.height }
                ]}>
                  <TouchableOpacity onPress={() => {
                    setSelectedImage(message.imageUrl!);
                    setIsImageModalVisible(true);
                  }}>
                    <Image 
                      source={{ uri: message.imageUrl }}
                      style={[
                        styles.messageImage,
                        dimensions && { width: dimensions.width, height: dimensions.height }
                      ]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
                {!isMyMessage && timeElement}
              </View>
            </View>
          </View>        
        </View>
      );
    }

    // 일반 텍스트 메시지
    return (
      <View key={index} style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={styles.messageRowContainer}>
          {renderProfileImage(isMyMessage, message)}
          <View style={styles.messageContentContainer}>
            {!isMyMessage && <Text style={styles.senderName}>{message.sender}</Text>}
            <View style={[
              styles.messageWithTimeContainer,
              isMyMessage ? styles.myMessageWithTimeContainer : styles.otherMessageWithTimeContainer
            ]}>
              {isMyMessage && timeElement}
              <View style={[
                styles.messageBubble,
                isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  isMyMessage ? styles.myMessageText : styles.otherMessageText
                ]}>
                  {message.message}
                </Text>
              </View>
              {!isMyMessage && timeElement}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Effects
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages]);

  useEffect(() => {
    loadMessagesFromStorage().then(() => {
      connectToWebSocket();
    });
    
    return () => {
      disconnect();
    };
  }, []);

  const handleGoBack = () => {
    disconnect();
    onBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← 뒤로</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>채팅방</Text>
          <View style={styles.connectionStatus}>
            <View style={[
              styles.statusDot,
              isConnected ? styles.connectedDot : styles.disconnectedDot
            ]} />
            <Text style={styles.statusText}>
              {isConnecting ? '연결 중...' : isConnected ? '연결됨' : '연결 안됨'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={() => {
            Alert.alert(
              '채팅 기록 삭제',
              '모든 채팅 기록을 삭제하시겠습니까?',
              [
                { text: '취소', style: 'cancel' },
                { text: '삭제', onPress: clearChatHistory, style: 'destructive' }
              ]
            );
          }}
        >
          <Text style={styles.clearButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {isLoadingMessages ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>메시지를 불러오는 중...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 메시지가 없습니다.</Text>
            <Text style={styles.emptySubText}>첫 메시지를 보내보세요!</Text>
          </View>
        ) : (
          messages.map(renderMessage)
        )}
      </ScrollView>

      {previewImageUri && (
        <View style={styles.imagePreviewContainer}>
          <View style={styles.imagePreviewWrapper}>
            <Image 
              source={{ uri: previewImageUri }}
              style={styles.previewImageSmall}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={removePreviewImage}
            >
              <Text style={styles.removeImageButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.previewImageText}>사진이 선택되었습니다</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder={previewImageUri ? "사진과 함께 보낼 메시지" : "메시지를 입력하세요..."}
          multiline
          maxLength={1000}
          editable={isConnected}
        />
        <TouchableOpacity 
          style={[
            styles.imageButton,
            (!isConnected || isUploading) && styles.imageButtonDisabled
          ]}
          onPress={selectImage}
          disabled={!isConnected || isUploading}
        >
          <Text style={styles.imageButtonText}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!messageInput.trim() && !previewImageUri || !isConnected) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={(!messageInput.trim() && !previewImageUri) || !isConnected}
        >
          <Text style={[
            styles.sendButtonText,
            (!messageInput.trim() && !previewImageUri || !isConnected) && styles.sendButtonTextDisabled
          ]}>
            {isUploading ? '전송 중...' : '전송'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseArea}
            onPress={() => setIsImageModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <Image 
                source={{ uri: selectedImage }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setIsImageModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  connectedDot: {
    backgroundColor: '#4CAF50',
  },
  disconnectedDot: {
    backgroundColor: '#f44336',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  headerSpace: {
    width: 60,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
    width: '100%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 8,
  },
  messageWithTimeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessageWithTimeContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageWithTimeContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: '#007bff',
  },
  otherMessageBubble: {
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    marginRight: 8,
  },
  otherMessageTime: {
    marginLeft: 8,
  },
  systemMessage: {
    alignSelf: 'center',
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  systemMessageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  imageButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  imageButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  imageButtonText: {
    fontSize: 20,
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#007bff',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#999',
  },
  
  // 이미지 메시지 관련 스타일 - 완전히 새로운 구조
  imageMessageContainer: {
    // 말풍선 배경 없이 이미지만 표시
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageTextBubble: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: 200,
  },
  myImageTextBubble: {
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
  },
  otherImageTextBubble: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  imageMessageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  
  // 이미지 모달 관련 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 400,
    borderRadius: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  modalCloseButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },

  imagePreviewContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  previewImageSmall: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  removeImageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewImageText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  clearButtonText: {
    fontSize: 18,
  },
    // 기존 스타일에 추가
  messageRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  
  messageContentContainer: {
    flex: 1,
    marginLeft: 8, // 프로필 이미지와의 간격
  },
  profileImageContainer: {
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
});

export default ChatRoomScreen;