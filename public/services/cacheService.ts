import { Image } from 'react-native';
import {
  ImageDimensions,
  CacheItem,
  ImageLoadStatus,
  CacheStats,
  CacheConfig,
  PreloadOptions,
  ImageCacheService,
  ImagePreloadData
} from '../types/imageCache';

/**
 * 썸네일 최적화 이미지 캐시 서비스
 * 이미지 로딩, 캐싱, 프리로딩을 관리
 */
export class ThumbnailCacheService implements ImageCacheService {
  private static instance: ThumbnailCacheService;
  
  // 캐시 스토리지
  private cache = new Map<string, CacheItem>();
  private failedUrls = new Set<string>();
  private loadingPromises = new Map<string, Promise<ImageDimensions>>();
  private preloadQueue: ImagePreloadData[] = [];
  
  // 상태 관리
  private socketConnected = true;
  private isPreloadingPaused = false;
  private isProcessingQueue = false;
  
  // 설정
  private config: CacheConfig = {
    maxRetries: 1,
    loadTimeout: 5000,
    retryDelay: 800,
    prefetchTimeout: 3000,
    getSizeTimeout: 2000,
    maxHeight: 400,
    minHeight: 80,
    fixedWidth: 200,
    batchSize: 3,
    batchDelay: 100
  };

  private constructor() {
    console.log('🚀 ThumbnailCache 서비스 초기화');
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  static getInstance(): ThumbnailCacheService {
    if (!ThumbnailCacheService.instance) {
      ThumbnailCacheService.instance = new ThumbnailCacheService();
    }
    return ThumbnailCacheService.instance;
  }

  /**
   * 소켓 연결 상태 설정
   */
  setSocketConnected(connected: boolean): void {
    if (this.socketConnected === connected) return;
    
    this.socketConnected = connected;
    
    if (!connected) {
      this.isPreloadingPaused = true;
      this.loadingPromises.clear();
      
      // 로딩 중인 항목들을 idle 상태로 되돌림
      for (const [url, item] of this.cache.entries()) {
        if (item.status === 'loading') {
          this.cache.set(url, { ...item, status: 'idle' });
        }
      }
    } else {
      this.isPreloadingPaused = false;
      console.log('🔌 썸네일 캐시 재개');
    }
  }

  /**
   * 이미지 로딩 (메인 API)
   */
  async loadImage(url: string): Promise<ImageDimensions> {
    if (!this.isValidUrl(url)) {
      throw new Error('Invalid URL');
    }

    // 캐시 확인
    const cached = this.getCachedSize(url);
    if (cached && !this.isDefaultSize(cached)) {
      return cached;
    }

    // 실패한 URL 빠른 반환
    if (this.failedUrls.has(url)) {
      const defaultSize = this.getDefaultSize();
      this.updateCache(url, defaultSize, 'error');
      return defaultSize;
    }

    // 이미 로딩 중인 경우
    const existingPromise = this.loadingPromises.get(url);
    if (existingPromise) {
      return existingPromise;
    }

    // 새로운 로딩 시작
    const loadPromise = this.performLoad(url);
    this.loadingPromises.set(url, loadPromise);

    try {
      const result = await loadPromise;
      return result;
    } finally {
      this.loadingPromises.delete(url);
    }
  }

  /**
   * 실제 로딩 수행
   */
  private async performLoad(url: string): Promise<ImageDimensions> {
    const cacheItem = this.cache.get(url);
    const currentRetry = cacheItem?.retryCount || 0;
    
    this.updateCache(url, this.getDefaultSize(), 'loading', currentRetry);

    try {
      const result = await Promise.race([
        this.fastGetSize(url),
        this.createTimeout(this.config.loadTimeout)
      ]);

      this.updateCache(url, result, 'loaded', 0);
      return result;

    } catch (error) {
      if (currentRetry < this.config.maxRetries) {
        const newRetryCount = currentRetry + 1;
        this.updateCache(url, this.getDefaultSize(), 'idle', newRetryCount);
        
        await this.delay(this.config.retryDelay);
        return this.performLoad(url);
      } else {
        this.failedUrls.add(url);
        const defaultSize = this.getDefaultSize();
        this.updateCache(url, defaultSize, 'error');
        return defaultSize;
      }
    }
  }

  /**
   * 빠른 이미지 크기 가져오기
   */
  private async fastGetSize(url: string): Promise<ImageDimensions> {
    return new Promise<ImageDimensions>((resolve, reject) => {
      const timeoutId = setTimeout(() => 
        reject(new Error('GetSize timeout')), this.config.getSizeTimeout);

      Image.getSize(
        url,
        (width, height) => {
          clearTimeout(timeoutId);
          if (width > 0 && height > 0) {
            const dimensions = this.calculateOptimizedDimensions(width, height);
            resolve(dimensions);
          } else {
            reject(new Error('Invalid dimensions'));
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          // 네트워크 오류 시 Prefetch 후 재시도
          this.fallbackWithPrefetch(url)
            .then(resolve)
            .catch(reject);
        }
      );
    });
  }

  /**
   * Prefetch 후 재시도
   */
  private async fallbackWithPrefetch(url: string): Promise<ImageDimensions> {
    // Prefetch 먼저 실행
    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => 
        reject(new Error('Prefetch timeout')), this.config.prefetchTimeout);
      
      Image.prefetch(url)
        .then(() => {
          clearTimeout(timeoutId);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });

    // GetSize 재시도
    return new Promise<ImageDimensions>((resolve, reject) => {
      const timeoutId = setTimeout(() => 
        reject(new Error('Fallback GetSize timeout')), this.config.getSizeTimeout);

      Image.getSize(
        url,
        (width, height) => {
          clearTimeout(timeoutId);
          if (width > 0 && height > 0) {
            const dimensions = this.calculateOptimizedDimensions(width, height);
            resolve(dimensions);
          } else {
            reject(new Error('Invalid dimensions after prefetch'));
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  }

  /**
   * 썸네일 최적화 크기 계산
   */
  private calculateOptimizedDimensions(width: number, height: number): ImageDimensions {
    const aspectRatio = height / width;
    const calculatedHeight = this.config.fixedWidth * aspectRatio;
    
    let finalHeight = calculatedHeight;
    if (calculatedHeight > this.config.maxHeight) {
      finalHeight = this.config.maxHeight;
    } else if (calculatedHeight < this.config.minHeight) {
      finalHeight = this.config.minHeight;
    }
    
    return { width: this.config.fixedWidth, height: finalHeight };
  }

  /**
   * 배치 프리로딩
   */
  async preloadImages(urls: string[], options?: PreloadOptions): Promise<void> {
    if (urls.length === 0) return;

    const validUrls = urls
      .filter(url => this.isValidUrl(url))
      .filter(url => !this.cache.has(url))
      .filter(url => !this.failedUrls.has(url))
      .slice(0, options?.maxImages || 10);

    if (validUrls.length === 0) return;

    console.log(`🚀 썸네일 프리로딩 시작: ${validUrls.length}개`);

    // 우선순위별로 정렬
    const priority = options?.priority === 'high' ? 1 : 
                    options?.priority === 'low' ? 3 : 2;

    // 프리로드 큐에 추가
    const preloadData: ImagePreloadData[] = validUrls.map(url => ({
      url,
      priority,
      retryCount: 0,
      lastAttempt: 0
    }));

    this.preloadQueue.push(...preloadData);
    this.processPreloadQueue();
  }

  /**
   * 프리로드 큐 처리
   */
  private async processPreloadQueue(): Promise<void> {
    if (this.isProcessingQueue || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      // 우선순위별로 정렬
      this.preloadQueue.sort((a, b) => a.priority - b.priority);

      const batchSize = this.config.batchSize;
      while (this.preloadQueue.length > 0) {
        const batch = this.preloadQueue.splice(0, batchSize);
        
        await Promise.allSettled(
          batch.map(async (item) => {
            try {
              await this.loadImage(item.url);
            } catch (error) {
              console.warn(`⚠️ 프리로드 실패: ${this.getShortUrl(item.url)}`);
            }
          })
        );
        
        // 배치 간 대기
        if (this.preloadQueue.length > 0) {
          await this.delay(this.config.batchDelay);
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }

    console.log('🎉 썸네일 프리로딩 완료');
  }

  /**
   * 캐시된 크기 반환
   */
  getCachedSize(url: string): ImageDimensions | undefined {
    return this.cache.get(url)?.dimensions;
  }

  /**
   * 로딩 상태 반환
   */
  getLoadStatus(url: string): ImageLoadStatus {
    return this.cache.get(url)?.status || 'idle';
  }

  /**
   * URL 유효성 검사
   */
  isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * 캐시 클리어
   */
  clear(): void {
    this.cache.clear();
    this.failedUrls.clear();
    this.loadingPromises.clear();
    this.preloadQueue = [];
    this.isPreloadingPaused = true;
    console.log('🗑️ 썸네일 캐시 클리어됨');
  }

  /**
   * 캐시 통계 반환
   */
  getStats(): CacheStats {
    const loading = Array.from(this.cache.values()).filter(item => item.status === 'loading').length;
    const loaded = Array.from(this.cache.values()).filter(item => item.status === 'loaded').length;
    
    return {
      cached: this.cache.size,
      loading,
      failed: this.failedUrls.size,
      promises: this.loadingPromises.size,
      socketConnected: this.socketConnected,
      avgLoadTime: this.calculateAverageLoadTime(),
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  /**
   * 캐시 업데이트
   */
  private updateCache(
    url: string, 
    dimensions: ImageDimensions, 
    status: ImageLoadStatus, 
    retryCount: number = 0
  ): void {
    this.cache.set(url, {
      dimensions,
      status,
      timestamp: Date.now(),
      retryCount
    });
  }

  /**
   * 기본 크기 반환
   */
  private getDefaultSize(): ImageDimensions {
    return { width: this.config.fixedWidth, height: 150 };
  }

  /**
   * 기본 크기인지 확인
   */
  private isDefaultSize(dimensions: ImageDimensions): boolean {
    return dimensions.height === 150 && dimensions.width === this.config.fixedWidth;
  }

  /**
   * 평균 로딩 시간 계산
   */
  private calculateAverageLoadTime(): string {
    const totalItems = this.cache.size + this.failedUrls.size;
    if (totalItems === 0) return '0ms';
    
    const estimatedTime = this.cache.size * 500 + this.failedUrls.size * 2000;
    return `${Math.round(estimatedTime / totalItems)}ms`;
  }

  /**
   * 캐시 히트율 계산
   */
  private calculateCacheHitRate(): string {
    const total = this.cache.size + this.failedUrls.size;
    if (total === 0) return '0%';
    
    const hitRate = (this.cache.size / total) * 100;
    return `${Math.round(hitRate)}%`;
  }

  /**
   * 짧은 URL 표시
   */
  private getShortUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const filename = urlObj.pathname.split('/').pop() || 'unknown';
      return filename.length > 25 ? filename.substring(0, 25) + '...' : filename;
    } catch {
      return url.substring(0, 25) + '...';
    }
  }

  /**
   * 타임아웃 생성
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 썸네일 캐시 서비스 인스턴스 가져오기
 */
export const getThumbnailCache = (): ThumbnailCacheService => {
  return ThumbnailCacheService.getInstance();
};

/**
 * 썸네일 캐시 초기화
 */
export const initializeThumbnailCache = (): ThumbnailCacheService => {
  const cache = getThumbnailCache();
  console.log('🎯 썸네일 캐시 초기화 완료');
  return cache;
};

// 타입 re-exports (기존 호환성을 위해)
export type {
  ImageDimensions,
  CacheItem,
  ImageLoadStatus,
  CacheStats,
  CacheConfig,
  PreloadOptions,
  ImageCacheService,
  ThumbnailImageProps,
  UseImageCacheReturn
} from '../types/imageCache';

export default ThumbnailCacheService;