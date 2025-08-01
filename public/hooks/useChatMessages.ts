// hooks/useChatMessages.ts
import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { MessgeInfoValue, ChatItem, DateSeparator, SearchMessgeInfoParams } from '../store/zustandboard/types'
import { chatPostStore } from '../store/zustandboard/chatPostStore';

const getDateFromString = (dateStr: string) => {
  if (!dateStr) return '';
  return dateStr.split(' ')[0];
};

const addDateSeparators = (messages: MessgeInfoValue[]): ChatItem[] => {
  if (messages.length === 0) return [];
  
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
        date: messageDate
      } as DateSeparator);
    }
    
    result.unshift(message);
  }
  
  return result;
};

// 메시지 읽음 처리
const processMessagesForRead = (messages: MessgeInfoValue[], userId: string) => {
  return messages.map(msg => {
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
          reUserId: updatedReUserId
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
      
      const params: SearchMessgeInfoParams = { roomId, id: 0 };
      const response = await loadMessgeInfoPosts(params);
      
      if (response.success && response.messageInfoList?.length > 0) {
        const sortedMessages = response.messageInfoList.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        const processedMessages = processMessagesForRead(sortedMessages, userId);
        
        setMessages(processedMessages);
        
        if (processedMessages.length > 0) {
          const oldestMsg = processedMessages[processedMessages.length - 1];
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
    if (isLoadingPreviousMessages || !hasMoreMessages) return;

    try {
      setIsLoadingPreviousMessages(true);
      
      const params: SearchMessgeInfoParams = { roomId, id: oldestMessageId };
      const response = await loadMessgeInfoPosts(params);
      
      if (response.success && response.messageInfoList?.length > 0) {
        const sortedMessages = response.messageInfoList.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        const processedMessages = processMessagesForRead(sortedMessages, userId);
        
        setMessages(prevMessages => [...prevMessages, ...processedMessages]);
        
        if (processedMessages.length > 0) {
          const oldestMsg = processedMessages[processedMessages.length - 1];
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

  // 새 메시지 추가
  const addMessage = useCallback((newMessage: MessgeInfoValue) => {
    setMessages(prev => [newMessage, ...prev]);
  }, []);

  // 메시지 읽음 상태 업데이트
  const markMessagesAsRead = useCallback((readerId: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.sender === userId) {
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
                reUserId: updatedReUserId
              };
            }
          }
        }
        
        return msg;
      })
    );
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