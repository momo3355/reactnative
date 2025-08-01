import 'react-native-url-polyfill/auto';
import 'text-encoding';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  StatusBar,
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

  // 🔥 refs
  const flatListRef = useRef<FlatList>(null);

  const {
    chatItems,
    isLoadingMessages,
    hasMoreMessages,
    loadInitialMessages,
    loadPreviousMessages,
    addMessage,
    markMessagesAsRead,
  } = useChatMessages(roomId, userId);

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
    uploadAndSendImages,    // ✅ 추가!
    isUploadingImages,
  } = useImagePicker(roomId, userId, sendWebSocketMessage);

  // 🔥 새 메시지 처리 함수
  const handleNewMessage = useCallback((message: any) => {
    // 이미지 프리로딩
    if (message.imageInfo) {
      preloadImages([message.imageInfo], { priority: 'high' });
    }

    // 스크롤 처리 (새 메시지가 오면 자동으로 하단으로)
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  }, [preloadImages]);

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
      } catch (error) {
        console.error('❌ 이미지 전송 실패:', error);
      }
      return;
    }

    // 텍스트 메시지가 있는 경우
    if (!inputMessage.trim() || !isConnected) {return;}

    try {
      console.log('💬 텍스트 메시지 전송:', inputMessage.trim());
      const success = await sendWebSocketMessage('TALK', inputMessage.trim());
      if (success) {
        setInputMessage('');
        console.log('✅ 텍스트 메시지 전송 완료');
      }
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
    }
  }, [inputMessage, isConnected, sendWebSocketMessage, selectedImages, uploadAndSendImages]);

  // 🔥 스크롤 핸들러
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // 상단 근처에서 이전 메시지 로드
    if (contentOffset.y > contentSize.height - layoutMeasurement.height - 100) {
      if (hasMoreMessages && !isLoadingMessages) {
        loadPreviousMessages();
      }
    }
  }, [hasMoreMessages, isLoadingMessages, loadPreviousMessages]);

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
    if (!hasMoreMessages || !isLoadingMessages) {return null;}

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

            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}

            onScroll={handleScroll}
            ListFooterComponent={ListFooterComponent}
          />
        )}
      </View>

      <ImagePreview
        selectedImages={selectedImages}
        onRemoveImage={removeSelectedImage}
        onRemoveAll={removeAllSelectedImages}
      />

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
