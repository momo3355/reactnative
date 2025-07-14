import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // 화면에 포커스될 때 실행되는 hook
import { usePostStore } from '../store/zustandboard/usePostStore'; // Zustand store import
import { PostsValue, SearchParams } from '../store/zustandboard/types'; // 타입 정의 import

const FIRST_PAGE = 1; // 첫 페이지 상수

const BoardScreen: React.FC = () => {
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
  const isInitialMount = useRef(true);                 // 컴포넌트가 처음 마운트되었는지 여부
  const loadingRef = useRef(false);                    // 중복 로딩 방지용 플래그

  /**
   * 화면에 포커스가 돌아올 때 실행됨 (탭 전환, 뒤로가기 등)
   * - 최초 진입 시 또는 posts 배열이 비어 있을 때 데이터 로드
   * - 중복 로딩 방지를 위해 loadingRef로 제어
   */
  useFocusEffect(
    React.useCallback(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      if (!loadingRef.current && posts.length === 0) {
        loadingRef.current = true;

        resetPosts();
        loadPosts({ page: FIRST_PAGE }).finally(() => {
          loadingRef.current = false;
        });
      }
    }

      // cleanup 필요 시 이곳에 정의
      return () => {};
    }, [loadPosts, resetPosts, posts.length])
  );

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

    resetPosts();
    await loadPosts({ page: FIRST_PAGE });

    setRefreshing(false);
    loadingRef.current = false;
  };

  /**
   * 게시물 하나를 렌더링하는 함수 (FlatList용)
   */
  const renderItem = ({ item }: { item: PostsValue }) => (
    <TouchableOpacity style={styles.itemContainer}>
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
            resetPosts();
            loadPosts({ page: FIRST_PAGE });
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
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={posts.length === 0 ? styles.emptyListContent : null}
      />
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
});

export default BoardScreen;