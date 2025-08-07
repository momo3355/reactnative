import React, { useMemo } from 'react';
import { View, Image } from 'react-native';
import { styles } from '../styles/ChatRoom.styles';
import { getProfileImageUrl } from '../utils/chatUtils';

// 프로필 이미지 컴포넌트
export const ProfileImage: React.FC<{
  sender: string;
  size?: number;
}> = React.memo(({ sender, size = 40 }) => {
  const profileImageUrl = useMemo(() => {
    return getProfileImageUrl(sender);
  }, [sender]);

  const imageStyle = useMemo(() => ({
    ...styles.profileImage,
    width: size,
    height: size,
    borderRadius: size / 2,
  }), [size]);

  return (
    <View style={[styles.profileImageContainer, { width: size, height: size }]}>
      <Image
        source={{
          uri: profileImageUrl,
          cache: 'force-cache',
        }}
        style={imageStyle}
        resizeMode="cover"
        fadeDuration={0}
      />
    </View>
  );
});

ProfileImage.displayName = 'ProfileImage';

export default ProfileImage;
