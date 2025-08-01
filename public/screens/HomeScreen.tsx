import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = React.memo(() => {
  // ✅ 마운트될 때만 한 번 실행
  useEffect(() => {
    console.log("=----------------home mounted-------------------=");
    
    // 언마운트될 때 실행 (선택사항)
    return () => {
      console.log("=----------------home unmounted-------------------=");
    };
  }, []); // 빈 의존성 배열 = 마운트 시에만 실행

  return (
    <View style={styles.container}>
      <Text style={styles.text}>홈 화면입니다</Text>
    </View>
  );
});

// displayName 설정 (디버깅용)
HomeScreen.displayName = 'HomeScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  text: {
    fontSize: 20, fontWeight: 'bold',
  },
});

export default HomeScreen;