/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  StatusBar,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
// 🚀 파일 다운로드를 위한 라이브러리
// npm install react-native-fs
// npm install @react-native-async-storage/async-storage
import RNFS from 'react-native-fs';
import { styles } from '../styles/ChatRoom.styles';

interface ImageViewModalProps {
  visible: boolean;
  imageUrl: string;
  loading: boolean;
  onClose: () => void;
  onLoadEnd: () => void;
}

export const ImageViewModal: React.FC<ImageViewModalProps> = ({
  visible,
  imageUrl,
  loading,
  onClose,
  onLoadEnd,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // 🚀 Android 권한 요청
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true; // iOS는 권한 불필요
    }

    try {
      // Android 13+ (API 33+)에서는 READ_MEDIA_IMAGES 권한 필요
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: '이미지 저장 권한',
            message: '이미지를 갤러리에 저장하기 위해 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android 12 이하
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: '저장소 권한',
            message: '이미지를 저장하기 위해 저장소 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('권한 요청 오류:', err);
      return false;
    }
  };

  // 🚀 파일 이름 생성
  const generateFileName = (url: string): string => {
    const timestamp = new Date().getTime();
    const extension = url.split('.').pop()?.toLowerCase() || 'jpg';

    // 이미지 확장자 검증
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const finalExtension = validExtensions.includes(extension) ? extension : 'jpg';

    return `ChatImage_${timestamp}.${finalExtension}`;
  };

  // 🚀 이미지 다운로드 함수
  const downloadImage = useCallback(async () => {
    if (!imageUrl || isDownloading) {
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // 권한 확인
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('권한 필요', '이미지를 저장하려면 저장소 권한이 필요합니다.');
        return;
      }

      const fileName = generateFileName(imageUrl);

      // 저장 경로 설정
      const downloadDest = Platform.select({
        ios: `${RNFS.DocumentDirectoryPath}/${fileName}`,
        android: `${RNFS.PicturesDirectoryPath}/${fileName}`, // Android의 Pictures 폴더
      });

      if (!downloadDest) {
        throw new Error('저장 경로를 설정할 수 없습니다.');
      }

      console.log('📥 이미지 다운로드 시작:', {
        url: imageUrl,
        destination: downloadDest,
        fileName,
      });

      // 다운로드 실행
      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: downloadDest,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          setDownloadProgress(Math.round(progress));
        },
        progressDivider: 10, // 진행률 업데이트 빈도
      }).promise;

      if (downloadResult.statusCode === 200) {
        // Android에서 미디어 스캔 (갤러리에 표시되도록)
        if (Platform.OS === 'android') {
          try {
            await RNFS.scanFile(downloadDest);
          } catch (scanError) {
            console.warn('미디어 스캔 실패:', scanError);
          }
        }

        Alert.alert(
          '다운로드 완료',
          `이미지가 저장되었습니다.\n${fileName}`,
          [
            {
              text: '확인',
              style: 'default',
            },
          ]
        );

        console.log('✅ 이미지 다운로드 완료:', downloadDest);
      } else {
        throw new Error(`다운로드 실패 (상태 코드: ${downloadResult.statusCode})`);
      }

    } catch (error) {
      console.error('❌ 이미지 다운로드 오류:', error);

      Alert.alert(
        '다운로드 실패',
        '이미지를 저장하는 중 오류가 발생했습니다.\n다시 시도해주세요.',
        [
          {
            text: '확인',
            style: 'default',
          },
        ]
      );
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, [imageUrl, isDownloading]);

  // 🚀 다운로드 확인 다이얼로그
  const handleDownloadPress = useCallback(() => {
    Alert.alert(
      '이미지 다운로드',
      '이 이미지를 갤러리에 저장하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '저장',
          style: 'default',
          onPress: downloadImage,
        },
      ]
    );
  }, [downloadImage]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />

        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.modalContent}>
            {/* 🚀 닫기 버튼 (상단 오른쪽) */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {/* 🚀 다운로드 버튼 (하단 오른쪽) */}
            <TouchableOpacity
              style={[styles.modalActionButton, {
                position: 'absolute',
                bottom: 80,
                right: 20,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 20,
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
              }]}
              onPress={handleDownloadPress}
              disabled={isDownloading || !imageUrl}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.modalActionButtonText, {
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontWeight: 'bold',
                }]}>⬇</Text>
              )}
            </TouchableOpacity>

            {/* 🚀 다운로드 진행률 표시 */}
            {isDownloading && (
              <View style={[styles.downloadProgressContainer, {
                position: 'absolute',
                top: 100,
                left: 20,
                right: 20,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 15,
                borderRadius: 10,
                zIndex: 999,
              }]}>
                <Text style={[styles.downloadProgressText, {
                  color: '#FFFFFF',
                  fontSize: 14,
                  textAlign: 'center',
                  marginBottom: 10,
                }]}>
                  다운로드 중... {downloadProgress}%
                </Text>
                <View style={[styles.progressBarContainer, {
                  height: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }]}>
                  <View style={[styles.progressBar, {
                    width: `${downloadProgress}%`,
                    height: '100%',
                    backgroundColor: '#FEE500',
                    borderRadius: 2,
                  }]} />
                </View>
              </View>
            )}

            {/* 로딩 인디케이터 */}
            {loading && (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}

            {/* 이미지 */}
            {imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                style={styles.modalImage}
                resizeMode="contain"
                onLoad={onLoadEnd}
                onError={() => {
                  onLoadEnd();
                  Alert.alert('오류', '이미지를 불러올 수 없습니다.');
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
