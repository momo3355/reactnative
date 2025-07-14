import React, { useState , useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './public/screens/HomeScreen';
import BoardScreen from './public/screens/BoardScreen';
import ChatScreen from './public/screens/ChatScreen';
import SettingScreen from './public/screens/SettingScreen';

const Stack = createNativeStackNavigator();
const SCREEN_WIDTH = Dimensions.get('window').width;

const menuList = ['Home', 'Board', 'Chat', 'Setting'];

const CustomHeader = ({ navigation, selectedTab, setSelectedTab, indicatorAnim  }: any) => {
  

  const moveIndicator = (index: number) => {
    Animated.timing(indicatorAnim, {
      toValue: (SCREEN_WIDTH / 4) * index,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const onPressTab = (tab: string, index: number) => {    
    setSelectedTab(tab);
    moveIndicator(index);
    setTimeout(() => {
      navigation.navigate(tab);
    }, 200); // 가볍게 로딩 효과
  };

  return (
    <View>
      <View style={styles.tabContainer}>
        {menuList.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => onPressTab(tab, index)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Animated.View
        style={[
          styles.indicator,
          {
            left: indicatorAnim,
            width: SCREEN_WIDTH / 4,
          },
        ]}
      />
    </View>
  );
};

const App = () => {
  const [selectedTab, setSelectedTab] = useState('Home');
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          header: ({ navigation }) => (
            <CustomHeader
              navigation={navigation}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              indicatorAnim={indicatorAnim}
            />
          ),
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Board" component={BoardScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Setting" component={SettingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  indicator: {
    height: 3,
    backgroundColor: '#007AFF',
    position: 'absolute',
    bottom: 0,
  },
});

export default App;