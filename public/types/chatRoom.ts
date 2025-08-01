import { MessgeInfoValue } from '../store/zustandboard/types';

// 채팅방 프리로딩 상태
export interface ChatPreloadingState {
  hasInitialPreload: boolean;
  isPreloading: boolean;
  preloadedImageCount: number;
  currentRoomId: string | null;
}

// 채팅방 스크롤 관련
export interface ChatScrollState {
  isAtBottom: boolean;
  isManualScrolling: boolean;
  lastScrollY: number;
  shouldAutoScroll: boolean;
}

// 채팅방 UI 상태
export interface ChatUIState {
  inputMessage: string;
  modalVisible: boolean;
  modalImageUrl: string;
  modalImageLoading: boolean;
}

// 채팅방 성능 메트릭
export interface ChatPerformanceMetrics {
  messageCount: number;
  imageMessageCount: number;
  preloadedImageCount: number;
  averageScrollTime: number;
  lastUpdateTime: number;
}

// 프리로딩 옵션
export interface ChatPreloadOptions {
  maxImages?: number;
  initialBatchSize?: number;
  roomChangeDelay?: number;
  backgroundTimeout?: number;
}

// Hook 반환 타입들
export interface UseChatPreloadingReturn {
  // 상태
  preloadingState: ChatPreloadingState;
  isPreloadingReady: boolean;
  
  // 액션
  initializePreloading: (roomId: string, messages: MessgeInfoValue[]) => Promise<void>;
  preloadNewMessage: (message: MessgeInfoValue) => Promise<void>;
  clearPreloadingCache: () => void;
  
  // 메트릭
  getPreloadingStats: () => ChatPerformanceMetrics;
}

export interface UseChatScrollingReturn {
  // 상태
  scrollState: ChatScrollState;
  
  // Ref
  flatListRef: React.RefObject<any>;
  
  // 액션
  handleScroll: (event: any) => void;
  scrollToBottom: (animated?: boolean) => void;
  enableAutoScroll: () => void;
  disableAutoScroll: () => void;
  
  // 이벤트
  onLoadMore: (() => void) | null;
}

export interface UseChatStateReturn {
  // UI 상태
  uiState: ChatUIState;
  setInputMessage: (message: string) => void;
  
  // 모달 상태
  openImageModal: (imageUrl: string) => void;
  closeImageModal: () => void;
  setModalImageLoading: (loading: boolean) => void;
  
  // 이벤트 핸들러
  handleSendMessage: () => Promise<void>;
  handleImagePress: (imageUrl: string) => void;
  
  // 상태 리셋
  resetChatState: () => void;
}

// 통합 채팅방 Hook 반환 타입
export interface UseChatRoomReturn extends 
  UseChatPreloadingReturn, 
  UseChatScrollingReturn, 
  UseChatStateReturn {
  
  // 추가 메타데이터
  roomMetadata: {
    roomId: string;
    userId: string;
    userName: string;
    isInitialized: boolean;
  };
  
  // 성능 정보
  performanceInfo: ChatPerformanceMetrics;
}

// 채팅방 Hook 설정
export interface ChatRoomConfig {
  enablePreloading: boolean;
  enableAutoScroll: boolean;
  enablePerformanceTracking: boolean;
  preloadOptions: ChatPreloadOptions;
  scrollOptions: {
    threshold: number;
    debounceDelay: number;
    autoScrollDelay: number;
  };
}
