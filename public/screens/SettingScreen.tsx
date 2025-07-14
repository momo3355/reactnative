import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  type: 'toggle' | 'link';
  value?: boolean;
  onPress?: () => void;
}

const SettingsScreen: React.FC = () => {
  console.log("=----------------setting-------------------=");
  // 설정 상태 관리
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'notify',
      title: '알림',
      description: '새 메시지와 댓글에 대한 알림을 받습니다',
      type: 'toggle',
      value: true,
    },
    {
      id: 'darkMode',
      title: '다크 모드',
      description: '어두운 테마를 사용합니다',
      type: 'toggle',
      value: false,
    },
    {
      id: 'soundEffect',
      title: '소리 효과',
      description: '앱 효과음을 재생합니다',
      type: 'toggle',
      value: true,
    },
    {
      id: 'account',
      title: '계정 설정',
      type: 'link',
    },
    {
      id: 'privacy',
      title: '개인정보 보호',
      type: 'link',
    },
    {
      id: 'about',
      title: '앱 정보',
      type: 'link',
    },
    {
      id: 'logout',
      title: '로그아웃',
      type: 'link',
    },
  ]);

  // 토글 설정 변경 핸들러
  const handleToggle = (id: string) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, value: !setting.value } : setting
    ));
  };

  // 설정 항목 렌더링
  const renderSettingItem = (item: SettingItem) => (
    <View key={item.id} style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.settingDescription}>{item.description}</Text>
        )}
      </View>
      
      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={() => handleToggle(item.id)}
          trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
          thumbColor={item.value ? '#007AFF' : '#f4f3f4'}
        />
      ) : (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={item.onPress || (() => console.log(`${item.title} 클릭됨`))}
        >
          <Text style={styles.linkText}>{'>'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionTitleText}>설정</Text>
      </View>
      
      <View style={styles.settingsContainer}>
        {settings.map(renderSettingItem)}
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>앱 버전: 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  linkButton: {
    padding: 8,
  },
  linkText: {
    fontSize: 18,
    color: '#999',
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});

export default SettingsScreen;