import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFCMService,
  createDefaultMessageHandler,
} from '../services/fcmService';
import type {
  UseFCMReturn,
  FCMInitOptions,
  FCMEventType,
  FCMDebugInfo,
} from '../types/fcm';

/**
 * FCM 기능을 React 컴포넌트에서 사용하기 위한 Hook
 */
export const useFCM = (
  userId?: string,
  navigation?: any,
  options?: FCMInitOptions
): UseFCMReturn => {
  // FCM 서비스 인스턴스
  const fcmService = useRef(getFCMService());

  // 상태 관리
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const [permission, setPermission] = useState({
    granted: false,
    status: 0, // messaging.AuthorizationStatus.NOT_DETERMINED
    canRequest: true,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이벤트 리스너 관리
  const eventListenersRef = useRef<Array<{ type: FCMEventType; callback: any }>>([]);

  /**
   * 이벤트 리스너 등록
   */
  const addEventListener = useCallback((type: FCMEventType, callback: (data?: any) => void) => {
    fcmService.current.addEventListener(type, callback);
    eventListenersRef.current.push({ type, callback });
  }, []);

  /**
   * 상태 업데이트 함수들
   */
  const updateStates = useCallback(() => {
    const state = fcmService.current.getState();

    setToken(state.token.token);
    setTokenError(state.token.error);
    setIsTokenLoading(state.token.isLoading);
    setPermission(state.permission);
    setLastMessage(state.message.lastMessage);
    setMessageHistory(state.message.messageHistory);
    setIsInitialized(state.isInitialized);
  }, []);

  /**
   * FCM 서비스 초기화
   */
  const initializeFCMService = useCallback(async () => {
    try {
      setError(null);

      // 메시지 핸들러 설정
      if (navigation) {
        const messageHandler = createDefaultMessageHandler(navigation, true);
        fcmService.current.setMessageHandler(messageHandler as any);
      }

      // 초기화 옵션 구성
      const initOptions: FCMInitOptions = {
        userId,
        enableBackgroundHandler: true,
        enableForegroundHandler: true,
        enableNotificationOpenHandler: true,
        config: {
          enableLogging: __DEV__,
          maxRetries: 3,
          retryDelay: 1000,
        },
        ...options,
      };

      // FCM 서비스 초기화
      await fcmService.current.initialize(initOptions);

      // 토큰 요청
      await fcmService.current.requestToken();

      // 상태 업데이트
      updateStates();

    } catch (initError) {
      const errorMessage = initError instanceof Error ? initError.message : 'FCM 초기화 실패';
      setError(errorMessage);
      console.error('❌ [useFCM] 초기화 오류:', initError);
    }
  }, [userId, navigation, options, updateStates]);

  /**
   * 토큰 새로고침
   */
  const refreshToken = useCallback(async () => {
    try {
      setTokenError(null);
      await fcmService.current.refreshToken();
      updateStates();
    } catch (refreshError) {
      const errorMessage = refreshError instanceof Error ? refreshError.message : '토큰 새로고침 실패';
      setTokenError(errorMessage);
      console.error('❌ [useFCM] 토큰 새로고침 오류:', refreshError);
    }
  }, [updateStates]);

  /**
   * 권한 요청
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await fcmService.current.requestPermission();
      updateStates();
      return granted;
    } catch (permissionError) {
      console.error('❌ [useFCM] 권한 요청 오류:', permissionError);
      return false;
    }
  }, [updateStates]);

  /**
   * 메시지 히스토리 클리어
   */
  const clearMessageHistory = useCallback(() => {
    fcmService.current.clearMessageHistory();
    updateStates();
  }, [updateStates]);

  /**
   * 디버그 정보 가져오기
   */
  const getDebugInfo = useCallback((): FCMDebugInfo => {
    return fcmService.current.getDebugInfo();
  }, []);

  /**
   * 초기화 useEffect
   */
  useEffect(() => {
    let mounted = true;

    const setupEventListeners = () => {
      // 토큰 수신 이벤트
      addEventListener('token_received', (data) => {
        if (mounted) {
          console.log('🎫 [useFCM] 토큰 수신:', data?.token?.substring(0, 20) + '...');
          updateStates();
        }
      });

      // 토큰 갱신 이벤트
      addEventListener('token_refreshed', (data) => {
        if (mounted) {
          console.log('🔄 [useFCM] 토큰 갱신:', data?.token?.substring(0, 20) + '...');
          updateStates();
        }
      });

      // 메시지 수신 이벤트
      addEventListener('message_received', (data) => {
        if (mounted) {
          console.log('📨 [useFCM] 메시지 수신:', data?.message?.notification?.title);
          updateStates();
        }
      });

      // 권한 승인 이벤트
      addEventListener('permission_granted', () => {
        if (mounted) {
          console.log('✅ [useFCM] 권한 승인됨');
          updateStates();
        }
      });

      // 권한 거부 이벤트
      addEventListener('permission_denied', () => {
        if (mounted) {
          console.log('❌ [useFCM] 권한 거부됨');
          updateStates();
        }
      });

      // 오류 이벤트
      addEventListener('error_occurred', (data) => {
        if (mounted) {
          console.error('🚨 [useFCM] 오류 발생:', data?.error);
          setError(data?.error?.message || '알 수 없는 오류');
          updateStates();
        }
      });

      // 서비스 초기화 완료 이벤트
      addEventListener('service_initialized', () => {
        if (mounted) {
          console.log('🚀 [useFCM] 서비스 초기화 완료');
          updateStates();
        }
      });
    };

    setupEventListeners();
    initializeFCMService();

    return () => {
      mounted = false;

      // 이벤트 리스너 정리
      eventListenersRef.current.forEach(({ type, callback }) => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fcmService.current.removeEventListener(type, callback);
      });
      eventListenersRef.current = [];
    };
  }, [initializeFCMService, addEventListener, updateStates]);

  /**
   * 네비게이션 변경 시 메시지 핸들러 업데이트
   */
  useEffect(() => {
    if (navigation && isInitialized) {
      const messageHandler = createDefaultMessageHandler(navigation, __DEV__);
      fcmService.current.setMessageHandler(messageHandler as any);
    }
  }, [navigation, isInitialized]);

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return () => {
      // 개발 모드에서만 서비스 정리 (프로덕션에서는 앱 전체에서 유지)
      if (__DEV__) {
        // fcmService.current.destroy(); // 주석 처리 - 앱 전체에서 FCM을 유지해야 함
      }
    };
  }, []);

  return {
    // 토큰 관련
    token,
    tokenError,
    isTokenLoading,
    refreshToken,

    // 권한 관련
    permission,
    requestPermission,

    // 메시지 관련
    lastMessage,
    messageHistory,
    clearMessageHistory,

    // 상태 관련
    isInitialized,
    error,

    // 유틸리티
    getDebugInfo,
  };
};

/**
 * FCM 토큰만 간단하게 사용하는 Hook
 */
export const useFCMToken = (userId?: string) => {
  const { token, tokenError, isTokenLoading, refreshToken, requestPermission } = useFCM(userId);

  return {
    token,
    error: tokenError,
    isLoading: isTokenLoading,
    refresh: refreshToken,
    requestPermission,
  };
};

/**
 * FCM 메시지만 간단하게 사용하는 Hook
 */
export const useFCMMessages = (navigation?: any) => {
  const { lastMessage, messageHistory, clearMessageHistory, isInitialized } = useFCM(undefined, navigation);

  return {
    lastMessage,
    messageHistory,
    clearHistory: clearMessageHistory,
    isReady: isInitialized,
  };
};

// FCM 서비스 유틸리티 함수들도 export (기존 호환성을 위해)
export {
  getFCMService,
  initializeFCM,
  FCMService,
} from '../services/fcmService';

export default useFCM;
