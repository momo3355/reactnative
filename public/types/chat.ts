// 채팅 관련 타입 정의

import { MessgeInfoValue } from '../store/zustandboard/types';

// 프리로딩 상태
export interface PreloadingState {
  hasInitialPreload: boolean;
  isPreloading: boolean;
  preloadedImageCount: number;
  currentRoomId: string | null;
  lastPreloadTime: number | null;
}

// 채팅방 상태
export interface ChatRoomState {
  roomId: string;
  isInitialized: boolean;
  isConnecting: boolean;
  connectionAttempts: number;
  lastConnectionTime: number | null;
}

// 메시지 상태
export interface MessageState {
  inputMessage: string;
  isComposing: boolean;
  lastTypingTime: number | null;
  pendingMessages: string[];
}

// 모달 상태
export interface ModalState {
  imageModal: {
    visible: boolean;
    imageUrl: string;
    loading: boolean;
  };
  pickerModal: {
    visible: boolean;
  };
}

// 스크롤 상태
export interface ScrollState {
  isAtBottom: boolean;
  isUserScrolling: boolean;
  lastScrollPosition: number;
  autoScrollEnabled: boolean;
}

// 채팅 성능 메트릭
export interface ChatPerformanceMetrics {
  messageCount: number;
  imageMessageCount: number;
  preloadedImages: number;
  averageLoadTime: number;
  renderTime: number;
  memoryUsage: number;
}

// Hook 반환 타입들
export interface UseChatPreloadingReturn {
  // 상태
  preloadingState: PreloadingState;
  
  // 메서드
  startInitialPreload: (messages: MessgeInfoValue[]) => Promise<void>;
  preloadNewMessage: (message: MessgeInfoValue) => Promise<void>;
  resetPreloading: () => void;
  
  // 유틸리티
  getPreloadingStats: () => {
    totalPreloaded: number;
    successRate: number;
    averageTime: number;
  };
}

export interface UseChatStateReturn {
  // 채팅방 상태
  chatRoomState: ChatRoomState;
  setChatRoomState: (state: Partial<ChatRoomState>) => void;
  
  // 메시지 상태
  messageState: MessageState;
  setMessageState: (state: Partial<MessageState>) => void;
  
  // 모달 상태
  modalState: ModalState;
  setModalState: (state: Partial<ModalState>) => void;
  
  // 스크롤 상태
  scrollState: ScrollState;
  setScrollState: (state: Partial<ScrollState>) => void;
  
  // 통합 리셋
  resetAllStates: () => void;
}

export interface UseChatOptimizationReturn {
  // 성능 최적화
  shouldRenderMessage: (messageId: string, index: number) => boolean;
  getOptimizedRenderList: (messages: MessgeInfoValue[]) => MessgeInfoValue[];
  
  // 메모리 관리
  cleanupOldMessages: () => void;
  optimizeImageCache: () => void;
  
  // 성능 메트릭
  getPerformanceMetrics: () => ChatPerformanceMetrics;
}

// 채팅방 설정
export interface ChatRoomConfig {
  enablePreloading: boolean;
  enableOptimization: boolean;
  maxVisibleMessages: number;
  preloadBatchSize: number;
  enableDebugLogs: boolean;
  autoScrollThreshold: number;
  memoryOptimizationInterval: number;
}

// 채팅 이벤트 타입
export type ChatEventType = 
  | 'message_received'
  | 'message_sent'
  | 'image_preloaded'
  | 'connection_changed'
  | 'room_entered'
  | 'room_left'
  | 'typing_started'
  | 'typing_stopped';

export interface ChatEvent {
  type: ChatEventType;
  timestamp: number;
  data?: any;
  roomId: string;
}

// 채팅 Hook 통합 타입
export interface UseChatRoomReturn {
  // 상태들
  preloading: UseChatPreloadingReturn;
  state: UseChatStateReturn;
  optimization: UseChatOptimizationReturn;
  
  // 설정
  config: ChatRoomConfig;
  updateConfig: (newConfig: Partial<ChatRoomConfig>) => void;
  
  // 이벤트
  emitEvent: (event: Omit<ChatEvent, 'timestamp'>) => void;
  addEventListener: (type: ChatEventType, callback: (event: ChatEvent) => void) => () => void;
}
