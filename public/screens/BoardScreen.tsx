import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity} from 'react-native';
import { usePostStore } from '../store/zustandboard/usePostStore'; // Zustand store import
import { PostsValue, SearchParams } from '../store/zustandboard/types'; // 타입 정의 import

// Props 타입 정의 - 네비게이션 콜백 함수 포함
interface BoardScreenProps {
  onNavigateToPost?: (postId: number) => void;
  onNavigateToInsert?: () => void;
  refreshTrigger?: number; // refresh 대신 refreshTrigger 사용
}

const FIRST_PAGE = 1; // 첫 페이지 상수

const BoardScreen: React.FC<BoardScreenProps> = ({ 
    onNavigateToPost, 
    onNavigateToInsert,
    refreshTrigger  = 0  }) => {
  // Zustand store에서 게시글 관련 상태와 액션들 불러오기
  const {
    posts,           // 게시물 리스트
    loading,         // 로딩 상태
    error,           // 에러 메시지
    currentPage,     // 현재 페이지
    totalPages,      // 전체 페이지 수
    loadPosts,       // 게시물 로드 함수
    setCurrentPage,  // 페이지 상태 업데이트 함수
    resetPosts} = usePostStore();       // 게시물 초기화 함수

  const [refreshing, setRefreshing] = useState(false); // 당겨서 새로고침 상태
  const loadingRef = useRef(false);                    // 중복 로딩 방지용 플래그
  const lastRefreshTrigger = useRef(0); // 마지막 refreshTrigger 값 저장

  /**
   * 초기 데이터 로드 함수
   */
  const loadInitialData = async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    try {
      resetPosts();
      await loadPosts({ page: FIRST_PAGE });
    } finally {
      loadingRef.current = false;
    }
  };

  /**
   * 컴포넌트 마운트 시 초기 데이터 로드
   */
  useEffect(() => {
    console.log('=== Initial data load useEffect ===');
    console.log('posts.length:', posts.length);
    
    if (posts.length === 0) {
      console.log('Loading initial data...');
      loadInitialData();
    }
  }, []); // dependency를 빈 배열로 변경


  /**
   * refreshTrigger 변경 시 새로고침 처리
   */
  useEffect(() => {
    console.log('=== RefreshTrigger useEffect ===');
    console.log('refreshTrigger:', refreshTrigger);
    console.log('lastRefreshTrigger.current:', lastRefreshTrigger.current);
    
    // refreshTrigger가 실제로 변경되었고 0이 아닐 때만 새로고침
    if (refreshTrigger > 0 && refreshTrigger !== lastRefreshTrigger.current) {
      console.log('Executing onRefresh due to refreshTrigger change...');
      lastRefreshTrigger.current = refreshTrigger;
      onRefresh();
    }
  }, [refreshTrigger]);


  /**
   * 다음 페이지 데이터를 로드하는 함수
   * - 현재 페이지를 1 증가시켜 loadPosts 호출
   * - setCurrentPage를 통해 상태도 함께 업데이트
   */
  const fetchNextPage = () => {
    if (loadingRef.current) return;

    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      loadingRef.current = true;
      setCurrentPage(nextPage);

      const params: SearchParams = {
        page: nextPage,
        // (필요 시 검색어 등 추가)
      };

      loadPosts(params)
        .finally(() => {
          loadingRef.current = false;
        });
    }
  };

  /**
   * FlatList가 끝에 도달했을 때 실행되는 콜백
   * - 현재 페이지 < 전체 페이지일 경우 fetchNextPage 호출
   * - 마지막 페이지일 경우 알림 출력
   */
  const handleEndReached = () => {
    if (loading) return;

    if (currentPage < totalPages) {
      fetchNextPage();
    } else if (posts.length > 0) {
      Alert.alert('알림', '마지막 페이지입니다.');
    }
  };

  /**
   * 당겨서 새로고침을 위한 핸들러
   * - 기존 게시물 초기화 후 다시 첫 페이지 데이터 로드
   */
  const onRefresh = async () => {
    if (loadingRef.current) return;

    setRefreshing(true);
    loadingRef.current = true;

    try {
      resetPosts();
      await loadPosts({ page: FIRST_PAGE });
    } finally {
      setRefreshing(false);
      loadingRef.current = false;
    }
  };

  const handlePostPress = (post: PostsValue) => {
    try {
        if (onNavigateToPost) {
          onNavigateToPost(post.id);
        } else {
          // 콜백이 없는 경우 알림 표시
          Alert.alert('알림', '게시물 상세 기능이 준비되지 않았습니다.');
        }
      } catch (error) {
        console.error('게시물 클릭 오류:', error);
        Alert.alert('오류', '게시물을 열 수 없습니다.');
      }
  };

  /**
   * 글쓰기 버튼 클릭 핸들러
   */
  const handleWritePress = () => {
    try {
      if (onNavigateToInsert) {
        onNavigateToInsert();
      } else {
        Alert.alert('알림', '글쓰기 기능이 준비되지 않았습니다.');
      }
    } catch (error) {
      console.error('글쓰기 버튼 클릭 오류:', error);
      Alert.alert('오류', '글쓰기 화면을 열 수 없습니다.');
    }
  };

  /**
   * 게시물 하나를 렌더링하는 함수 (FlatList용)
   */
  const renderItem = ({ item }: { item: PostsValue }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handlePostPress(item)}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
      <View style={styles.postFooter}>
        <Text style={styles.author}>{item.author}</Text>
      </View>
    </TouchableOpacity>
  );

  /**
   * FlatList 하단에 표시되는 footer (로딩 인디케이터 또는 빈 목록 메시지)
   */
  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text style={styles.footerText}>게시물을 불러오는 중...</Text>
        </View>
      );
    }
  
    if (posts.length > 0 && currentPage >= totalPages) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>모든 게시물을 다 읽었어요 ✅</Text>
        </View>
      );
    }

    return null;
  };

  /**
   * 에러가 있을 경우 에러 화면을 렌더링
   */
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {   
            loadInitialData();
          }}
        >
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * 실제 화면 렌더링
   * - FlatList로 게시글 리스트 출력
   * - 무한 스크롤, 당겨서 새로고침, 빈 목록 처리 등 포함
   */
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item, index) => `post-${item.id || index}`}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={posts.length === 0 ? styles.emptyListContent : null}
      />
      <TouchableOpacity
      style={styles.writeButton}
      onPress={handleWritePress}
    >
      <Text style={styles.writeButtonText}>＋</Text>
    </TouchableOpacity>
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  author: {
    fontSize: 12,
    color: '#666',
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  writeButton: {
  position: 'absolute',
  right: 20,
  bottom: 35,
  backgroundColor: '#007bff',
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  },
  writeButtonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 35,
  },
});

export default BoardScreen;