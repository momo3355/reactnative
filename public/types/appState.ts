import { AppStateStatus } from 'react-native';

// 앱 종료 감지 관련 타입
export interface AppKillDetection {
  isAppKilled: boolean;
  killDetectionMethod: 'background_timeout' | 'launch_detection' | 'abnormal_restart' | null;
  lastActiveTime: number;
  backgroundDuration: number;
  killCount: number;
}

// 앱 상태 관련 타입
export interface AppLifecycleState {
  currentState: AppStateStatus;
  previousState: AppStateStatus | null;
  isActive: boolean;
  isBackground: boolean;
  isInactive: boolean;
  stateChangeCount: number;
  sessionStartTime: number;
}

// 앱 세션 정보
export interface AppSession {
  sessionId: string;
  launchTime: number;
  isFirstLaunch: boolean;
  lastCloseTime: number | null;
  backgroundEntryTime: number | null;
}

// 저장소 키 상수
export interface StorageKeys {
  LAST_CLOSE_TIME: string;
  LAST_APP_STATE: string;
  LAUNCH_TIME: string;
  KILL_COUNT: string;
  SESSION_ID: string;
  BACKGROUND_ENTRY_TIME: string;
}

// 앱 종료 통계
export interface KillStatistics {
  totalKills: number;
  currentSessionKills: number;
  averageSessionDuration: number;
  lastKillTime: number | null;
}

// 앱 디버그 정보
export interface AppDebugInfo {
  currentState: AppStateStatus;
  sessionId: string;
  isAppKilled: boolean;
  killMethod: string | null;
  backgroundDuration: number;
  killProbability: number;
  lastActiveTime: string;
  appLaunchTime: string;
  killStatistics: KillStatistics;
  backgroundTimeout: number;
  stateHistory: AppStateChangeLog[];
}

// 상태 변화 로그
export interface AppStateChangeLog {
  from: AppStateStatus;
  to: AppStateStatus;
  timestamp: number;
  duration: number;
}

// Hook 반환 타입들
export interface UseAppLifecycleReturn {
  // 기본 상태
  appState: AppStateStatus;
  isActive: boolean;
  isBackground: boolean;
  isInactive: boolean;
  
  // 세션 정보
  sessionInfo: AppSession;
  
  // 이미지 피커 상태 (기존 호환성)
  isUsingImagePicker: boolean;
  setIsUsingImagePicker: (using: boolean) => void;
  
  // 상태 변화 이벤트
  onStateChange: (callback: (state: AppStateStatus) => void) => () => void;
}

export interface UseAppKillDetectionReturn {
  // 종료 감지 상태
  isAppKilled: boolean;
  killDetectionMethod: AppKillDetection['killDetectionMethod'];
  backgroundDuration: number;
  killCount: number;
  
  // 확률 계산
  calculateKillProbability: () => number;
  
  // 상태 관리
  resetKillDetection: () => void;
  
  // 통계
  getKillStatistics: () => Promise<KillStatistics>;
  
  // 테스트용
  simulateAppKill: () => Promise<void>;
}

export interface UseAppDebugReturn {
  // 디버그 정보
  getDebugInfo: () => Promise<AppDebugInfo>;
  
  // 로깅 제어
  enableLogging: (enabled: boolean) => void;
  isLoggingEnabled: boolean;
  
  // 상태 히스토리
  getStateHistory: () => AppStateChangeLog[];
  clearStateHistory: () => void;
  
  // 성능 측정
  getSessionDuration: () => number;
  getBackgroundTime: () => number;
}

// 설정 타입
export interface AppStateConfig {
  enableKillDetection: boolean;
  enableDetailedLogging: boolean;
  backgroundTimeout: number;
  maxStateHistorySize: number;
  enablePerformanceTracking: boolean;
}
