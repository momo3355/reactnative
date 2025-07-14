import axios from 'axios';

// axios 클라이언트 설정
const apiClient = axios.create({
  baseURL: 'http://132.226.225.178:8888',
  timeout: 60000,
  withCredentials: true,
  headers: { 'content-Type': 'application/json' },
});

// 응답 인터셉터 추가
apiClient.interceptors.request.use(async (config) => {
  return config;
});

export default apiClient;
