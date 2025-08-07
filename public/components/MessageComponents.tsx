/* eslint-disable radix */
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/ChatRoom.styles';

// 읽음 상태 컴포넌트
export const ReadStatus: React.FC<{
  isRead: string;
  isMyMessage: boolean;
}> = React.memo(({ isRead, isMyMessage }) => {
  const readCount = parseInt(isRead);

  if (readCount <= 0) {return null;}

  return (
    <Text style={[
      styles.readStatusText,
      isMyMessage ? styles.myReadStatus : styles.receivedReadStatus,
    ]}>
      {readCount}
    </Text>
  );
});

// 날짜 구분선 컴포넌트
export const DateSeparator: React.FC<{
  date: string;
}> = React.memo(({ date }) => (
  <View style={styles.dateSeparatorContainer}>
    <View style={styles.dateSeparatorLine} />
    <Text style={styles.dateSeparatorText}>{date}</Text>
    <View style={styles.dateSeparatorLine} />
  </View>
));

// 텍스트 메시지 컴포넌트
export const TextMessage: React.FC<{
  message: string;
  isMyMessage: boolean;
}> = React.memo(({ message, isMyMessage }) => {
  const bubbleStyle = isMyMessage ? styles.myMessageBubble : styles.receivedMessageBubble;
  const textStyle = isMyMessage ? styles.myMessageText : styles.receivedMessageText;
  const tailStyle = isMyMessage ? styles.myMessageTail : styles.receivedMessageTail;

  return (
    <View style={isMyMessage ? styles.myMessageBubbleContainer : styles.receivedMessageBubbleContainer}>
      {!isMyMessage && <View style={tailStyle} />}
      <View style={bubbleStyle}>
        <Text style={textStyle}>{message}</Text>
      </View>
      {isMyMessage && <View style={tailStyle} />}
    </View>
  );
});

// 입장 메시지 컴포넌트
export const EnterMessage: React.FC<{
  message: string;
  time: string;
}> = React.memo(({ message, time }) => (
  <View style={styles.enterMessageContainer}>
    <Text style={styles.enterMessageText}>{message}</Text>
    <Text style={styles.enterMessageTime}>{time}</Text>
  </View>
));

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
