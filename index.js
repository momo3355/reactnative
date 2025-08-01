import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App';

import messaging from '@react-native-firebase/messaging';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

// 백그라운드 및 종료 상태에서 수신한 메시지 처리
messaging().setBackgroundMessageHandler(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
  console.log('📥 [Background] 메시지 수신:', remoteMessage);

  const { data } = remoteMessage;

  if (data?.type === 'chat_message') {
    console.log('💬 채팅 메시지:', {
      roomId: data.roomId,
      sender: data.senderName,
      message: data.message,
      timestamp: data.timestamp
    });

    // TODO: 로컬 DB 저장 또는 뱃지 카운트 증가 등 처리
    // await saveMessageToLocal(data);
    // await updateBadgeCount();
  }
});

// 앱이 종료된 상태에서 알림을 클릭해 앱이 열릴 경우 처리
messaging()
  .getInitialNotification()
  .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
    if (remoteMessage) {
      console.log('🚀 [Cold Start] 알림 클릭으로 앱 시작:', remoteMessage);
      const { data } = remoteMessage;

      if (data?.roomId) {
        // TODO: ChatRoom으로 navigation 하는 로직 필요
        console.log(`➡️ ChatRoom(${data.roomId})로 이동해야 함`);
      }
    }
  });

// 앱 컴포넌트 등록
AppRegistry.registerComponent(appName, () => App);
