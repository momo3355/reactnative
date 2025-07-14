import { create } from 'zustand';
import { PostsValue ,SearchParams} from './types';
import { fetchPosts, PostDetail , insertData} from './api';


interface PostState {
    posts: PostsValue[];
    totalCnt: number;
    totalPages: number;
    loading: boolean;
    currentPage: number;
    error: string | null;
    errorTitle: string | null;
    
    // 상세보기 관련 상태 추가
    postDetail: PostsValue | null;
    detailLoading: boolean;
    detailError: string | undefined;
    
    success: boolean;

    setCurrentPage: (page: number) => void;
    loadPosts: (params:SearchParams) => Promise<void>;
    resetPosts: () => void;

      // 상세보기 관련 액션 추가
    loadPostDetail: (postId: number) => Promise<void>;
    clearPostDetail: () => void;
    
    insertData:(params:SearchParams) => Promise<void>;
    
  }
  
  export const usePostStore = create<PostState>((set) => ({
    posts: []  , 
    totalCnt: 0,
    totalPages: 0,
    currentPage :1,
    errorTitle : null,
    loading: false,
    error: null,

    // 상세보기 초기 상태
    postDetail: null,
    detailLoading: false,
    detailError: undefined,
    success : true,

    setCurrentPage: (page) => set({ currentPage: page }),
    
    resetPosts: () => {
        set({
          posts: [],
          currentPage: 1,
          totalPages: 0, // 👈 명확하게 0으로 (데이터 없음 표시)
          error: null,
          errorTitle: null,
        });
      },

    loadPosts: async (params:SearchParams) => {
        set({ loading: true, error: null });
        try{
            const data = await fetchPosts(params);
            const totalPages = Math.ceil(data.resultListCnt / 10);
            const pageNumber = Number(params.page);
            
            set((state) => ({
                posts:
                  pageNumber > 1
                    ? [...state.posts, ...data.resultList]
                    : data.resultList,
                totalCnt: data.resultListCnt,
                totalPages,
              }));
        }catch(e){
            set({ error: '게시글 목록을 불러오는 데 실패했습니다.' });
        } finally {
            set({ loading: false });
        }
    },
      // 상세보기 로드 함수
  loadPostDetail: async (postId: number) => {
    set({ detailLoading: true, detailError: undefined, postDetail: null });
    
    try {      
      // 목록에 없으면 API 호출
      const params: SearchParams = { id: postId };
      const data = await PostDetail(params);
      if (data.result) {
        set({ postDetail: data.result });
      } else {
        set({ detailError: '게시물을 찾을 수 없습니다.' });
      }
    } catch (e) {
      console.error('게시물 상세 정보 로드 실패:', e);
      set({ detailError: '게시물 상세 정보를 불러오는 데 실패했습니다.' });
    } finally {
      set({ detailLoading: false });
    }
  },
  // 데이터 삽입 함수
  insertData: async (params: SearchParams) => {
    set({ loading: true, detailError: undefined });
    try {
      const data = await insertData(params);
      if (data.success) {
        set({ success: true, detailError: undefined });
      } else {
        set({ success: false, detailError: data.errorMsg || '등록에 실패했습니다.' });
      }
    } catch (e) {
      console.error('데이터 삽입 실패:', e);
      set({ success: false, detailError: `등록중에 ${e} 오류가 발생되었습니다.` });
    } finally {
      set({ loading: false });
    }
  },
  // 상세보기 데이터 초기화
  clearPostDetail: () => {
    set({ 
      postDetail: null, 
      detailError: undefined, 
      detailLoading: false 
    });
  },

}));