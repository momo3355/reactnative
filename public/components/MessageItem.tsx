import React, { useCallback, useMemo } from 'react';
import { View, Text } from 'react-native';
import { MessgeInfoValue, DateSeparator, ChatItem } from '../store/zustandboard/types';
import { styles } from '../styles/ChatRoom.styles';
import { getThumbnailCache } from '../services/cacheService';
import { getMessageImageUrl, getOriginalImageUrl, formatTime } from '../utils/chatUtils';

// 🚀 리팩토링된 컴포넌트들 import
import { ThumbnailImage } from './ThumbnailImage';
import { ProfileImage } from './ProfileImage';
import {
  ReadStatus,
  DateSeparator as DateSeparatorComponent,
  TextMessage,
  EnterMessage,
} from './MessageComponents';

interface MessageItemProps {
  item: ChatItem;
  userId: string;
  onImagePress: (imageUrl: string) => void;
  onImageLoad?: (messageId: string, imageUrl: string) => void;
  allMessages?: MessgeInfoValue[];
  currentIndex?: number;
}

/**
 * 🚀 간소화된 메시지 아이템 컴포넌트
 * 리팩토링된 구조를 사용하여 더욱 간단해짐
 */
export const MessageItem: React.FC<MessageItemProps> = React.memo(({
  item,
  userId,
  onImagePress,
  onImageLoad,
}) => {
  const cacheService = getThumbnailCache();

  // 🔥 메시지 데이터 메모이제이션
  const message = useMemo(() =>
    item.type !== 'DATE_SEPARATOR' ? item as MessgeInfoValue : null,
    [item]
  );

  const isMyMessage = useMemo(() =>
    message ? message.sender === userId : false,
    [message, userId]
  );

  const isImageMessage = useMemo(() =>
    message ? message.type === 'IMAGE' : false,
    [message]
  );

  const isEnterMessage = useMemo(() =>
    message ? message.type === 'ENTER' : false,
    [message]
  );

  // 🔥 이미지 URL 메모이제이션
  const imageUrl = useMemo(() => {
    if (isImageMessage && message) {
      const url = getMessageImageUrl(message.imageInfo || '');
      console.log('🖼️ 이미지 URL 생성:', {
        messageId: message.id,
        imageInfo: message.imageInfo,
        generatedUrl: url
      });
      return url;
    }
    return '';
  }, [isImageMessage, message]);

  const formattedTime = useMemo(() => {
    return message ? formatTime(message.cretDate) : '';
  }, [message]);

  const senderName = useMemo(() => {
    if (!message) return '';
    return message.userName || message.sender || 'Unknown';
  }, [message]);

  const messageText = useMemo(() => {
    if (!message) return '';
    return message.message || '';
  }, [message]);

  // 🔥 이미지 클릭 핸들러
  const handleImagePress = useCallback(() => {
    if (message && message.imageInfo) {
      const originalImageUrl = getOriginalImageUrl(message.imageInfo);
      onImagePress(originalImageUrl);

      // 원본 이미지 프리로드
      cacheService.preloadImages([originalImageUrl], { priority: 'high' });
    }
  }, [message, onImagePress, cacheService]);

  const handleImageLoadComplete = useCallback(() => {
    if (onImageLoad && message && message.imageInfo) {
      onImageLoad(message.id, getMessageImageUrl(message.imageInfo));
    }
  }, [message, onImageLoad]);

  // 🔥 조건부 렌더링 (Hook 호출 이후)
  if (item.type === 'DATE_SEPARATOR') {
    return <DateSeparatorComponent date={(item as DateSeparator).date} />;
  }

  if (!message) {
    return null;
  }

  if (isEnterMessage) {
    return (
      <EnterMessage
        message={messageText}
        time={formattedTime}
      />
    );
  }

  // 🔥 내 메시지 렌더링
  if (isMyMessage) {
    return (
      <View style={styles.myMessageContainer}>
        <View style={styles.myMessageContent}>
          <View style={styles.messageRow}>
            {/* 🔥 시간과 읽음 상태를 세로 배치 (오른쪽 정렬) */}
            <View style={styles.myTimeReadColumn}>
              <ReadStatus isRead={message.isRead} isMyMessage={true} />
              <Text style={styles.messageTime}>{formattedTime}</Text>
            </View>

            {isImageMessage ? (
              <View style={styles.myImageBubbleContainer}>
                <ThumbnailImage
                  imageUrl={imageUrl}
                  isMyMessage={true}
                  onPress={handleImagePress}
                  onLoad={handleImageLoadComplete}
                />
              </View>
            ) : (
              <TextMessage message={messageText} isMyMessage={true} />
            )}
          </View>
        </View>
      </View>
    );
  }

  // 🔥 받은 메시지 렌더링
  return (
    <View style={styles.receivedMessageContainer}>
      <ProfileImage sender={message.sender} />

      <View style={styles.receivedMessageContent}>
        <Text style={styles.receivedSenderName}>{senderName}</Text>

        <View style={styles.messageRow}>
          {isImageMessage ? (
            <View style={styles.receivedImageBubbleContainer}>
              <ThumbnailImage
                imageUrl={imageUrl}
                isMyMessage={false}
                onPress={handleImagePress}
                onLoad={handleImageLoadComplete}
              />
            </View>
          ) : (
            <TextMessage message={messageText} isMyMessage={false} />
          )}
          
          {/* 🔥 시간과 읽음 상태를 세로 배치 (왼쪽 정렬) */}
          <View style={styles.receivedTimeReadColumn}>
            <ReadStatus isRead={message.isRead} isMyMessage={false} />
            <Text style={styles.messageTime}>{formattedTime}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  if (prevProps.item.type === 'DATE_SEPARATOR' && nextProps.item.type === 'DATE_SEPARATOR') {
    return (prevProps.item as DateSeparator).date === (nextProps.item as DateSeparator).date;
  }

  if (prevProps.item.type !== 'DATE_SEPARATOR' && nextProps.item.type !== 'DATE_SEPARATOR') {
    const prevMessage = prevProps.item as MessgeInfoValue;
    const nextMessage = nextProps.item as MessgeInfoValue;

    return (
      prevMessage.id === nextMessage.id &&
      prevMessage.isRead === nextMessage.isRead &&
      prevMessage.message === nextMessage.message &&
      prevProps.userId === nextProps.userId &&
      prevProps.currentIndex === nextProps.currentIndex
    );
  }

  return false;
});

MessageItem.displayName = 'MessageItem';

// 🚀 간소화된 유틸리티 함수들 - 리팩토링된 서비스 사용
export const clearImageCache = () => {
  const cache = getThumbnailCache();
  cache.clear();
};

export const preloadVisibleImages = async (messages: MessgeInfoValue[]) => {
  const cache = getThumbnailCache();

  const imageUrls = messages
    .filter(msg => msg.type === 'IMAGE' && msg.imageInfo)
    .map(msg => getMessageImageUrl(msg.imageInfo!))
    .filter(url => url && typeof url === 'string');

  if (imageUrls.length > 0) {
    await cache.preloadImages(imageUrls, { priority: 'normal' });
  }
};

export const setSocketConnected = (connected: boolean) => {
  const cache = getThumbnailCache();
  cache.setSocketConnected(connected);
};

export const getThumbnailCacheDebugInfo = () => {
  const cache = getThumbnailCache();
  return cache.getStats();
};

// 호환성을 위한 추가 별칭들
export const clearThumbnailCache = clearImageCache;
export const preloadThumbnailImages = preloadVisibleImages;
export const setThumbnailSocketConnected = setSocketConnected;
export const forceEnableThumbnailCache = () => setSocketConnected(true);
export const checkThumbnailCacheStatus = getThumbnailCacheDebugInfo;
export const getImageCacheDebugInfo = getThumbnailCacheDebugInfo;
export const forceEnableSocket = forceEnableThumbnailCache;
export const checkSocketStatus = checkThumbnailCacheStatus;

export default MessageItem;
