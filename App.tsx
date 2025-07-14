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
  ChatRoom : {roomId:string} ;
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

// 메인 화면 컴포넌트 (탭 네비게이션 포함)
const MainScreen = ({ route }: any) => {
  const [selectedTab, setSelectedTab] = useState('Home');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // shouldRefreshBoard 대신 사용
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();
  
  // route params 처리 - 수정됨
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
        setRefreshTrigger(prev => prev + 1); // 숫자를 증가시켜 새로고침 트리거
      }
      
      // 즉시 params 초기화
      navigation.setParams({ selectedTab: undefined, refresh: undefined });
    }
  }, [route?.params?.selectedTab, route?.params?.refresh]);


  // 게시물 상세로 네비게이션하는 함수
  const handleNavigateToPost = (postId: number) => {
    navigation.navigate('PostDetail', { postId });
  };

  // 글쓰기 화면으로 네비게이션하는 함수
  const handleNavigateToInsert = () => {
    navigation.navigate('BoardInsertData');
  };

  const handlChatNavigateToPost =(roomId: string) =>{
    navigation.navigate('ChatRoom',{roomId});
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Board':
        return (
          <BoardScreen 
            key={`board-${refreshTrigger}`} // refreshTrigger가 변경될 때만 새로 생성
            onNavigateToPost={handleNavigateToPost} 
            onNavigateToInsert={handleNavigateToInsert}
            refreshTrigger={refreshTrigger} // refresh 대신 refreshTrigger 전달
          />
        );
      case 'Chat':
        return <ChatScreen onChatNavigateToPost = {handlChatNavigateToPost}/>;
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
    </View>
  );
};

// PostDetail 화면 래퍼 컴포넌트
const PostDetailScreenWrapper = ({ route, navigation }: any) => {
  const { postId } = route.params;
  
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <PostDetailScreen 
      postId={postId}
      onBack={handleBack}
    />
  );
};

// BoardInsertData 화면 래퍼 컴포넌트
const BoardInsertDataScreenWrapper = ({ navigation }: any) => {
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSaveAndNavigateToBoard = () => {
    // Main 화면으로 돌아가면서 Board 탭을 선택하고 새로고침
    navigation.navigate('Main', { 
      selectedTab: 'Board', 
      refresh: true 
    });
  };

  return (
    <BoardInsertDataScreen
      onBack={handleBack}
      onSaveComplete={handleSaveAndNavigateToBoard}
    />
  );
};

// PostDetail 화면 래퍼 컴포넌트
const ChatRoomScreenWrapper = ({ route, navigation }: any) => {
  const { roomId } = route.params;
  
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ChatRoomScreen 
      roomId={roomId}
      onBack={handleBack}
    />
  );
};


const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false, // 기본 헤더 숨김
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
});

export default App;