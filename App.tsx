import React, { useState, useRef, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';

// 🚀 새로운 FCM Hook 사용
import { useFCM } from './public/hooks/useFCM';

import HomeScreen from './public/screens/HomeScreen';
import BoardScreen from './public/screens/BoardScreen';
import ChatScreen from './public/screens/ChatScreen';
import ChatRoomScreen from './public/screens/ChatRoomScreen';
import SettingScreen from './public/screens/SettingScreen';
import PostDetailScreen from './public/screens/PostDetailScreen';
import BoardInsertDataScreen from './public/screens/BoardInsertDataScreen';

// Navigation 타입 정의
type RootStackParamList = {
  Main: { selectedTab?: string; refresh?: boolean } | undefined;
  PostDetail: { postId: number };
  BoardInsertData: undefined;
  ChatRoom: { roomId: string };
};

type Props = {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  indicatorAnim: Animated.Value;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const menuList = ['Home', 'Board', 'Chat', 'Setting'];

const Stack = createNativeStackNavigator<RootStackParamList>();

const CustomHeader = ({ selectedTab, setSelectedTab, indicatorAnim }: Props) => {
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

// 🚀 간소화된 메인 화면 컴포넌트
const MainScreen = ({ route }: any) => {
  const [selectedTab, setSelectedTab] = useState('Home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();
  
  // 🚀 새로운 FCM Hook 사용 (200줄 → 1줄!)
  const { 
    token: fcmToken, 
    error: fcmError, 
    lastMessage, 
    isInitialized,
    getDebugInfo 
  } = useFCM('test', navigation);
  
  // 🚀 FCM 상태 로깅 (간소화됨)
  useEffect(() => {
    if (isInitialized) {
      console.log('🎉 [App] FCM 초기화 완료');
      if (fcmToken) {
        console.log('🎫 [App] FCM 토큰 준비:', fcmToken.substring(0, 20) + '...');
      }
      if (lastMessage) {
        console.log('📨 [App] 마지막 메시지:', lastMessage.notification?.title);
      }
    }
  }, [isInitialized, fcmToken, lastMessage]);
  
  // route params 처리
  useEffect(() => {
    if (route?.params) {
      const { selectedTab: routeSelectedTab, refresh } = route.params;
      
      console.log('=== MainScreen useEffect ===');
      console.log('Route params:', route.params);
      
      if (routeSelectedTab && routeSelectedTab !== selectedTab) {
        setSelectedTab(routeSelectedTab);
        const tabIndex = menuList.indexOf(routeSelectedTab);
        if (tabIndex !== -1) {
          Animated.timing(indicatorAnim, {
            toValue: (SCREEN_WIDTH / 4) * tabIndex,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      }
      
      if (refresh === true) {
        console.log('Triggering refresh');
        setRefreshTrigger(prev => prev + 1);
      }
      
      navigation.setParams({ selectedTab: undefined, refresh: undefined });
    }
  }, [route?.params, selectedTab, indicatorAnim, navigation]);

  const handleNavigateToPost = (postId: number) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleNavigateToInsert = () => {
    navigation.navigate('BoardInsertData');
  };

  const handlChatNavigateToPost = (roomId: string) => {
    navigation.navigate('ChatRoom', { roomId });
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Board':
        return (
          <BoardScreen 
            key={`board-${refreshTrigger}`}
            onNavigateToPost={handleNavigateToPost} 
            onNavigateToInsert={handleNavigateToInsert}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'Chat':
        return <ChatScreen onChatNavigateToPost={handlChatNavigateToPost} />;
      case 'Setting':
        return <SettingScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        indicatorAnim={indicatorAnim}
      />
      <View style={{ flex: 1 }}>{renderTabContent()}</View>
      
      {/* 🚀 간소화된 FCM 디버그 정보 */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            FCM: {isInitialized ? '✅' : '⏳'} {fcmToken ? '토큰 OK' : (fcmError ? '오류' : '로딩')}
          </Text>
          
          {lastMessage && (
            <Text style={[styles.debugText, { color: '#FFD700' }]}>
              최근: {lastMessage.notification?.title || '제목없음'}
            </Text>
          )}
          
          {fcmToken && (
            <TouchableOpacity onPress={() => {
              const debugInfo = getDebugInfo();
              console.log('🎫 [FCM Debug]', debugInfo);
            }}>
              <Text style={[styles.debugText, { color: '#4CAF50' }]}>
                디버그 정보 출력
              </Text>
            </TouchableOpacity>
          )}

          {fcmError && (
            <Text style={[styles.debugText, { color: '#FF5722' }]}>
              오류: {fcmError.substring(0, 25)}...
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

// 🚀 간소화된 Screen Wrapper들
const PostDetailScreenWrapper = ({ route, navigation }: any) => {
  const { postId } = route.params;
  return (
    <PostDetailScreen
      postId={postId}
      onBack={() => navigation.goBack()}
    />
  );
};

const BoardInsertDataScreenWrapper = ({ navigation }: any) => {
  return (
    <BoardInsertDataScreen
      onBack={() => navigation.goBack()}
      onSaveComplete={() => navigation.navigate('Main', {
        selectedTab: 'Board',
        refresh: true,
      })}
    />
  );
};

const ChatRoomScreenWrapper = ({ route, navigation }: any) => {
  const { roomId } = route.params;
  
  // 🚀 FCM 토큰을 Hook에서 가져오기
  const { token: fcmToken } = useFCM();

  return (
    <ChatRoomScreen
      roomId={roomId}
      userId="test"
      userName="홍길동"
      token={fcmToken || ''} // 🚀 Hook에서 가져온 토큰 사용
      onBack={() => navigation.goBack()}
    />
  );
};

// 🚀 깔끔해진 App 컴포넌트
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PostDetail"
          component={PostDetailScreenWrapper}
          options={{
            animation: 'slide_from_right',
            headerShown: false,
            presentation: 'card',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="BoardInsertData"
          component={BoardInsertDataScreenWrapper}
          options={{
            animation: 'slide_from_right',
            headerShown: false,
            presentation: 'card',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoomScreenWrapper}
          options={{
            animation: 'default',
            headerShown: false,
            presentation: 'card',
            gestureEnabled: true,
          }}
        />
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
  // 🚀 간소화된 디버그 스타일
  debugContainer: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 5,
    maxWidth: 280,
  },
  debugText: {
    color: '#fff',
    fontSize: 11,
    marginBottom: 3,
  },
});

export default App;
