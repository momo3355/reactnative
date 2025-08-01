import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { 
  FCMTokenState, 
  FCMPermissionState, 
  FCMMessageState, 
  FCMServiceConfig,
  FCMEventListener,
  FCMEventType,
  FCMDebugInfo,
  FCMInitOptions,
  FCMMessageData,
  FCMNotificationResult,
  FCMMessageHandlerFunction
} from '../types/fcm';

// =============================================================================
// 🔔 FCM 메시지 핸들러 클래스
// =============================================================================

/**
 * FCM 메시지 핸들러 클래스
 * 메시지 수신, 파싱, 처리를 담당
 */
export class FCMMessageHandler {
  private navigation: any = null;
  private enableLogging: boolean = true;
  private messaging = messaging();

  constructor(navigation?: any, enableLogging: boolean = true) {
    this.navigation = navigation;
    this.enableLogging = enableLogging;
  }

  /**
   * 네비게이션 인스턴스 설정
   */
  setNavigation(navigation: any): void {
    this.navigation = navigation;
  }

  /**
   * 메시지 데이터 파싱
   */
  private parseMessageData(remoteMessage: FirebaseMessagingTypes.RemoteMessage): FCMMessageData {
    const data = remoteMessage.data || {};

    return {
      type: (data.type as FCMMessageData['type']) || 'general',
      roomId: data.roomId,
      postId: data.postId,
      senderId: data.senderId,
      senderName: data.senderName,
      messageId: data.messageId
    };
  }

  /**
   * 포그라운드 메시지 처리
   */
  async handleForegroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<FCMNotificationResult> {
    if (this.enableLogging) {
      console.log('📱 [FCM] 포그라운드 메시지 수신:', remoteMessage.notification?.title);
    }

    const messageData = this.parseMessageData(remoteMessage);

    if (!remoteMessage.notification) {
      return { success: true, action: 'ignore' };
    }

    return new Promise((resolve) => {
      Alert.alert(
        remoteMessage.notification!.title || '새 메시지',
        remoteMessage.notification!.body || '메시지를 확인하세요',
        [
          {
            text: '확인',
            style: 'default',
            onPress: () => resolve({ success: true, action: 'alert' })
          },
          {
            text: '보기',
            onPress: () => {
              const result = this.navigateFromMessage(messageData);
              resolve(result);
            },
            style: 'default'
          }
        ]
      );
    });
  }

  /**
   * 백그라운드 알림 클릭 처리
   */
  async handleBackgroundNotificationOpen(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<FCMNotificationResult> {
    if (this.enableLogging) {
      console.log('🔙 [FCM] 백그라운드 알림 클릭:', remoteMessage.notification?.title);
    }

    const messageData = this.parseMessageData(remoteMessage);
    return this.navigateFromMessage(messageData);
  }

  /**
   * 앱 종료 상태에서 알림 클릭 처리
   */
  async handleAppLaunchFromNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<FCMNotificationResult> {
    if (this.enableLogging) {
      console.log('🚀 [FCM] 앱 종료상태에서 알림 클릭:', remoteMessage.notification?.title);
    }

    const messageData = this.parseMessageData(remoteMessage);

    // 앱 로딩 완료를 기다림
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.navigateFromMessage(messageData);
        resolve(result);
      }, 3000);
    });
  }

  /**
   * 메시지 데이터에 따른 네비게이션 처리
   */
  private navigateFromMessage(messageData: FCMMessageData): FCMNotificationResult {
    if (!this.navigation) {
      console.warn('⚠️ [FCM] Navigation이 설정되지 않음');
      return {
        success: false,
        error: 'Navigation not available',
        action: 'ignore'
      };
    }

    try {
      switch (messageData.type) {
        case 'chat_message':
          if (messageData.roomId) {
            this.navigation.navigate('ChatRoom', { roomId: messageData.roomId });
            return {
              success: true,
              action: 'navigate',
              destination: `ChatRoom(${messageData.roomId})`
            };
          }
          break;

        case 'post':
          if (messageData.postId) {
            this.navigation.navigate('PostDetail', { postId: messageData.postId });
            return {
              success: true,
              action: 'navigate',
              destination: `PostDetail(${messageData.postId})`
            };
          }
          break;

        default:
          this.navigation.navigate('Main');
          return {
            success: true,
            action: 'navigate',
            destination: 'Main'
          };
      }

      // 기본 처리
      this.navigation.navigate('Main');
      return {
        success: true,
        action: 'navigate',
        destination: 'Main (fallback)'
      };
    } catch (error) {
      console.error('❌ [FCM] 네비게이션 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Navigation error',
        action: 'ignore'
      };
    }
  }

  /**
   * 메시지 유효성 검사
   */
  validateMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): boolean {
    if (!remoteMessage) {
      console.warn('⚠️ [FCM] 빈 메시지');
      return false;
    }

    if (!remoteMessage.notification && !remoteMessage.data) {
      console.warn('⚠️ [FCM] 알림과 데이터가 모두 없음');
      return false;
    }

    return true;
  }

  /**
   * 디버그 정보 출력
   */
  logMessageDetails(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    if (!this.enableLogging) return;

    console.log('📊 [FCM] 메시지 상세 정보:');
    console.log('  • 제목:', remoteMessage.notification?.title || '없음');
    console.log('  • 내용:', remoteMessage.notification?.body || '없음');
    console.log('  • 데이터:', JSON.stringify(remoteMessage.data, null, 2));
    console.log('  • 수신 시간:', new Date().toLocaleString());
  }
}

// =============================================================================
// 🚀 FCM 서비스 클래스 (메인)
// =============================================================================

/**
 * FCM 서비스 클래스 (싱글톤)
 * FCM 토큰 관리, 권한 처리, 메시지 리스너 관리
 */
export class FCMService {
  private static instance: FCMService;
  
  // 상태 관리
  private tokenState: FCMTokenState = {
    token: null,
    isLoading: false,
    error: null,
    lastUpdated: null
  };

  private permissionState: FCMPermissionState = {
    granted: false,
    status: messaging.AuthorizationStatus.NOT_DETERMINED,
    canRequest: true
  };

  private messageState: FCMMessageState = {
    lastMessage: null,
    messageHistory: [],
    unreadCount: 0
  };

  // 설정
  private config: FCMServiceConfig = {
    enableLogging: true,
    maxRetries: 3,
    retryDelay: 1000,
    tokenRefreshInterval: 24 * 60 * 60 * 1000, // 24시간
    messageHistoryLimit: 50
  };

  // 이벤트 리스너
  private eventListeners: FCMEventListener[] = [];
  
  // 메시지 핸들러
  private messageHandler: FCMMessageHandler | null = null;
  
  // 초기화 상태
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  // 리스너 정리 함수들
  private unsubscribeFunctions: Array<() => void> = [];

  // 스토리지 키
  private readonly STORAGE_KEYS = {
    FCM_TOKEN: 'fcm_token',
    TOKEN_TIMESTAMP: 'fcm_token_timestamp',
    PERMISSION_STATUS: 'fcm_permission_status'
  };

  private constructor() {
    this.log('🚀 FCM Service 인스턴스 생성');
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  /**
   * FCM 서비스 초기화
   */
  async initialize(options?: FCMInitOptions): Promise<void> {
    if (this.isInitialized) {
      this.log('✅ FCM Service 이미 초기화됨');
      return;
    }

    if (this.initPromise) {
      this.log('⏳ FCM Service 초기화 진행 중...');
      return this.initPromise;
    }

    this.initPromise = this.performInitialization(options);
    return this.initPromise;
  }

  /**
   * 실제 초기화 수행
   */
  private async performInitialization(options?: FCMInitOptions): Promise<void> {
    try {
      this.log('🔄 FCM Service 초기화 시작');

      // 설정 적용
      if (options?.config) {
        this.config = { ...this.config, ...options.config };
      }

      // 메시지 핸들러 설정
      if (options?.customMessageHandler) {
        this.messageHandler = new FCMMessageHandler();
      }

      // 토큰 복원
      await this.restoreTokenFromStorage();

      // 권한 상태 확인
      await this.checkPermissionStatus();

      // 리스너 설정
      this.setupMessageListeners(options);

      this.isInitialized = true;
      this.emitEvent('service_initialized');
      this.log('✅ FCM Service 초기화 완료');

    } catch (error) {
      this.log('❌ FCM Service 초기화 실패:', error);
      this.tokenState.error = error instanceof Error ? error.message : 'Initialization failed';
      throw error;
    }
  }

  /**
   * 토큰 요청 및 획득
   */
  async requestToken(): Promise<string | null> {
    try {
      this.log('🎫 FCM 토큰 요청 시작');
      this.tokenState.isLoading = true;
      this.tokenState.error = null;

      // 권한 확인
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('FCM 권한이 거부되었습니다');
      }

      // 토큰 획득
      const token = await messaging().getToken();
      
      if (!token) {
        throw new Error('FCM 토큰을 획득할 수 없습니다');
      }

      // 상태 업데이트
      this.tokenState = {
        token,
        isLoading: false,
        error: null,
        lastUpdated: Date.now()
      };

      // 스토리지 저장
      await this.saveTokenToStorage(token);

      this.log('✅ FCM 토큰 획득 성공');
      this.emitEvent('token_received', { token });
      
      return token;

    } catch (error) {
      this.log('❌ FCM 토큰 획득 실패:', error);
      this.tokenState.isLoading = false;
      this.tokenState.error = error instanceof Error ? error.message : 'Token request failed';
      
      this.emitEvent('error_occurred', { error });
      return null;
    }
  }

  /**
   * 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    try {
      this.log('🔐 FCM 권한 요청');

      const authStatus = await messaging().requestPermission();
      const granted = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      this.permissionState = {
        granted,
        status: authStatus,
        canRequest: authStatus !== messaging.AuthorizationStatus.DENIED
      };

      await AsyncStorage.setItem(this.STORAGE_KEYS.PERMISSION_STATUS, authStatus.toString());

      if (granted) {
        this.log('✅ FCM 권한 승인');
        this.emitEvent('permission_granted');
      } else {
        this.log('❌ FCM 권한 거부');
        this.emitEvent('permission_denied');
        
        if (!this.permissionState.canRequest) {
          Alert.alert(
            '알림 권한 필요',
            '설정에서 알림 권한을 허용해주세요.',
            [{ text: '확인' }]
          );
        }
      }

      return granted;

    } catch (error) {
      this.log('❌ FCM 권한 요청 실패:', error);
      this.emitEvent('error_occurred', { error });
      return false;
    }
  }

  /**
   * 메시지 리스너 설정
   */
  private setupMessageListeners(options?: FCMInitOptions): void {
    this.log('🔔 FCM 메시지 리스너 설정');

    // 포그라운드 메시지 수신
    if (options?.enableForegroundHandler !== false) {
      const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        this.log('📱 포그라운드 메시지 수신');
        await this.handleForegroundMessage(remoteMessage);
      });
      this.unsubscribeFunctions.push(unsubscribeForeground);
    }

    // 백그라운드 알림 클릭
    if (options?.enableNotificationOpenHandler !== false) {
      const unsubscribeBackground = messaging().onNotificationOpenedApp((remoteMessage) => {
        this.log('🔙 백그라운드 알림 클릭');
        this.handleBackgroundNotificationOpen(remoteMessage);
      });
      this.unsubscribeFunctions.push(unsubscribeBackground);
    }

    // 토큰 갱신 리스너
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
      this.log('🔄 FCM 토큰 갱신');
      await this.handleTokenRefresh(token);
    });
    this.unsubscribeFunctions.push(unsubscribeTokenRefresh);

    // 앱 종료 상태에서 알림 클릭으로 시작
    this.checkInitialNotification();
  }

  /**
   * 앱 종료 상태에서 알림 클릭 확인
   */
  private async checkInitialNotification(): Promise<void> {
    try {
      const remoteMessage = await messaging().getInitialNotification();
      if (remoteMessage) {
        this.log('🚀 앱 종료 상태에서 알림 클릭으로 시작');
        setTimeout(() => {
          this.handleAppLaunchFromNotification(remoteMessage);
        }, 3000);
      }
    } catch (error) {
      this.log('❌ 초기 알림 확인 실패:', error);
    }
  }

  /**
   * 포그라운드 메시지 처리
   */
  private async handleForegroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    this.addToMessageHistory(remoteMessage);
    
    if (this.messageHandler) {
      await this.messageHandler.handleForegroundMessage(remoteMessage);
    }
    
    this.emitEvent('message_received', { message: remoteMessage, type: 'foreground' });
  }

  /**
   * 백그라운드 알림 클릭 처리
   */
  private async handleBackgroundNotificationOpen(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    this.addToMessageHistory(remoteMessage);
    
    if (this.messageHandler) {
      await this.messageHandler.handleBackgroundNotificationOpen(remoteMessage);
    }
    
    this.emitEvent('message_received', { message: remoteMessage, type: 'background' });
  }

  /**
   * 앱 시작 시 알림 클릭 처리
   */
  private async handleAppLaunchFromNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    this.addToMessageHistory(remoteMessage);
    
    if (this.messageHandler) {
      await this.messageHandler.handleAppLaunchFromNotification(remoteMessage);
    }
    
    this.emitEvent('message_received', { message: remoteMessage, type: 'app_launch' });
  }

  /**
   * 토큰 갱신 처리
   */
  private async handleTokenRefresh(token: string): Promise<void> {
    this.tokenState.token = token;
    this.tokenState.lastUpdated = Date.now();
    
    await this.saveTokenToStorage(token);
    this.emitEvent('token_refreshed', { token });
  }

  /**
   * 메시지 히스토리에 추가
   */
  private addToMessageHistory(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    this.messageState.lastMessage = remoteMessage;
    this.messageState.messageHistory.unshift(remoteMessage);
    
    // 히스토리 제한
    if (this.messageState.messageHistory.length > this.config.messageHistoryLimit!) {
      this.messageState.messageHistory = this.messageState.messageHistory.slice(0, this.config.messageHistoryLimit!);
    }
    
    this.messageState.unreadCount++;
  }

  /**
   * 스토리지에서 토큰 복원
   */
  private async restoreTokenFromStorage(): Promise<void> {
    try {
      const [token, timestamp] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.FCM_TOKEN),
        AsyncStorage.getItem(this.STORAGE_KEYS.TOKEN_TIMESTAMP)
      ]);

      if (token) {
        this.tokenState.token = token;
        this.tokenState.lastUpdated = timestamp ? parseInt(timestamp) : null;
        this.log('📱 저장된 FCM 토큰 복원');
      }
    } catch (error) {
      this.log('⚠️ 토큰 복원 실패:', error);
    }
  }

  /**
   * 토큰을 스토리지에 저장
   */
  private async saveTokenToStorage(token: string): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      await Promise.all([
        AsyncStorage.setItem(this.STORAGE_KEYS.FCM_TOKEN, token),
        AsyncStorage.setItem(this.STORAGE_KEYS.TOKEN_TIMESTAMP, timestamp)
      ]);
    } catch (error) {
      this.log('⚠️ 토큰 저장 실패:', error);
    }
  }

  /**
   * 권한 상태 확인
   */
  private async checkPermissionStatus(): Promise<void> {
    try {
      const authStatus = await messaging().hasPermission();
      const granted = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      this.permissionState = {
        granted,
        status: authStatus,
        canRequest: authStatus !== messaging.AuthorizationStatus.DENIED
      };
    } catch (error) {
      this.log('⚠️ 권한 상태 확인 실패:', error);
    }
  }

  /**
   * 메시지 핸들러 설정
   */
  setMessageHandler(handler: FCMMessageHandler): void {
    this.messageHandler = handler;
    this.log('🔧 메시지 핸들러 설정됨');
  }

  /**
   * 이벤트 리스너 추가
   */
  addEventListener(type: FCMEventType, callback: (data?: any) => void): void {
    this.eventListeners.push({ type, callback });
  }

  /**
   * 이벤트 리스너 제거
   */
  removeEventListener(type: FCMEventType, callback: (data?: any) => void): void {
    this.eventListeners = this.eventListeners.filter(
      listener => !(listener.type === type && listener.callback === callback)
    );
  }

  /**
   * 이벤트 발생
   */
  private emitEvent(type: FCMEventType, data?: any): void {
    this.eventListeners
      .filter(listener => listener.type === type)
      .forEach(listener => listener.callback(data));
  }

  /**
   * 메시지 히스토리 클리어
   */
  clearMessageHistory(): void {
    this.messageState.messageHistory = [];
    this.messageState.unreadCount = 0;
    this.messageState.lastMessage = null;
    this.log('🗑️ 메시지 히스토리 클리어됨');
  }

  /**
   * 토큰 새로고침
   */
  async refreshToken(): Promise<void> {
    this.log('🔄 토큰 강제 새로고침');
    await this.requestToken();
  }

  /**
   * 디버그 정보 반환
   */
  getDebugInfo(): FCMDebugInfo {
    const errorCount = this.eventListeners.filter(l => l.type === 'error_occurred').length;
    
    return {
      tokenLength: this.tokenState.token?.length || 0,
      hasToken: !!this.tokenState.token,
      permissionStatus: messaging.AuthorizationStatus[this.permissionState.status],
      messageCount: this.messageState.messageHistory.length,
      lastMessageTime: this.messageState.lastMessage ? 
        new Date(this.messageState.lastMessage.sentTime || Date.now()).toLocaleString() : null,
      isServiceInitialized: this.isInitialized,
      errorCount,
      lastError: this.tokenState.error
    };
  }

  /**
   * 현재 상태 반환
   */
  getState() {
    return {
      token: this.tokenState,
      permission: this.permissionState,
      message: this.messageState,
      isInitialized: this.isInitialized
    };
  }

  /**
   * 서비스 정리
   */
  destroy(): void {
    this.log('🧹 FCM Service 정리');
    
    // 모든 리스너 해제
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
    
    // 이벤트 리스너 정리
    this.eventListeners = [];
    
    // 상태 초기화
    this.isInitialized = false;
    this.initPromise = null;
    this.messageHandler = null;
  }

  /**
   * 로깅 유틸리티
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[FCM Service] ${message}`, ...args);
    }
  }
}

// =============================================================================
// 🔧 헬퍼 함수들
// =============================================================================

/**
 * 기본 메시지 핸들러 팩토리
 */
export const createDefaultMessageHandler = (
  navigation?: any,
  enableLogging: boolean = true
): FCMMessageHandlerFunction => {
  const handler = new FCMMessageHandler(navigation, enableLogging);

  return async (message: FirebaseMessagingTypes.RemoteMessage) => {
    return handler.handleForegroundMessage(message);
  };
};

/**
 * 메시지 타입별 핸들러 맵
 */
export const createMessageHandlerMap = (navigation?: any) => {
  const handler = new FCMMessageHandler(navigation);

  return {
    foreground: (message: FirebaseMessagingTypes.RemoteMessage) =>
      handler.handleForegroundMessage(message),
    background: (message: FirebaseMessagingTypes.RemoteMessage) =>
      handler.handleBackgroundNotificationOpen(message),
    appLaunch: (message: FirebaseMessagingTypes.RemoteMessage) =>
      handler.handleAppLaunchFromNotification(message)
  };
};

/**
 * FCM 서비스 인스턴스 가져오기
 */
export const getFCMService = (): FCMService => {
  return FCMService.getInstance();
};

/**
 * FCM 서비스 초기화 헬퍼
 */
export const initializeFCM = async (options?: FCMInitOptions): Promise<void> => {
  const service = getFCMService();
  await service.initialize(options);
};

// 타입 re-exports (기존 호환성을 위해)
export type {
  FCMMessageData,
  FCMNotificationResult,
  FCMTokenState,
  FCMPermissionState,
  FCMMessageState,
  FCMServiceConfig,
  UseFCMReturn,
  FCMDebugInfo,
  FCMEventType,
  FCMEventListener,
  FCMMessageHandlerFunction,
  FCMInitOptions
} from '../types/fcm';

export default FCMService;