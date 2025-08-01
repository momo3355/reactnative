import React from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { styles } from '../styles/ChatRoom.styles';

interface ImagePickerModalProps {
  visible: boolean;
  galleryPhotos: any[];
  loadingGallery: boolean;
  selectedPhotoIds: Set<string>;
  loadingMorePhotos: boolean;
  hasMorePhotos: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onTogglePhoto: (photoId: string) => void;
  onLoadMore: () => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  galleryPhotos,
  loadingGallery,
  selectedPhotoIds,
  loadingMorePhotos,
  hasMorePhotos,
  onClose,
  onConfirm,
  onTogglePhoto,
  onLoadMore,
}) => {
  const renderPhotoItem = ({ item }: { item: any }) => {
    const isSelected = selectedPhotoIds.has(item.node.image.uri);
    
    return (
      <TouchableOpacity
        style={styles.photoItem}
        onPress={() => onTogglePhoto(item.node.image.uri)}
      >
        <Image
          source={{ uri: item.node.image.uri }}
          style={styles.gridPhoto}
          resizeMode="cover"
        />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.selectedCheckmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (loadingMorePhotos) {
      return (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color="#FEE500" />
          <Text style={styles.loadMoreText}>더 많은 사진 로드 중...</Text>
        </View>
      );
    }
    
    if (!hasMorePhotos && galleryPhotos.length > 0) {
      return (
        <View style={styles.endOfListContainer}>
          <Text style={styles.endOfListText}>모든 사진을 불러왔습니다</Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.photoPickerContainer}>
        {/* 헤더 */}
        <View style={styles.photoPickerHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.photoPickerTitle}>
            사진 선택 ({selectedPhotoIds.size}/10)
          </Text>
          <TouchableOpacity 
            onPress={onConfirm}
            disabled={selectedPhotoIds.size === 0}
          >
            <Text style={[
              styles.confirmButtonText,
              { opacity: selectedPhotoIds.size === 0 ? 0.5 : 1 }
            ]}>
              확인
            </Text>
          </TouchableOpacity>
        </View>

        {/* 사진 그리드 */}
        {loadingGallery ? (
          <View style={styles.galleryLoadingContainer}>
            <ActivityIndicator size="large" color="#FEE500" />
            <Text style={styles.galleryLoadingText}>사진을 불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={galleryPhotos}
            numColumns={3}
            keyExtractor={(item) => item.node.image.uri}
            contentContainerStyle={styles.photoGrid}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            renderItem={renderPhotoItem}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};
