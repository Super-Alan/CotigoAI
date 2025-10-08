/**
 * 语音输入按钮组件
 *
 * 功能：
 * 1. 长按开始录音，松开结束录音
 * 2. 实时显示录音状态和波形动画
 * 3. 显示识别结果
 * 4. 支持取消录音（滑出范围）
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Alert,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SpeechRecognitionService, RecognitionEvent, RecordingState } from '@/src/services/speech.service';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CANCEL_THRESHOLD = 80; // 上滑超过此距离取消录音

interface VoiceInputButtonProps {
  apiKey: string;
  onResult: (text: string) => void; // 识别完成回调
  disabled?: boolean;
}

export function VoiceInputButton({ apiKey, onResult, disabled }: VoiceInputButtonProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recognizedText, setRecognizedText] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const speechService = useRef<SpeechRecognitionService | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 初始化语音服务
  useEffect(() => {
    speechService.current = new SpeechRecognitionService({
      apiKey,
    });

    return () => {
      if (speechService.current) {
        speechService.current.destroy();
      }
    };
  }, [apiKey]);

  // 录音时的脉冲动画
  useEffect(() => {
    if (recordingState === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recordingState]);

  // 处理识别事件
  const handleRecognitionEvent = (event: RecognitionEvent) => {
    console.log('[VoiceInput] Event:', event.type, event.text);

    switch (event.type) {
      case 'task-started':
        setRecordingState('recording');
        break;

      case 'result-generated':
        if (event.text) {
          setRecognizedText(event.text);
        }
        break;

      case 'task-finished':
        setRecordingState('idle');
        if (recognizedText) {
          onResult(recognizedText);
          setRecognizedText('');
        }
        break;

      case 'task-failed':
      case 'error':
        setRecordingState('error');
        Alert.alert('识别失败', event.error || '语音识别失败，请重试');
        setTimeout(() => setRecordingState('idle'), 1500);
        break;
    }
  };

  // 开始录音
  const startRecording = async () => {
    if (!speechService.current || disabled) return;

    try {
      setRecognizedText('');
      setIsCancelling(false);

      // 按下动画
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
      }).start();

      await speechService.current.startRecording(handleRecognitionEvent);
    } catch (error) {
      console.error('[VoiceInput] Start recording failed:', error);
      Alert.alert('错误', '无法开始录音，请检查麦克风权限');
      setRecordingState('idle');
      scaleAnim.setValue(1);
    }
  };

  // 停止录音
  const stopRecording = async () => {
    if (!speechService.current) return;

    try {
      // 松开动画
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      if (isCancelling) {
        await speechService.current.cancelRecording();
        setRecognizedText('');
        setRecordingState('idle');
      } else {
        setRecordingState('processing');
        await speechService.current.stopRecording();
      }
    } catch (error) {
      console.error('[VoiceInput] Stop recording failed:', error);
      setRecordingState('idle');
    }
  };

  // 取消录音
  const cancelRecording = async () => {
    if (!speechService.current) return;

    setIsCancelling(true);
    await speechService.current.cancelRecording();
    setRecognizedText('');
    setRecordingState('idle');
    scaleAnim.setValue(1);
    slideAnim.setValue(0);
  };

  // 手势处理
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        startRecording();
      },

      onPanResponderMove: (_, gestureState) => {
        const { dy } = gestureState;
        slideAnim.setValue(dy);

        // 上滑超过阈值，显示取消提示
        if (-dy > CANCEL_THRESHOLD && !isCancelling) {
          setIsCancelling(true);
        } else if (-dy <= CANCEL_THRESHOLD && isCancelling) {
          setIsCancelling(false);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        const { dy } = gestureState;
        slideAnim.setValue(0);

        // 如果上滑超过阈值，取消录音
        if (-dy > CANCEL_THRESHOLD) {
          cancelRecording();
        } else {
          stopRecording();
        }
      },
    })
  ).current;

  // 状态文本
  const getStatusText = () => {
    if (isCancelling) return '松开取消';
    switch (recordingState) {
      case 'connecting':
        return '连接中...';
      case 'recording':
        return recognizedText || '正在聆听...';
      case 'processing':
        return '处理中...';
      case 'error':
        return '识别失败';
      default:
        return '';
    }
  };

  const isActive = recordingState !== 'idle';

  return (
    <View style={styles.container}>
      {/* 录音提示浮层 */}
      {isActive && (
        <View style={styles.overlay}>
          <View style={[
            styles.statusCard,
            isCancelling && styles.statusCardCancel
          ]}>
            {/* 取消区域提示 */}
            {isCancelling ? (
              <>
                <Text style={styles.cancelIcon}>🚫</Text>
                <Text style={styles.statusTextLarge}>松开取消</Text>
              </>
            ) : (
              <>
                {/* 录音波形动画 */}
                <Animated.View style={[
                  styles.waveform,
                  { transform: [{ scale: pulseAnim }] }
                ]}>
                  <View style={styles.waveBar} />
                  <View style={[styles.waveBar, styles.waveBarMid]} />
                  <View style={styles.waveBar} />
                </Animated.View>

                {/* 状态文本 */}
                <Text style={styles.statusText}>{getStatusText()}</Text>

                {/* 提示文本 */}
                {recordingState === 'recording' && !recognizedText && (
                  <Text style={styles.hintText}>上滑取消</Text>
                )}
              </>
            )}
          </View>
        </View>
      )}

      {/* 语音输入按钮 */}
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            styles.button,
            isActive && styles.buttonActive,
            isCancelling && styles.buttonCancel,
            disabled && styles.buttonDisabled,
          ]}
          activeOpacity={1}
          disabled={disabled}
        >
          <Text style={styles.buttonIcon}>
            {recordingState === 'recording' ? '🎤' : '🎙️'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  statusCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    minWidth: 200,
    maxWidth: SCREEN_WIDTH * 0.8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statusCardCancel: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  cancelIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  statusTextLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'SF Pro Display',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  waveBar: {
    width: 4,
    height: 24,
    backgroundColor: '#0EA5E9',
    borderRadius: 2,
  },
  waveBarMid: {
    height: 36,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'SF Pro Text',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'SF Pro Text',
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  buttonCancel: {
    backgroundColor: '#6B7280',
    shadowColor: '#6B7280',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowColor: '#CBD5E1',
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 28,
  },
});
