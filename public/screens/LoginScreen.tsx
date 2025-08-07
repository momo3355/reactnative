// 🔐 로그인 화면
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
} from 'react-native';
import AuthInput, { AuthInputRef } from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import { authStyles, AuthColors } from '../styles/Auth.styles';
import { useAuthStore } from '../store/zustandboard/authStore';
import { AuthScreenProps, FormValidation } from '../types/auth';

interface LoginScreenProps extends AuthScreenProps {
  navigation?: any; // React Navigation의 navigation prop
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToSignUp,
  navigation,
}) => {
  // 🔹 상태 관리
  const [userId, setUserId] = useState('');
  const [passwd, setPasswd] = useState('');
  const [validation, setValidation] = useState<FormValidation>({
    userId: { isValid: true, message: '' },      // 🔥 userName → userId
    passwd: { isValid: true, message: '' },      // 🔥 password → passwd
  });

  // 🔹 Zustand store
  const { login, loading, error, clearError, isAuthenticated } = useAuthStore();

  // 🔹 입력 필드 참조
  const userIdRef = useRef<AuthInputRef>(null);
  const passwdRef = useRef<AuthInputRef>(null);

  // 🔹 인증 성공 시 처리
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ 로그인 성공 - 메인 화면으로 이동');
      // AuthStore에서 인증 상태가 변경되면 App.tsx에서 자동으로 MainAppNavigator로 전환
      onLoginSuccess?.();
    }
  }, [isAuthenticated, onLoginSuccess]);

  // 🔹 에러 클리어 (컴포넌트 마운트 시)
  useEffect(() => {
    clearError();
  }, [clearError]);

  // 🔹 유효성 검사
  const validateForm = (): boolean => {
    const newValidation: FormValidation = {
      userId: { isValid: true, message: '' },      // 🔥 userName → userId
      passwd: { isValid: true, message: '' },      // 🔥 password → passwd
    };

    // 사용자 아이디 검사
    if (!userId.trim()) {
      newValidation.userId = {
        isValid: false,
        message: '사용자 아이디를 입력해주세요.',
      };
    } else if (userId.length < 2) {
      newValidation.userId = {
        isValid: false,
        message: '사용자 아이디는 2자 이상이어야 합니다.',
      };
    }

    // 비밀번호 검사
    if (!passwd.trim()) {
      newValidation.passwd = {
        isValid: false,
        message: '비밀번호를 입력해주세요.',
      };
    } else if (passwd.length < 4) {
      newValidation.passwd = {
        isValid: false,
        message: '비밀번호는 4자 이상이어야 합니다.',
      };
    }

    setValidation(newValidation);

    return newValidation.userId.isValid && newValidation.passwd.isValid;
  };

  // 🔹 로그인 처리
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    clearError();

    try {
      const response = await login({ userId: userId.trim(), passwd });

      if (!response.success) {
        // 로그인 실패 시 알림 표시
        Alert.alert(
          response.errorTitle || '로그인 실패',
          response.errorMsg || '아이디 또는 비밀번호를 확인해주세요.',
          [{ text: '확인' }]
        );
      }
      // 성공 시 useEffect에서 처리됨
    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('오류', '로그인 중 문제가 발생했습니다.');
    }
  };

  // 🔹 회원가입 화면으로 이동
  const handleNavigateToSignUp = () => {
    onNavigateToSignUp?.();
    
    // React Navigation 사용 시
    if (navigation) {
      navigation.navigate('SignUp');
    }
  };

  // 🔹 입력 필드 포커스 이동
  const handleUserIdSubmit = () => {
    passwdRef.current?.focus();
  };

  const handlePasswdSubmit = () => {
    handleLogin();
  };

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <KeyboardAvoidingView 
        style={authStyles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.contentContainer}>
            
            {/* 헤더 */}
            <View style={authStyles.header}>
              <View style={authStyles.logo}>
                <Text style={authStyles.logoText}>💬</Text>
              </View>
              <Text style={authStyles.title}>로그인</Text>
              <Text style={authStyles.subtitle}>
                계정에 로그인하여{'\n'}대화를 시작하세요
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

              {/* 사용자 아이디 입력 */}
              <AuthInput
                ref={userIdRef}
                label="사용자 아이디"
                placeholder="사용자 아이디를 입력하세요"
                value={userId}
                onChangeText={setUserId}
                error={!validation.userId.isValid ? validation.userId.message : undefined}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={handleUserIdSubmit}
                required
              />

              {/* 비밀번호 입력 */}
              <AuthInput
                ref={passwdRef}
                label="비밀번호"
                placeholder="비밀번호를 입력하세요"
                value={passwd}
                onChangeText={setPasswd}
                error={!validation.passwd.isValid ? validation.passwd.message : undefined}
                secureTextEntry
                showPasswordToggle
                returnKeyType="done"
                onSubmitEditing={handlePasswdSubmit}
                required
              />

              {/* 로그인 버튼 */}
              <View style={authStyles.buttonContainer}>
                <AuthButton
                  title="로그인"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                />                   
              </View>
            </View>

            {/* 회원가입 링크 */}
            <View style={authStyles.navigationContainer}>
              <Text style={authStyles.navigationText}>계정이 없으신가요?</Text>
              <TouchableOpacity onPress={handleNavigateToSignUp}>
                <Text style={authStyles.navigationLink}>회원가입</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>

        {/* 로딩 오버레이 */}
        {loading && (
          <View style={authStyles.loadingContainer}>
            <ActivityIndicator size="large" color={AuthColors.kakaoYellow} />
            <Text style={authStyles.loadingText}>로그인 중...</Text>
          </View>
        )}
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
