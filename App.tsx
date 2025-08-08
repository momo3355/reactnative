/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

// 🔐 인증 관련 import
import { useAuthStore } from './public/store/zustandboard/authStore';
import LoginScreen from './public/screens/LoginScreen';
import SignUpScreen from './public/screens/SignUpScreen';

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
  Login: undefined;
  SignUp: undefined;
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

  // 🔐 로그인한 사용자 정보 가져오기
  const { user } = useAuthStore();
  const currentUserId = user?.userId || 'guest';

  // 🚀 새로운 FCM Hook 사용 - 로그인한 userId 사용
  const {
    token: fcmToken,
    error: fcmError,
    lastMessage,
    isInitialized,
    getDebugInfo,
  } = useFCM(currentUserId, navigation);

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

// 🔥 성능 최적화를 위한 React.memo 적용
const ChatRoomScreenWrapper = React.memo(({ route, navigation }: any) => {
  const { roomId } = route.params;

  // 🔐 인증된 사용자 정보 가져오기
  const { user, isAuthenticated } = useAuthStore();
  const currentUserId = user?.userId || 'guest';
  const currentUserName = user?.userName || user?.userId || '게스트';

  // 🚀 FCM 토큰을 Hook에서 가져오기 - 로그인한 userId 사용
  const { token: fcmToken } = useFCM(currentUserId, navigation);

  // 🔐 인증되지 않은 상태에서는 로그인 화면으로 이동
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('❌ 채팅방 접근 실패: 인증되지 않은 사용자');
      navigation.navigate('Login');
    }
  }, [isAuthenticated, user, navigation]);

  // 🔍 채팅방 접속 로그 (한 번만 출력)
  useEffect(() => {
    if (isAuthenticated && user && roomId && __DEV__) {
      console.log('💬 채팅방 접속:', {
        roomId,
        userId: currentUserId,
        userName: currentUserName,
      });
    }
  }, [currentUserId, currentUserName, isAuthenticated, roomId, user]); // roomId에만 의존하여 방 변경 시에만 로그 출력

  // 🔐 사용자 정보가 없으면 로딩 상태 표시
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#FEE500" />
        <Text style={styles.loadingText}>사용자 정보를 확인하는 중...</Text>
      </View>
    );
  }

  return (
    <ChatRoomScreen
      roomId={roomId}
      userId={currentUserId}
      userName={currentUserName} // 🔥 fallback 처리된 사용자 이름 사용
      token={fcmToken || ''}
      onBack={() => navigation.goBack()}
    />
  );
}); // React.memo 닫는 부분

// 🔐 로그인 화면 Wrapper
const LoginScreenWrapper = ({ navigation }: any) => {
  return (
    <LoginScreen
      navigation={navigation}
      onLoginSuccess={() => {
        // 로그인 성공 시 AuthStore에서 인증 상태가 변경되면
        // App.tsx에서 자동으로 MainAppNavigator로 전환됨
        console.log('🛈 로그인 성공 콜백 실행');
      }}
      onNavigateToSignUp={() => {
        navigation.navigate('SignUp');
      }}
    />
  );
};

// 🔐 회원가입 화면 Wrapper
const SignUpScreenWrapper = ({ navigation }: any) => {
  return (
    <SignUpScreen
      navigation={navigation}
      onLoginSuccess={() => {
        // 회원가입 성공 시 AuthStore에서 인증 상태가 변경되면
        // App.tsx에서 자동으로 MainAppNavigator로 전환됨
        console.log('🛈 회원가입 성공 콜백 실행');
      }}
      onNavigateToLogin={() => {
        navigation.navigate('Login');
      }}
    />
  );
};

// 🔐 로딩 화면 컴포넌트
const LoadingScreen = () => {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator size="large" color="#FEE500" />
      <Text style={styles.loadingText}>앱을 시작하는 중...</Text>
    </View>
  );
};

// 🔐 인증된 사용자를 위한 메인 앱 네비게이터
const MainAppNavigator = () => {
  return (
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
  );
};

// 🔐 인증되지 않은 사용자를 위한 Auth 네비게이터
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreenWrapper}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreenWrapper}
        options={{
          animation: 'slide_from_right',
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

// 🚀 깔끔해진 App 컴포넌트 + 인증 로직
const App = () => {
  // 🔐 인증 상태 관리
  const { isAuthenticated, loading, checkAuthStatus } = useAuthStore();

  // 🔐 앱 시작 시 인증 상태 확인 (빠른 로딩)
  useEffect(() => {
    console.log('🚀 [App] 인증 상태 확인 시작');
    // 단순히 저장된 데이터만 확인 (서버 요청 없음)
    checkAuthStatus();
  }, [checkAuthStatus]);

  // 🔐 로딩 중인 경우
  if (loading) {
    return (
      <NavigationContainer>
        <LoadingScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // 🔐 로그인된 경우 - 메인 앱 표시
        <MainAppNavigator />
      ) : (
        // 🔐 로그인되지 않은 경우 - 인증 화면 표시
        <AuthNavigator />
      )}
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
  // 🔐 로딩 화면 스타일
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default App;
