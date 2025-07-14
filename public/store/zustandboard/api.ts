import apiClient from '../../api/client';
import { PostResponse,
        SearchParams,
        PostDetailResponse,
        SearchChatRoomParams,
        ChatRoomPostResponse} from './types';

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
                params.imageFiles.forEach((file, index) => {
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


export const chatRoomList = async (params:SearchChatRoomParams): Promise<ChatRoomPostResponse> => {           
        const res = await apiClient.post("/chat/chatRoomList", params);        
        return res.data;
};

export const chatFileUpload = async (params:SearchChatRoomParams): Promise<ChatRoomPostResponse> => {     

        const formData = new FormData();

        // 이미지 파일들 추가
        if (params.imageFiles && params.imageFiles.length > 0) {
                params.imageFiles.forEach((file, index) => {
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
