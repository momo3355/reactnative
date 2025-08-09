/* eslint-disable react-hooks/exhaustive-deps */
import 'react-native-url-polyfill/auto';
import 'text-encoding';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Text,
} from 'react-native';

// 🚀 리팩토링된 hooks 사용
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { useChatMessages } from '../hooks/useChatMessages';
import { useImagePicker } from '../hooks/useImagePicker';
import { useAppState } from '../hooks/useAppState';
import { useImageCache } from '../hooks/useImageCache';

// 🚀 리팩토링된 components 사용 (경로 확인)
import { ChatHeader } from '../components/ChatHeader';
import { MessageItem } from '../components/MessageItem';
import { ChatInput } from '../components/ChatInput';
import { ImagePickerModal } from '../components/ImagePickerModal';
import { ImageViewModal } from '../components/ImageViewModal';
import { ImagePreview } from '../components/ImagePreview';

import { ChatItem, ChatRoomProps, MessgeInfoValue } from '../store/zustandboard/types';
import { styles } from '../styles/ChatRoom.styles';

// 🔥 타입 가드 헬퍼 함수들
const isMessageItem = (item: ChatItem): item is MessgeInfoValue => {
  return item.type !== 'DATE_SEPARATOR';
};

const hasImageInfo = (item: MessgeInfoValue): boolean => {
  return !!item.imageInfo;
};

const getImageInfoSafely = (item: ChatItem): string | undefined => {
  if (isMessageItem(item) && hasImageInfo(item)) {
    return item.imageInfo;
  }
  return undefined;
};

/**
 * 🚀 간소화된 ChatRoomScreen
 * 리팩토링된 구조에 맞게 단순화됨
 */
const ChatRoomScreen: React.FC<ChatRoomProps> = ({
  roomId,
  onBack,
  userId,
  token,
  userName,
}) => {
  // 🔥 리팩토링된 hooks 사용
  const { appState } = useAppState();
  const { preloadImages } = useImageCache();

  // 🔥 로컬 상태 관리 (복잡한 hook 대신 직접 관리)
  const [inputMessage, setInputMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>('');
  const [modalImageLoading, setModalImageLoading] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true); // 스크롤이 하단 근처에 있는지 추적
  const [hasNewMessage, setHasNewMessage] = useState(false); // 새 메시지 알림 표시 여부
  const [userScrolled, setUserScrolled] = useState(false); // 사용자가 의도적으로 스크롤했는지 추적
  const [isAutoScrolling, setIsAutoScrolling] = useState(false); // 자동 스크롤 중인지 추적

  // 🔥 refs
  const flatListRef = useRef<FlatList>(null);
  const lastScrollOffsetRef = useRef<number>(0); // 마지막 스크롤 위치 저장
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    chatItems,
    isLoadingMessages,
    hasMoreMessages,
    loadInitialMessages,
    loadPreviousMessages,
    addMessage,
    markMessagesAsRead,
  } = useChatMessages(roomId, userId);

  // 🔥 새 메시지 처리 함수 - 💥 핵심: 사용자가 스크롤한 상태면 절대 자동 스크롤 안함
  const handleNewMessage = useCallback((message: any) => {
    // 이미지 프리로딩
    if (message.imageInfo) {
      preloadImages([message.imageInfo], { priority: 'high' });
    }

    // 🚨 핵심 1: 사용자가 스크롤을 올린 상태라면 절대 자동 스크롤하지 않음
    if (userScrolled) {
      console.log('🚫 자동 스크롤 방지 - 사용자 스크롤 상태');
      setHasNewMessage(true);
      return;
    }

    // 🚨 핵심 2: 스크롤 위치가 하단(50px 이내)이 아니라면 자동 스크롤하지 않음
    if (lastScrollOffsetRef.current > 50) {
      console.log('🚫 자동 스크롤 방지 - 스크롤 위치 비하단 (offset:', lastScrollOffsetRef.current, ')');
      setHasNewMessage(true);
      setUserScrolled(true); // 명시적으로 userScrolled 설정
      return;
    }

    // 🚨 핵심 3: 자신이 보낸 메시지도 자동 스크롤 방지 (메시지 전송 시 이미 처리됨)
    if (message.sender === userId) {
      return;
    }

    // 모든 조건을 통과한 경우에만 자동 스크롤 (다른 사람 메시지 & 하단 위치)
    console.log('✅ 자동 스크롤 허용');
    setTimeout(() => {
      scrollToBottomSafe();
    }, 100);
  }, [userScrolled, isNearBottom, userId, preloadImages]);

  // 🔥 안전한 자동 스크롤 함수 - 삼중 체크 시스템
  const scrollToBottomSafe = useCallback(() => {
    // 이중 체크 1: userScrolled 상태 체크
    if (userScrolled) {
      console.log('⛔ 자동 스크롤 차단 - userScrolled');
      return;
    }

    // 이중 체크 2: 실제 스크롤 위치 체크
    if (lastScrollOffsetRef.current > 50) {
      console.log('⛔ 자동 스크롤 차단 - 비하단 위치');
      setUserScrolled(true);
      return;
    }

    // 이중 체크 3: 이미 자동 스크롤 중인지 체크
    if (isAutoScrolling) {
      console.log('⛔ 자동 스크롤 차단 - 스크롤 중');
      return;
    }
    
    console.log('✅ 자동 스크롤 실행');
    setIsAutoScrolling(true);
    
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    
    // 자동 스크롤 상태 해제
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }
    autoScrollTimeoutRef.current = setTimeout(() => {
      setIsAutoScrolling(false);
    }, 600);
  }, [userScrolled, isAutoScrolling]);

  // 🔥 강제 스크롤 함수 (메시지 전송, 버튼 클릭 등)
  const forceScrollToBottom = useCallback(() => {
    console.log('🚀 강제 스크롤 실행');
    setIsAutoScrolling(true);
    setUserScrolled(false); // 강제 스크롤 시에만 userScrolled 리셋
    
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }
    autoScrollTimeoutRef.current = setTimeout(() => {
      setIsAutoScrolling(false);
    }, 500);
  }, []);

  // 🔥 하단으로 스크롤 함수 (수동 버튼 클릭)
  const scrollToBottom = useCallback(() => {
    console.log('📍 수동 하단 스크롤 - 버튼 클릭');
    setHasNewMessage(false);
    setIsNearBottom(true);
    forceScrollToBottom();
  }, [forceScrollToBottom]);

  // 🔥 스크롤 핸들러 - 안정성 강화
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const currentOffset = contentOffset.y;

    // 🚨 자동 스크롤 중에는 사용자 스크롤 감지 제외
    if (isAutoScrolling) {
      lastScrollOffsetRef.current = currentOffset;
      return;
    }

    // 이전 오프셋과의 차이 계산
    const offsetDiff = Math.abs(currentOffset - lastScrollOffsetRef.current);

    // 사용자가 위로 스크롤한 경우 (효과적인 감지)
    if (!userScrolled) {
      // 조건 1: 오프셋이 50px 이상이면 스크롤로 간주
      if (currentOffset > 50) {
        console.log('🔥 사용자 스크롤 감지 (offset > 50)');
        setUserScrolled(true);
      }
      // 조건 2: 오프셋 차이가 30px 이상이면 스크롤로 간주 (의미있는 스크롤)
      else if (offsetDiff > 30) {
        console.log('🔥 사용자 스크롤 감지 (diff > 30)');
        setUserScrolled(true);
      }
    }

    lastScrollOffsetRef.current = currentOffset;

    // 상단 근처에서 이전 메시지 로드
    if (contentOffset.y > contentSize.height - layoutMeasurement.height - 100) {
      if (hasMoreMessages && !isLoadingMessages) {
        loadPreviousMessages();
      }
    }

    // 하단 근처 여부 확인 (안정적인 임계값)
    const BOTTOM_THRESHOLD = 50;
    const nearBottom = contentOffset.y <= BOTTOM_THRESHOLD;
    
    // isNearBottom 상태 업데이트 (배치로 제한)
    if (nearBottom !== isNearBottom) {
      setTimeout(() => {
        setIsNearBottom(nearBottom);
        if (nearBottom) {
          setHasNewMessage(false);
        }
      }, 0);
    }
  }, [hasMoreMessages, isLoadingMessages, loadPreviousMessages, isNearBottom, userScrolled, isAutoScrolling]);

  const {
    isConnected,
    sendMessage: sendWebSocketMessage,
    connect,
    disconnect,
  } = useChatWebSocket({
    roomId,
    userId,
    userName,
    token,
    onMessageReceived: (message) => {
      addMessage(message);
      // 🚀 새 메시지 처리
      handleNewMessage(message);
    },
    onUserEntered: markMessagesAsRead,
  });

  const {
    selectedImages,
    photoPickerVisible,
    galleryPhotos,
    loadingGallery,
    selectedPhotoIds,
    loadingMorePhotos,
    hasMorePhotos,
    showImagePickerOptions,
    closePhotoPickerModal,
    confirmPhotoSelection,
    removeSelectedImage,
    removeAllSelectedImages,
    togglePhotoSelection,
    loadMorePhotos,
    uploadAndSendImages,
    isUploadingImages,
  } = useImagePicker(roomId, userId, sendWebSocketMessage);

  // 🔥 이미지 모달 핸들러들
  const openImageModal = useCallback((imageUrl: string) => {
    setModalImageUrl(imageUrl);
    setModalImageLoading(true);
    setModalVisible(true);
  }, []);

  const closeImageModal = useCallback(() => {
    setModalVisible(false);
    setModalImageUrl('');
    setModalImageLoading(false);
  }, []);

  // 🔥 메시지 전송 핸들러 (텍스트 + 이미지 통합)
  const handleSendMessage = useCallback(async () => {
    // 이미지가 있는 경우 이미지 업로드 및 전송
    if (selectedImages.length > 0) {
      console.log('📸 이미지 전송 시작:', selectedImages.length, '개');
      try {
        await uploadAndSendImages();
        console.log('✅ 이미지 전송 완료');
        // 이미지 전송 후 강제 스크롤
        setTimeout(() => {
          forceScrollToBottom();
        }, 100);
      } catch (error) {
        console.error('❌ 이미지 전송 실패:', error);
      }
      return;
    }

    // 텍스트 메시지가 있는 경우
    if (!inputMessage.trim() || !isConnected) return;

    const messageText = inputMessage.trim();

    try {
      console.log('💬 텍스트 메시지 전송:', messageText);

      // 🔥 Optimistic Update: 메시지 전송 즉시 UI에 추가
      const optimisticMessage: MessgeInfoValue = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 🔥 고유한 임시 ID
        sender: userId,
        userName: userName,
        message: messageText,
        roomId: roomId,
        type: 'TALK',
        cretDate: new Date().toLocaleString('sv-SE').replace('T', ' ').substring(0, 19),
        isRead: '0',
        reUserId: '',
        userList: [],
        imageInfo: undefined,
      };

      // 즉시 UI에 메시지 추가
      addMessage(optimisticMessage);

      // 입력창 초기화 및 상태 리셋
      setInputMessage('');
      setHasNewMessage(false);
      setIsNearBottom(true);
      
      // 메시지 전송 후 강제 하단 스크롤 (사용자가 직접 전송했으므로)
      setTimeout(() => {
        forceScrollToBottom();
      }, 100);

      // 서버로 메시지 전송
      const success = await sendWebSocketMessage('TALK', messageText);

      if (success) {
        console.log('✅ 텍스트 메시지 전송 완료');
      } else {
        console.error('❌ 메시지 전송 실패');
      }
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
      // 오류 시 입력창 복원
      setInputMessage(messageText);
    }
  }, [inputMessage, isConnected, sendWebSocketMessage, selectedImages, uploadAndSendImages, userId, userName, roomId, addMessage, forceScrollToBottom]);

  // 🔥 이미지 프리로딩
  useEffect(() => {
    if (chatItems.length > 0) {
      const imageUrls = chatItems
        .map(item => getImageInfoSafely(item))
        .filter((url): url is string => !!url)
        .slice(0, 10); // 최근 10개만

      if (imageUrls.length > 0) {
        preloadImages(imageUrls, { priority: 'normal' });
      }
    }
  }, [chatItems, preloadImages]);

  // 🔥 초기화 로직
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('🔄 [ChatRoom] 채팅 초기화 시작');
        
        // 초기 상태 설정
        setUserScrolled(false);
        setIsNearBottom(true);
        setHasNewMessage(false);
        setIsAutoScrolling(false);
        lastScrollOffsetRef.current = 0;
        
        await loadInitialMessages();

        if (appState === 'active') {
          connect();
        }

        console.log('✅ [ChatRoom] 채팅 초기화 완료');
      } catch (error) {
        console.error('❌ [ChatRoom] 채팅 초기화 오류:', error);
      }
    };

    initializeChat();

    return () => {
      console.log('🧹 [ChatRoom] 정리');
      disconnect();
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, [roomId, appState, connect, disconnect, loadInitialMessages]);

  // 🔥 앱 상태 변화 처리
  useEffect(() => {
    if (appState === 'active' && !isConnected) {
      console.log('🚀 [ChatRoom] 앱 활성화 - 소켓 재연결');
      connect();
    }
  }, [appState, isConnected, connect]);

  // 🔥 렌더링 최적화된 renderItem
  const renderItem = useCallback(({ item, index }: { item: ChatItem; index: number }) => (
    <MessageItem
      item={item}
      userId={userId}
      onImagePress={openImageModal}
      currentIndex={index}
    />
  ), [userId, openImageModal]);

  const keyExtractor = useCallback((item: ChatItem) => item.id, []);

  // 🔥 리스트 푸터 컴포넌트
  const ListFooterComponent = useCallback(() => {
    if (!hasMoreMessages || !isLoadingMessages) return null;

    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#FEE500" />
      </View>
    );
  }, [hasMoreMessages, isLoadingMessages]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FEE500" barStyle="dark-content" />

      <ChatHeader
        onBack={onBack}
        isConnected={isConnected}
        title="채팅방"
      />

      <View style={styles.messagesContainer}>
        {isLoadingMessages && chatItems.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FEE500" />
          </View>
        ) : (
          <View>
          <FlatList
            ref={flatListRef}
            data={chatItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            inverted={true}
            removeClippedSubviews={true}
            windowSize={8}
            initialNumToRender={12}
            maxToRenderPerBatch={6}
            updateCellsBatchingPeriod={50}
            scrollEventThrottle={32}
            onScroll={handleScroll}
            ListFooterComponent={ListFooterComponent}
            // 🔥 스크롤 위치 유지 설정 (새 메시지 추가 시 안정성 향상)
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 1,
            }}
            // 🔥 레이아웃 안정성 향상
            getItemLayout={undefined} // 동적 높이를 위해 undefined로 설정
          />
          </View>
        )}
      </View>

      <ImagePreview
        selectedImages={selectedImages}
        onRemoveImage={removeSelectedImage}
        onRemoveAll={removeAllSelectedImages}
      />

      {/* 새 메시지 알림 버튼 */}
      {hasNewMessage && (
        <View style={{
          position: 'absolute',
          bottom: 80,
          alignSelf: 'center',
          zIndex: 1000,
        }}>
          <TouchableOpacity
            onPress={scrollToBottom}
            style={{
              backgroundColor: '#FEE500',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Text style={{
              color: '#000',
              fontSize: 14,
              fontWeight: '500',
              marginRight: 4,
            }}>
              새 메시지
            </Text>
            <Text style={{
              color: '#000',
              fontSize: 16,
            }}>
              ↓
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ChatInput
        inputMessage={inputMessage}
        onChangeText={setInputMessage}
        onSend={handleSendMessage}
        onImagePicker={showImagePickerOptions}
        selectedImages={selectedImages}
        isConnected={isConnected}
        isUploading={isUploadingImages}
      />

      <ImagePickerModal
        visible={photoPickerVisible}
        galleryPhotos={galleryPhotos}
        loadingGallery={loadingGallery}
        selectedPhotoIds={selectedPhotoIds}
        loadingMorePhotos={loadingMorePhotos}
        hasMorePhotos={hasMorePhotos}
        onClose={closePhotoPickerModal}
        onConfirm={confirmPhotoSelection}
        onTogglePhoto={togglePhotoSelection}
        onLoadMore={loadMorePhotos}
      />

      <ImageViewModal
        visible={modalVisible}
        imageUrl={modalImageUrl}
        loading={modalImageLoading}
        onClose={closeImageModal}
        onLoadEnd={() => setModalImageLoading(false)}
      />
    </SafeAreaView>
  );
};

export default ChatRoomScreen;
