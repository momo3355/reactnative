// 이미지 캐시 관련 타입 정의

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CacheItem {
  dimensions: ImageDimensions;
  status: ImageLoadStatus;
  timestamp: number;
  retryCount: number;
}

export type ImageLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface CacheStats {
  cached: number;
  loading: number;
  failed: number;
  promises: number;
  socketConnected: boolean;
  avgLoadTime: string;
  cacheHitRate: string;
}

export interface CacheConfig {
  maxRetries: number;
  loadTimeout: number;
  retryDelay: number;
  prefetchTimeout: number;
  getSizeTimeout: number;
  maxHeight: number;
  minHeight: number;
  fixedWidth: number;
  batchSize: number;
  batchDelay: number;
}

export interface PreloadOptions {
  maxImages?: number;
  priority?: 'high' | 'normal' | 'low';
  socketRequired?: boolean;
}

export interface ImageCacheEvent {
  type: 'loaded' | 'failed' | 'cleared' | 'preloaded';
  url: string;
  dimensions?: ImageDimensions;
  error?: string;
  timestamp: number;
}

export interface ImageCacheService {
  loadImage(url: string): Promise<ImageDimensions>;
  preloadImages(urls: string[], options?: PreloadOptions): Promise<void>;
  getCachedSize(url: string): ImageDimensions | undefined;
  getLoadStatus(url: string): ImageLoadStatus;
  clear(): void;
  setSocketConnected(connected: boolean): void;
  getStats(): CacheStats;
  isValidUrl(url: string): boolean;
}

export interface UseImageCacheReturn {
  // 이미지 로딩
  loadImage: (url: string) => Promise<ImageDimensions>;
  preloadImages: (urls: string[], options?: PreloadOptions) => Promise<void>;
  
  // 캐시 상태
  getCachedSize: (url: string) => ImageDimensions | undefined;
  getLoadStatus: (url: string) => ImageLoadStatus;
  
  // 캐시 관리
  clearCache: () => void;
  setSocketConnected: (connected: boolean) => void;
  
  // 통계 및 디버그
  getStats: () => CacheStats;
  isValidUrl: (url: string) => boolean;
}

export interface ThumbnailImageProps {
  imageUrl: string;
  isMyMessage: boolean;
  onPress: () => void;
  onLoad?: () => void;
  dimensions?: ImageDimensions;
}

export interface ImagePreloadData {
  url: string;
  priority: number;
  retryCount: number;
  lastAttempt: number;
}
