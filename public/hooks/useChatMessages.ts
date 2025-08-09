/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable radix */
// hooks/useChatMessages.ts
import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { MessgeInfoValue, ChatItem, DateSeparator, SearchMessgeInfoParams } from '../store/zustandboard/types';
import { chatPostStore } from '../store/zustandboard/chatPostStore';

const getDateFromString = (dateStr: string) => {
  if (!dateStr) {return '';}
  return dateStr.split(' ')[0];
};

const addDateSeparators = (messages: MessgeInfoValue[]): ChatItem[] => {
  if (messages.length === 0) {return [];}

  const result: ChatItem[] = [];
  let currentDate = '';

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageDate = getDateFromString(message.cretDate || '');

    if (messageDate && messageDate !== currentDate) {
      currentDate = messageDate;
      result.unshift({
        id: `separator_${messageDate}`,
        type: 'DATE_SEPARATOR',
        date: messageDate,
      } as DateSeparator);
    }

    result.unshift(message);
  }

  return result;
};

// 메시지 읽음 처리
const processMessagesForRead = (messages: MessgeInfoValue[], userId: string) => {
  return messages.map((msg) => {
    // 내가 보낸 메시지가 아닌 경우만 처리
    if (msg.sender !== userId && msg.reUserId && typeof msg.reUserId === 'string' && msg.reUserId.trim() !== '') {
      const userIds = msg.reUserId.split(',').map(id => id.trim()).filter(id => id !== '');

      if (userIds.includes(userId)) {
        const currentReadCount = parseInt(msg.isRead) || 0;
        const newReadCount = Math.max(0, currentReadCount - 1);
        const updatedUserIds = userIds.filter(id => id !== userId);
        const updatedReUserId = updatedUserIds.join(',');

        return {
          ...msg,
          isRead: newReadCount.toString(),
          reUserId: updatedReUserId,
        };
      }
    }
    return msg;
  });
};

export const useChatMessages = (roomId: string, userId: string) => {
  const { loadMessgeInfoPosts } = chatPostStore();
  const [messages, setMessages] = useState<MessgeInfoValue[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingPreviousMessages, setIsLoadingPreviousMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [oldestMessageId, setOldestMessageId] = useState<number>(0);

  // 날짜 구분선이 포함된 채팅 아이템들 (메모화)
  const chatItems = useMemo(() => {
    return addDateSeparators(messages);
  }, [messages]);

  // 초기 메시지 로드
  const loadInitialMessages = useCallback(async () => {
    try {
      setIsLoadingMessages(true);
      setMessages([]);
      setOldestMessageId(0);
      setHasMoreMessages(true);

      const params: SearchMessgeInfoParams = {
        roomId,
        id: 0,
        sender: userId, // 🔥 로그인한 사용자 ID 추가
      };
      const response = await loadMessgeInfoPosts(params);

      if (response.success && response.messageInfoList?.length > 0) {
        const sortedMessages = response.messageInfoList.sort((a, b) => parseInt(b.id) - parseInt(a.id));

        // 1단계: 받은 메시지들에 대한 읽음 처리
        const processedMessages = processMessagesForRead(sortedMessages, userId);

        // 2단계: 모든 메시지의 reUserId에서 입장한 사용자 ID 제거 (-1 처리)
        const finalMessages = processedMessages.map((msg) => {
          const reUserIdStr = msg.reUserId;

          if (reUserIdStr && typeof reUserIdStr === 'string' && reUserIdStr.trim() !== '') {
            const userIds = reUserIdStr.split(',').map(id => id.trim()).filter(id => id !== '');

            if (userIds.includes(userId)) {
              const currentReadCount = parseInt(msg.isRead) || 0;
              const newReadCount = Math.max(0, currentReadCount - 1);
              const updatedUserIds = userIds.filter(id => id !== userId);
              const updatedReUserId = updatedUserIds.join(',');

              return {
                ...msg,
                isRead: newReadCount.toString(),
                reUserId: updatedReUserId,
              };
            }
          }

          return msg;
        });

        setMessages(finalMessages);

        if (finalMessages.length > 0) {
          const oldestMsg = finalMessages[finalMessages.length - 1];
          setOldestMessageId(parseInt(oldestMsg.id));
        }
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('메시지 로드 오류:', error);
      Alert.alert('오류', '메시지를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [roomId, userId, loadMessgeInfoPosts]);

  // 이전 메시지 로드 (무한 스크롤)
  const loadPreviousMessages = useCallback(async () => {
    if (isLoadingPreviousMessages || !hasMoreMessages) {return;}

    try {
      setIsLoadingPreviousMessages(true);

      const params: SearchMessgeInfoParams = {
        roomId,
        id: oldestMessageId,
        sender: userId, // 🔥 로그인한 사용자 ID 추가
      };
      const response = await loadMessgeInfoPosts(params);

      if (response.success && response.messageInfoList?.length > 0) {
        const sortedMessages = response.messageInfoList.sort((a, b) => parseInt(b.id) - parseInt(a.id));

        // 1단계: 받은 메시지들에 대한 읽음 처리
        const processedMessages = processMessagesForRead(sortedMessages, userId);

        // 2단계: 모든 메시지의 reUserId에서 입장한 사용자 ID 제거 (-1 처리)
        const finalMessages = processedMessages.map((msg) => {
          const reUserIdStr = msg.reUserId;

          if (reUserIdStr && typeof reUserIdStr === 'string' && reUserIdStr.trim() !== '') {
            const userIds = reUserIdStr.split(',').map(id => id.trim()).filter(id => id !== '');

            if (userIds.includes(userId)) {
              const currentReadCount = parseInt(msg.isRead) || 0;
              const newReadCount = Math.max(0, currentReadCount - 1);
              const updatedUserIds = userIds.filter(id => id !== userId);
              const updatedReUserId = updatedUserIds.join(',');

              return {
                ...msg,
                isRead: newReadCount.toString(),
                reUserId: updatedReUserId,
              };
            }
          }
          return msg;
        });

        setMessages(prevMessages => [...prevMessages, ...finalMessages]);

        if (finalMessages.length > 0) {
          const oldestMsg = finalMessages[finalMessages.length - 1];
          setOldestMessageId(parseInt(oldestMsg.id));
        }
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('이전 메시지 로드 오류:', error);
      Alert.alert('오류', '이전 메시지를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingPreviousMessages(false);
    }
  }, [isLoadingPreviousMessages, hasMoreMessages, roomId, oldestMessageId, userId, loadMessgeInfoPosts]);

  // 새 메시지 추가 또는 기존 메시지 업데이트
  const addMessage = useCallback((newMessage: MessgeInfoValue) => {
    // 🔥 메시지 추가 시 isRead 값 디버깅
    console.log('📦 [useChatMessages] addMessage 디버깅:', {
      messageId: newMessage.id,
      message: newMessage.message?.substring(0, 20) + '...',
      isRead: newMessage.isRead,
      sender: newMessage.sender,
      type: newMessage.type,
    });

    setMessages(prev => {
      // 🔥 자신이 보낸 메시지의 경우 기존 임시 메시지를 찾아서 업데이트
      if (newMessage.sender === userId && newMessage.isRead && newMessage.isRead !== '0') {
        const tempMessageIndex = prev.findIndex(msg =>
          msg.sender === userId &&
          msg.message === newMessage.message &&
          msg.id.startsWith('temp_') &&
          Math.abs(new Date(msg.cretDate).getTime() - new Date(newMessage.cretDate).getTime()) < 10000 // 10초 이내
        );

        if (tempMessageIndex !== -1) {
          console.log('🔄 [useChatMessages] 임시 메시지를 서버 메시지로 갱신:', {
            tempId: prev[tempMessageIndex].id,
            newId: newMessage.id,
            newIsRead: newMessage.isRead,
          });

          // 기존 임시 메시지를 서버 메시지로 교체
          const updatedMessages = [...prev];
          updatedMessages[tempMessageIndex] = newMessage;
          return updatedMessages;
        }
      }

      // 🔥 기존 메시지가 없으면 새로 추가
      console.log('➕ [useChatMessages] 새 메시지 추가');
      return [newMessage, ...prev];
    });
  }, [userId]); // 🔥 userId 의존성 추가

  // 메시지 읽음 상태 업데이트 - 모든 메시지의 reUserId 체크
  const markMessagesAsRead = useCallback((readerId: string) => {
    console.log('\n=== 👀 markMessagesAsRead 시작 ===');
    console.log('👤 읽음 처리할 사용자 (readerId):', readerId);

    setMessages(prevMessages => {
      // 🔥 방 입장 시 전체 메시지의 reUserId 체크 로그
      console.log('\n=== 📋 방 입장 시 전체 메시지 reUserId 체크 ===');
      prevMessages.forEach((msg, index) => {
        const reUserIdStr = msg.reUserId;

        if (reUserIdStr && typeof reUserIdStr === 'string' && reUserIdStr.trim() !== '') {
          const userIds = reUserIdStr.split(',').map(id => id.trim()).filter(id => id !== '');
          const hasMatchingUserId = userIds.includes(readerId);
          const checkResult = hasMatchingUserId ? 'O' : 'X';

          console.log(`📝 [${index}] [${checkResult}] "${msg.message?.substring(0, 25)}..." | sender: ${msg.sender} | reUserId: "${reUserIdStr}" | isRead: ${msg.isRead}`);
        } else {
          console.log(`📝 [${index}] [X] "${msg.message?.substring(0, 25)}..." | sender: ${msg.sender} | reUserId: 비어있음 | isRead: ${msg.isRead}`);
        }
      });
      console.log('=== 📋 전체 메시지 reUserId 체크 완료 ===\n');

      const updatedMessages = prevMessages.map((msg) => {
        // 모든 메시지의 reUserId 체크 (sender 상관없이)
        const reUserIdStr = msg.reUserId;

        if (reUserIdStr && typeof reUserIdStr === 'string' && reUserIdStr.trim() !== '') {
          const userIds = reUserIdStr.split(',').map(id => id.trim()).filter(id => id !== '');

          if (userIds.includes(readerId)) {
            const currentReadCount = parseInt(msg.isRead) || 0;
            const newReadCount = Math.max(0, currentReadCount - 1);
            const updatedUserIds = userIds.filter(id => id !== readerId);
            const updatedReUserId = updatedUserIds.join(',');

            return {
              ...msg,
              isRead: newReadCount.toString(),
              reUserId: updatedReUserId,
            };
          }
        }

        return msg;
      });

      console.log('=== 👀 markMessagesAsRead 완료 ===\n');
      return updatedMessages;
    });
  }, [userId]);

  // 메시지 업데이트 (예: 이미지 높이 설정)
  const updateMessage = useCallback((messageId: string, updates: Partial<MessgeInfoValue>) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, ...updates }
          : msg
      )
    );
  }, []);

  // 메시지 삭제
  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  // 모든 메시지 클리어
  const clearMessages = useCallback(() => {
    setMessages([]);
    setOldestMessageId(0);
    setHasMoreMessages(true);
  }, []);

  return {
    messages,
    chatItems,
    isLoadingMessages,
    isLoadingPreviousMessages,
    hasMoreMessages,
    loadInitialMessages,
    loadPreviousMessages,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    markMessagesAsRead,
  };
};
