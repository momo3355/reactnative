// 🔐 인증용 버튼 컴포넌트
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { authStyles, AuthColors } from '../styles/Auth.styles';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;

  // 스타일 조합
  const buttonStyle = [
    variant === 'primary' ? authStyles.primaryButton : authStyles.secondaryButton,
    isDisabled && variant === 'primary' ? authStyles.primaryButtonDisabled : undefined,
    !fullWidth ? { alignSelf: 'center' as const, paddingHorizontal: 32 } : undefined,
    style,
  ].filter(Boolean) as ViewStyle[];

  const buttonTextStyle = [
    variant === 'primary' ? authStyles.primaryButtonText : authStyles.secondaryButtonText,
    isDisabled && variant === 'primary' ? authStyles.primaryButtonTextDisabled : undefined,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  const handlePress = () => {
    if (!isDisabled && onPress) {
      onPress({} as any);
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? AuthColors.primaryText : AuthColors.secondaryText}
        />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default AuthButton;
