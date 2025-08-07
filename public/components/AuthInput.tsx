/* eslint-disable react-native/no-inline-styles */
// 🔐 인증용 입력 컴포넌트
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { authStyles, AuthColors } from '../styles/Auth.styles';

interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
  required?: boolean;
}

export interface AuthInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
}

export const AuthInput = forwardRef<AuthInputRef, AuthInputProps>(({
  label,
  error,
  showPasswordToggle = false,
  required = false,
  secureTextEntry,
  value,
  onChangeText,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const inputRef = useRef<TextInput>(null);

  // ref 메서드들 노출
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => inputRef.current?.clear(),
    getValue: () => value || '',
  }));

  const handleFocus = () => {
    setIsFocused(true);
    props.onFocus && props.onFocus({} as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    props.onBlur && props.onBlur({} as any);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // 스타일 조합
  const inputStyle = [
    authStyles.textInput,
    isFocused && authStyles.textInputFocused,
    error && authStyles.textInputError,
  ];

  return (
    <View style={authStyles.inputContainer}>
      {/* 라벨 */}
      <Text style={authStyles.inputLabel}>
        {label}
        {required && <Text style={{ color: AuthColors.error }}> *</Text>}
      </Text>

      {/* 입력 필드와 비밀번호 토글 */}
      <View style={{ position: 'relative' }}>
        <TextInput
          ref={inputRef}
          style={inputStyle}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
          placeholderTextColor={AuthColors.placeholderText}
          {...props}
        />

        {/* 비밀번호 표시/숨김 토글 버튼 */}
        {showPasswordToggle && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 12,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              width: 40,
            }}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            <Text style={{
              fontSize: 14,
              color: AuthColors.secondaryText,
              fontWeight: '600',
            }}>
              {isPasswordVisible ? '숨김' : '표시'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 에러 메시지 */}
      {error && (
        <View style={authStyles.errorContainer}>
          <Text style={authStyles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
});

AuthInput.displayName = 'AuthInput';

export default AuthInput;
