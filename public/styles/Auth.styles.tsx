// 🔐 인증 화면 스타일
import { StyleSheet,} from 'react-native';

// 색상 상수 정의 (ChatRoom.styles와 동일)
const Colors = {
  // Primary Colors
  kakaoYellow: '#FEE500',
  white: '#FFFFFF',
  black: '#000000',
  
  // Status Colors
  error: '#FF4444',
  success: '#4CAF50',
  warning: '#FF9800',
  
  // Text Colors
  primaryText: '#000000',
  secondaryText: '#666666',
  lightText: '#999999',
  whiteText: '#FFFFFF',
  placeholderText: '#CCCCCC',
  
  // Background Colors
  background: '#FFFFFF',
  inputBackground: '#F8F8F8',
  disabledBackground: '#F0F0F0',
  
  // Border Colors
  border: '#E0E0E0',
  focusedBorder: '#FEE500',
  errorBorder: '#FF4444',
  
  // Button Colors
  primaryButton: '#FEE500',
  secondaryButton: '#F0F0F0',
  disabledButton: '#CCCCCC',
};

// 공통 치수 상수
const Sizes = {
  // Container
  containerPadding: 24,
  sectionSpacing: 32,
  
  // Input
  inputHeight: 42,
  inputBorderRadius: 8,
  inputPadding: 16,
  
  // Button
  buttonHeight: 42,
  buttonBorderRadius: 8,
  
  // Logo
  logoSize: 80,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Font Sizes
  fontSize: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
    xxlarge: 24,
    title: 28,
  },
};

export const authStyles = StyleSheet.create({
  // ===================
  // 컨테이너 스타일
  // ===================
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Sizes.containerPadding,
    paddingVertical: Sizes.spacing.xl,
  },
  
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.containerPadding,
  },
  
  // ===================
  // 헤더 스타일
  // ===================
  header: {
    alignItems: 'center',
    marginBottom: Sizes.sectionSpacing,
  },
  
  logo: {
    width: Sizes.logoSize,
    height: Sizes.logoSize,
    backgroundColor: Colors.kakaoYellow,
    borderRadius: Sizes.logoSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.spacing.xl,
  },
  
  logoText: {
    fontSize: Sizes.fontSize.xxlarge,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  
  title: {
    fontSize: Sizes.fontSize.title,
    fontWeight: 'bold',
    color: Colors.primaryText,
    marginBottom: Sizes.spacing.md,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: Sizes.fontSize.large,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // ===================
  // 폼 스타일
  // ===================
  form: {
    width: '100%',
    maxWidth: 400,
  },
  
  inputContainer: {
    marginBottom: Sizes.spacing.md,
  },
  
  inputLabel: {
    fontSize: Sizes.fontSize.medium,
    fontWeight: '600',
    color: Colors.primaryText,
    marginBottom: 4, // 라벨과 input 간격 축소
  },
  
  textInput: {
    height: Sizes.inputHeight,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.inputBorderRadius,
    paddingHorizontal: Sizes.inputPadding,
    fontSize: Sizes.fontSize.large,
    color: Colors.primaryText,
    lineHeight: 20,
  },
  
  textInputFocused: {
    borderColor: Colors.focusedBorder,
    backgroundColor: Colors.white,
  },
  
  textInputError: {
    borderColor: Colors.errorBorder,
  },
  
  // ===================
  // 에러 메시지 스타일
  // ===================
  errorContainer: {
    marginTop: Sizes.spacing.sm,
  },
  
  errorText: {
    fontSize: Sizes.fontSize.small,
    color: Colors.error,
    lineHeight: 16,
  },
  
  globalErrorContainer: {
    backgroundColor: Colors.error,
    paddingHorizontal: Sizes.spacing.lg,
    paddingVertical: Sizes.spacing.md,
    borderRadius: Sizes.inputBorderRadius,
    marginBottom: Sizes.spacing.lg,
  },
  
  globalErrorText: {
    fontSize: Sizes.fontSize.medium,
    color: Colors.whiteText,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // ===================
  // 버튼 스타일
  // ===================
  buttonContainer: {
    marginTop: Sizes.spacing.xl,
  },
  
  primaryButton: {
    height: Sizes.buttonHeight,
    backgroundColor: Colors.primaryButton,
    borderRadius: Sizes.buttonBorderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.spacing.md,
  },
  
  primaryButtonDisabled: {
    backgroundColor: Colors.disabledButton,
  },
  
  primaryButtonText: {
    fontSize: Sizes.fontSize.large,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  
  primaryButtonTextDisabled: {
    color: Colors.lightText,
  },
  
  secondaryButton: {
    height: Sizes.buttonHeight,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.buttonBorderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.spacing.md,
  },
  
  secondaryButtonText: {
    fontSize: Sizes.fontSize.large,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  
  // ===================
  // 네비게이션 링크 스타일
  // ===================
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Sizes.spacing.xl,
    paddingVertical: Sizes.spacing.md,
  },
  
  navigationText: {
    fontSize: Sizes.fontSize.medium,
    color: Colors.secondaryText,
  },
  
  navigationLink: {
    fontSize: Sizes.fontSize.medium,
    color: Colors.kakaoYellow,
    fontWeight: 'bold',
    marginLeft: Sizes.spacing.sm,
  },
  
  // ===================
  // 로딩 스타일
  // ===================
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  loadingText: {
    marginTop: Sizes.spacing.lg,
    fontSize: Sizes.fontSize.large,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  
  // ===================
  // 키보드 회피 스타일
  // ===================
  keyboardAvoidingView: {
    flex: 1,
  },
  
  // ===================
  // 뒤로가기 버튼 스타일
  // ===================
  backButton: {
    position: 'absolute',
    top: 50,
    left: Sizes.spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  
  backButtonText: {
    fontSize: 20,
    color: Colors.primaryText,
    fontWeight: 'bold',
  },
  
  // ===================
  // 추가 유틸리티 스타일
  // ===================
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Sizes.spacing.xl,
  },
  
  centerText: {
    textAlign: 'center',
  },
  
  boldText: {
    fontWeight: 'bold',
  },
  
  // ===================
  // 🔥 성별 라디오 버튼 (간단 디자인)
  // ===================
  radioContainer: {
    marginBottom: Sizes.spacing.md,
  },
  
  radioLabel: {
    fontSize: Sizes.fontSize.large,
    color: Colors.primaryText,
    fontWeight: 'bold',
    marginBottom: 6, // 라벨과 라디오 버튼 간격 축소
  },
  
  radioGroup: {
    flexDirection: 'row',
    gap: 15,
  },
  
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
  },
  
  radioButtonSelected: {
    borderColor: Colors.kakaoYellow,
    backgroundColor: 'rgba(254, 229, 0, 0.1)',
  },
  
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  radioCircleSelected: {
    borderColor: Colors.kakaoYellow,
  },
  
  radioChecked: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.kakaoYellow,
  },
  
  radioText: {
    fontSize: 16,
    color: Colors.primaryText,
    fontWeight: '500',
  },
  
  // ===================
  // 🔥 ID 입력 + 중복체크 버튼 (간단 디자인)
  // ===================
  inputWithButtonContainer: {
    marginBottom: Sizes.spacing.md,
  },
  
  inputWithButtonRow: {
    flexDirection: 'row',
    alignItems: 'center', // center 정렬로 변경 (직접 TextInput 사용)
    gap: 10,
  },
  
  inputWithButtonInput: {
    flex: 1,
  },
  
  checkButton: {
    backgroundColor: Colors.kakaoYellow,
    paddingHorizontal: 12,
    height: Sizes.inputHeight, // input과 같은 높이
    borderRadius: 8,
    minWidth: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  
  checkButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // ===================
  // 🔥 입력 필드 및 라벨 스타일
  // ===================
  inputWithoutLabel: {
    marginBottom: 0,
  },
  
  formSection: {
    marginBottom: Sizes.spacing.xl,
  },
  
  formSectionTitle: {
    fontSize: Sizes.fontSize.large,
    color: Colors.primaryText,
    fontWeight: '600',
    marginBottom: Sizes.spacing.lg,
    textAlign: 'left',
  },
  
  // ===================
  // 🔥 버튼 개선
  // ===================
  enhancedButton: {
    backgroundColor: Colors.kakaoYellow,
    paddingVertical: Sizes.spacing.lg,
    paddingHorizontal: Sizes.spacing.xl,    
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: 'rgba(254, 229, 0, 0.3)',
  },
  
  enhancedButtonText: {
    color: Colors.white,
    fontSize: Sizes.fontSize.large,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  // ===================
  // 반응형 스타일 (작은 화면 대응)
  // ===================
  smallScreen: {
    paddingHorizontal: Sizes.spacing.lg,
  },
  
  // ===================
  // 접근성 스타일
  // ===================
  accessibilityFocus: {
    borderWidth: 2,
    borderColor: Colors.focusedBorder,
  },
});

// 색상과 크기 상수 내보내기 (다른 컴포넌트에서 사용할 수 있도록)
export { Colors as AuthColors, Sizes as AuthSizes };
