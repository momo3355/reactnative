// 🔐 인증 상태 관리 Store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../api/client';
import { AuthState, LoginRequest, SignUpRequest, AuthResponse, User } from '../../types/auth';
import { authLogin, authSignUp, authIdCheck, tokenUpdate } from './api';

// Zustand Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 🔹 초기 상태
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // 🔹 로그인 액션
      login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        set({ loading: true, error: null });

        try {
          console.log('🔐 로그인 시도:', credentials.userId);

          const response = await authLogin(credentials);

          console.log('📝 로그인 응답:', {
            success: response.success,
            hasUser: !!response.user,
            hasToken: !!response.token,
            errorMsg: response.errorMsg,
          });

          if (response.success && response.user) {
            // 🔥 userName이 없으면 userId를 fallback으로 사용
            const normalizedUser = {
              ...response.user,
              userName: response.user.userName || '게스트',
            };

            console.log('🔍 사용자 정보 정규화:', {
              userId: normalizedUser.userId,
              userName: normalizedUser.userName,
              originalUserName: response.user.userName,
            });

            // 로그인 성공 (토큰이 없어도 OK)
            set({
              user: normalizedUser,
              token: response.token || 'session_' + Date.now(), // 토큰이 없으면 세션 ID 생성
              isAuthenticated: true,
              loading: false,
              error: null,
            });

            console.log('✅ 로그인 성공:', normalizedUser.userId, '(이름:', normalizedUser.userName, ')');

            // API 클라이언트에 토큰 설정 (선택적)
            if (response.token) {
              apiClient.defaults.headers.common.Authorization = `Bearer ${response.token}`;
            }

            // 🔥 FCM 토큰 업데이트 (비동기)
            // AsyncStorage에서 FCM 토큰 가져오기
            try {
              const fcmToken = await AsyncStorage.getItem('fcm_token');
              if (fcmToken) {
                get().updateToken(normalizedUser.userId, fcmToken).then((success) => {
                  if (success) {
                    console.log('✅ FCM 토큰 업데이트 성공');
                  } else {
                    console.log('⚠️ FCM 토큰 업데이트 실패');
                  }
                }).catch((error) => {
                  console.error('❌ FCM 토큰 업데이트 오류:', error);
                });
              }
            } catch (error) {
              console.error('❌ FCM 토큰 조회 오류:', error);
            }

          } else {
            // 로그인 실패
            set({
              loading: false,
              error: response.errorMsg || '로그인에 실패했습니다.',
            });
          }

          return response;

        } catch (error) {
          console.error('❌ 로그인 오류:', error);

          const errorMsg = '로그인 중 오류가 발생했습니다.';
          set({
            loading: false,
            error: errorMsg,
          });

          return {
            success: false,
            errorTitle: '로그인 실패',
            errorMsg,
          };
        }
      },

      // 🔹 회원가입 액션
      signUp: async (userData: SignUpRequest): Promise<AuthResponse> => {
        set({ loading: true, error: null });

        try {
          console.log('📝 회원가입 시도:', userData.userName);

          const response = await authSignUp(userData);

          if (response.success && response.user) {
            // 🔥 userName이 없으면 userId를 fallback으로 사용
            const normalizedUser = {
              ...response.user,
              userName: response.user.userName || response.user.userId || '게스트',
            };

            console.log('🔍 회원가입 사용자 정보 정규화:', {
              userId: normalizedUser.userId,
              userName: normalizedUser.userName,
              originalUserName: response.user.userName,
            });

            // 회원가입 성공 - 자동 로그인
            set({
              user: normalizedUser,
              token: response.token || 'session_' + Date.now(),
              isAuthenticated: true,
              loading: false,
              error: null,
            });

            console.log('✅ 회원가입 성공:', normalizedUser.userId, '(이름:', normalizedUser.userName, ')');

            // API 클라이언트에 토큰 설정 (선택적)
            if (response.token) {
              apiClient.defaults.headers.common.Authorization = `Bearer ${response.token}`;
            }

            // 🔥 FCM 토큰 업데이트 (비동기)
            // AsyncStorage에서 FCM 토큰 가져오기
            try {
              const fcmToken = await AsyncStorage.getItem('fcm_token');
              if (fcmToken) {
                get().updateToken(normalizedUser.userId, fcmToken).then((success) => {
                  if (success) {
                    console.log('✅ FCM 토큰 업데이트 성공 (회원가입)');
                  } else {
                    console.log('⚠️ FCM 토큰 업데이트 실패 (회원가입)');
                  }
                }).catch((error) => {
                  console.error('❌ FCM 토큰 업데이트 오류 (회원가입):', error);
                });
              }
            } catch (error) {
              console.error('❌ FCM 토큰 조회 오류 (회원가입):', error);
            }

          } else {
            // 회원가입 실패
            set({
              loading: false,
              error: response.errorMsg || '회원가입에 실패했습니다.',
            });
          }

          return response;

        } catch (error) {
          console.error('❌ 회원가입 오류:', error);

          const errorMsg = '회원가입 중 오류가 발생했습니다.';
          set({
            loading: false,
            error: errorMsg,
          });

          return {
            success: false,
            errorTitle: '회원가입 실패',
            errorMsg,
          };
        }
      },

      // 🔹 로그아웃 액션
      logout: () => {
        console.log('🚪 로그아웃 실행');

        // API 클라이언트에서 토큰 제거
        delete apiClient.defaults.headers.common.Authorization;

        // 상태 초기화
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      },

      // 🔹 에러 클리어 액션
      clearError: () => {
        set({ error: null });
      },

      // 🔹 ID 중복체크 액션
      checkIdDuplicate: async (userId: string) => {
        try {
          console.log('🔍 ID 중복체크 (Store):', userId);

          const response = await authIdCheck({ userId: userId.trim() });

          console.log('📝 ID 중복체크 응답 (Store):', response);

          return response;
        } catch (error) {
          console.error('❌ ID 중복체크 오류 (Store):', error);
          return {
            status: true, // 오류 시 안전하게 사용 불가로 처리
            message: '중복체크 중 오류가 발생했습니다.',
          };
        }
      },

      // 🔹 토큰 업데이트 액션
      updateToken: async (userId: string, token: string): Promise<boolean> => {
        try {
          console.log('🔄 토큰 업데이트 (Store):', userId);
          
          const response = await tokenUpdate({ userId: userId.trim(), token });
          
          console.log('📝 토큰 업데이트 응답 (Store):', response);
          
          return response.success;
        } catch (error) {
          console.error('❌ 토큰 업데이트 오류 (Store):', error);
          return false;
        }
      },

      // 🔹 FCM 토큰 설정 액션
      setFCMToken: async (fcmToken: string): Promise<void> => {
        try {
          console.log('🔔 FCM 토큰 설정:', fcmToken.substring(0, 20) + '...');
          
          // AsyncStorage에 FCM 토큰 저장
          await AsyncStorage.setItem('fcm_token', fcmToken);
          
          const { user } = get();
          
          if (user && user.userId) {
            // 로그인된 사용자가 있으면 서버에 토큰 업데이트
            const success = await get().updateToken(user.userId, fcmToken);
            if (success) {
              console.log('✅ FCM 토큰 서버 업데이트 성공');
            } else {
              console.log('⚠️ FCM 토큰 서버 업데이트 실패');
            }
          } else {
            console.log('📝 로그인되지 않음 - FCM 토큰만 저장');
          }
          
        } catch (error) {
          console.error('❌ FCM 토큰 설정 오류:', error);
        }
      },

      // 🔹 인증 상태 확인 액션 (토큰 체크 제거 - 단순히 저장된 토큰만 확인)
      checkAuthStatus: async () => {
        const { token, user } = get();

        console.log('🔍 저장된 인증 정보 확인...');

        if (token && user) {
          // 저장된 토큰과 사용자 정보가 있으면 인증된 것으로 처리
          set({
            isAuthenticated: true,
            loading: false,
          });

          // API 클라이언트에 토큰 설정 (선택적)
          if (token && token.startsWith('eyJ')) { // JWT 토큰인 경우만
            apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
          }

          console.log('✅ 저장된 인증 정보로 자동 로그인:', user.userId);
        } else {
          // 저장된 정보가 없으면 로그아웃 상태
          console.log('💭 저장된 인증 정보 없음');
          set({
            isAuthenticated: false,
            loading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage', // AsyncStorage 키
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }), // persist할 상태만 선택
    }
  )
);

// 편의 함수들
export const authActions = {
  // 현재 사용자 정보 가져오기
  getCurrentUser: (): User | null => {
    return useAuthStore.getState().user;
  },

  // 🔥 안전한 사용자 이름 가져오기 (fallback 지원)
  getUserName: (): string => {
    const user = useAuthStore.getState().user;
    return user?.userName || user?.userId || '게스트';
  },

  // 🔥 안전한 사용자 ID 가져오기
  getUserId: (): string => {
    const user = useAuthStore.getState().user;
    return user?.userId || 'guest';
  },

  // 인증 상태 확인
  isLoggedIn: (): boolean => {
    return useAuthStore.getState().isAuthenticated;
  },

  // 토큰 가져오기
  getToken: (): string | null => {
    return useAuthStore.getState().token;
  },

  // 로딩 상태 확인
  isLoading: (): boolean => {
    return useAuthStore.getState().loading;
  },

  // 디버그 정보
  getDebugInfo: () => {
    const state = useAuthStore.getState();
    const user = state.user;
    return {
      isAuthenticated: state.isAuthenticated,
      user: user,
      userId: user?.userId,
      userName: user?.userName,
      safeName: user?.userName || user?.userId || '게스트',
      hasToken: !!state.token,
      loading: state.loading,
      error: state.error,
    };
  },
};

export default useAuthStore;
