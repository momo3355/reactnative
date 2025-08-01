// hooks/useChatWebSocket.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessgeInfoValue } from '../store/zustandboard/types';
import { getWebSocketUrl } from '../utils/chatUtils';

interface UseChatWebSocketProps {
  roomId: string;
  userId: string;
  userName: string;
  token:string;
  onMessageReceived: (message: MessgeInfoValue) => void;
  onUserEntered: (userId: string) => void;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionAttempts: number;
  lastConnectionTime: number;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;
const CONNECTION_TIMEOUT = 10000;

export const useChatWebSocket = ({
  roomId,
  userId,
  userName,
  token,
  onMessageReceived,
  onUserEntered,
}: UseChatWebSocketProps) => {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    connectionAttempts: 0,
    lastConnectionTime: 0,
  });

  // 🔥 실제 사용할 토큰 상태 관리
  const [actualToken, setActualToken] = useState<string>('');
  const stompClientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasEnteredRoomRef = useRef(false);

  // 🚀 함수 참조를 위한 ref (순환 의존성 방지)
  const connectRef = useRef<() => Promise<void>>();
  const ensureTokenRef = useRef<() => Promise<string>>();

 // 🔥 토큰 확인 및 로드 함수 (ref에 저장)
  ensureTokenRef.current = useCallback(async (): Promise<string> => {
    console.log('🔑 토큰 확인 시작...');
    console.log('전달받은 token:', token);
    console.log('현재 actualToken:', actualToken);
    
    // 1. 전달받은 token이 유효한 경우
    if (token && token.trim() !== '') {
      console.log('✅ 전달받은 토큰 사용:', token.substring(0, 20) + '...');
      setActualToken(token);
      return token;
    }
    
    // 2. actualToken이 이미 있는 경우
    if (actualToken && actualToken.trim() !== '') {
      console.log('✅ 기존 actualToken 사용:', actualToken.substring(0, 20) + '...');
      return actualToken;
    }
    
    // 3. AsyncStorage에서 토큰 로드 시도
    try {
      console.log('🔍 AsyncStorage에서 토큰 검색...');
      const storedToken = await AsyncStorage.getItem('fcm_token');
      if (storedToken && storedToken.trim() !== '') {
        console.log('✅ AsyncStorage에서 토큰 로드 성공:', storedToken.substring(0, 20) + '...');
        setActualToken(storedToken);
        return storedToken;
      }
    } catch (error) {
      console.error('❌ AsyncStorage 토큰 로드 실패:', error);
    }
    
    // 4. 모든 방법이 실패한 경우
    console.warn('⚠️ 토큰을 찾을 수 없음 - 빈 문자열 반환');
    return '';
  }, [token, actualToken]);

  // 🔥 토큰 변경 감지 및 업데이트
  useEffect(() => {
    if (token && token.trim() !== '' && token !== actualToken) {
      console.log('🔄 새로운 토큰 감지, 업데이트 중...');
      console.log('이전:', actualToken.substring(0, 20) + '...');
      console.log('새로운:', token.substring(0, 20) + '...');
      setActualToken(token);
    }
  }, [token, actualToken]);

  // 연결 상태 업데이트 헬퍼
  const updateState = useCallback((updates: Partial<WebSocketState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 웹소켓 메시지 수신 처리
  const handleMessage = useCallback((message: any) => {
    try {
      const receivedMessage = JSON.parse(message.body);
      console.log('📨 수신된 메시지:', receivedMessage);

      if (receivedMessage.type === 'ENTER') {
        console.log(`🚪 ${receivedMessage.sender}님이 방에 입장함 - 읽음 처리 시작`);
        // 🔥 ENTER 메시지 시 읽음 처리 실행
        onUserEntered(receivedMessage.sender);
        return;
      }
      
      // 메시지 정규화
      let reUserId = '';
      if (receivedMessage.userList && receivedMessage.userList.length > 0) {
        reUserId = receivedMessage.userList[0] || '';
      }
      
      const unreadCount = reUserId ? reUserId.split(',').filter(id => id.trim() !== '').length : 0;
      
      const normalizedMessage: MessgeInfoValue = { 
        ...receivedMessage, 
        id: receivedMessage.id || Date.now().toString(),
        cretDate: receivedMessage.cretDate || new Date().toLocaleString('sv-SE').replace('T', ' ').substring(0, 19),
        reUserId: reUserId,
        isRead: unreadCount.toString(),
        userList: receivedMessage.userList || []
      };
      
      console.log('📝 정규화된 메시지:', normalizedMessage);
      onMessageReceived(normalizedMessage);
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
    }
  }, [onMessageReceived, onUserEntered]);

  // 🔥 방 입장 메시지 전송 함수
  const sendRoomEnterMessage = useCallback(() => {
    console.log('🚪 sendRoomEnterMessage 함수 실행됨!');
    console.log('📊 현재 상태:', {
      stompClient: !!stompClientRef.current,
      isConnected: state.isConnected,
      hasEnteredRoom: hasEnteredRoomRef.current,
      roomId,
      userId,
      userName
    });

    if (!stompClientRef.current) {
      console.error('❌ STOMP 클라이언트가 없습니다');
      return false;
    }

    if (!state.isConnected) {
      console.error('❌ WebSocket이 연결되지 않았습니다');
      return false;
    }

    if (hasEnteredRoomRef.current) {
      console.warn('⚠️ 이미 방에 입장했습니다');
      return false;
    }

    try {
      const enterMessage = {
        roomId,
        sender: userId,
        userName: userName,
        type: 'ENTER',        
        cretDate: new Date().toLocaleString('sv-SE').replace('T', ' ').substring(0, 19),
      };

      console.log('📤 전송할 입장 메시지:', enterMessage);

      stompClientRef.current.publish({
        destination: '/pub/chat/enter',
        body: JSON.stringify(enterMessage)
      });

      hasEnteredRoomRef.current = true;
      console.log('✅ 방 입장 메시지 전송 완료');
      return true;
    } catch (error) {
      console.error('❌ 방 입장 메시지 전송 오류:', error);
      hasEnteredRoomRef.current = false;
      return false;
    }
  }, [roomId, userId, userName, state.isConnected]);

  // 🔥 연결 완료 시 자동 입장 메시지 전송 (핵심 부분!)
  useEffect(() => {
    console.log('🔄 연결 상태 변화 감지:', {
      isConnected: state.isConnected,
      hasEnteredRoom: hasEnteredRoomRef.current,
      stompClient: !!stompClientRef.current
    });

    // 연결되었고, 아직 입장하지 않았고, STOMP 클라이언트가 있을 때
    if (state.isConnected && !hasEnteredRoomRef.current && stompClientRef.current) {
      console.log('✨ 조건 만족 - 입장 메시지 전송 시작');
      
      // 🚨 setTimeout이 필요한 이유:
      // WebSocket 연결은 완료되었지만 STOMP 프로토콜이 완전히 준비되기까지 약간의 시간이 필요
      const timer = setTimeout(() => {
        console.log('⏰ 타이머 실행 - sendRoomEnterMessage 호출');
        const success = sendRoomEnterMessage();
        console.log('📊 전송 결과:', success);
      }, 1000); // 1초 대기

      return () => {
        console.log('🧹 타이머 정리');
        clearTimeout(timer);
      };
    }
  }, [state.isConnected, sendRoomEnterMessage]);

  // 연결 정리
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch (error) {
        console.error('STOMP 클라이언트 정리 오류:', error);
      }
      stompClientRef.current = null;
    }

    hasEnteredRoomRef.current = false;
  }, []);

  // 🚀 재연결 스케줄링 (ref 사용으로 순환 의존성 방지)
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current || state.connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    const delay = RECONNECT_DELAY * Math.pow(2, Math.min(state.connectionAttempts, 4));
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      // 🔥 ref를 통해 connect 호출 (의존성 순환 방지)
      connectRef.current?.();
    }, delay);
    
    console.log(`${delay}ms 후 재연결 시도 (${state.connectionAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
  }, [state.connectionAttempts]); // 🔥 connect 의존성 제거

  // 🚀 연결 함수 (ref에 저장하여 안정적인 참조 유지)
  connectRef.current = useCallback(async () => {
    if (state.isConnecting || state.isConnected) {
      return;
    }

    if (state.connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('최대 재연결 횟수 초과');
      return;
    }

    // 🔥 연결 전 토큰 확인 (ref 사용)
    console.log('🔑 연결 전 토큰 확인...');
    const validToken = await ensureTokenRef.current?.();
    
    if (!validToken || validToken.trim() === '') {
      console.error('❌ 유효한 토큰이 없어 연결을 중단합니다');
      console.log('대기 후 재시도...');
      
      // 토큰이 없으면 3초 후 재시도
      setTimeout(() => {
        if (!state.isConnected && !state.isConnecting) {
          connectRef.current?.();
        }
      }, 3000);
      return;
    }

    updateState({ 
      isConnecting: true,
      connectionAttempts: state.connectionAttempts + 1,
      lastConnectionTime: Date.now()
    });

    try {
      cleanup();

      // 안전한 WebSocket URL 사용
      const wsUrl = getWebSocketUrl();
      console.log('WebSocket 연결 시도:', wsUrl);
      
      const socket = new SockJS(wsUrl);
      stompClientRef.current = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          "chatType": "room",
          "userId": userId,
          "roomId": roomId,
          "token" : validToken 
        },
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        reconnectDelay: 0,
        debug: (str) => {
          if (__DEV__) {
            console.log('STOMP:', str);
          }
        },
        onConnect: (frame) => {
          console.log('🔗 WebSocket 연결 성공');
          console.log('📋 연결 정보:', frame.headers);
          
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }

          updateState({
            isConnected: true,
            isConnecting: false,
            connectionAttempts: 0
          });

          // 메시지 구독
          const subscriptionPath = `/sub/chat/room/${roomId}`;
          console.log('🔔 구독 경로:', subscriptionPath);
          
          try {
            const subscription = stompClientRef.current?.subscribe(subscriptionPath, handleMessage);
            console.log('✅ 메시지 구독 성공:', subscription);
          } catch (error) {
            console.error('❌ 메시지 구독 실패:', error);
          }
          
          // 🔥 여기서는 직접 호출하지 않음! useEffect가 처리함
          console.log('📝 onConnect 완료 - useEffect에서 입장 메시지 처리 예정');
        },
        onStompError: (frame) => {
          console.error('STOMP 오류:', frame.headers['message']);
          updateState({
            isConnected: false,
            isConnecting: false
          });
          
          scheduleReconnect();
        },
        onDisconnect: () => {
          console.log('WebSocket 연결 해제');
          updateState({
            isConnected: false,
            isConnecting: false
          });
          hasEnteredRoomRef.current = false;
        },
        onWebSocketClose: (event) => {
          console.log('WebSocket 종료:', event.code);
          updateState({
            isConnected: false,
            isConnecting: false
          });
          
          if (!event.wasClean && state.connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
            scheduleReconnect();
          }
        },
      });

      // 연결 타임아웃 설정
      connectionTimeoutRef.current = setTimeout(() => {
        if (state.isConnecting) {
          console.error('연결 타임아웃');
          cleanup();
          updateState({
            isConnecting: false,
            isConnected: false
          });
          scheduleReconnect();
        }
      }, CONNECTION_TIMEOUT);

      stompClientRef.current.activate();
      
    } catch (error) {
      console.error('WebSocket 연결 오류:', error);
      updateState({
        isConnected: false,
        isConnecting: false
      });
      scheduleReconnect();
    }
  }, [state, userId, roomId, handleMessage, updateState, cleanup, scheduleReconnect]); // 🔥 ensureToken 의존성 제거

  // 🚀 외부에서 사용할 connect 함수 (안정적인 참조)
  const connect = useCallback(async () => {
    await connectRef.current?.();
  }, []); // 🔥 의존성 없음 (ref 사용)

  // 연결 해제
  const disconnect = useCallback(() => {
    cleanup();
    updateState({
      isConnected: false,
      isConnecting: false,
      connectionAttempts: 0
    });
  }, [cleanup, updateState]);

  // 재연결
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => connectRef.current?.(), 100);
  }, [disconnect]); // 🔥 connect 의존성 제거

  // 메시지 전송
  const sendMessage = useCallback(async (type: string, message: string, imageInfo?: string): Promise<boolean> => {
    if (!stompClientRef.current || !state.isConnected) {
      console.error('WebSocket이 연결되지 않음');
      return false;
    }

    try {
      const messageToSend = {
        id: Date.now().toString(),
        sender: userId,
        message,
        userName: userName,
        roomId,
        type,
        cretDate: new Date().toLocaleString('sv-SE').replace('T', ' ').substring(0, 19),
        isRead: '0',
        reUserId: '',
        userList: [],
        ...(imageInfo && { imageInfo })
      };

      stompClientRef.current.publish({
        destination: '/pub/chat/message',
        body: JSON.stringify(messageToSend)
      });

      return true;
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      return false;
    }
  }, [state.isConnected, userId, userName, roomId]);

  // cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    connectionAttempts: state.connectionAttempts,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    sendRoomEnterMessage, // 🔥 수동 호출용으로 export
  };
};