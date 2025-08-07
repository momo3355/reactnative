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
  console.log('\n=== 📚 processMessagesForRead 시작 ===');
  console.log('👤 읽음 처리 대상 사용자:', userId);
  console.log('💬 처리할 메시지 수:', messages.length);
  
  let processedCount = 0;
  let skippedCount = 0;
  
  const result = messages.map((msg, index) => {
    // 내가 보낸 메시지가 아닌 경우만 처리
    if (msg.sender !== userId && msg.reUserId && typeof msg.reUserId === 'string' && msg.reUserId.trim() !== '') {
      const userIds = msg.reUserId.split(',').map(id => id.trim()).filter(id => id !== '');
      
      // 🔥 중복 사용자 검사
      const duplicates = userIds.filter((item, index) => userIds.indexOf(item) !== index);
      if (duplicates.length > 0) {
        console.log('\n⭕ 중복 사용자 발견!');
        console.log('📝 메시지:', msg.message?.substring(0, 30) + '...');
        console.log('👥 reUserId 원본:', `"${msg.reUserId}"`);
        console.log('🔄 중복된 사용자들:', [...new Set(duplicates)]);
        console.log('📊 전체 사용자 배열:', userIds);
      }
      
      console.log(`\n📝 메시지 [${index}] 상세 정보:`);
      console.log('  - ID:', msg.id);
      console.log('  - 내용:', msg.message?.substring(0, 20) + '...');
      console.log('  - 보낸이:', msg.sender, '(타입:', typeof msg.sender, ')');
      console.log('  - reUserId 원본:', `"${msg.reUserId}"`, '(타입:', typeof msg.reUserId, ')');
      console.log('  - 현재 isRead:', msg.isRead, '(타입:', typeof msg.isRead, ')');
      console.log('  - userIds 배열:', userIds);
      console.log('  - 찾는 userId:', `"${userId}"`, '(타입:', typeof userId, ')');
      
      // 🔥 reUserId 동일값 체크 로그 추가
      const hasMatchingUserId = userIds.includes(userId);
      const checkResult = hasMatchingUserId ? 'O' : 'X';
      console.log(`  - 📋 reUserId 체크 [${checkResult}] 메시지: "${msg.message?.substring(0, 30)}..."`); 
      
      // 🔥 상세 비교 로그
      console.log('  - 🔍 상세 비교:');
      userIds.forEach((id, idx) => {
        const isMatch = id === userId;
        console.log(`    [${idx}] "${id}" === "${userId}" → ${isMatch}`);
      }); 
      
      if (userIds.includes(userId)) {
        const currentReadCount = parseInt(msg.isRead) || 0;
        const newReadCount = Math.max(0, currentReadCount - 1);
        const updatedUserIds = userIds.filter(id => id !== userId);
        const updatedReUserId = updatedUserIds.join(',');
        
        // 🔥 parseInt 상세 체크
        console.log('  ✅ 읽음 처리 실행!');
        console.log('    🔤 isRead 원본:', `"${msg.isRead}"`);
        console.log('    🔢 parseInt 결과:', parseInt(msg.isRead));
        console.log('    🔢 currentReadCount:', currentReadCount);
        console.log('    🔢 newReadCount (Math.max(0, currentReadCount - 1)):', newReadCount);
        console.log('    📊 isRead 변화: %s → %s', currentReadCount, newReadCount);
        console.log('    👥 reUserId 변화:');
        console.log('      - 이전: "%s"', msg.reUserId);
        console.log('      - 제거할 사용자: "%s"', userId);
        console.log('      - 남은 사용자 배열:', updatedUserIds);
        console.log('      - 이후: "%s"', updatedReUserId);
        
        processedCount++;
        return {
          ...msg,
          isRead: newReadCount.toString(),
          reUserId: updatedReUserId,
        };
      } else {
        console.log('  ➖ 대상 사용자가 아님 - 스킨');
        console.log('    🔍 includes 결과:', userIds.includes(userId));
        console.log('    📋 배열 내용:', userIds.map(id => `"${id}"`));
        skippedCount++;
      }
    } else {
      if (msg.sender === userId) {
        console.log(`\n📝 메시지 [${index}] - 내가 보낸 메시지 스킨`);
      } else {
        console.log(`\n📝 메시지 [${index}] - reUserId 비어있음 스킨`);
        console.log('    - reUserId:', `"${msg.reUserId}"`);
        console.log('    - reUserId 타입:', typeof msg.reUserId);
        console.log('    - reUserId trim:', msg.reUserId?.trim());
      }
      skippedCount++;
    }
    return msg;
  });
  
  console.log('\n=== 📚 processMessagesForRead 완료 ===');
  console.log('🔢 처리된 메시지 수:', processedCount);
  console.log('➖ 스킨된 메시지 수:', skippedCount);
  console.log('=== 📚 완료 ===\n');
  
  return result;
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
        
        console.log('\n=== 📺 초기 메시지 로드후 읽음 처리 ===');
        console.log('💬 로드된 메시지 수:', sortedMessages.length);
        console.log('👤 내 ID (userId):', userId);
        
        // 1단계: 받은 메시지들에 대한 읽음 처리 (processMessagesForRead)
        console.log('\n🔄 1단계: 받은 메시지 읽음 처리 시작...');
        const processedMessages = processMessagesForRead(sortedMessages, userId);
        console.log('✅ 1단계 완료: 받은 메시지 읽음 처리');
        
        // 2단계: 내가 보낸 메시지들에 대한 읽음 처리 (markMessagesAsRead 로직)
        console.log('\n🔄 2단계: 내가 보낸 메시지 읽음 처리 시작...');
        console.log('👤 방 입장한 사용자 ID:', userId);
        
        // 내가 보낸 메시지들의 reUserId에서 입장한 사용자 ID 제거 (-1 처리)
        const finalMessages = processedMessages.map((msg, index) => {
          // 내가 보낸 메시지만 처리
          if (msg.sender === userId) {
            const reUserIdStr = msg.reUserId;
            
            console.log(`\n📝 내 메시지 [${index}] 방 입장 읽음 처리:`);
            console.log('  - ID:', msg.id);
            console.log('  - 내용:', msg.message?.substring(0, 20) + '...');
            console.log('  - reUserId 원본:', `"${reUserIdStr}"`, '(타입:', typeof reUserIdStr, ')');
            console.log('  - 현재 isRead:', msg.isRead, '(타입:', typeof msg.isRead, ')');
            
            if (reUserIdStr && typeof reUserIdStr === 'string' && reUserIdStr.trim() !== '') {
              const userIds = reUserIdStr.split(',').map(id => id.trim()).filter(id => id !== '');
              
              console.log('  - userIds 배열:', userIds);
              console.log('  - 입장한 userId:', `"${userId}"`, '(타입:', typeof userId, ')');
              
              // 🔥 reUserId 동일값 체크 로그 추가
              const hasMatchingUserId = userIds.includes(userId);
              const checkResult = hasMatchingUserId ? 'O' : 'X';
              console.log(`  - 📋 방 입장 체크 [${checkResult}] 메시지: "${msg.message?.substring(0, 30)}..."`); 
              
              // 🔥 상세 비교 로그
              console.log('  - 🔍 상세 비교:');
              userIds.forEach((id, idx) => {
                const isMatch = id === userId;
                console.log(`    [${idx}] "${id}" === "${userId}" → ${isMatch}`);
              });
              
              if (userIds.includes(userId)) {
                const currentReadCount = parseInt(msg.isRead) || 0;
                const newReadCount = Math.max(0, currentReadCount - 1);
                const updatedUserIds = userIds.filter(id => id !== userId);
                const updatedReUserId = updatedUserIds.join(',');
                
                // 🔥 parseInt 상세 체크
                console.log('  ✅ 방 입장 읽음 처리 실행!');
                console.log('    🔤 isRead 원본:', `"${msg.isRead}"`);
                console.log('    🔢 parseInt 결과:', parseInt(msg.isRead));
                console.log('    🔢 currentReadCount:', currentReadCount);
                console.log('    🔢 newReadCount (Math.max(0, currentReadCount - 1)):', newReadCount);
                console.log('    📊 isRead 변화: %s → %s', currentReadCount, newReadCount);
                console.log('    👥 reUserId 변화:');
                console.log('      - 이전: "%s"', reUserIdStr);
                console.log('      - 제거할 사용자: "%s"', userId);
                console.log('      - 남은 사용자 배열:', updatedUserIds);
                console.log('      - 이후: "%s"', updatedReUserId);
                
                return {
                  ...msg,
                  isRead: newReadCount.toString(),
                  reUserId: updatedReUserId,
                };
              } else {
                console.log('  ➖ 입장한 사용자가 reUserId에 없음 - 스킨');
                console.log('    🔍 includes 결과:', userIds.includes(userId));
                console.log('    📋 배열 내용:', userIds.map(id => `"${id}"`));
              }
            } else {
              console.log('  ➖ reUserId가 비어있음 - 스킨');
              console.log('    - reUserId:', `"${reUserIdStr}"`);
              console.log('    - reUserId 타입:', typeof reUserIdStr);
              console.log('    - reUserId trim:', reUserIdStr?.trim());
            }
          } else {
            // 내가 보낸 메시지가 아니면 그대로 반환
            if (index < 3) { // 처음 3개만 로그
              console.log(`\n📝 다른 사용자 메시지 [${index}] - 스킨 (sender: ${msg.sender})`);
            }
          }
          
          return msg;
        });
        
        console.log('\n✅ 2단계 완료: 내가 보낸 메시지 읽음 처리');
        console.log('✅ 초기 로드 읽음 처리 완료\n');

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

      const params: SearchMessgeInfoParams = { roomId, id: oldestMessageId };
      const response = await loadMessgeInfoPosts(params);

      if (response.success && response.messageInfoList?.length > 0) {
        const sortedMessages = response.messageInfoList.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        
        console.log('\n=== 📺 이전 메시지 로드후 읽음 처리 ===');
        console.log('💬 로드된 이전 메시지 수:', sortedMessages.length);
        console.log('👤 내 ID (userId):', userId);
        
        // 1단계: 받은 메시지들에 대한 읽음 처리
        console.log('\n🔄 1단계: 받은 이전 메시지 읽음 처리 시작...');
        const processedMessages = processMessagesForRead(sortedMessages, userId);
        console.log('✅ 1단계 완료: 받은 이전 메시지 읽음 처리');
        
        // 2단계: 내가 보낸 메시지들에 대한 읽음 처리
        console.log('\n🔄 2단계: 내가 보낸 이전 메시지 읽음 처리 시작...');
        
        const finalMessages = processedMessages.map((msg, index) => {
          if (msg.sender === userId) {
            const reUserIdStr = msg.reUserId;
            
            if (reUserIdStr && typeof reUserIdStr === 'string' && reUserIdStr.trim() !== '') {
              const userIds = reUserIdStr.split(',').map(id => id.trim()).filter(id => id !== '');
              
              if (userIds.includes(userId)) {
                const currentReadCount = parseInt(msg.isRead) || 0;
                const newReadCount = Math.max(0, currentReadCount - 1);
                const updatedUserIds = userIds.filter(id => id !== userId);
                const updatedReUserId = updatedUserIds.join(',');
                
                console.log(`\n📝 이전 메시지 [${index}] 읽음 처리: "${msg.message?.substring(0, 20)}..." (${currentReadCount} → ${newReadCount})`);
                
                return {
                  ...msg,
                  isRead: newReadCount.toString(),
                  reUserId: updatedReUserId,
                };
              }
            }
          }
          return msg;
        });
        
        console.log('✅ 2단계 완료: 내가 보낸 이전 메시지 읽음 처리');
        console.log('✅ 이전 메시지 로드 읽음 처리 완료\n');

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

  // 새 메시지 추가
  const addMessage = useCallback((newMessage: MessgeInfoValue) => {
    setMessages(prev => [newMessage, ...prev]);
  }, []);

  // 메시지 읽음 상태 업데이트
  const markMessagesAsRead = useCallback((readerId: string) => {
    console.log('\n=== 👀 markMessagesAsRead 시작 ===');
    console.log('👤 읽음 처리할 사용자 (readerId):', readerId);
    console.log('👤 내 ID (userId):', userId);
    
    setMessages(prevMessages => {
      console.log('💬 처리 전 메시지 수:', prevMessages.length);
      
      // 🔥 방 입장 시 전체 메시지의 reUserId 체크 로그
      console.log('\n=== 📋 방 입장 시 전체 메시지 reUserId 체크 ===');
      prevMessages.forEach((msg, index) => {
        if (msg.sender === userId) {
          // 내가 보낸 메시지만 체크
          const reUserIdStr = msg.reUserId;
          
          if (reUserIdStr && typeof reUserIdStr === 'string' && reUserIdStr.trim() !== '') {
            const userIds = reUserIdStr.split(',').map(id => id.trim()).filter(id => id !== '');
            const hasMatchingUserId = userIds.includes(readerId);
            const checkResult = hasMatchingUserId ? 'O' : 'X';
            
            console.log(`📝 [${index}] [${checkResult}] "${msg.message?.substring(0, 25)}..." | reUserId: "${reUserIdStr}" | isRead: ${msg.isRead}`);
          } else {
            console.log(`📝 [${index}] [X] "${msg.message?.substring(0, 25)}..." | reUserId: 비어있음 | isRead: ${msg.isRead}`);
          }
        } else {
          // 다른 사람이 보낸 메시지는 간단히 표시
          if (index < 5) { // 처음 5개만 표시
            console.log(`📝 [${index}] [-] "${msg.message?.substring(0, 25)}..." | 다른 사용자 메시지 (sender: ${msg.sender})`);
          }
        }
      });
      console.log('=== 📋 전체 메시지 reUserId 체크 완료 ===\n');
      
      const updatedMessages = prevMessages.map((msg, index) => {
        // 내가 보낸 메시지만 처리
        if (msg.sender === userId) {
          const reUserIdStr = msg.reUserId;
          
          console.log(`\n📝 내 메시지 [${index}] 상세 정보:`);
          console.log('  - ID:', msg.id);
          console.log('  - 내용:', msg.message?.substring(0, 20) + '...');
          console.log('  - reUserId 원본:', `"${reUserIdStr}"`, '(타입:', typeof reUserIdStr, ')');
          console.log('  - 찾는 readerId:', `"${readerId}"`, '(타입:', typeof readerId, ')');

          if (reUserIdStr && typeof reUserIdStr === 'string' && reUserIdStr.trim() !== '') {
            const userIds = reUserIdStr.split(',').map(id => id.trim()).filter(id => id !== '');
            
            // 🔥 중복 사용자 검사
            const duplicates = userIds.filter((item, index) => userIds.indexOf(item) !== index);
            if (duplicates.length > 0) {
              console.log('\n⭕ 중복 사용자 발견! (markMessagesAsRead)');
              console.log('📝 메시지:', msg.message?.substring(0, 30) + '...');
              console.log('👥 reUserId 원본:', `"${reUserIdStr}"`);
              console.log('🔄 중복된 사용자들:', [...new Set(duplicates)]);
              console.log('📊 전체 사용자 배열:', userIds);
            }
            
            console.log('  - reUserId 파싱 결과:');
            console.log('    - split(",") 결과:', userIds);
            console.log('    - 제거할 대상 (readerId):', readerId);
            console.log('    - readerId가 리스트에 있나?', userIds.includes(readerId));
            
            // 🔥 reUserId 동일값 체크 로그 추가
            const hasMatchingReaderId = userIds.includes(readerId);
            const checkResult = hasMatchingReaderId ? 'O' : 'X';
            console.log(`    - 📋 reUserId 체크 [${checkResult}] 메시지: "${msg.message?.substring(0, 30)}..."`); 
            
            // 🔥 상세 비교 로그
            console.log('    - 🔍 상세 비교:');
            userIds.forEach((id, idx) => {
              const isMatch = id === readerId;
              console.log(`      [${idx}] "${id}" === "${readerId}" → ${isMatch}`);
            }); 

            if (userIds.includes(readerId)) {
              const currentReadCount = parseInt(msg.isRead) || 0;
              const newReadCount = Math.max(0, currentReadCount - 1);
              const updatedUserIds = userIds.filter(id => id !== readerId);
              const updatedReUserId = updatedUserIds.join(',');
              
              // 🔥 parseInt 상세 체크
              console.log('  ✅ 읽음 처리 실행!');
              console.log('    🔤 isRead 원본:', `"${msg.isRead}"`);
              console.log('    🔢 parseInt 결과:', parseInt(msg.isRead));
              console.log('    🔢 currentReadCount:', currentReadCount);
              console.log('    🔢 newReadCount (Math.max(0, currentReadCount - 1)):', newReadCount);
              console.log('    📊 isRead 변화: %s → %s', currentReadCount, newReadCount);
              console.log('    👥 reUserId 변화:');
              console.log('      - 이전: "%s"', reUserIdStr);
              console.log('      - 제거할 사용자: "%s"', readerId);
              console.log('      - 남은 사용자 배열:', updatedUserIds);
              console.log('      - 이후: "%s"', updatedReUserId);

              return {
                ...msg,
                isRead: newReadCount.toString(),
                reUserId: updatedReUserId,
              };
            } else {
              console.log('  ➖ readerId가 리스트에 없음 - 스킨');
              console.log('    🔍 includes 결과:', userIds.includes(readerId));
              console.log('    📋 배열 내용:', userIds.map(id => `"${id}"`));
            }
          } else {
            console.log('  ➖ reUserId가 비어있음 - 스킨');
            console.log('    - reUserId:', `"${reUserIdStr}"`);
            console.log('    - reUserId 타입:', typeof reUserIdStr);
            console.log('    - reUserId trim:', reUserIdStr?.trim());
          }
        } else {
          // 내가 보낸 메시지가 아니면 스킨
          if (index < 3) { // 처음 3개만 로그
            console.log(`\n📝 다른 사용자 메시지 [${index}] - 스킨 (sender: ${msg.sender})`);
          }
        }

        return msg;
      });
      
      console.log('\n=== 👀 markMessagesAsRead 완료 ===\n');
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
