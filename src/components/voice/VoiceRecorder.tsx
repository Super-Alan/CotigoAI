'use client'

import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { voiceConfig } from '@/config/voice';
import {
  VoiceRecorderProps,
  RecordingState,
  VoiceInputError,
  BrowserCompatibility
} from '@/types/voice';

/**
 * 检查浏览器兼容性
 */
const checkBrowserCompatibility = (): BrowserCompatibility => {
  const unsupportedFeatures: string[] = [];
  
  const mediaRecorder = typeof MediaRecorder !== 'undefined';
  if (!mediaRecorder) unsupportedFeatures.push('MediaRecorder');
  
  const getUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  if (!getUserMedia) unsupportedFeatures.push('getUserMedia');
  
  const audioContext = !!(window.AudioContext || (window as any).webkitAudioContext);
  if (!audioContext) unsupportedFeatures.push('AudioContext');
  
  const webAudio = audioContext && typeof AnalyserNode !== 'undefined';
  if (!webAudio) unsupportedFeatures.push('Web Audio API');
  
  return {
    mediaRecorder,
    getUserMedia,
    audioContext,
    webAudio,
    isSupported: mediaRecorder && getUserMedia,
    unsupportedFeatures
  };
};

/**
 * 录音器实例接口 - 暴露给父组件的方法
 */
export interface VoiceRecorderHandle {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  getAudioStream: () => MediaStream | null;
  isRecording: boolean;
  duration: number;
}

/**
 * 录音组件 - 封装 MediaRecorder API
 */
export const VoiceRecorder = forwardRef<VoiceRecorderHandle, VoiceRecorderProps>(({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onError,
  onDurationUpdate,
  maxDuration = voiceConfig.maxRecordingDuration,
  minDuration = voiceConfig.minRecordingDuration,
  sampleRate = voiceConfig.sampleRate,
  mimeType = voiceConfig.mimeType
}, ref) => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    mediaRecorder: null,
    audioStream: null,
    audioChunks: []
  });

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  /**
   * 清理资源
   */
  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (recordingState.audioStream) {
      recordingState.audioStream.getTracks().forEach(track => track.stop());
    }

    if (recordingState.mediaRecorder && recordingState.mediaRecorder.state !== 'inactive') {
      recordingState.mediaRecorder.stop();
    }
  }, [recordingState.audioStream, recordingState.mediaRecorder]);

  /**
   * 组件卸载时清理资源
   */
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  /**
   * 开始录音
   */
  const startRecording = useCallback(async () => {
    try {
      // 检查浏览器兼容性
      const compatibility = checkBrowserCompatibility();
      if (!compatibility.isSupported) {
        onError(VoiceInputError.UNSUPPORTED_BROWSER, 
          `浏览器不支持录音功能。缺少: ${compatibility.unsupportedFeatures.join(', ')}`);
        return;
      }

      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // 检查是否支持指定的 MIME 类型
      let actualMimeType = mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // 尝试其他格式
        const fallbackTypes = ['audio/webm', 'audio/mp4', 'audio/ogg'];
        actualMimeType = fallbackTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
        
        if (!actualMimeType) {
          onError(VoiceInputError.INVALID_AUDIO_FORMAT, '浏览器不支持任何音频格式');
          stream.getTracks().forEach(track => track.stop());
          return;
        }
      }

      // 创建 MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: actualMimeType,
        audioBitsPerSecond: voiceConfig.audioBitsPerSecond
      });

      const audioChunks: Blob[] = [];

      // 设置事件处理器
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: actualMimeType });
        
        // 检查录音时长
        const duration = Date.now() - startTimeRef.current;
        if (duration < minDuration) {
          onError(VoiceInputError.AUDIO_TOO_SHORT, `录音时长太短，至少需要 ${minDuration / 1000} 秒`);
          return;
        }

        onRecordingComplete(audioBlob);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        onError(VoiceInputError.RECORDING_FAILED, '录音过程中发生错误');
      };

      // 更新状态
      setRecordingState({
        isRecording: true,
        duration: 0,
        mediaRecorder,
        audioStream: stream,
        audioChunks
      });

      // 开始录音
      mediaRecorder.start(100); // 每100ms收集一次数据
      startTimeRef.current = Date.now();
      onRecordingStart();

      // 开始计时
      durationIntervalRef.current = setInterval(() => {
        const currentDuration = Date.now() - startTimeRef.current;
        
        setRecordingState(prev => ({
          ...prev,
          duration: currentDuration
        }));

        onDurationUpdate?.(currentDuration);

        // 检查是否超过最大时长
        if (currentDuration >= maxDuration) {
          stopRecording();
        }
      }, 100);

    } catch (error) {
      console.error('Failed to start recording:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          onError(VoiceInputError.MICROPHONE_PERMISSION_DENIED, '麦克风权限被拒绝');
        } else if (error.name === 'NotFoundError') {
          onError(VoiceInputError.MICROPHONE_NOT_AVAILABLE, '未找到可用的麦克风设备');
        } else {
          onError(VoiceInputError.RECORDING_FAILED, `录音启动失败: ${error.message}`);
        }
      } else {
        onError(VoiceInputError.RECORDING_FAILED, '录音启动失败');
      }
    }
  }, [maxDuration, minDuration, mimeType, onError, onRecordingComplete, onRecordingStart, onDurationUpdate, sampleRate]);

  /**
   * 停止录音
   */
  const stopRecording = useCallback(() => {
    if (!recordingState.isRecording || !recordingState.mediaRecorder) {
      return;
    }

    try {
      // 停止计时
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // 停止录音
      if (recordingState.mediaRecorder.state === 'recording') {
        recordingState.mediaRecorder.stop();
      }

      // 停止音频流
      if (recordingState.audioStream) {
        recordingState.audioStream.getTracks().forEach(track => track.stop());
      }

      // 更新状态
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        mediaRecorder: null,
        audioStream: null
      }));

      onRecordingStop();

    } catch (error) {
      console.error('Failed to stop recording:', error);
      onError(VoiceInputError.RECORDING_FAILED, '停止录音时发生错误');
    }
  }, [recordingState.isRecording, recordingState.mediaRecorder, recordingState.audioStream, onRecordingStop, onError]);

  /**
   * 获取当前录音状态
   */
  const getRecordingState = useCallback(() => recordingState, [recordingState]);

  /**
   * 获取音频流（用于可视化）
   */
  const getAudioStream = useCallback(() => recordingState.audioStream, [recordingState.audioStream]);

  // 使用 useImperativeHandle 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    getAudioStream,
    isRecording: recordingState.isRecording,
    duration: recordingState.duration
  }), [startRecording, stopRecording, getAudioStream, recordingState.isRecording, recordingState.duration]);

  // 录音器组件不渲染任何 UI
  return null;
});

VoiceRecorder.displayName = 'VoiceRecorder';

/**
 * 自定义 Hook 用于录音功能
 */
export const useVoiceRecorder = (props: VoiceRecorderProps) => {
  const recorderRef = useRef<VoiceRecorderHandle>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  // 包装 props 的回调，以便更新本地状态
  const wrappedProps: VoiceRecorderProps = {
    ...props,
    onRecordingStart: () => {
      setIsRecording(true);
      setDuration(0);
      props.onRecordingStart();
    },
    onRecordingStop: () => {
      setIsRecording(false);
      props.onRecordingStop();
    },
    onDurationUpdate: (newDuration: number) => {
      setDuration(newDuration);
      props.onDurationUpdate?.(newDuration);
    },
  };

  const startRecording = useCallback(async () => {
    if (recorderRef.current) {
      await recorderRef.current.startRecording();
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
    }
  }, []);

  const getAudioStream = useCallback(() => {
    return recorderRef.current?.getAudioStream() || null;
  }, []);

  return {
    recorderRef,
    startRecording,
    stopRecording,
    getAudioStream,
    isRecording,
    duration,
    VoiceRecorderComponent: VoiceRecorder,
    wrappedProps
  };
};

export default VoiceRecorder;