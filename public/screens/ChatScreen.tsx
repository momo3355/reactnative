import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { chatPostStore } from '../store/zustandboard/chatPostStore'; // Zustand store import
import { ChatRoomPostsValue } from '../store/zustandboard/types'; // 타입 정의 import

// Props 타입 정의 - 네비게이션 콜백 함수 포함
interface BoardScreenProps {
  onChatNavigateToPost?: (roomId: string) => void; 
}

const ChatScreen: React.FC<BoardScreenProps> = ({onChatNavigateToPost}) => {

  const {
    posts,           // 게시물 리스트
    chatLoadPosts} = chatPostStore();       // 게시물 초기화 함수

  /**
   * 초기 데이터 로드 함수
   */
  const loadInitialData = async () => {   
      await chatLoadPosts({userId: "test"});
  };

  /**
   * 컴포넌트 마운트 시 초기 데이터 로드
   */
  useEffect(() => {
    console.log('=== Initial chat data load useEffect ===');
    loadInitialData();
  }, []); 

  const handlePostPress = (post: ChatRoomPostsValue) => {
    try{        
        if (typeof onChatNavigateToPost === 'function') { // 함수인지 명시적으로 확인
          onChatNavigateToPost(post.roomId);
        } else {
          console.warn("onChatNavigateToPost 함수가 정의되지 않았습니다.");
          // 또는 적절한 에러 처리
        }
    }catch(e){
      console.log("챗룸 에러 errr");
    }
  };

  // 시간 포맷팅 함수
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    
    const now = new Date();
    const messageTime = new Date(timeString);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return minutes <= 0 ? '방금' : `${minutes}분 전`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else {
      return messageTime.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // 기본 프로필 이미지 생성 함수
  const getDefaultProfileImage = (roomName: string) => {
    const firstChar = roomName.charAt(0).toUpperCase();
    return firstChar;
  };

  const renderItem = ({ item }: { item: ChatRoomPostsValue }) => (
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
                {getDefaultProfileImage(item.roomName)}
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
              {item.roomName}
            </Text>
            {item.memberCount && item.memberCount > 2 && (
              <Text style={styles.memberCount}>{item.memberCount}</Text>
            )}
          </View>
          
          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessage || '새로운 채팅방입니다.'}
          </Text>
        </View>

        {/* 시간 및 읽지 않은 메시지 수 영역 */}
        <View style={styles.rightContainer}>
          <Text style={styles.timeText}>
            {formatTime(item.lastMessageTime)}
          </Text>
          {item.unreadCount && item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item, index) => `post-${item.id || index}`}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      /> 
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