import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

// FCM 메시지 타입
export interface FCMMessageData {
  type?: 'chat_message' | 'post' | 'general';
  roomId?: string;
  postId?: string;
  senderId?: string;
  senderName?: string;
  messageId?: string;
}

// FCM 알림 처리 결과
export interface FCMNotificationResult {
  success: boolean;
  action?: 'navigate' | 'alert' | 'ignore';
  destination?: string;
  error?: string;
}

// FCM 토큰 상태
export interface FCMTokenState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// FCM 권한 상태
export interface FCMPermissionState {
  granted: boolean;
  status: FirebaseMessagingTypes.AuthorizationStatus;
  canRequest: boolean;
}

// FCM 메시지 상태
export interface FCMMessageState {
  lastMessage: FirebaseMessagingTypes.RemoteMessage | null;
  messageHistory: FirebaseMessagingTypes.RemoteMessage[];
  unreadCount: number;
}

// FCM 서비스 설정
export interface FCMServiceConfig {
  enableLogging?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  tokenRefreshInterval?: number;
  messageHistoryLimit?: number;
}

// FCM Hook 반환 타입
export interface UseFCMReturn {
  // 토큰 관련
  token: string | null;
  tokenError: string | null;
  isTokenLoading: boolean;
  refreshToken: () => Promise<void>;
  
  // 권한 관련
  permission: FCMPermissionState;
  requestPermission: () => Promise<boolean>;
  
  // 메시지 관련
  lastMessage: FirebaseMessagingTypes.RemoteMessage | null;
  messageHistory: FirebaseMessagingTypes.RemoteMessage[];
  clearMessageHistory: () => void;
  
  // 상태 관련
  isInitialized: boolean;
  error: string | null;
  
  // 유틸리티
  getDebugInfo: () => FCMDebugInfo;
}

// FCM 디버그 정보
export interface FCMDebugInfo {
  tokenLength: number;
  hasToken: boolean;
  permissionStatus: string;
  messageCount: number;
  lastMessageTime: string | null;
  isServiceInitialized: boolean;
  errorCount: number;
  lastError: string | null;
}

// FCM 이벤트 타입
export type FCMEventType = 
  | 'token_received'
  | 'token_refreshed'
  | 'message_received'
  | 'permission_granted'
  | 'permission_denied'
  | 'error_occurred'
  | 'service_initialized';

// FCM 이벤트 리스너
export interface FCMEventListener {
  type: FCMEventType;
  callback: (data?: any) => void;
}

// FCM 메시지 핸들러 함수 타입
export type FCMMessageHandlerFunction = (
  message: FirebaseMessagingTypes.RemoteMessage
) => Promise<FCMNotificationResult>;

// FCM 초기화 옵션
export interface FCMInitOptions {
  userId?: string;
  enableBackgroundHandler?: boolean;
  enableForegroundHandler?: boolean;
  enableNotificationOpenHandler?: boolean;
  customMessageHandler?: FCMMessageHandlerFunction;
  config?: FCMServiceConfig;
}
