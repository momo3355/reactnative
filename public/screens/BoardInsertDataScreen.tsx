import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';

import { usePostStore } from '../store/zustandboard/usePostStore'; // Zustand store import
import { SearchParams } from '../store/zustandboard/types'; // 타입 정의 import

interface BoardInsertDataScreenProps {
  onBack: () => void;
  onSaveComplete?: () => void;  
}

interface ImageData {
  uri: string;
  type: string;
  name: string;
  size: number;
}

const { width: screenWidth } = Dimensions.get('window');

const BoardInsertDataScreen: React.FC<BoardInsertDataScreenProps> = ({ 
  onBack,
  onSaveComplete  
}) => {

  const {
    success,
    insertData
  } = usePostStore();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // 입력 검증 함수
  const validateInputs = () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return false;
    }
    if (!author.trim()) {
      Alert.alert('알림', '작성자를 입력해주세요.');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return false;
    }
    return true;
  };

  // 이미지 선택 핸들러
  const handleImagePicker = () => {
    setShowImagePicker(true);
  };

  // 카메라로 촬영
  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      setShowImagePicker(false);
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri && asset.type && asset.fileName) {
          const imageData: ImageData = {
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName,
            size: asset.fileSize || 0,
          };
          setSelectedImages(prev => [...prev, imageData]);
        }
      }
    });
  };

  // 갤러리에서 선택
  const openGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: 5, // 최대 5개까지 선택 가능
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      setShowImagePicker(false);
      if (response.assets) {
        const newImages: ImageData[] = response.assets
          .filter(asset => asset.uri && asset.type && asset.fileName)
          .map(asset => ({
            uri: asset.uri!,
            type: asset.type!,
            name: asset.fileName!,
            size: asset.fileSize || 0,
          }));
        
        // 기존 이미지와 합쳐서 최대 5개까지만 유지
        setSelectedImages(prev => {
          const combined = [...prev, ...newImages];
          return combined.slice(0, 5);
        });
      }
    });
  };

  // 이미지 삭제
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 이미지 데이터를 파일 객체로 변환하는 함수
  const convertImagesToFileObjects = (images: ImageData[]) => {
    return images.map(image => ({
      uri: image.uri,
      type: image.type,
      name: image.name,
      size: image.size,
    }));
  };

  // 저장 버튼 핸들러
 const handleSave = async () => {
  if (!validateInputs()) return;

  setIsLoading(true);
  try {
    const imageFiles = selectedImages.length > 0 ? convertImagesToFileObjects(selectedImages) : [];
    const params: SearchParams = {
      "title": title,
      "content": content,
      "author": author,
      "imageFiles": imageFiles,
    };

    await insertData(params);
    
    // insertData의 결과를 직접 확인하거나 store의 success 상태 확인
    if (success) {  // 성공 시에만 실행
      Alert.alert(
        '성공', 
        '게시물이 성공적으로 저장되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              setTitle('');
              setAuthor('');
              setContent('');
              setSelectedImages([]);
              
              if (onSaveComplete) {
                onSaveComplete();
              }
            }
          }
        ]
      );
    } else {
      throw new Error('저장 실패');
    }

  } catch (error) {
    console.error('게시물 저장 오류:', error);
    Alert.alert('오류', '게시물 저장에 실패했습니다. 다시 시도해주세요.');
  } finally {
    setIsLoading(false);
  }
};

  // 취소 버튼 핸들러
  const handleCancel = () => {
    if (title.trim() || author.trim() || content.trim() || selectedImages.length > 0) {
      Alert.alert(
        '확인', 
        '작성 중인 내용이 있습니다. 정말 나가시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '나가기',
            style: 'destructive',
            onPress: onBack,
          },
        ]
      );
    } else {
      onBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>글쓰기</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.headerButton, styles.saveButton]}
          disabled={isLoading}
        >
          <Text style={[
            styles.saveButtonText,
            isLoading && styles.disabledButtonText
          ]}>
            {isLoading ? '저장중...' : '저장'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 제목 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>제목 *</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="제목을 입력하세요"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              editable={!isLoading}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* 작성자 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>작성자 *</Text>
            <TextInput
              style={styles.authorInput}
              placeholder="작성자명을 입력하세요"
              value={author}
              onChangeText={setAuthor}
              maxLength={20}
              editable={!isLoading}
            />
            <Text style={styles.charCount}>{author.length}/20</Text>
          </View>

          {/* 이미지 업로드 섹션 */}
          <View style={styles.inputContainer}>
            <View style={styles.imageHeader}>
              <Text style={styles.label}>이미지</Text>
              <Text style={styles.imageCount}>({selectedImages.length}/5)</Text>
            </View>
            
            {/* 이미지 선택 버튼 */}
            <TouchableOpacity 
              style={styles.imagePickerButton}
              onPress={handleImagePicker}
              disabled={isLoading || selectedImages.length >= 5}
            >
              <Text style={[
                styles.imagePickerButtonText,
                (isLoading || selectedImages.length >= 5) && styles.disabledButtonText
              ]}>
                📷 이미지 추가
              </Text>
            </TouchableOpacity>

            {/* 선택된 이미지 미리보기 */}
            {selectedImages.length > 0 && (
              <ScrollView 
                horizontal 
                style={styles.imagePreviewContainer}
                showsHorizontalScrollIndicator={false}
              >
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imagePreviewItem}>
                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Text style={styles.removeImageButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* 내용 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>내용 *</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="내용을 입력하세요"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={1000}
              editable={!isLoading}
            />
            <Text style={styles.charCount}>{content.length}/1000</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 이미지 선택 모달 */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>이미지 선택</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
              <Text style={styles.modalButtonText}>📷 카메라로 촬영</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalButton} onPress={openGallery}>
              <Text style={styles.modalButtonText}>🖼️ 갤러리에서 선택</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelModalButton]} 
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.cancelModalButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#ccc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  authorInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 200,
    maxHeight: 300,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  // 이미지 관련 스타일
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  imagePickerButton: {
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  imagePickerButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 12,
  },
  imagePreviewItem: {
    marginRight: 12,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: screenWidth - 60,
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  cancelModalButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  cancelModalButtonText: {
    fontSize: 16,
    color: '#666',
  },
});

export default BoardInsertDataScreen;