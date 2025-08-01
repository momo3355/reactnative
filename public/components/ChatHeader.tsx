import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/ChatRoom.styles';

interface ChatHeaderProps {
  title: string;
  isConnected: boolean;
  onBack: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  title, 
  isConnected, 
  onBack 
}) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backButtonText}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.headerRight}>
      <View style={styles.connectionStatusContainer}>
        <View style={[
          styles.connectionStatus,
          { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
        ]} />
      </View>
    </View>
  </View>
);