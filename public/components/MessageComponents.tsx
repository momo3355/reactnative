/* eslint-disable radix */
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/ChatRoom.styles';

// 읽음 상태 컴포넌트
export const ReadStatus: React.FC<{
  isRead: string;
  isMyMessage: boolean;
}> = React.memo(({ isRead, isMyMessage }) => {
  // 안전한 파싱
  const safeIsRead = isRead || '0';
  const readCount = parseInt(safeIsRead, 10);

  // 🔥 디버깅용 로그 추가
  console.log('👀 ReadStatus 디버깅:', {
    isRead,
    safeIsRead,
    readCount,
    isMyMessage,
    willShow: !isNaN(readCount) && readCount > 0
  });

  if (isNaN(readCount) || readCount <= 0) {return null;}

  return (
    <Text style={{
      fontSize: 10,
      color: '#FEE500', // 🔥 모든 메시지 읽음표시 카카오 에로우로 통일
      fontWeight: '600',
      textAlign: 'center',
    }}>
      {readCount}
    </Text>
  );
});

// 날짜 구분선 컴포넌트
export const DateSeparator: React.FC<{
  date: string;
}> = React.memo(({ date }) => {
  // 안전한 날짜 처리
  const safeDate = date || '';
  
  return (
    <View style={styles.dateSeparatorContainer}>
      <View style={styles.dateSeparatorLine} />
      <Text style={styles.dateSeparatorText}>{safeDate}</Text>
      <View style={styles.dateSeparatorLine} />
    </View>
  );
});

// 텍스트 메시지 컴포넌트
export const TextMessage: React.FC<{
  message: string;
  isMyMessage: boolean;
}> = React.memo(({ message, isMyMessage }) => {
  const bubbleStyle = isMyMessage ? styles.myMessageBubble : styles.receivedMessageBubble;
  const textStyle = isMyMessage ? styles.myMessageText : styles.receivedMessageText;
  const tailStyle = isMyMessage ? styles.myMessageTail : styles.receivedMessageTail;

  // 안전한 메시지 처리
  const safeMessage = message || '';

  return (
    <View style={isMyMessage ? styles.myMessageBubbleContainer : styles.receivedMessageBubbleContainer}>
      {!isMyMessage && <View style={tailStyle} />}
      <View style={bubbleStyle}>
        <Text style={textStyle}>{safeMessage}</Text>
      </View>
      {isMyMessage && <View style={tailStyle} />}
    </View>
  );
});

// 입장 메시지 컴포넌트
export const EnterMessage: React.FC<{
  message: string;
  time: string;
}> = React.memo(({ message, time }) => {
  // 안전한 메시지 처리
  const safeMessage = message || '';
  const safeTime = time || '';
  
  return (
    <View style={styles.enterMessageContainer}>
      <Text style={styles.enterMessageText}>{safeMessage}</Text>
      <Text style={styles.enterMessageTime}>{safeTime}</Text>
    </View>
  );
});

// 컴포넌트 display name 설정
ReadStatus.displayName = 'ReadStatus';
DateSeparator.displayName = 'DateSeparator';
TextMessage.displayName = 'TextMessage';
EnterMessage.displayName = 'EnterMessage';

// 개별 export
export default {
  ReadStatus,
  DateSeparator,
  TextMessage,
  EnterMessage,
};
