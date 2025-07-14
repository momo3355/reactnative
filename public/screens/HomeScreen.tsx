import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => {
  console.log("=----------------home-------------------=");
  return (
    <View style={styles.container}>
      <Text style={styles.text}>홈 화면입니다</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  text: {
    fontSize: 20, fontWeight: 'bold',
  },
});

export default HomeScreen;