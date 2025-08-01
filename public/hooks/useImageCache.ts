import { useCallback, useRef, useEffect, useState } from 'react';
import { getThumbnailCache } from '../services/cacheService';
import type {
  UseImageCacheReturn,
  ImageDimensions,
  ImageLoadStatus,
  CacheStats,
  PreloadOptions,
} from '../types/imageCache';

/**
 * 이미지 캐시 Hook
 * React 컴포넌트에서 썸네일 캐시 서비스를 쉽게 사용
 */
export const useImageCache = (): UseImageCacheReturn => {
  const cacheService = useRef(getThumbnailCache());
  const [_stats, setStats] = useState<CacheStats | null>(null);

  /**
   * 이미지 로딩
   */
  const loadImage = useCallback(async (url: string): Promise<ImageDimensions> => {
    try {
      return await cacheService.current.loadImage(url);
    } catch (error) {
      console.warn('이미지 로딩 실패:', url, error);
      // 기본 크기 반환
      return { width: 200, height: 150 };
    }
  }, []);

  /**
   * 이미지 배치 프리로딩
   */
  const preloadImages = useCallback(async (
    urls: string[],
    options?: PreloadOptions
  ): Promise<void> => {
    if (urls.length === 0) {return;}

    try {
      await cacheService.current.preloadImages(urls, options);
    } catch (error) {
      console.warn('이미지 프리로딩 실패:', error);
    }
  }, []);

  /**
   * 캐시된 크기 가져오기
   */
  const getCachedSize = useCallback((url: string): ImageDimensions | undefined => {
    return cacheService.current.getCachedSize(url);
  }, []);

  /**
   * 로딩 상태 가져오기
   */
  const getLoadStatus = useCallback((url: string): ImageLoadStatus => {
    return cacheService.current.getLoadStatus(url);
  }, []);

  /**
   * 캐시 클리어
   */
  const clearCache = useCallback(() => {
    cacheService.current.clear();
    setStats(null);
  }, []);

  /**
   * 소켓 연결 상태 설정
   */
  const setSocketConnected = useCallback((connected: boolean) => {
    cacheService.current.setSocketConnected(connected);
  }, []);

  /**
   * 캐시 통계 가져오기
   */
  const getStats = useCallback((): CacheStats => {
    const currentStats = cacheService.current.getStats();
    setStats(currentStats);
    return currentStats;
  }, []);

  /**
   * URL 유효성 검사
   */
  const isValidUrl = useCallback((url: string): boolean => {
    return cacheService.current.isValidUrl(url);
  }, []);

  /**
   * 주기적으로 통계 업데이트 (개발 모드에서만)
   */
  useEffect(() => {
    if (!__DEV__) {return;}

    const interval = setInterval(() => {
      getStats();
    }, 5000); // 5초마다 업데이트

    return () => clearInterval(interval);
  }, [getStats]);

  return {
    // 이미지 로딩
    loadImage,
    preloadImages,

    // 캐시 상태
    getCachedSize,
    getLoadStatus,

    // 캐시 관리
    clearCache,
    setSocketConnected,

    // 통계 및 디버그
    getStats,
    isValidUrl,
  };
};

/**
 * 단일 이미지 로딩을 위한 간단한 Hook
 */
export const useImageLoader = (url: string) => {
  const { loadImage, getCachedSize, getLoadStatus } = useImageCache();
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!url){return;}

    // 캐시 확인
    const cached = getCachedSize(url);
    if (cached) {
      setDimensions(cached);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await loadImage(url);
      setDimensions(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '로딩 실패');
      setDimensions({ width: 200, height: 150 }); // 기본값
    } finally {
      setIsLoading(false);
    }
  }, [url, loadImage, getCachedSize]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    dimensions,
    isLoading,
    error,
    reload: load,
    status: getLoadStatus(url),
  };
};

/**
 * 이미지 프리로딩을 위한 Hook
 */
export const useImagePreloader = () => {
  const { preloadImages, getStats } = useImageCache();
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedCount, setPreloadedCount] = useState(0);

  const preload = useCallback(async (
    urls: string[],
    options?: PreloadOptions
  ) => {
    if (urls.length === 0){return;}

    setIsPreloading(true);

    try {
      await preloadImages(urls, options);
      setPreloadedCount(prev => prev + urls.length);
    } catch (error) {
      console.warn('프리로딩 실패:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [preloadImages]);

  const reset = useCallback(() => {
    setPreloadedCount(0);
  }, []);

  return {
    preload,
    isPreloading,
    preloadedCount,
    reset,
    stats: getStats(),
  };
};

// 캐시 서비스 유틸리티 함수들도 export (기존 호환성을 위해)
export {
  getThumbnailCache,
  initializeThumbnailCache,
  ThumbnailCacheService,
} from '../services/cacheService';

export default useImageCache;
