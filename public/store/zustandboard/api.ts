import apiClient from '../../api/client';
import { PostResponse,
        SearchParams,
        PostDetailResponse,
        SearchChatRoomParams,
        ChatRoomPostResponse,
        SearchMessgeInfoParams,
        MessgeInfoResponse } from './types';
        
// 🔥 인증 관련 타입들은 별도 파일에서 import
import { LoginRequest, SignUpRequest, AuthResponse, ServerAuthResponse, IdCheckRequest, IdCheckResponse, TokenUpdateRequest, TokenUpdateResponse } from '../../types/auth';

export const fetchPosts = async (params:SearchParams): Promise<PostResponse> => {     
    const res = await apiClient.post("/dashboard/list", params);
    return res.data;
 };


 export const PostDetail = async (params:SearchParams): Promise<PostDetailResponse> => {     
    const res = await apiClient.post("/dashboard/view", params);
    return res.data;
 };

export const insertData = async (params:SearchParams): Promise<PostResponse> => {     

        const formData = new FormData();

        // 텍스트 데이터 추가
        if (params.title) formData.append('title', params.title);
        if (params.content) formData.append('content', params.content);
        if (params.author) formData.append('author', params.author);

        // 이미지 파일들 추가
        if (params.imageFiles && params.imageFiles.length > 0) {
                params.imageFiles.forEach((file, _index) => {
                formData.append('files', {
                        uri: file.uri,
                        type: file.type,
                        name: file.name,
                } as any);
                });
        }

        const res = await apiClient.post("/dashboard/saveMobileBoard", formData, { headers: {'Content-Type': 'multipart/form-data'}});
        return res.data;
};


export const loadMessgeInfoPosts = async (params:SearchMessgeInfoParams): Promise<MessgeInfoResponse> => {     
    const res = await apiClient.post("/chat/chatMessgeLoadList", params);
    return res.data;
 };

// ===================
// 인증 관련 API 함수들
// ===================

// 🔥 ID 중복체크 API
export const authIdCheck = async (params: IdCheckRequest): Promise<IdCheckResponse> => {
    try {
        console.log('🔍 ID 중복체크 API 요청:', params.userId);
        
        const res = await apiClient.post('/auth/idCheck', params);
        const response = res.data;
        
        console.log('📝 ID 중복체크 응답:', response);
        
        return {
            status: response.status || false,
            message: response.message || ''
        };
    } catch (error: any) {
        console.error('❌ ID 중복체크 API 오류:', error);
        return {
            status: true, // 오류 시 안전하게 사용 불가로 처리
            message: '중복체크 중 오류가 발생했습니다.'
        };
    }
};
export const authLogin = async (params: LoginRequest): Promise<AuthResponse> => {
    try {
        console.log('🔐 로그인 API 요청:', params.userId);
        
        const body = `userId=${encodeURIComponent(params.userId)}&passwd=${encodeURIComponent(params.passwd)}`;
        const res = await apiClient.post('/auth/login', body, { 
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
        
        const serverResponse: ServerAuthResponse = res.data;
        console.log('📝 서버 응답:', serverResponse);
        
        if (serverResponse.status === 'success' && serverResponse.user) {
            // 서버 응답을 앱 내부 형식으로 변환
            return {
                success: true,
                user: {
                    id: serverResponse.user.id,
                    userId: serverResponse.user.userId,
                    email: serverResponse.user.email,
                    roles: serverResponse.user.roles,
                    userName: serverResponse.user.userName || serverResponse.user.userId, // 🔥 userName 필드로 수정
                },
                token: serverResponse.token || 'session_token_' + Date.now(), // 토큰이 없으면 세션 토큰
            };
        } else {
            return {
                success: false,
                errorTitle: '로그인 실패',
                errorMsg: serverResponse.message || '로그인에 실패했습니다.',
            };
        }
    } catch (error: any) {
        console.error('❌ 로그인 API 오류:', error);
        return {
            success: false,
            errorTitle: '로그인 실패',
            errorMsg: error.response?.data?.message || '네트워크 오류가 발생했습니다.',
        };
    }
};

export const authSignUp = async (params: SignUpRequest): Promise<AuthResponse> => {
    try {
        console.log('📝 회원가입 API 요청:', params); // 🔥 userId로 수정
           const formData = new FormData();

        // 텍스트 데이터 추가
        formData.append('userId', params.userId);
        formData.append('passwd', params.passwd);
        formData.append('userName', params.userName);
        formData.append('email', params.email);
        formData.append('gender', params.gender);

        const res = await apiClient.post("/auth/signup", formData, { headers: {'Content-Type': 'multipart/form-data'}});
        const serverResponse: ServerAuthResponse = res.data;
        
        console.log('📝 서버 응답:', serverResponse);
        
        if (serverResponse.status === 'success' && serverResponse.user) {
            // 서버 응답을 앱 내부 형식으로 변환
            return {
                success: true,
                user: {
                    id: serverResponse.user.id,
                    userId: serverResponse.user.userId,
                    email: serverResponse.user.email,
                    roles: serverResponse.user.roles,
                    userName: serverResponse.user.userName || params.userName, // 🔥 userName 필드로 수정
                },
                token: serverResponse.token || 'session_token_' + Date.now(),
            };
        } else {
            return {
                success: false,
                errorTitle: '회원가입 실패',
                errorMsg: serverResponse.message || '회원가입에 실패했습니다.',
            };
        }
    } catch (error: any) {
        console.error('❌ 회원가입 API 오류:', error);
        return {
            success: false,
            errorTitle: '회원가입 실패',
            errorMsg: error.response?.data?.message || '네트워크 오류가 발생했습니다.',
        };
    }
};

// 🔥 토큰 업데이트 API
export const tokenUpdate = async (params: TokenUpdateRequest): Promise<TokenUpdateResponse> => {
    try {
        console.log('🔄 토큰 업데이트 API 요청:', params.userId);
        
        const res = await apiClient.post("/auth/tokenUpdate", params);
        const response = res.data;
        
        console.log('📝 토큰 업데이트 응답:', response);
        
        return {
            success: response.success || response.status === 'success' || true,
            message: response.message || '토큰이 업데이트되었습니다.'
        };
    } catch (error: any) {
        console.error('❌ 토큰 업데이트 API 오류:', error);
        return {
            success: false,
            message: error.response?.data?.message || '토큰 업데이트 중 오류가 발생했습니다.'
        };
    }
};


export const chatRoomList = async (params:SearchChatRoomParams): Promise<ChatRoomPostResponse> => {           
        const res = await apiClient.post("/chat/chatRoomList", params);        
        return res.data;
};

export const chatFileUpload = async (params:SearchChatRoomParams): Promise<ChatRoomPostResponse> => {     

        const formData = new FormData();

        // 이미지 파일들 추가
        if (params.imageFiles && params.imageFiles.length > 0) {
                params.imageFiles.forEach((file, _index) => {
                formData.append('files', {
                        uri: file.uri,
                        type: file.type,
                        name: file.name,
                } as any);
                });
        }
        const res = await apiClient.post("/chat/fileUpload", formData, { headers: {'Content-Type': 'multipart/form-data'}});
        return res.data;
};

