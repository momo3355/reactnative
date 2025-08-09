/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, AppState, AppStateStatus } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import { chatPostStore } from '../store/zustandboard/chatPostStore'; // Zustand store import
import { ChatRoomPostsValue } from '../store/zustandboard/types'; // 타입 정의 import
import { useAuthStore } from '../store/zustandboard/authStore'; // 인증 스토어 import

// Props 타입 정의 - 네비게이션 콜백 함수 포함
interface BoardScreenProps {
  onChatNavigateToPost?: (roomId: string) => void;
  onRefreshRequest?: boolean; // 🔥 새로고침 요청 플래그 추가
}

const ChatScreen: React.FC<BoardScreenProps> = ({onChatNavigateToPost, onRefreshRequest}) => {

  // 🔐 로그인한 사용자 정보 가져오기
  const { user } = useAuthStore();
  const currentUserId = user?.userId || 'guest';

  const {
    posts,           // 게시물 리스트
    chatLoadPosts,   // 게시물 초기화 함수
    updateUnreadCount, // 읽지 않은 메시지 카운터 업데이트 함수
    updateLastMessage, // 마지막 메시지 업데이트 함수
    resetUnreadCount} = chatPostStore();  // 카운터 리셋 함수

  /**
   * 초기 데이터 로드 함수
   */
  const loadInitialData = useCallback(async () => {
      console.log('📁 채팅방 리스트 로드:', currentUserId);
      await chatLoadPosts({userId: currentUserId});
  }, [currentUserId, chatLoadPosts]);

  /**
   * 화면 포커스 시 데이터 새로고침 (채팅방에서 뒤로가기 시에도 자동 새로고침)
   * useFocusEffect 사용으로 채팅방에서 메시지 전송 후 뒤로가기 시 최신 상태 반영
   */
  useFocusEffect(
    useCallback(() => {
      console.log('=== ChatScreen 포커스됨 - 데이터 새로고침 ===');
      if (currentUserId && currentUserId !== 'guest') {
        loadInitialData();
      }
    }, [currentUserId])
  );

  /**
   * 외부에서 새로고침 요청 시 처리
   */
  useEffect(() => {
    if (onRefreshRequest) {
      // 새로고침 요청 리스너 등록
      const handleRefresh = () => {
        console.log('🔄 [ChatScreen] 외부 새로고침 요청 수신');
        if (currentUserId && currentUserId !== 'guest') {
          loadInitialData();
        }
      };
      
      // 콜백을 전역으로 등록 (React Native에서는 global 사용)
      (global as any).refreshChatScreen = handleRefresh;
      
      return () => {
        delete (global as any).refreshChatScreen;
      };
    }
  }, [onRefreshRequest, currentUserId]);

  /**
   * 앱 상태 변화 감지 - 백그라운드에서 포그라운드로 돌아올 때 새로고침
   */
  useEffect(() => {
    console.log('📱 [ChatScreen] AppState 리스너 등록');
    
    let appStateSubscription: any;
    let previousAppState = AppState.currentState;
    
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('📱 [ChatScreen] AppState 변화:', {
        previous: previousAppState,
        current: nextAppState
      });
      
      // 백그라운드에서 포그라운드로 돌아올 때
      if (previousAppState !== 'active' && nextAppState === 'active') {
        console.log('🌅 [ChatScreen] 앱이 포그라운드로 돌아옴 - 데이터 새로고침');
        if (currentUserId && currentUserId !== 'guest') {
          loadInitialData();
        }
      }
      
      previousAppState = nextAppState;
    };
    
    // AppState 리스너 등록
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      console.log('🧹 [ChatScreen] AppState 리스너 해제');
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
    };
  }, [currentUserId, loadInitialData]);

  /**
   * FCM 메시지 처리 리스너 설정
   */
  useEffect(() => {
    console.log('📡 [ChatScreen] FCM 리스너 설정');
    
    // 포그라운드 메시지 리스너
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('📥 [ChatScreen] FCM 메시지 수신:', remoteMessage);
      
      // 🔥 더 자세한 데이터 추출
      const fcmRoomId = remoteMessage.data?.roomId as string;
      const messageText = remoteMessage.notification?.body || (remoteMessage.data?.message as string) || '';
      const messageType = remoteMessage.data?.type as string || 'TALK'; // 🔥 메시지 타입 추가
      const sender = remoteMessage.data?.sender || remoteMessage.data?.userName || 'Unknown';
      const timestamp = remoteMessage.data?.sentTime as string;
      const imageInfo = remoteMessage.data?.imageInfo as string; // 🔥 이미지 정보 추가
      
      console.log('🔍 [ChatScreen] FCM 데이터 파싱 결과:', {
        roomId: fcmRoomId,
        messageType: messageType,
        messageText: messageText,
        sender: sender,
        imageInfo: imageInfo
      });
      
      if (fcmRoomId) {
        console.log('🔥 [ChatScreen] 채팅방 리스트 업데이트:', {
          roomId: fcmRoomId,
          type: messageType,
          message: messageType === 'IMAGE' ? '사진을 보냈습니다.' : messageText,
          sender: sender
        });
        
        // 🔥 이미지 메시지인 경우 표시 메시지 변경
        const displayMessage = messageType === 'IMAGE' ? '사진을 보냈습니다.' : messageText;
        
        // 채팅방 리스트에서 해당 roomId의 마지막 메시지와 카운터 업데이트
        if (updateLastMessage && updateUnreadCount) {
          // 🔥 마지막 메시지 업데이트 (타입 정보 포함)
          updateLastMessage(fcmRoomId, displayMessage, timestamp || '', messageType);
          updateUnreadCount(fcmRoomId, 1);
          
          console.log('✅ [ChatScreen] 카운터 업데이트 완료');
        } else {
          console.error('❌ [ChatScreen] updateLastMessage 또는 updateUnreadCount 함수가 없음');
        }
        
        // 🔥 데이터 새로고침 (중요!)
        setTimeout(() => {
          console.log('🔄 [ChatScreen] FCM 후 데이터 새로고침 실행');
          if (currentUserId && currentUserId !== 'guest') {
            loadInitialData();
          }
        }, 500); // 500ms 후 새로고침
      } else {
        console.warn('⚠️ [ChatScreen] FCM 메시진에 roomId가 없음');
      }
    });
    
    // 백그라운드/종료 상태에서 앱 열릴 때 메시지 처리
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('🚀 [ChatScreen] 앱이 종료 상태에서 FCM으로 열림:', remoteMessage);
          handleFCMMessage(remoteMessage);
        }
      });
    
    // 백그라운드에서 알림 터치로 앱 열릴 때
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('🚀 [ChatScreen] 백그라운드에서 FCM으로 앱 열림:', remoteMessage);
      handleFCMMessage(remoteMessage);
    });
    
    return () => {
      console.log('🧹 [ChatScreen] FCM 리스너 해제');
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, [updateUnreadCount, updateLastMessage, currentUserId, loadInitialData]); // 🔥 loadInitialData 의존성 추가
  
  // FCM 메시지 처리 함수 (백그라운드/종료 상태에서 앱 열 때)
  const handleFCMMessage = (remoteMessage: any) => {
    console.log('🔍 [ChatScreen] handleFCMMessage 실행:', remoteMessage);
    
    const fcmRoomId = remoteMessage.data?.roomId as string;
    const messageText = remoteMessage.notification?.body || (remoteMessage.data?.message as string) || '';
    const messageType = remoteMessage.data?.type as string || 'TALK'; // 🔥 메시지 타입 추가
    const sender = remoteMessage.data?.sender || remoteMessage.data?.userName || 'Unknown';
    const timestamp = remoteMessage.data?.sentTime as string;
    const imageInfo = remoteMessage.data?.imageInfo as string; // 🔥 이미지 정보 추가
    
    console.log('🔍 [ChatScreen] handleFCMMessage 데이터 파싱:', {
      roomId: fcmRoomId,
      messageType: messageType,
      messageText: messageText,
      sender: sender,
      imageInfo: imageInfo
    });
    
    if (fcmRoomId) {
      console.log('🔥 [ChatScreen] handleFCMMessage - 채팅방 리스트 업데이트:', {
        roomId: fcmRoomId,
        type: messageType,
        message: messageType === 'IMAGE' ? '사진을 보냈습니다.' : messageText,
        sender: sender
      });
      
      // 🔥 이미지 메시지인 경우 표시 메시지 변경
      const displayMessage = messageType === 'IMAGE' ? '사진을 보냈습니다.' : messageText;
      
      if (updateLastMessage && updateUnreadCount) {
        console.log('🔥 [ChatScreen] handleFCMMessage - 카운터 업데이트 실행');
        
        // 🔥 마지막 메시지 업데이트 (타입 정보 포함)
        updateLastMessage(fcmRoomId, displayMessage, timestamp || '', messageType);
        updateUnreadCount(fcmRoomId, 1);
        
        console.log('✅ [ChatScreen] handleFCMMessage - 카운터 업데이트 완료');
        
        // 🔥 데이터 새로고침 (중요!)
        setTimeout(() => {
          console.log('🔄 [ChatScreen] handleFCMMessage - 데이터 새로고침 실행');
          if (currentUserId && currentUserId !== 'guest') {
            loadInitialData();
          }
        }, 1000); // 1초 후 새로고침 (백그라운드에서 오는 경우 조금 더 기다림)
      } else {
        console.error('❌ [ChatScreen] handleFCMMessage - updateLastMessage 또는 updateUnreadCount 함수가 없음');
      }
    } else {
      console.warn('⚠️ [ChatScreen] handleFCMMessage - roomId가 없음');
    }
  };

  const handlePostPress = (post: ChatRoomPostsValue) => {
    // null/undefined 체크
    if (!post) {
      console.warn('⚠️ handlePostPress: post가 null 또는 undefined입니다.');
      return;
    }
    
    const safeRoomId = post.roomId || '';
    const safeRoomName = post.roomName || '채팅방';
    const safeLastMessage = post.lastMessage || '';
    
    console.log('🎯 [STEP 1] 채팅방 클릭됨:', {
      roomId: safeRoomId,
      roomName: safeRoomName,
      lastMessage: safeLastMessage
    });
    
    // 채팅방 진입 시 읽지 않은 메시지 카운터 리셋
    const unreadCount = Number(post.unreadCount) || 0;
    if (unreadCount > 0 && resetUnreadCount && safeRoomId) {
      resetUnreadCount(safeRoomId);
    }
    
    try{
        if (typeof onChatNavigateToPost === 'function' && safeRoomId) { // 함수인지 명시적으로 확인
          console.log('🎯 [STEP 2] onChatNavigateToPost 콜백 호출:', safeRoomId);
          onChatNavigateToPost(safeRoomId);
          console.log('🎯 [STEP 3] 콜백 호출 완료');
        } else {
          console.warn('⚠️ onChatNavigateToPost 함수가 정의되지 않았거나 roomId가 비어있습니다.');
        }
    }catch(e){
      console.error('❌ 채팅방 이동 중 에러:', e);
    }
  };

  // 시간 포맷팅 함수
  const formatTime = (timeString?: string): string => {
    try {
      if (!timeString || typeof timeString !== 'string') {
        return '';
      }

      const now = new Date();
      const messageTime = new Date(timeString);
      
      // 유효한 날짜인지 확인
      if (isNaN(messageTime.getTime())) {
        return '';
      }
      
      // 오늘 날짜와 비교
      const nowDateStr = now.toDateString();
      const messageDateStr = messageTime.toDateString();
      
      if (nowDateStr === messageDateStr) {
        // 오늘 날짜와 같으면: "09:56:29" → "09:56"
        const hours = messageTime.getHours().toString().padStart(2, '0');
        const minutes = messageTime.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else {
        // 날짜가 다름
        if (now.getFullYear() === messageTime.getFullYear()) {
          // 년도가 같으면: "08-08"
          const month = (messageTime.getMonth() + 1).toString().padStart(2, '0');
          const day = messageTime.getDate().toString().padStart(2, '0');
          return `${month}-${day}`;
        } else {
          // 년도가 다르면: "2025.08.08"
          const year = messageTime.getFullYear();
          const month = (messageTime.getMonth() + 1).toString().padStart(2, '0');
          const day = messageTime.getDate().toString().padStart(2, '0');
          return `${year}.${month}.${day}`;
        }
      }
    } catch (error) {
      console.warn('⚙️ formatTime 오류:', error);
      return '';
    }
  };

  // 기본 프로필 이미지 생성 함수
  const getDefaultProfileImage = (roomName?: string) => {
    if (!roomName || roomName.length === 0) {
      return '?'; // 기본값
    }
    const firstChar = roomName.charAt(0).toUpperCase();
    return firstChar;
  };

  const renderItem = ({ item }: { item: ChatRoomPostsValue }) => {
    // null/undefined 체크
    if (!item) {
      return null;
    }
    
    // 안전한 데이터 처리
    const safeRoomName = item?.roomName || '채팅방';
    const safeLastMessage = String(item?.lastMessage || ''); // 🔥 String()으로 감싸서 문자열 보장
    const safeLastType = item?.lastType || 'TALK';
    const safeUnreadCount = Number(item?.unreadCount) || 0;
    const safeMemberCount = Number(item?.memberCount) || 0;
    const safeTime = formatTime(item?.lastMessageTime) || '';
    
    // 마지막 메시지 표시 - 안전한 trim() 사용
    const displayMessage = safeLastType === 'IMAGE' 
      ? '사진을 보냈습니다.' 
      : (safeLastMessage && typeof safeLastMessage === 'string' && safeLastMessage.trim() !== '') 
        ? safeLastMessage 
        : '새로운 채팅방입니다.';
    
    // 카운터 표시
    const displayCount = safeUnreadCount > 99 ? '99+' : String(safeUnreadCount);
    
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handlePostPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.contentContainer}>
          {/* 프로필 이미지 영역 */}
          <View style={styles.profileContainer}>
            {item.profileImage ? (
              <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.defaultProfileImage}>
                <Text style={styles.defaultProfileText}>
                  {getDefaultProfileImage(safeRoomName)}
                </Text>
              </View>
            )}
            {/* 온라인 상태 표시 */}
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>

          {/* 메시지 내용 영역 */}
          <View style={styles.messageContainer}>
            <View style={styles.topRow}>
              <Text style={styles.roomName} numberOfLines={1}>
                {safeRoomName}
              </Text>
              {safeMemberCount > 2 && (
                <Text style={styles.memberCount}>
                  {String(safeMemberCount)}
                </Text>
              )}
            </View>

            <Text style={styles.lastMessage} numberOfLines={2}>
              {displayMessage}
            </Text>
          </View>

          {/* 시간 및 읽지 않은 메시지 수 영역 */}
          <View style={styles.rightContainer}>
            <Text style={styles.timeText}>
              {safeTime}
            </Text>
            {safeUnreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {displayCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {posts && Array.isArray(posts) && posts.length > 0 ? (
        <FlatList
          data={posts.filter(item => item != null)} // null/undefined 제거
          renderItem={renderItem}
          keyExtractor={(item, index) => {
            // 안전한 키 생성
            try {
              const safeId = item?.id || item?.roomId || `item-${index}`;
              return String(safeId);
            } catch (error) {
              console.warn('⚠️ keyExtractor 오류:', error);
              return `error-item-${index}`;
            }
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => {
            try {
              return <View style={styles.separator || { height: 1, backgroundColor: '#f0f0f0' }} />;
            } catch (error) {
              console.warn('⚠️ ItemSeparatorComponent 오류:', error);
              return <View style={{ height: 1, backgroundColor: '#f0f0f0' }} />;
            }
          }}
          extraData={posts}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          getItemLayout={undefined}
        />
      ) : (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <Text style={{
            fontSize: 16,
            color: '#666',
            textAlign: 'center'
          }}>
            {posts && Array.isArray(posts) ? '채팅방이 없습니다.' : '로딩 중...'}
          </Text>
        </View>
      )}
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  itemContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  defaultProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  messageContainer: {
    flex: 1,
    marginRight: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  memberCount: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  timeText: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 78, // 프로필 이미지 + 마진 크기만큼 왼쪽에서 시작
  },
});

export default ChatScreen;
