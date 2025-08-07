import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SelectedImage } from '../store/zustandboard/types';
import { styles } from '../styles/ChatRoom.styles';

interface ImagePreviewProps {
  selectedImages: SelectedImage[];
  onRemoveImage: (imageId: string) => void;
  onRemoveAll: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  selectedImages,
  onRemoveImage,
  onRemoveAll,
}) => {
  if (selectedImages.length === 0) {return null;}

  return (
    <View style={styles.multiImagePreviewContainer}>
      <View style={styles.multiImagePreviewHeader}>
        <Text style={styles.imageCountText}>
          {selectedImages.length}장의 사진 선택됨
        </Text>
        <TouchableOpacity
          style={styles.removeAllButton}
          onPress={onRemoveAll}
        >
          <Text style={styles.removeAllText}>전체 삭제</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        style={styles.imagePreviewScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imagePreviewScrollContent}
      >
        {selectedImages.map((image) => (
          <View key={image.id} style={styles.imagePreviewItem}>
            <Image
              source={{ uri: image.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => onRemoveImage(image.id)}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
