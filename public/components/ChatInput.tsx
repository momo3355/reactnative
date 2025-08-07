/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SelectedImage } from '../store/zustandboard/types';
import { styles } from '../styles/ChatRoom.styles';

interface ChatInputProps {
  inputMessage: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onImagePicker: () => void;
  selectedImages: SelectedImage[];
  isConnected: boolean;
  isUploading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputMessage,
  onChangeText,
  onSend,
  onImagePicker,
  selectedImages,
  isConnected,
  isUploading,
}) => {
  const canSend = (inputMessage.trim() || selectedImages.length > 0) && !isUploading && isConnected;

  return (
    <View style={styles.footer}>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={onImagePicker}
        >
          <Text style={styles.imageButtonText}>📷</Text>
        </TouchableOpacity>

        <TextInput
          value={inputMessage}
          onChangeText={onChangeText}
          placeholder={
            selectedImages.length > 0
              ? `${selectedImages.length}장의 이미지를 전송합니다`
              : '메시지를 입력하세요...'
          }
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          onSubmitEditing={onSend}
          returnKeyType="send"
          blurOnSubmit={false}
          style={styles.textInput}
          editable={selectedImages.length === 0}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: canSend ? '#FEE500' : '#E0E0E0' },
          ]}
          onPress={onSend}
          disabled={!canSend}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <Text style={[
              styles.sendButtonText,
              { color: canSend ? '#000' : '#999' },
            ]}>
              전송
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
