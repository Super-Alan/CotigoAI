/**
 * 语音输入确认对话框
 *
 * 功能：
 * 1. 显示识别的文本
 * 2. 允许用户编辑
 * 3. 确认或取消
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';

interface VoiceInputModalProps {
  visible: boolean;
  recognizedText: string;
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

export function VoiceInputModal({
  visible,
  recognizedText,
  onConfirm,
  onCancel,
}: VoiceInputModalProps) {
  const [editedText, setEditedText] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    setEditedText(recognizedText);
  }, [recognizedText]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const handleConfirm = () => {
    if (editedText.trim()) {
      onConfirm(editedText.trim());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[styles.overlay, { opacity: fadeAnim }]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onCancel}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modal,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* 标题 */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🎤</Text>
            <Text style={styles.headerTitle}>语音识别结果</Text>
            <Text style={styles.headerSubtitle}>您可以编辑后发送</Text>
          </View>

          {/* 文本编辑区 */}
          <View style={styles.content}>
            <TextInput
              multiline
              value={editedText}
              onChangeText={setEditedText}
              placeholder="识别的文本将显示在这里..."
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
              autoFocus
            />

            <Text style={styles.charCount}>
              {editedText.length} 字
            </Text>
          </View>

          {/* 按钮 */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonTextCancel}>取消</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonConfirm,
                !editedText.trim() && styles.buttonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!editedText.trim()}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonTextConfirm}>
                发送
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#F0F9FF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'SF Pro Display',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'SF Pro Text',
    letterSpacing: -0.2,
  },
  content: {
    padding: 20,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'SF Pro Text',
    color: '#0F172A',
    minHeight: 120,
    maxHeight: 240,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    letterSpacing: -0.3,
  },
  charCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'SF Pro Text',
    textAlign: 'right',
    marginTop: 8,
    letterSpacing: -0.2,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonConfirm: {
    backgroundColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowColor: '#CBD5E1',
    opacity: 0.5,
  },
  buttonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    fontFamily: 'SF Pro Text',
    letterSpacing: -0.4,
  },
  buttonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'SF Pro Text',
    letterSpacing: -0.4,
  },
});
