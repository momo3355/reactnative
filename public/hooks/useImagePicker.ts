// hooks/useImagePicker.ts
import { useState, useCallback } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import { SelectedImage, SearchChatRoomParams } from '../store/zustandboard/types';
import { chatPostStore } from '../store/zustandboard/chatPostStore';

const getAndroidVersion = (): number => {
  if (Platform.OS !== 'android') {return 0;}
  const version = Platform.Version;
  if (typeof version === 'number') {return version;}
  const parsed = parseInt(String(version), 10);
  return isNaN(parsed) ? 0 : parsed;
};

const getPhotoPermission = () => {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.PHOTO_LIBRARY;
  }
  const androidVersion = getAndroidVersion();
  return androidVersion >= 33
    ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
    : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
};

export const useImagePicker = (
  roomId: string,
  userId: string,
  sendMessage: (type: string, message: string, imageInfo?: string) => Promise<boolean>
) => {
  const { chatFileUpload } = chatPostStore();

  // 선택된 이미지들
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // 갤러리 모달 상태
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());

  // 무한 스크롤 상태
  const [loadingMorePhotos, setLoadingMorePhotos] = useState(false);
  const [hasMorePhotos, setHasMorePhotos] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  // 권한 확인
  const checkPermissions = useCallback(async () => {
    try {
      const permission = getPhotoPermission();
      const status = await check(permission);

      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        return true;
      }

      const result = await request(permission);

      if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
        return true;
      }

      if (result === RESULTS.DENIED) {
        Alert.alert(
          '갤러리 접근 권한 필요',
          '사진을 선택하기 위해 갤러리 접근 권한이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '권한 허용', onPress: checkPermissions },
          ]
        );
        return false;
      }

      if (result === RESULTS.BLOCKED || result === RESULTS.UNAVAILABLE) {
        Alert.alert(
          '권한 설정이 필요합니다',
          '갤러리 접근을 위해 설정에서 권한을 허용해주세요.',
          [
            { text: '취소' },
            {
              text: '설정 열기',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  openSettings();
                }
              },
            },
          ]
        );
        return false;
      }

      // 그 외의 경우는 거부된 것으로 처리
      return false;

    } catch (error) {
      console.error('권한 확인 오류:', error);
      return false;
    }
  }, []);

  // 갤러리 사진 로드
  const loadGalleryPhotos = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMorePhotos(true);
      } else {
        setLoadingGallery(true);
        setGalleryPhotos([]);
        setHasMorePhotos(true);
        setNextCursor(undefined);
      }

      const hasPermission = await checkPermissions();
      if (!hasPermission) {return;}

      const photos = await CameraRoll.getPhotos({
        first: 30,
        assetType: 'Photos',
        include: ['filename', 'fileSize'],
        after: isLoadMore ? nextCursor : undefined,
      });

      if (isLoadMore) {
        setGalleryPhotos(prev => [...prev, ...photos.edges]);
      } else {
        setGalleryPhotos(photos.edges);
      }

      setHasMorePhotos(photos.page_info.has_next_page);
      setNextCursor(photos.page_info.end_cursor);

    } catch (error) {
      console.error('갤러리 로드 오류:', error);
      Alert.alert('오류', '갤러리를 불러오는 중 오류가 발생했습니다.');
    } finally {
      if (isLoadMore) {
        setLoadingMorePhotos(false);
      } else {
        setLoadingGallery(false);
      }
    }
  }, [checkPermissions, nextCursor]);

  // 추가 사진 로드
  const loadMorePhotos = useCallback(() => {
    if (hasMorePhotos && !loadingMorePhotos) {
      loadGalleryPhotos(true);
    }
  }, [hasMorePhotos, loadingMorePhotos, loadGalleryPhotos]);

  // 갤러리 모달 열기
  const openPhotoPickerModal = useCallback(async () => {
    const hasPermission = await checkPermissions();
    if (hasPermission) {
      setPhotoPickerVisible(true);
      loadGalleryPhotos();
    }
  }, [checkPermissions, loadGalleryPhotos]);

  // 갤러리 모달 닫기
  const closePhotoPickerModal = useCallback(() => {
    setPhotoPickerVisible(false);
    setSelectedPhotoIds(new Set());
    setGalleryPhotos([]);
    setHasMorePhotos(true);
    setNextCursor(undefined);
    setLoadingMorePhotos(false);
  }, []);

  // 사진 선택/해제
  const togglePhotoSelection = useCallback((photoId: string) => {
    setSelectedPhotoIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        if (newSet.size < 10) {
          newSet.add(photoId);
        } else {
          Alert.alert('알림', '최대 10장까지 선택할 수 있습니다.');
        }
      }
      return newSet;
    });
  }, []);

  // 선택된 사진 확인
  const confirmPhotoSelection = useCallback(() => {
    const selectedPhotos = galleryPhotos.filter(photo =>
      selectedPhotoIds.has(photo.node.image.uri)
    );

    const newImages: SelectedImage[] = selectedPhotos.map((photo, index) => ({
      uri: photo.node.image.uri,
      type: 'image/jpeg',
      name: photo.node.image.filename || `image_${Date.now()}_${index}.jpg`,
      size: photo.node.image.fileSize || 0,
      id: `${Date.now()}_${index}`,
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
    closePhotoPickerModal();
  }, [galleryPhotos, selectedPhotoIds, closePhotoPickerModal]);

  // 카메라로 사진 촬영
  const takePhoto = useCallback(() => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      saveToPhotos: true,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        if (response.errorMessage) {
          Alert.alert('오류', '카메라 사용 중 오류가 발생했습니다.');
        }
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const newImage: SelectedImage = {
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `camera_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          id: `camera_${Date.now()}`,
        };

        setSelectedImages(prev => [...prev, newImage]);
      }
    });
  }, []);

  // 이미지 선택 옵션 표시 (의존성 배열에 openPhotoPickerModal과 takePhoto 추가)
  const showImagePickerOptions = useCallback(() => {
    Alert.alert(
      '사진 추가',
      '사진을 어떻게 추가하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '🖼️ 갤러리', onPress: openPhotoPickerModal },
        { text: '📷 카메라', onPress: takePhoto },
      ],
      { cancelable: true }
    );
  }, [openPhotoPickerModal, takePhoto]); // 의존성 추가

  // 개별 이미지 서버 업로드
  const uploadImageToServer = useCallback(async (imageUri: string, fileName: string) => {
    try {
      const uploadParams: SearchChatRoomParams = {
        imageFiles: [{
          uri: imageUri,
          type: 'image/jpeg',
          name: fileName,
        }],
        roomId: roomId,
        userId: userId,
      };

      const response = await chatFileUpload(uploadParams);

      if (response.success && response.files && response.files.length > 0) {
        return {
          success: true,
          fileInfo: response.files[0],
        };
      } else {
        throw new Error(response.errorMsg || '업로드 실패');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  }, [roomId, userId, chatFileUpload]);

  // 여러 이미지 업로드 및 전송
  const uploadAndSendImages = useCallback(async () => {
    if (selectedImages.length === 0) {return;}

    try {
      setIsUploadingImages(true);

      for (const image of selectedImages) {
        try {
          const uploadResult = await uploadImageToServer(image.uri, image.name);

          if (uploadResult.success && uploadResult.fileInfo) {
            await sendMessage('IMAGE', '', uploadResult.fileInfo.savedName);
            await new Promise(resolve => setTimeout(resolve, 100)); // 업로드 간격
          }
        } catch (error) {
          console.error('개별 이미지 업로드 실패:', error);
          Alert.alert('오류', `${image.name} 업로드에 실패했습니다.`);
        }
      }

      setSelectedImages([]);
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      Alert.alert('오류', '이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingImages(false);
    }
  }, [selectedImages, uploadImageToServer, sendMessage]);

  // 개별 이미지 제거
  const removeSelectedImage = useCallback((imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  // 모든 선택된 이미지 제거
  const removeAllSelectedImages = useCallback(() => {
    setSelectedImages([]);
  }, []);

  return {
    // 선택된 이미지 상태
    selectedImages,
    isUploadingImages,

    // 갤러리 모달 상태
    photoPickerVisible,
    galleryPhotos,
    loadingGallery,
    selectedPhotoIds,
    loadingMorePhotos,
    hasMorePhotos,

    // 함수들
    showImagePickerOptions,
    openPhotoPickerModal,
    closePhotoPickerModal,
    confirmPhotoSelection,
    togglePhotoSelection,
    loadMorePhotos,
    takePhoto,
    uploadAndSendImages,
    removeSelectedImage,
    removeAllSelectedImages,
  };
};
