/* eslint-disable react-native/no-inline-styles */
// 🔐 회원가입 화면
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import AuthInput, { AuthInputRef } from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import { authStyles, AuthColors } from '../styles/Auth.styles';
import { useAuthStore } from '../store/zustandboard/authStore';
import { AuthScreenProps, FormValidation } from '../types/auth';


interface SignUpScreenProps extends AuthScreenProps {
  navigation?: any; // React Navigation의 navigation prop
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onLoginSuccess,
  onNavigateToLogin,
  navigation,
}) => {
  // 🔹 상태 관리
  const [userId, setUserId] = useState('');           // 🔥 username → userId
  const [passwd, setPasswd] = useState('');           // 🔥 password → passwd
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');       // 🔥 name → userName
  const [gender, setGender] = useState<'M' | 'W' | ''>(''); // 🔥 성별 추가
  const [isIdChecked, setIsIdChecked] = useState(false); // 🔥 ID 중복체크 여부
  const [isIdCheckLoading, setIsIdCheckLoading] = useState(false); // 🔥 ID 중복체크 로딩 상태

  const [validation, setValidation] = useState<FormValidation>({
    userId: { isValid: true, message: '' },           // 🔥 username → userId
    passwd: { isValid: true, message: '' },           // 🔥 password → passwd
    confirmPassword: { isValid: true, message: '' },
    email: { isValid: true, message: '' },
    userName: { isValid: true, message: '' },         // 🔥 name → userName
    gender: { isValid: true, message: '' },           // 🔥 성별 추가
  });

  // 🔹 Zustand store
  const { signUp, loading, error, clearError, isAuthenticated, checkIdDuplicate } = useAuthStore();

  // 🔹 입력 필드 참조
  const userIdRef = useRef<TextInput>(null);           // 🔥 TextInput으로 변경
  const passwdRef = useRef<AuthInputRef>(null);       // 🔥 password → passwd
  const confirmPasswordRef = useRef<AuthInputRef>(null);
  const emailRef = useRef<AuthInputRef>(null);
  const userNameRef = useRef<AuthInputRef>(null);     // 🔥 name → userName

  // 🔹 회원가입 성공 시 처리
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ 회원가입 성공 - 메인 화면으로 이동');
      onLoginSuccess?.();
    }
  }, [isAuthenticated, onLoginSuccess]);

  // 🔹 에러 클리어 (컴포넌트 마운트 시)
  useEffect(() => {
    clearError();
  }, [clearError]);

  // 🔹 userId 변경 시 중복체크 상태 초기화
  useEffect(() => {
    setIsIdChecked(false);
  }, [userId]);

  // 🔹 ID 중복체크 함수
  const handleIdCheck = async () => {
    if (!userId.trim()) {
      Alert.alert('알림', '사용자 ID를 입력해주세요.');
      return;
    }

    if (userId.length < 3) {
      Alert.alert('알림', '사용자 ID는 3자 이상이어야 합니다.');
      return;
    }

    setIsIdCheckLoading(true);

    try {
      const response = await checkIdDuplicate(userId.trim());

      if (response.status) {
        // true = 이미 사용 중
        Alert.alert('중복체크 결과', '이미 사용 중인 ID입니다. 다른 ID를 입력해주세요.');
        setIsIdChecked(false);
      } else {
        // false = 사용 가능
        Alert.alert('중복체크 결과', '사용 가능한 ID입니다.');
        setIsIdChecked(true);
      }

    } catch (_error) {
      console.error('ID 중복체크 오류:', error);
      Alert.alert('오류', 'ID 중복체크 중 오류가 발생했습니다.');
      setIsIdChecked(false);
    } finally {
      setIsIdCheckLoading(false);
    }
  };

  // 🔹 이메일 유효성 검사 함수
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 🔹 유효성 검사
  const validateForm = (): boolean => {
    const newValidation: FormValidation = {
      userId: { isValid: true, message: '' },
      passwd: { isValid: true, message: '' },
      confirmPassword: { isValid: true, message: '' },
      email: { isValid: true, message: '' },
      userName: { isValid: true, message: '' },
      gender: { isValid: true, message: '' },
    };

    // 사용자 ID 검사
    if (!userId.trim()) {
      newValidation.userId = {
        isValid: false,
        message: '사용자 ID를 입력해주세요.',
      };
    } else if (userId.length < 3) {
      newValidation.userId = {
        isValid: false,
        message: '사용자 ID는 3자 이상이어야 합니다.',
      };
    } else if (userId.length > 20) {
      newValidation.userId = {
        isValid: false,
        message: '사용자 ID는 20자 이하여야 합니다.',
      };
    } else if (!/^[a-zA-Z0-9_]+$/.test(userId)) {
      newValidation.userId = {
        isValid: false,
        message: '사용자 ID는 영문, 숫자, 언더스코어만 사용할 수 있습니다.',
      };
    } else if (!isIdChecked) {
      newValidation.userId = {
        isValid: false,
        message: 'ID 중복체크를 해주세요.',
      };
    }

    // 비밀번호 검사
    if (!passwd.trim()) {
      newValidation.passwd = {
        isValid: false,
        message: '비밀번호를 입력해주세요.',
      };
    } else if (passwd.length < 6) {
      newValidation.passwd = {
        isValid: false,
        message: '비밀번호는 6자 이상이어야 합니다.',
      };
    } else if (passwd.length > 50) {
      newValidation.passwd = {
        isValid: false,
        message: '비밀번호는 50자 이하여야 합니다.',
      };
    }

    // 비밀번호 확인 검사
    if (!confirmPassword.trim()) {
      newValidation.confirmPassword = {
        isValid: false,
        message: '비밀번호 확인을 입력해주세요.',
      };
    } else if (passwd !== confirmPassword) {
      newValidation.confirmPassword = {
        isValid: false,
        message: '비밀번호가 일치하지 않습니다.',
      };
    }

    // 이메일 검사
    if (!email.trim()) {
      newValidation.email = {
        isValid: false,
        message: '이메일을 입력해주세요.',
      };
    } else if (!isValidEmail(email)) {
      newValidation.email = {
        isValid: false,
        message: '올바른 이메일 형식을 입력해주세요.',
      };
    }

    // 이름 검사
    if (!userName.trim()) {
      newValidation.userName = {
        isValid: false,
        message: '이름을 입력해주세요.',
      };
    } else if (userName.length < 2) {
      newValidation.userName = {
        isValid: false,
        message: '이름은 2자 이상이어야 합니다.',
      };
    } else if (userName.length > 10) {
      newValidation.userName = {
        isValid: false,
        message: '이름은 10자 이하여야 합니다.',
      };
    }

    // 성별 검사
    if (!gender) {
      newValidation.gender = {
        isValid: false,
        message: '성별을 선택해주세요.',
      };
    }

    setValidation(newValidation);

    return Object.values(newValidation).every(field => field?.isValid !== false);
  };

  // 🔹 회원가입 처리
  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    clearError();

    try {
      const response = await signUp({
        userId: userId.trim(),
        passwd,
        confirmPassword,
        email: email.trim().toLowerCase(),
        userName: userName.trim(),
        gender,
      });

      if (!response.success) {
        Alert.alert(
          response.errorTitle || '회원가입 실패',
          response.errorMsg || '회원가입 중 오류가 발생했습니다.',
          [{ text: '확인' }]
        );
      }
    } catch (_error) {
      console.error('회원가입 오류:', error);
      Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
    }
  };

  // 🔹 로그인 화면으로 이동
  const handleNavigateToLogin = () => {
    onNavigateToLogin?.();
    if (navigation) {
      navigation.navigate('Login');
    }
  };

  // 🔹 뒤로가기 (로그인 화면으로)
  const handleGoBack = () => {
    handleNavigateToLogin();
  };

  // 🔹 입력 필드 포커스 이동
  const handleUserIdSubmit = () => {
    passwdRef.current?.focus();
  };

  const handlePasswdSubmit = () => {
    confirmPasswordRef.current?.focus();
  };

  const handleConfirmPasswordSubmit = () => {
    emailRef.current?.focus();
  };

  const handleEmailSubmit = () => {
    userNameRef.current?.focus();
  };

  const handleUserNameSubmit = () => {
    handleSignUp();
  };

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <KeyboardAvoidingView
        style={authStyles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity style={authStyles.backButton} onPress={handleGoBack}>
          <Text style={authStyles.backButtonText}>←</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={authStyles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.contentContainer}>

            {/* 헤더 */}
            <View style={authStyles.header}>
              <View style={authStyles.logo}>
                <Text style={authStyles.logoText}>📝</Text>
              </View>
              <Text style={authStyles.title}>회원가입</Text>
              <Text style={authStyles.subtitle}>
                새 계정을 만들어{'\n'}대화에 참여하세요
              </Text>
            </View>

            {/* 폼 */}
            <View style={authStyles.form}>

              {/* 전역 오류 메시지 */}
              {error && (
                <View style={authStyles.globalErrorContainer}>
                  <Text style={authStyles.globalErrorText}>{error}</Text>
                </View>
              )}

              {/* 🔥 사용자 ID 입력 + 중복체크 (나란히 배치) */}
              <View style={authStyles.inputWithButtonContainer}>
                {/* 라벨 */}
                <Text style={authStyles.inputLabel}>
                  사용자 ID
                  <Text style={{ color: AuthColors.error }}> *</Text>
                </Text>

                {/* Input + 버튼 */}
                <View style={authStyles.inputWithButtonRow}>
                  <View style={authStyles.inputWithButtonInput}>
                    <TextInput
                      ref={userIdRef}
                      style={[
                        authStyles.textInput,
                        validation.userId && !validation.userId.isValid && authStyles.textInputError,
                      ]}
                      placeholder="영문, 숫자, 언더스코어 사용 가능"
                      value={userId}
                      onChangeText={setUserId}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      onSubmitEditing={handleUserIdSubmit}
                      placeholderTextColor={AuthColors.placeholderText}
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      authStyles.checkButton,
                      (!userId.trim() || userId.length < 3) && authStyles.checkButtonDisabled,
                      isIdCheckLoading && authStyles.checkButtonDisabled,
                      isIdChecked && authStyles.checkButtonSuccess,
                    ]}
                    onPress={handleIdCheck}
                    disabled={isIdCheckLoading || !userId.trim() || userId.length < 3}
                  >
                    {isIdCheckLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={authStyles.checkButtonText}>
                        {isIdChecked ? '✓ 확인' : '중복체크'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* 에러 메시지 */}
                {validation.userId && !validation.userId.isValid && (
                  <Text style={authStyles.errorText}>{validation.userId.message}</Text>
                )}
                {isIdChecked && (
                  <Text style={[authStyles.errorText, { color: '#4CAF50', marginTop: 5 }]}>
                    ✅ 사용 가능한 ID입니다
                  </Text>
                )}
              </View>

              {/* 비밀번호 입력 */}
              <AuthInput
                ref={passwdRef}
                label="비밀번호"
                placeholder="6자 이상 입력해주세요"
                value={passwd}
                onChangeText={setPasswd}
                error={!validation.passwd?.isValid ? validation.passwd?.message : undefined}
                secureTextEntry
                showPasswordToggle
                returnKeyType="next"
                onSubmitEditing={handlePasswdSubmit}
                required
              />

              {/* 비밀번호 확인 입력 */}
              <AuthInput
                ref={confirmPasswordRef}
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력해주세요"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={!validation.confirmPassword?.isValid ? validation.confirmPassword?.message : undefined}
                secureTextEntry
                showPasswordToggle
                returnKeyType="next"
                onSubmitEditing={handleConfirmPasswordSubmit}
                required
              />

              {/* 이메일 입력 */}
              <AuthInput
                ref={emailRef}
                label="이메일"
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                error={!validation.email?.isValid ? validation.email?.message : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={handleEmailSubmit}
                required
              />

              {/* 이름 입력 */}
              <AuthInput
                ref={userNameRef}
                label="이름"
                placeholder="실명을 입력해주세요"
                value={userName}
                onChangeText={setUserName}
                error={!validation.userName?.isValid ? validation.userName?.message : undefined}
                returnKeyType="done"
                onSubmitEditing={handleUserNameSubmit}
                required
              />

              {/* 성별 선택 */}
              <View style={authStyles.radioContainer}>
                <Text style={authStyles.radioLabel}>성별 *</Text>
                <View style={authStyles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      authStyles.radioButton,
                      gender === 'M' && authStyles.radioButtonSelected,
                    ]}
                    onPress={() => setGender('M')}
                  >
                    <View style={[
                      authStyles.radioCircle,
                      gender === 'M' && authStyles.radioCircleSelected,
                    ]}>
                      {gender === 'M' && <View style={authStyles.radioChecked} />}
                    </View>
                    <Text style={authStyles.radioText}>남</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      authStyles.radioButton,
                      gender === 'W' && authStyles.radioButtonSelected,
                    ]}
                    onPress={() => setGender('W')}
                  >
                    <View style={[
                      authStyles.radioCircle,
                      gender === 'W' && authStyles.radioCircleSelected,
                    ]}>
                      {gender === 'W' && <View style={authStyles.radioChecked} />}
                    </View>
                    <Text style={authStyles.radioText}>여</Text>
                  </TouchableOpacity>
                </View>
                {validation.gender && !validation.gender.isValid && (
                  <Text style={authStyles.errorText}>{validation.gender.message}</Text>
                )}
              </View>

              {/* 회원가입 버튼 */}
              <View style={authStyles.buttonContainer}>
                <AuthButton
                  title="회원가입"
                  onPress={handleSignUp}
                  loading={loading}
                  disabled={loading}
                />
              </View>
            </View>

            {/* 로그인 링크 */}
            <View style={authStyles.navigationContainer}>
              <Text style={authStyles.navigationText}>이미 계정이 있으신가요?</Text>
              <TouchableOpacity onPress={handleNavigateToLogin}>
                <Text style={authStyles.navigationLink}>로그인</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>

        {/* 로딩 오버레이 */}
        {loading && (
          <View style={authStyles.loadingContainer}>
            <ActivityIndicator size="large" color={AuthColors.kakaoYellow} />
            <Text style={authStyles.loadingText}>회원가입 중...</Text>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
