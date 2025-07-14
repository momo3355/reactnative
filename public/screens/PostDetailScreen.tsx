import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { usePostStore } from '../store/zustandboard/usePostStore';

type Props = {
  postId: number;
  onBack: () => void;
};

const PostDetailScreen: React.FC<Props> = ({ postId, onBack }) => {
  // Zustand store에서 상세보기 관련 상태와 액션들 가져오기
  const {
    postDetail,
    detailLoading,
    detailError,
    loadPostDetail,
    clearPostDetail,
  } = usePostStore();  

  useEffect(() => {
    if (postId) {
      loadPostDetail(postId);
    }
    return () => {
      clearPostDetail();
    };
  }, [postId, loadPostDetail, clearPostDetail]);

  const handleGoBack = () => {
    onBack();
  };

  // 로딩 화면
  if (detailLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>게시물을 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 화면
  if (detailError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{detailError}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>목록으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 게시물 데이터가 없는 경우
  if (!postDetail) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>게시물을 찾을 수 없습니다.</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>목록으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시물 상세</Text>
        <View style={styles.headerSpace} />
      </View>

      {/* 게시물 내용 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 제목 */}
        <Text style={styles.title}>{postDetail.title}</Text>

        {/* 메타 정보 */}
        <View style={styles.metaContainer}>
          <Text style={styles.author}>작성자: {postDetail.author}</Text>
          {postDetail.createdAt && (
            <Text style={styles.date}>
              작성일: {new Date(postDetail.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          )}
        </View>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 본문 */}
        <Text style={styles.contentText}>{postDetail.content}</Text>

        {/* 하단 여백 */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* 하단 액션 버튼들 (선택사항) */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>좋아요</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>댓글</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>공유</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpace: {
    width: 60, // 뒤로가기 버튼과 같은 너비로 중앙 정렬
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
    lineHeight: 28,
  },
  metaContainer: {
    marginBottom: 16,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  views: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  bottomSpace: {
    height: 40,
  },
  actionContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PostDetailScreen;