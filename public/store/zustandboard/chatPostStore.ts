import { create } from 'zustand';
import { SearchChatRoomParams, ChatPostState, ChatFileUploadResponse, SearchMessgeInfoParams, MessgeInfoResponse} from './types';
import { chatRoomList, chatFileUpload, loadMessgeInfoPosts,} from './api';

  
export const chatPostStore = create<ChatPostState>((set) => ({
 // 초기 상태 정의
  posts: [], // 'posts' 속성을 빈 배열로 초기화
  loading: false, // 'loading' 초기 상태를 false로 설정
  error: null, // 'error' 초기 상태를 null로 설정

  chatLoadPosts: async (params:SearchChatRoomParams) => {   
      set({ loading: true, error: null });    

      try{
          const data = await chatRoomList(params);          
          set({posts:data.roomList });
      }catch(e){
          set({ error: '채팅 목록을 불러오는 데 실패했습니다.' });
      } finally {
          set({ loading: false });
      }
  },

 loadMessgeInfoPosts:async (params: SearchMessgeInfoParams): Promise<MessgeInfoResponse> => {
    set({ loading: true, error: null });
    try {
      const data = await loadMessgeInfoPosts(params);
      
      // 성공적으로 데이터를 받았을 때
      if (data.success) {
        return {
          success: true,
          chatMessageLoadCount: data.chatMessageLoadCount,
          messageInfoList: data.messageInfoList,
          errorMsg: data.errorMsg
        };
      } else {
        // 서버에서 실패 응답을 받았을 때
        set({ error: data.errorMsg || '메시지를 불러오는 데 실패했습니다.' });
        return {
          success: false,
          chatMessageLoadCount: 0,
          messageInfoList: [],
          errorMsg: data.errorMsg || '메시지를 불러오는 데 실패했습니다.'
        };
      }
    } catch (e) {
      const errorMessage = '메시지를 불러오는 데 실패했습니다.';
      set({ error: errorMessage });
      console.error('loadMessgeInfoPosts error:', e);
      
      return {
        success: false,
        chatMessageLoadCount: 0,
        messageInfoList: [],
        errorMsg: errorMessage
      };
    } finally {
      set({ loading: false });
    }
  },

  
// 데이터 삽입 함수 수정
chatFileUpload: async (params: SearchChatRoomParams): Promise<ChatFileUploadResponse> => {
  set({ loading: true, error: null });
  try {
    const data = await chatFileUpload(params); // 이 부분에서 실제 API 호출
    
    if (data.success) {
      set({ success: true, errorMsg: undefined });
      return data; // 응답 데이터 반환
    } else {
      set({ success: false, errorMsg: data.errorMsg || '등록에 실패했습니다.' });
      return data; // 실패한 응답도 반환
    }
  } catch (e) {
    console.error('데이터 삽입 실패:', e);
    const errorResponse: ChatFileUploadResponse = {
      success: false,
      errorMsg: `등록중에 ${e} 오류가 발생되었습니다.`
    };
    set({ success: false, errorMsg: errorResponse.errorMsg });
    return errorResponse; // 에러 응답 반환
  } finally {
    set({ loading: false });
  }
},
 

}));