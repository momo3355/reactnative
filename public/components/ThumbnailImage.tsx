import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, Text } from 'react-native';
import { useImageCache } from '../hooks/useImageCache';
import type { ThumbnailImageProps, ImageDimensions } from '../types/imageCache';
import { styles } from '../styles/ChatRoom.styles';

/**
 * 최적화된 썸네일 이미지 컴포넌트
 * 새로운 이미지 캐시 서비스 사용
 */
export const ThumbnailImage: React.FC<ThumbnailImageProps> = React.memo(({ 
  imageUrl, 
  isMyMessage, 
  onPress, 
  onLoad,
  dimensions: propDimensions
}) => {
  const { loadImage, getCachedSize, getLoadStatus } = useImageCache();
  
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>(
    propDimensions || { width: 200, height: 150 }
  );
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);
  const loadStartTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 이미지 로딩 로직
  useEffect(() => {
    if (!imageUrl || !mountedRef.current) {
      setLoadState('error');
      return;
    }

    // 캐시 즉시 확인
    const cachedSize = getCachedSize(imageUrl);
    if (cachedSize) {
      setImageDimensions(cachedSize);
      setLoadState('loaded');
      onLoad?.();
      return;
    }

    // 로딩 시작
    setLoadState('loading');
    loadStartTimeRef.current = Date.now();

    loadImage(imageUrl)
      .then((dimensions) => {
        if (!mountedRef.current) return;

        setImageDimensions(dimensions);
        setLoadState('loaded');
        setRetryCount(0);
        onLoad?.();
      })
      .catch((error) => {
        if (!mountedRef.current) return;

        const loadTime = Date.now() - loadStartTimeRef.current;
        console.error(`🚫 썸네일 로딩 실패: ${loadTime}ms`, error);
        setLoadState('error');
        setRetryCount(prev => prev + 1);
        setImageDimensions({ width: 200, height: 150 });
      });
  }, [imageUrl, loadImage, getCachedSize, onLoad]);

  // 빠른 재시도 핸들러
  const handleQuickRetry = useCallback(() => {
    if (retryCount >= 3) return; // 최대 3회 재시도
    
    setLoadState('loading');
    setRetryCount(prev => prev + 1);
    
    setTimeout(() => {
      loadImage(imageUrl)
        .then((dimensions) => {
          if (!mountedRef.current) return;
          setImageDimensions(dimensions);
          setLoadState('loaded');
          onLoad?.();
        })
        .catch(() => {
          if (!mountedRef.current) return;
          setLoadState('error');
        });
    }, 500); // 0.5초 후 재시도
  }, [imageUrl, loadImage, onLoad, retryCount]);

  const containerStyle = isMyMessage ? styles.myImageContainer : styles.receivedImageContainer;
  const imageStyle = isMyMessage ? styles.myMessageImage : styles.receivedMessageImage;

  // 에러 상태 UI
  if (loadState === 'error') {
    return (
      <View style={[
        containerStyle, 
        { 
          width: imageDimensions.width, 
          height: 100, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#f8f8f8',
          borderWidth: 1,
          borderColor: '#e0e0e0',
          borderRadius: 8
        }
      ]}>
        <TouchableOpacity 
          onPress={handleQuickRetry} 
          style={{ alignItems: 'center' }}
          disabled={retryCount >= 3}
        >
          <Text style={{ fontSize: 16, marginBottom: 2 }}>📷</Text>
          <Text style={{ color: '#999', fontSize: 10, textAlign: 'center' }}>
            {retryCount >= 3 ? '로딩 실패' : '탭하여 재시도'}
          </Text>
          {retryCount > 0 && (
            <Text style={{ color: '#ccc', fontSize: 8 }}>
              ({retryCount}/3)
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // 로딩 상태 UI
  if (loadState === 'loading') {
    return (
      <View style={[
        containerStyle, 
        { 
          width: imageDimensions.width, 
          height: imageDimensions.height,
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#fafafa'
        }
      ]}>
        <ActivityIndicator size="small" color="#FEE500" />
        <Text style={{ color: '#999', fontSize: 9, marginTop: 4 }}>
          로딩 중...
        </Text>
      </View>
    );
  }

  // 정상 이미지 UI
  return (
    <View style={[containerStyle, { width: imageDimensions.width }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Image 
          source={{ 
            uri: imageUrl,
            cache: 'force-cache'
          }}
          style={[
            imageStyle, 
            { 
              width: imageDimensions.width, 
              height: imageDimensions.height
            }
          ]}
          resizeMode="cover"
          fadeDuration={150}
          onLoad={() => {
            if (mountedRef.current && loadState !== 'loaded') {
              setLoadState('loaded');
              onLoad?.();
            }
          }}
          onError={(error) => {
            console.error('🖼️ 썸네일 렌더링 에러:', error.nativeEvent.error);
            if (mountedRef.current) {
              setLoadState('error');
            }
          }}
        />        
      </TouchableOpacity>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.imageUrl === nextProps.imageUrl && 
    prevProps.isMyMessage === nextProps.isMyMessage &&
    JSON.stringify(prevProps.dimensions) === JSON.stringify(nextProps.dimensions)
  );
});

ThumbnailImage.displayName = 'ThumbnailImage';

export default ThumbnailImage;