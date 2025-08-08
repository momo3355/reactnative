// styles/ChatRoom.styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 색상 상수 정의
const Colors = {
  // Primary Colors
  kakaoYellow: '#FEE500',
  chatBackground: '#B2C7D9',
  white: '#FFFFFF',
  black: '#000000',
  
  // Status Colors
  connected: '#4CAF50',
  disconnected: '#F44336',
  error: '#FF4444',
  warning: '#FF9800',
  
  // Text Colors
  primaryText: '#000000',
  secondaryText: '#666666',
  lightText: '#999999',
  whiteText: '#FFFFFF',
  
  // Background Colors
  messageBubbleReceived: '#FFFFFF',
  messageBubbleSent: '#FEE500',
  inputBackground: '#FFFFFF',
  headerBackground: '#FEE500',
  
  // Border Colors
  border: '#E0E0E0',
  lightBorder: '#CCCCCC',
  separator: '#E0E0E0',
  
  // Overlay Colors
  modalBackground: 'rgba(0, 0, 0, 0.9)',
  selectedOverlay: 'rgba(0, 0, 0, 0.5)',
  enterMessageBg: 'rgba(255, 255, 255, 0.9)',
};

// 공통 치수 상수
const Sizes = {
  // Header
  headerHeight: 56,
  
  // Profile
  profileImageSize: 40,
  
  // Message
  messageImageSize: 200,
  maxMessageWidth: SCREEN_WIDTH * 0.65,
  maxReceivedMessageWidth: SCREEN_WIDTH * 0.60,
  maxMessageContainerWidth: SCREEN_WIDTH * 0.8,
  maxReceivedContainerWidth: SCREEN_WIDTH * 0.75,
  
  // Input
  inputHeight: 40,
  imageButtonSize: 40,
  
  // Preview
  previewImageSize: 80,
  removeButtonSize: 20,
  
  // Grid
  photoGridItemSize: (SCREEN_WIDTH - 12) / 3,
  
  // Modal
  modalImageWidth: SCREEN_WIDTH - 40,
  modalImageHeight: SCREEN_HEIGHT - 200,
  closeButtonSize: 40,
  modalActionButtonSize: 40, // 🚀 새로 추가
  
  // Spacing
  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
  },
  
  // Border Radius - 말풍선 둥글기 조정
  borderRadius: {
    small: 4,
    medium: 6,      // 8에서 6으로 줄임
    large: 8,       // 12에서 8로 줄임
    round: 20,
  },
  
  // 메시지 말풍선 전용 radius
  messageBubbleRadius: 8,  // 새로 추가: 12에서 8로 줄임
};

export const styles = StyleSheet.create({
  // ===================
  // 컨테이너 스타일
  // ===================
  container: {
    flex: 1,
    backgroundColor: Colors.chatBackground,
  },
  
  // ===================
  // 헤더 스타일
  // ===================
  header: {
    height: Sizes.headerHeight,
    backgroundColor: Colors.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Sizes.spacing.md,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.primaryText,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primaryText,
    textAlign: 'center',
    marginRight: Sizes.profileImageSize,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // ===================
  // 연결 상태 스타일
  // ===================
  connectionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.spacing.md,
  },
  connectionStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reconnectingIndicator: {
    marginRight: Sizes.spacing.sm,
  },
  reconnectButton: {
    paddingHorizontal: Sizes.spacing.md,
    paddingVertical: Sizes.spacing.sm,
    backgroundColor: Colors.error,
    borderRadius: Sizes.borderRadius.large,
  },
  reconnectButtonText: {
    color: Colors.whiteText,
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // ===================
  // 날짜 구분선 스타일
  // ===================
  dateSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Sizes.spacing.xs,
    paddingHorizontal: Sizes.spacing.xxl,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.separator,
  },
  dateSeparatorText: {
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.spacing.lg,
    paddingVertical: Sizes.spacing.sm,
    marginHorizontal: Sizes.spacing.md,
    fontSize: 12,
    color: Colors.secondaryText,
    borderRadius: Sizes.borderRadius.round,
    borderWidth: 1,
    borderColor: Colors.lightBorder,
    textAlign: 'center',
  },
  
  // ===================
  // 입장 메시지 스타일
  // ===================
  enterMessageContainer: {
    alignItems: 'center',
    marginVertical: Sizes.spacing.md,
    paddingHorizontal: Sizes.spacing.xxl,
  },
  enterMessageText: {
    backgroundColor: Colors.enterMessageBg,
    paddingHorizontal: Sizes.spacing.xl,
    paddingVertical: Sizes.spacing.md,
    borderRadius: Sizes.spacing.xl,
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  enterMessageTime: {
    fontSize: 10,
    color: Colors.lightText,
    marginTop: Sizes.spacing.sm,
  },
  
  // ===================
  // 로딩 스타일
  // ===================
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.chatBackground,
  },
  loadingText: {
    marginTop: Sizes.spacing.xl,
    fontSize: 16,
    color: Colors.secondaryText,
  },
  
  // ===================
  // 메시지 영역 스타일
  // ===================
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.chatBackground,
  },
  messagesList: {
    maxHeight: '100%',
  },
  messagesContentContainer: {
    paddingVertical: Sizes.spacing.md,
    backgroundColor: Colors.chatBackground,
    flexGrow: 1,
  },
  
  // ===================
  // 프로필 이미지 스타일
  // ===================
  profileImageContainer: {
    marginRight: Sizes.spacing.md,
    justifyContent: 'flex-end',
    width: Sizes.profileImageSize,
    height: Sizes.profileImageSize,
    borderRadius: Sizes.profileImageSize / 2,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  profileImage: {
    width: Sizes.profileImageSize,
    height: Sizes.profileImageSize,
    borderRadius: Sizes.profileImageSize / 2,
  },
  
  // ===================
  // 보낸 메시지 스타일
  // ===================
  myMessageContainer: {
    maxWidth: '80%',
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    borderRadius: Sizes.borderRadius.large,
    marginVertical: Sizes.spacing.sm,
    marginHorizontal: Sizes.spacing.md,
  },
  myMessageContent: {
    alignItems: 'flex-start',
    maxWidth: Sizes.maxMessageContainerWidth,
    width: '100%',
  },
  
  // 🔥 내 메시지 말풍선 컨테이너 (꼬리 포함) - 둥글기 줄임
  myMessageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // 🔥 위쪽 정렬
    alignSelf: 'flex-end',
    marginLeft: Sizes.spacing.sm,
  },
  
  myMessageBubble: {
    backgroundColor: Colors.messageBubbleSent,
    borderRadius: Sizes.messageBubbleRadius, // 12에서 8로 변경
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: Sizes.maxMessageWidth,
  },
  
  // 🔥 내 메시지 꼬리 (오른쪽으로 향하는 삼각형, 위쪽 배치)
  myMessageTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 0,
    borderBottomWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: Colors.messageBubbleSent,
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: -1, // 🔥 말풍선과 연결
    marginTop: 6,   // 🔥 위치 조정
  },
  
  myMessageText: {
    color: Colors.primaryText,
    fontSize: 16,
    lineHeight: 20,
  },
  
  // 🔥 내가 보낸 메시지의 발신자 이름 스타일
  mySenderName: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginBottom: Sizes.spacing.xs,
    marginLeft: Sizes.spacing.md,
    textAlign: 'left',
    alignSelf: 'flex-start',
    width: '100%',
  },
  
  // ===================
  // 내가 보낸 이미지 스타일
  // ===================
  myImageContainer: {
    borderRadius: Sizes.messageBubbleRadius, // large에서 messageBubbleRadius로 변경
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
  },
  myMessageImage: {
    borderRadius: Sizes.messageBubbleRadius, // large에서 messageBubbleRadius로 변경
  },
  
  // 🔥 내 이미지 메시지 컨테이너 (꼬리 포함)
  myImageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'flex-end',
    marginLeft: Sizes.spacing.sm,
  },
  
  // ===================
  // 받은 메시지 스타일
  // ===================
  receivedMessageContainer: {
    flexDirection: 'row',
    maxWidth: '85%',
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    marginVertical: Sizes.spacing.sm,
    marginHorizontal: Sizes.spacing.md,
  },
  receivedMessageContent: {
    alignItems: 'flex-start',
    flex: 1,
    maxWidth: Sizes.maxReceivedContainerWidth,
    paddingLeft: 0,
  },
  
  // 🔥 받은 메시지 말풍선 컨테이너 (꼬리 포함) - 둥글기 줄임
  receivedMessageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // 🔥 위쪽 정렬
    alignSelf: 'flex-start',
    marginRight: Sizes.spacing.sm,
  },
  
  receivedMessageBubble: {
    backgroundColor: Colors.messageBubbleReceived,
    borderRadius: Sizes.messageBubbleRadius, // 12에서 8로 변경
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: Sizes.maxReceivedMessageWidth,
  },
  
  // 🔥 받은 메시지 꼬리 (왼쪽으로 향하는 삼각형, 위쪽 배치)
  receivedMessageTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 0,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: Colors.messageBubbleReceived,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginRight: -1, // 🔥 말풍선과 연결
    marginTop: 6,    // 🔥 위치 조정
  },
  
  receivedMessageText: {
    color: Colors.primaryText,
    fontSize: 16,
    lineHeight: 20,
  },
  receivedSenderName: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginBottom: Sizes.spacing.xs,
    marginLeft: 0,
    textAlign: 'left',
    height: 14,
    lineHeight: 14,
  },
  
  // ===================
  // 받은 이미지 스타일
  // ===================
  receivedImageContainer: {
    borderRadius: Sizes.messageBubbleRadius, // large에서 messageBubbleRadius로 변경
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  receivedMessageImage: {
    borderRadius: Sizes.messageBubbleRadius, // large에서 messageBubbleRadius로 변경
  },
  
  // 🔥 받은 이미지 메시지 컨테이너 (꼬리 포함)
  receivedImageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    marginRight: Sizes.spacing.sm,
  },
  
  // ===================
  // 공통 메시지 스타일
  // ===================
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Sizes.spacing.sm,
  },
  
  // 🔥 시간과 읽음 상태 세로 배치 스타일
  timeReadColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 20,
    gap: 2,
  },
  
  // 🔥 내 메시지 시간/읽음 상태 열 (오른쪽 정렬)
  myTimeReadColumn: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 20,
    gap: 2,
  },
  
  // 🔥 받은 메시지 시간/읽음 상태 열 (왼쪽 정렬)
  receivedTimeReadColumn: {
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    minHeight: 20,
    gap: 2,
  },
  
  messageTime: {
    fontSize: 10,
    color: Colors.secondaryText,
  },
  
  // ===================
  // 읽음 표시 스타일
  // ===================
  readStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    borderRadius: Sizes.borderRadius.medium,
    paddingHorizontal: Sizes.spacing.sm,
    paddingVertical: 1,
    minWidth: 16,
    textAlign: 'center',
    lineHeight: 12,
  },
  myReadStatus: {
    backgroundColor: Colors.error,
    color: Colors.whiteText,
    marginRight: Sizes.spacing.sm,
  },
  receivedReadStatus: {
    backgroundColor: Colors.connected,
    color: Colors.whiteText,
    marginLeft: Sizes.spacing.sm,
  },
  
  // ===================
  // 이미지 미리보기 스타일
  // ===================
  multiImagePreviewContainer: {
    backgroundColor: Colors.white,
    paddingVertical: Sizes.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    maxHeight: 140,
  },
  multiImagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Sizes.spacing.xl,
    marginBottom: Sizes.spacing.md,
  },
  imageCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  removeAllButton: {
    paddingHorizontal: Sizes.spacing.lg,
    paddingVertical: Sizes.spacing.sm,
    backgroundColor: Colors.error,
    borderRadius: Sizes.spacing.xl,
  },
  removeAllText: {
    color: Colors.whiteText,
    fontSize: 12,
    fontWeight: 'bold',
  },
  imagePreviewScroll: {
    paddingLeft: Sizes.spacing.xl,
  },
  imagePreviewScrollContent: {
    paddingRight: Sizes.spacing.xl,
  },
  imagePreviewItem: {
    position: 'relative',
    marginRight: Sizes.spacing.md,
  },
  previewImage: {
    width: Sizes.previewImageSize,
    height: Sizes.previewImageSize,
    borderRadius: Sizes.borderRadius.medium,
  },
  removeImageButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: Sizes.removeButtonSize,
    height: Sizes.removeButtonSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: Colors.whiteText,
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // ===================
  // 입력 영역 스타일
  // ===================
  footer: {
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Sizes.spacing.lg,
    paddingVertical: Sizes.spacing.md,
    borderTopWidth: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  imageButton: {
    width: Sizes.imageButtonSize,
    height: Sizes.imageButtonSize,
    borderRadius: Sizes.imageButtonSize / 2,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.spacing.md,
  },
  imageButtonText: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.lightBorder,
    borderRadius: Sizes.borderRadius.round,
    paddingHorizontal: Sizes.spacing.xl,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: Sizes.spacing.md,
    backgroundColor: Colors.white,
    textAlignVertical: 'top',
    lineHeight: 20,
    height: Sizes.inputHeight,
  },
  sendButton: {
    borderRadius: Sizes.borderRadius.round,
    paddingHorizontal: Sizes.spacing.xxl,
    height: Sizes.inputHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // ===================
  // 이미지 확대 모달 스타일
  // ===================
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // 🚀 모달 헤더 버튼들 컨테이너
  modalHeaderButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.spacing.xxl,
    zIndex: 1000,
  },
  
  // 🚀 모달 액션 버튼 (다운로드 버튼)
  modalActionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: Sizes.borderRadius.round,
    width: Sizes.modalActionButtonSize,
    height: Sizes.modalActionButtonSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 🚀 모달 액션 버튼 텍스트
  modalActionButtonText: {
    color: Colors.whiteText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  closeButton: {
    position: 'absolute',
    top: 50,
    right: Sizes.spacing.xxl,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: Sizes.borderRadius.round,
    width: Sizes.closeButtonSize,
    height: Sizes.closeButtonSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.whiteText,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalLoadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  modalImage: {
    width: Sizes.modalImageWidth,
    height: Sizes.modalImageHeight,
    maxWidth: Sizes.modalImageWidth,
    maxHeight: Sizes.modalImageHeight,
  },
  
  // 🚀 다운로드 진행률 컨테이너
  downloadProgressContainer: {
    position: 'absolute',
    top: 100,
    left: Sizes.spacing.xxl,
    right: Sizes.spacing.xxl,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    zIndex: 999,
  },
  
  // 🚀 다운로드 진행률 텍스트
  downloadProgressText: {
    color: Colors.whiteText,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  
  // 🚀 진행률 바 컨테이너
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  // 🚀 진행률 바
  progressBar: {
    height: '100%',
    backgroundColor: Colors.kakaoYellow,
    borderRadius: 2,
  },
  
  // ===================
  // 사진 선택 모달 스타일
  // ===================
  photoPickerContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  photoPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Sizes.spacing.xl,
    paddingVertical: Sizes.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.secondaryText,
  },
  photoPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  confirmButtonText: {
    fontSize: 16,
    color: Colors.kakaoYellow,
    fontWeight: 'bold',
  },
  galleryLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryLoadingText: {
    marginTop: Sizes.spacing.lg,
    fontSize: 16,
    color: Colors.secondaryText,
  },
  photoGrid: {
    padding: Sizes.spacing.xs,
  },
  photoItem: {
    flex: 1,
    margin: Sizes.spacing.xs,
    aspectRatio: 1,
    maxWidth: Sizes.photoGridItemSize,
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: Sizes.borderRadius.small,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.selectedOverlay,
    borderRadius: Sizes.borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckmark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.kakaoYellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: Colors.primaryText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // ===================
  // 무한 스크롤 스타일
  // ===================
  loadMoreContainer: {
    padding: Sizes.spacing.xxl,
    alignItems: 'center',
  },
  loadMoreText: {
    marginTop: Sizes.spacing.md,
    fontSize: 14,
    color: Colors.secondaryText,
  },
  endOfListContainer: {
    padding: Sizes.spacing.xxl,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 14,
    color: Colors.lightText,
  },
});
