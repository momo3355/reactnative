// 🚀 통합된 useAppState Hook
// 모든 앱 상태 관리 기능을 하나의 파일에 통합

import { useState, useEffect, useRef, useCallback} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AppKillDetection,
  AppSession,
  KillStatistics,
  AppDebugInfo,
  AppStateChangeLog,
  AppStateConfig,
  StorageKeys,
} from '../types/appState';

// =============================================================================
// 🔧 내부 유틸리티 함수들
// =============================================================================

const STORAGE_KEYS: StorageKeys = {
  LAST_CLOSE_TIME: 'app_last_close_time',
  LAST_APP_STATE: 'app_last_state',
  LAUNCH_TIME: 'app_launch_time',
  KILL_COUNT: 'app_kill_count',
  SESSION_ID: 'app_session_id',
  BACKGROUND_ENTRY_TIME: 'app_background_entry_time',
};

const BACKGROUND_TIMEOUT = 2 * 60 * 1000; // 2분

// =============================================================================
// 🔥 메인 useAppState Hook
// =============================================================================

export const useAppState = (config?: Partial<AppStateConfig>) => {
  // 기본 설정
  const defaultConfig: AppStateConfig = {
    enableKillDetection: true,
    enableDetailedLogging: __DEV__,
    backgroundTimeout: BACKGROUND_TIMEOUT,
    maxStateHistorySize: 100,
    enablePerformanceTracking: __DEV__,
  };

  const finalConfig = { ...defaultConfig, ...config };

  // =============================================================================
  // 📊 상태 관리
  // =============================================================================

  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [isUsingImagePicker, setIsUsingImagePicker] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<AppSession>({
    sessionId: '',
    launchTime: 0,
    isFirstLaunch: true,
    lastCloseTime: null,
    backgroundEntryTime: null,
  });

  const [killDetection, setKillDetection] = useState<AppKillDetection>({
    isAppKilled: false,
    killDetectionMethod: null,
    lastActiveTime: Date.now(),
    backgroundDuration: 0,
    killCount: 0,
  });

  const [isLoggingEnabled, setIsLoggingEnabled] = useState(finalConfig.enableDetailedLogging);

  // =============================================================================
  // 📝 Refs
  // =============================================================================

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const sessionStartTime = useRef<number>(Date.now());
  const lastActiveTimeRef = useRef<number>(Date.now());
  const backgroundStartTime = useRef<number | null>(null);
  const stateChangeCallbacks = useRef<Array<(state: AppStateStatus) => void>>([]);
  const stateHistory = useRef<AppStateChangeLog[]>([]);
  const initializationDone = useRef<boolean>(false);
  const performanceMetrics = useRef({
    stateChangeCount: 0,
    totalBackgroundTime: 0,
    longestBackgroundDuration: 0,
    averageBackgroundDuration: 0,
  });

  // =============================================================================
  // 🔄 세션 초기화
  // =============================================================================

  const initializeSession = useCallback(async () => {
    try {
      const currentTime = Date.now();
      const sessionId = currentTime.toString();

      const [lastCloseTime, lastSessionId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LAST_CLOSE_TIME),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID),
      ]);

      const isFirstLaunch = !lastSessionId;

      setSessionInfo({
        sessionId,
        launchTime: currentTime,
        isFirstLaunch,
        // eslint-disable-next-line radix
        lastCloseTime: lastCloseTime ? parseInt(lastCloseTime) : null,
        backgroundEntryTime: null,
      });

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId),
        AsyncStorage.setItem(STORAGE_KEYS.LAUNCH_TIME, currentTime.toString()),
      ]);

      if (isLoggingEnabled) {
        console.log('📱 [AppState] 세션 초기화:', {
          sessionId: sessionId.slice(-8),
          isFirstLaunch,
          lastCloseTime: lastCloseTime
            // eslint-disable-next-line radix
            ? new Date(parseInt(lastCloseTime)).toLocaleString()
            : '없음',
        });
      }
    } catch (err) {
      console.error('❌ [AppState] 세션 초기화 실패:', err);
    }
  }, [isLoggingEnabled]);

  // =============================================================================
  // 💀 앱 종료 감지
  // =============================================================================

  const detectPreviousKill = useCallback(async () => {
    if (!finalConfig.enableKillDetection) {return;}

    try {
      const currentTime = Date.now();

      if (isLoggingEnabled) {
        console.log('🔍 [AppState] 이전 종료 감지 시작');
      }

      const [
        lastCloseTime,
        lastAppState,
        killCount,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LAST_CLOSE_TIME),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_APP_STATE),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID),
        AsyncStorage.getItem(STORAGE_KEYS.KILL_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_ENTRY_TIME),
      ]);
      // eslint-disable-next-line radix
      const previousKillCount = killCount ? parseInt(killCount) : 0;
      let isKilled = false;
      let killMethod: AppKillDetection['killDetectionMethod'] = null;
      let backgroundDuration = 0;

      if (lastCloseTime && lastAppState) {
        // eslint-disable-next-line radix
        const timeDiff = currentTime - parseInt(lastCloseTime);
        const wasInBackground = lastAppState === 'background';

        if (wasInBackground && timeDiff > finalConfig.backgroundTimeout) {
          isKilled = true;
          killMethod = 'launch_detection';
          backgroundDuration = timeDiff;

          if (isLoggingEnabled) {
            console.log('💀 [AppState] 앱 종료 감지됨!', {
              method: killMethod,
              duration: `${Math.round(timeDiff / 60000)}분`,
              killCount: previousKillCount + 1,
            });
          }
        }
      }

      setKillDetection({
        isAppKilled: isKilled,
        killDetectionMethod: killMethod,
        lastActiveTime: currentTime,
        backgroundDuration,
        killCount: isKilled ? previousKillCount + 1 : previousKillCount,
      });

      if (isKilled) {
        await AsyncStorage.setItem(STORAGE_KEYS.KILL_COUNT, (previousKillCount + 1).toString());
      }

      lastActiveTimeRef.current = currentTime;

    } catch (error) {
      console.error('❌ [AppState] 이전 종료 감지 실패:', error);
    }
  }, [finalConfig.enableKillDetection, finalConfig.backgroundTimeout, isLoggingEnabled]);

  // =============================================================================
  // 📈 상태 변화 로그
  // =============================================================================

  const addStateChangeLog = useCallback((from: AppStateStatus, to: AppStateStatus, timestamp: number) => {
    const duration = timestamp - (stateHistory.current[0]?.timestamp || sessionStartTime.current);
    const log: AppStateChangeLog = { from, to, timestamp, duration };

    stateHistory.current.unshift(log);
    if (stateHistory.current.length > finalConfig.maxStateHistorySize) {
      stateHistory.current.length = finalConfig.maxStateHistorySize;
    }

    // 성능 메트릭 업데이트
    performanceMetrics.current.stateChangeCount++;

    // 백그라운드 시간 추적
    if (to === 'background') {
      backgroundStartTime.current = timestamp;
    } else if (from === 'background' && backgroundStartTime.current) {
      const backgroundDuration = timestamp - backgroundStartTime.current;
      performanceMetrics.current.totalBackgroundTime += backgroundDuration;

      if (backgroundDuration > performanceMetrics.current.longestBackgroundDuration) {
        performanceMetrics.current.longestBackgroundDuration = backgroundDuration;
      }

      // eslint-disable-next-line @typescript-eslint/no-shadow
      const backgroundCount = stateHistory.current.filter(log => log.from === 'background').length;
      if (backgroundCount > 0) {
        performanceMetrics.current.averageBackgroundDuration =
          performanceMetrics.current.totalBackgroundTime / backgroundCount;
      }

      backgroundStartTime.current = null;
    }
  }, [finalConfig.maxStateHistorySize]);

  // =============================================================================
  // 🔄 앱 상태 변화 핸들러
  // =============================================================================

  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      const prevState = appStateRef.current;
      const now = Date.now();

      if (prevState === nextAppState || isUsingImagePicker) {
        return;
      }

      appStateRef.current = nextAppState;
      setAppState(nextAppState);
      addStateChangeLog(prevState, nextAppState, now);

      if (isLoggingEnabled) {
        console.log(`📱 [AppState] 상태 변화: ${prevState} → ${nextAppState}`);
      }

      if (nextAppState === 'background') {
        await AsyncStorage.setItem(STORAGE_KEYS.BACKGROUND_ENTRY_TIME, now.toString());
        setSessionInfo((prev) => ({ ...prev, backgroundEntryTime: now }));
      } else if (nextAppState === 'active' && prevState === 'background') {
        setSessionInfo((prev) => ({ ...prev, backgroundEntryTime: null }));
        lastActiveTimeRef.current = now;
      }

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.LAST_APP_STATE, nextAppState),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_CLOSE_TIME, now.toString()),
      ]);

      stateChangeCallbacks.current.forEach((cb) => cb(nextAppState));
    },
    [isUsingImagePicker, isLoggingEnabled, addStateChangeLog]
  );

  // =============================================================================
  // 🎯 유틸리티 함수들
  // =============================================================================

  const calculateKillProbability = useCallback((): number => {
    const currentTime = Date.now();
    const backgroundTime = currentTime - lastActiveTimeRef.current;

    if (appState === 'active') {return 0;}

    if (backgroundTime < 1 * 60 * 1000) {return 5;}
    else if (backgroundTime < 2 * 60 * 1000) {return 25;}
    else if (backgroundTime < 5 * 60 * 1000) {return 60;}
    else if (backgroundTime < 10 * 60 * 1000) {return 80;}
    else if (backgroundTime < 30 * 60 * 1000) {return 95;}
    else {return 99;}
  }, [appState]);

  const resetKillDetection = useCallback(() => {
    if (isLoggingEnabled) {
      console.log('🔄 [AppState] 종료 감지 상태 리셋');
    }

    setKillDetection(prev => ({
      ...prev,
      isAppKilled: false,
      killDetectionMethod: null,
      lastActiveTime: Date.now(),
      backgroundDuration: 0,
    }));
  }, [isLoggingEnabled]);

  const getKillStatistics = useCallback(async (): Promise<KillStatistics> => {
    try {
      const [killCountStr, launchTimeStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.KILL_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.LAUNCH_TIME),
      ]);
      // eslint-disable-next-line radix
      const totalKills = killCountStr ? parseInt(killCountStr) : 0;
      // eslint-disable-next-line radix
      const launchTime = launchTimeStr ? parseInt(launchTimeStr) : Date.now();
      const sessionDuration = Date.now() - launchTime;

      return {
        totalKills,
        currentSessionKills: killDetection.killCount,
        averageSessionDuration: sessionDuration,
        lastKillTime: killDetection.isAppKilled ? killDetection.lastActiveTime : null,
      };
    } catch (error) {
      console.error('❌ [AppState] 통계 가져오기 실패:', error);
      return {
        totalKills: 0,
        currentSessionKills: 0,
        averageSessionDuration: 0,
        lastKillTime: null,
      };
    }
  }, [killDetection]);

  const getDebugInfo = useCallback(async (): Promise<AppDebugInfo> => {
    const killStats = await getKillStatistics();

    return {
      currentState: appState,
      sessionId: sessionInfo.sessionId,
      isAppKilled: killDetection.isAppKilled,
      killMethod: killDetection.killDetectionMethod,
      backgroundDuration: killDetection.backgroundDuration,
      killProbability: calculateKillProbability(),
      lastActiveTime: new Date(killDetection.lastActiveTime).toLocaleTimeString(),
      appLaunchTime: new Date(sessionInfo.launchTime).toLocaleTimeString(),
      killStatistics: killStats,
      backgroundTimeout: finalConfig.backgroundTimeout / 60000, // 분 단위
      stateHistory: stateHistory.current.slice(0, 10),
    };
  }, [appState, sessionInfo, killDetection, calculateKillProbability, getKillStatistics, finalConfig.backgroundTimeout]);

  const onStateChange = useCallback((callback: (state: AppStateStatus) => void) => {
    stateChangeCallbacks.current.push(callback);
    return () => {
      stateChangeCallbacks.current = stateChangeCallbacks.current.filter((cb) => cb !== callback);
    };
  }, []);

  const enableLogging = useCallback((enabled: boolean) => {
    setIsLoggingEnabled(enabled);
    if (enabled) {
      console.log('🔊 [AppState] 로깅 활성화됨');
    } else {
      console.log('🔇 [AppState] 로깅 비활성화됨');
    }
  }, []);

  const getStateHistory = useCallback((): AppStateChangeLog[] => {
    return [...stateHistory.current];
  }, []);

  const clearStateHistory = useCallback(() => {
    stateHistory.current = [];
    performanceMetrics.current = {
      stateChangeCount: 0,
      totalBackgroundTime: 0,
      longestBackgroundDuration: 0,
      averageBackgroundDuration: 0,
    };

    if (isLoggingEnabled) {
      console.log('🗑️ [AppState] 상태 히스토리 클리어됨');
    }
  }, [isLoggingEnabled]);

  const getSessionDuration = useCallback((): number => {
    return Date.now() - sessionStartTime.current;
  }, []);

  const getBackgroundTime = useCallback((): number => {
    if (appState === 'background' && backgroundStartTime.current) {
      return Date.now() - backgroundStartTime.current;
    }
    return 0;
  }, [appState]);

  const simulateAppKill = useCallback(async () => {
    if (isLoggingEnabled) {
      console.log('🧪 [AppState] 앱 종료 시뮬레이션');
    }

    const currentTime = Date.now();
    const pastTime = currentTime - (3 * 60 * 1000); // 3분 전

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.LAST_APP_STATE, 'background'),
      AsyncStorage.setItem(STORAGE_KEYS.LAST_CLOSE_TIME, pastTime.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.BACKGROUND_ENTRY_TIME, pastTime.toString()),
    ]);

    if (isLoggingEnabled) {
      console.log('✅ [AppState] 시뮬레이션 완료. 앱을 재시작하면 종료 감지됩니다.');
    }
  }, [isLoggingEnabled]);

  // =============================================================================
  // 🔧 초기화 및 이벤트 리스너
  // =============================================================================

  useEffect(() => {
    if (!initializationDone.current) {
      initializeSession();
      detectPreviousKill();
      initializationDone.current = true;
    }
  }, [initializeSession, detectPreviousKill]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub?.remove();
  }, [handleAppStateChange]);

  useEffect(() => {
    if (appState === 'active') {
      lastActiveTimeRef.current = Date.now();
    }
  }, [appState]);

  // 종료 감지 상태가 변경될 때 자동 리셋
  useEffect(() => {
    if (killDetection.isAppKilled && isLoggingEnabled) {
      console.log('🚨 [AppState] 앱 종료 감지 알림:', {
        method: killDetection.killDetectionMethod,
        duration: `${Math.round(killDetection.backgroundDuration / 60000)}분`,
        totalKills: killDetection.killCount,
      });

      // 3초 후 자동 리셋
      setTimeout(() => {
        resetKillDetection();
      }, 3000);
    }
  }, [killDetection.isAppKilled, killDetection.killDetectionMethod, killDetection.backgroundDuration, killDetection.killCount, isLoggingEnabled, resetKillDetection]);

  // =============================================================================
  // 📤 반환값
  // =============================================================================

  // 파생 상태들
  const isActive = appState === 'active';
  const isBackground = appState === 'background';
  const isInactive = appState === 'inactive';

  return {
    // 기본 상태 (기존 호환성)
    appState,
    isUsingImagePicker,
    setIsUsingImagePicker,

    // 파생 상태들
    isActive,
    isBackground,
    isInactive,

    // 세션 정보
    sessionInfo,

    // 종료 감지
    isAppKilled: killDetection.isAppKilled,
    killDetectionMethod: killDetection.killDetectionMethod,
    backgroundDuration: killDetection.backgroundDuration,
    killCount: killDetection.killCount,
    calculateKillProbability,
    resetKillDetection,
    getKillStatistics,
    simulateAppKill,

    // 디버그 기능
    getDebugInfo,
    enableLogging,
    isLoggingEnabled,

    // 고급 기능들
    onStateChange,
    getStateHistory,
    clearStateHistory,
    getSessionDuration,
    getBackgroundTime,

    // 설정
    config: finalConfig,
  };
};

// =============================================================================
// 🎯 간단한 버전들 (편의성을 위해)
// =============================================================================

/**
 * 가벼운 앱 상태만 필요한 경우
 */
export const useLightAppState = () => {
  const { appState, isActive, isBackground, isInactive } = useAppState({
    enableKillDetection: false,
    enableDetailedLogging: false,
    enablePerformanceTracking: false,
  });

  return { appState, isActive, isBackground, isInactive };
};

/**
 * 종료 감지만 필요한 경우
 */
export const useKillDetectionOnly = () => {
  const {
    isAppKilled,
    killDetectionMethod,
    backgroundDuration,
    killCount,
    calculateKillProbability,
    resetKillDetection,
    getKillStatistics,
    simulateAppKill,
  } = useAppState({
    enableDetailedLogging: false,
    enablePerformanceTracking: false,
  });

  return {
    isAppKilled,
    killDetectionMethod,
    backgroundDuration,
    killCount,
    calculateKillProbability,
    resetKillDetection,
    getKillStatistics,
    simulateAppKill,
  };
};

/**
 * 기존 useAppState 사용자를 위한 완전 호환 Hook
 */
export const useAppStateLegacy = () => {
  const result = useAppState({
    enableKillDetection: true,
    enableDetailedLogging: __DEV__,
    backgroundTimeout: 2 * 60 * 1000,
    maxStateHistorySize: 50,
    enablePerformanceTracking: false,
  });

  // 기존 인터페이스만 반환
  return {
    appState: result.appState,
    isUsingImagePicker: result.isUsingImagePicker,
    setIsUsingImagePicker: result.setIsUsingImagePicker,
    isAppKilled: result.isAppKilled,
    killDetectionMethod: result.killDetectionMethod,
    backgroundDuration: result.backgroundDuration,
    killCount: result.killCount,
    calculateKillProbability: result.calculateKillProbability,
    resetKillDetection: result.resetKillDetection,
    getDebugInfo: result.getDebugInfo,
    getKillStatistics: result.getKillStatistics,
    simulateAppKill: result.simulateAppKill,
  };
};

// =============================================================================
// 🔥 기본 export
// =============================================================================

export default useAppState;

/*
🔥 사용법 가이드:

1. 기본 사용:
   const { appState, isAppKilled, killCount } = useAppState();

2. 가벼운 버전:
   const { appState, isActive } = useLightAppState();

3. 종료 감지만:
   const { isAppKilled, killCount } = useKillDetectionOnly();

4. 기존 코드 호환:
   const appStateData = useAppStateLegacy();
*/
