'use client'

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Mic,
  MicOff,
  Loader2,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import { voiceConfig } from '@/config/voice';
import {
  VoiceInputProps,
  VoiceInputState,
  VoiceInputStatus,
  VoiceInputError,
  TranscribeRequest,
  TranscribeResponse
} from '@/types/voice';
import { useVoiceRecorder } from './VoiceRecorder';
// import { VoiceConfirmDialog } from './VoiceConfirmDialog'; // 不再使用确认对话框
import { CircularAudioVisualizer } from './AudioVisualizer';
import { convertToWAV } from '@/lib/audio-converter';

/**
 * 主语音输入组件 - 协调录音和语音识别流程
 * 识别完成后自动将文本填入输入框，无需用户确认
 */
export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTextConfirmed,
  disabled = false,
  className = '',
  language = voiceConfig.defaultLanguage,
  placeholder = '点击开始语音输入'
}) => {
  const [state, setState] = useState<VoiceInputState>({
    status: 'idle',
    isRecording: false,
    isProcessing: false,
    audioBlob: null,
    transcribedText: '',
    showConfirmDialog: false, // 不再使用，保留以兼容类型
    error: null,
    recordingDuration: 0,
    confidence: undefined
  });

  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 使用录音 Hook
  const {
    recorderRef,
    startRecording: startRecorderRecording,
    stopRecording: stopRecorderRecording,
    // getAudioStream, // 未使用，已注释
    // isRecording: recorderIsRecording, // 使用 state.isRecording 代替
    duration: recordingDuration,
    VoiceRecorderComponent,
    wrappedProps
  } = useVoiceRecorder({
    onRecordingComplete: handleRecordingComplete,
    onRecordingStart: handleRecordingStart,
    onRecordingStop: handleRecordingStop,
    onError: handleRecorderError,
    onDurationUpdate: handleDurationUpdate,
    maxDuration: voiceConfig.maxRecordingDuration,
    minDuration: voiceConfig.minRecordingDuration
  });

  /**
   * 录音开始处理
   */
  function handleRecordingStart() {
    setState(prev => ({
      ...prev,
      status: 'recording',
      isRecording: true,
      error: null
    }));
  }

  /**
   * 录音停止处理
   */
  function handleRecordingStop() {
    setState(prev => ({
      ...prev,
      isRecording: false
    }));
  }

  /**
   * 录音完成处理
   */
  async function handleRecordingComplete(audioBlob: Blob) {
    setState(prev => ({
      ...prev,
      status: 'processing',
      isProcessing: true,
      audioBlob,
      isRecording: false
    }));

    // 开始转录
    await transcribeAudio(audioBlob);
  }

  /**
   * 录音器错误处理
   */
  function handleRecorderError(error: VoiceInputError, message: string) {
    setState(prev => ({
      ...prev,
      status: 'error',
      error: message,
      isRecording: false,
      isProcessing: false
    }));

    showErrorToast(error, message);
  }

  /**
   * 录音时长更新
   */
  function handleDurationUpdate(duration: number) {
    setState(prev => ({
      ...prev,
      recordingDuration: duration
    }));
  }

  /**
   * 音频转文字
   */
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // 将音频转换为 WAV 格式（16kHz, 16-bit, 单声道）
      const wavBlob = await convertToWAV(audioBlob, voiceConfig.sampleRate);

      // 构建 FormData 请求
      const formData = new FormData();
      formData.append('audioData', wavBlob, 'recording.wav');
      formData.append('language', language);
      formData.append('format', 'wav');
      formData.append('sampleRate', voiceConfig.sampleRate.toString());

      console.log('[VoiceInput] 发送音频数据到服务端代理:', {
        audioSize: wavBlob.size,
        language,
        format: 'wav',
        sampleRate: voiceConfig.sampleRate,
        duration: state.recordingDuration
      });

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData, // 使用 FormData，不设置 Content-Type header
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: TranscribeResponse = await response.json();

      if (result.success && result.text) {
        // 识别成功，直接调用回调填入输入框（不显示确认对话框）
        console.log('[VoiceInput] 识别成功，自动填入文本:', result.text);

        // 显示成功提示
        toast.success('语音识别成功');

        // 调用回调，将文本填入输入框
        onTextConfirmed(result.text);

        // 重置状态
        setState(prev => ({
          ...prev,
          status: 'idle',
          isProcessing: false,
          transcribedText: result.text || '',
          confidence: result.confidence,
          audioBlob: null
        }));

        retryCountRef.current = 0; // 重置重试计数
      } else {
        throw new Error(result.error || '语音识别失败');
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // 请求被取消，不处理
      }

      console.error('Transcription failed:', error);
      
      // 检查是否需要重试
      if (retryCountRef.current < voiceConfig.retryAttempts) {
        retryCountRef.current++;
        toast.error(`识别失败，正在重试 (${retryCountRef.current}/${voiceConfig.retryAttempts})...`);
        
        setTimeout(() => {
          transcribeAudio(audioBlob);
        }, voiceConfig.retryDelay);
      } else {
        setState(prev => ({
          ...prev,
          status: 'error',
          isProcessing: false,
          error: error instanceof Error ? error.message : '语音识别失败'
        }));
        
        showErrorToast(VoiceInputError.TRANSCRIPTION_FAILED, '语音识别失败，请重试');
        retryCountRef.current = 0;
      }
    }
  }, [language, state.recordingDuration]);

  /**
   * Blob 转 Base64
   */
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除 data:audio/wav;base64, 前缀
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  /**
   * 显示错误提示
   */
  const showErrorToast = (error: VoiceInputError, message: string) => {
    const errorMessages = {
      [VoiceInputError.MICROPHONE_PERMISSION_DENIED]: '请允许访问麦克风权限',
      [VoiceInputError.MICROPHONE_NOT_AVAILABLE]: '未找到可用的麦克风设备',
      [VoiceInputError.RECORDING_FAILED]: '录音失败，请重试',
      [VoiceInputError.UPLOAD_FAILED]: '上传失败，请重试',
      [VoiceInputError.TRANSCRIPTION_FAILED]: '语音识别失败，请重试',
      [VoiceInputError.NETWORK_ERROR]: '网络连接失败，请检查网络',
      [VoiceInputError.AUDIO_TOO_SHORT]: '录音时间太短，请重新录音',
      [VoiceInputError.AUDIO_TOO_LONG]: '录音时间太长，请重新录音',
      [VoiceInputError.UNSUPPORTED_BROWSER]: '浏览器不支持录音功能',
      [VoiceInputError.INVALID_AUDIO_FORMAT]: '音频格式不支持'
    };

    toast.error(errorMessages[error] || message);
  };

  /**
   * 开始录音
   */
  const handleStartRecording = useCallback(async () => {
    if (disabled || state.isRecording || state.isProcessing) return;

    setState(prev => ({
      ...prev,
      status: 'requesting',
      error: null,
      audioBlob: null,
      transcribedText: '',
      confidence: undefined
    }));

    try {
      await startRecorderRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [disabled, state.isRecording, state.isProcessing, startRecorderRecording]);

  /**
   * 停止录音
   */
  const handleStopRecording = useCallback(() => {
    if (!state.isRecording) return;
    stopRecorderRecording();
  }, [state.isRecording, stopRecorderRecording]);

  // 移除了确认、取消、重试、重置等回调函数
  // 语音识别完成后直接填入输入框，无需用户确认

  /**
   * 组件卸载时清理
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * 获取按钮状态和样式
   */
  const getButtonState = () => {
    if (disabled) {
      return {
        variant: 'outline' as const,
        className: 'opacity-50 cursor-not-allowed',
        icon: MicOff,
        text: '语音输入不可用'
      };
    }

    switch (state.status) {
      case 'requesting':
        return {
          variant: 'outline' as const,
          className: 'border-blue-300 text-blue-600',
          icon: Loader2,
          text: '请求权限中...',
          iconClassName: 'animate-spin'
        };
      
      case 'recording':
        return {
          variant: 'default' as const,
          className: 'bg-red-500 hover:bg-red-600 text-white animate-pulse',
          icon: Mic,
          text: `录音中 ${Math.floor(recordingDuration / 1000)}s`,
          showVisualizer: true
        };
      
      case 'processing':
        return {
          variant: 'outline' as const,
          className: 'border-blue-300 text-blue-600',
          icon: Loader2,
          text: '识别中...',
          iconClassName: 'animate-spin'
        };
      
      case 'error':
        return {
          variant: 'outline' as const,
          className: 'border-red-300 text-red-600',
          icon: AlertCircle,
          text: '点击重试'
        };
      
      default:
        return {
          variant: 'outline' as const,
          className: 'border-gray-300 hover:border-blue-400 hover:text-blue-600',
          icon: Mic,
          text: placeholder
        };
    }
  };

  const buttonState = getButtonState();

  return (
    <>
      {/* 隐藏的录音器组件 */}
      <VoiceRecorderComponent ref={recorderRef} {...wrappedProps} />

      <Button
        variant={buttonState.variant}
        size="sm"
        className={`relative flex items-center gap-2 ${buttonState.className} ${className}`}
        onClick={state.isRecording ? handleStopRecording : handleStartRecording}
        disabled={disabled || state.status === 'requesting' || state.status === 'processing'}
        title={buttonState.text}
      >
        {/* 音频可视化器 */}
        {buttonState.showVisualizer && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CircularAudioVisualizer
              isRecording={true}
              size={20}
              className="text-white"
            />
          </div>
        )}

        {/* 图标 */}
        <buttonState.icon
          className={`h-4 w-4 ${buttonState.iconClassName || ''} ${
            buttonState.showVisualizer ? 'opacity-0' : ''
          }`}
        />

        {/* 文本（仅在非录音状态显示） */}
        {!buttonState.showVisualizer && (
          <span className="hidden sm:inline text-sm">
            {buttonState.text}
          </span>
        )}
      </Button>

      {/* 不再显示确认对话框，语音识别完成后直接填入输入框 */}
    </>
  );
};

export default VoiceInput;