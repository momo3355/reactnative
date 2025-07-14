export interface PostsValue{
    id: number;
    title: string;
    content: string;
    author: string;
    createdAt: string;
  }

export interface PostResponse {
  success: boolean;
  result?: PostsValue;
  resultList: PostsValue[];
  resultListCnt: number;
  errorTitle:string;
  errorMsg?: string;
}

export interface PostDetailResponse {
  result: {
    id: number;
    title: string;
    content: string;
    author: string;
    createdAt: string;
  };
}

// 검색 파라미터 타입 정의 (확장)
export interface SearchParams {
  id?: number;
  title?: string;
  content?: string;
  author?: string;
  page?: number;
  images?: string[]; // 이미지 URL 배열 (기존)
  imageFiles?: any[]; // 실제 이미지 파일 객체 배열 (새로 추가)
}

export interface PostState {
    posts: PostsValue[];  
    totalCnt: number;
    totalPages: number;
    loading: boolean;
    currentPage : number;
    error: string | null;
    errorTitle : string | null;
    setCurrentPage: (page: number) => void;
    loadPosts: (params:SearchParams) => Promise<void>;
    resetPosts: () => void;
}


// 검색 파라미터 타입 정의 (확장)
export interface SearchChatRoomParams {
  id? : number;
  userId? : string;
  roomId? : string;  
    imageFiles?: {
    uri: string;
    type: string;
    name: string;
  }[];
}

export interface ChatRoomPostsValue{
  id: string;
  roomId: string;
  roomName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  profileImage?: string;
  isOnline?: boolean;
  memberCount?: number;
}

export interface ChatRoomPostResponse {
  success: boolean;
  roomList: ChatRoomPostsValue[];  
  errorMsg?: string;
  data?: {
    imageUrl?: string;
    filePath?: string;
    // 다른 응답 필드들...
  };
}

export interface UploadedFileInfo {
  originalName: string;
  savedName: string;
  fileUrl: string;
  fileSize: number;
}

// 파일 업로드 응답 타입 추가
export interface ChatFileUploadResponse {
  success: boolean;
  errorMsg?: string;
  files?: UploadedFileInfo[]; 
}

export interface ChatPostState {
    posts: ChatRoomPostsValue[];  
    loading: boolean; // 로딩 상태 추가
    error: string | null; // 에러 메시지 상태 추가 (초기값은 null)
    success?: boolean;
    errorMsg?: string | null; 
    chatLoadPosts: (params:SearchChatRoomParams) => Promise<void>;
    chatFileUpload: (params: SearchChatRoomParams) => Promise<ChatFileUploadResponse>;
}
