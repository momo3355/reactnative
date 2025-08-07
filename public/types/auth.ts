// 🔐 인증 관련 타입 정의

export interface User {
  id: string;
  userId: string;
  email: string;
  roles?: string[];
  userName?: string; // 선택적 필드로 변경
  createdAt?: string;
  profileImage?: string;
}

export interface LoginRequest {
  userId: string;
  passwd: string;
}

export interface SignUpRequest {
  userId: string;        // 🔥 username → userId로 변경
  passwd: string;        // 🔥 password → passwd로 변경
  confirmPassword: string;
  email: string;         // 🔥 유지
  userName: string;      // 🔥 name → userName으로 변경
  gender: 'M' | 'W' | ''; // 🔥 빈 문자열 허용 (선택 전 상태)
}

// 🔥 ID 중복체크 요청 타입
export interface IdCheckRequest {
  userId: string;
}

// 🔥 ID 중복체크 응답 타입
export interface IdCheckResponse {
  status: boolean; // true: 이미 사용 중, false: 사용 가능
  message?: string;
}

// 🔥 토큰 업데이트 요청 타입
export interface TokenUpdateRequest {
  userId: string;
  token: string;
}

// 🔥 토큰 업데이트 응답 타입
export interface TokenUpdateResponse {
  success: boolean;
  message?: string;
}

// 서버 실제 응답 형식
export interface ServerAuthResponse {
  message: string;
  status: string; // "success" | "error"
  user?: {
    id: string;
    userId: string;
    email: string;
    roles?: string[];
    userName?: string; // 서버에서 userName 필드 추가
  };
  token?: string; // 토큰이 있는 경우
}

// 앱 내부에서 사용하는 통합 응답 형식
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  errorTitle?: string;
  errorMsg?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  signUp: (userData: SignUpRequest) => Promise<AuthResponse>;
  logout: () => void;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
  checkIdDuplicate: (userId: string) => Promise<IdCheckResponse>; // 🔥 ID 중복체크 함수 추가
  updateToken: (userId: string, token: string) => Promise<boolean>; // 🔥 토큰 업데이트 함수 추가
  setFCMToken: (fcmToken: string) => Promise<void>; // 🔥 FCM 토큰 설정 함수 추가
}

export interface AuthScreenProps {
  onLoginSuccess?: () => void;
  onNavigateToSignUp?: () => void;
  onNavigateToLogin?: () => void;
}

export interface InputValidation {
  isValid: boolean;
  message: string;
}

export interface FormValidation {
  userId: InputValidation;        // 🔥 userName → userId
  passwd: InputValidation;        // 🔥 password → passwd
  confirmPassword?: InputValidation;
  email?: InputValidation;
  userName?: InputValidation;     // 🔥 name → userName
  gender?: InputValidation;       // 🔥 성별 필드 추가
}
