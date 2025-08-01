const SERVER_BASE_URL = 'http://132.226.225.178:8888';
const WEBSOCKET_URL = `${SERVER_BASE_URL}/ws-stomp`;
const UPLOAD_PATH = '/uploads/';
const PROFILE_IMAGE_PATH = `${SERVER_BASE_URL}/uploads/profile/`;

// 안전한 URL 반환 함수
export const getWebSocketUrl = () => {  
  return WEBSOCKET_URL;
};

export const formatTime = (cretDate?: string) => {
  let date: Date;
  if (cretDate) {
    date = new Date(cretDate);
  } else {
    date = new Date();
  }
  
  return date.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

export const formatDateSeparator = (dateStr: string) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getProfileImageUrl = (sender: string) => {  
  return `${PROFILE_IMAGE_PATH}${sender}.jpg`;
};

export const getMessageImageUrl = (imageInfo: string) => {
  // 파일명에 _thumbnail 추가하는 함수
  const addThumbnailSuffix = (url: string) => {
    // URL에서 파일 확장자 찾기
    const lastDotIndex = url.lastIndexOf('.');
    const lastSlashIndex = url.lastIndexOf('/');
    
    // 확장자가 있고, 마지막 슬래시 이후에 있는 경우
    if (lastDotIndex > lastSlashIndex && lastDotIndex !== -1) {
      const filename = url.substring(0, lastDotIndex);
      const extension = url.substring(lastDotIndex);
      return `${filename}_thumbnail${extension}`;
    }
    
    // 확장자가 없는 경우 끝에 _thumbnail 추가
    return `${url}_thumbnail`;
  };

  // 이미 http로 시작하는 완전한 URL인 경우
  if (imageInfo.startsWith('http')) {
    return addThumbnailSuffix(imageInfo);
  }
  
  // /uploads/로 시작하는 경우
  if (imageInfo.startsWith('/uploads/')) {
    const fullUrl = `${SERVER_BASE_URL}${imageInfo}`;
    return addThumbnailSuffix(fullUrl);
  }
  
  // 기본 경로에 파일명만 있는 경우
  const fullUrl = `${SERVER_BASE_URL}${UPLOAD_PATH}${imageInfo}`;
  return addThumbnailSuffix(fullUrl);
};

// 원본 이미지 URL (새로 추가)
export const getOriginalImageUrl = (imageInfo: string) => {
  if (imageInfo.startsWith('http')) {
    return imageInfo;
  }
  
  if (imageInfo.startsWith('/uploads/')) {
    return `${SERVER_BASE_URL}${imageInfo}`;
  }
  
  return `${SERVER_BASE_URL}${UPLOAD_PATH}${imageInfo}`;
};

export const getFullImageUrl = (fileUrl: string) => {
  if (fileUrl.startsWith('http')) {
    return fileUrl;
  }
  return `${SERVER_BASE_URL}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
};