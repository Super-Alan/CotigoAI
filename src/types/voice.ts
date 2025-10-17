import { SupportedLanguage } from '@/config/voice';

/**
 * 语音输入状态枚举
 */
export type VoiceInputStatus = 
  | 'idle'           // 空闲状态
  | 'requesting'     // 请求麦克风权限
  | 'recording'      // 录音中
  | 'processing'     // 处理中（上传+识别）
  | 'confirming'     // 用户确认
  | 'error';         // 错误状态

/**
 * 语音输入错误类型
 */
export enum VoiceInputError {
  MICROPHONE_PERMISSION_DENIED = 'microphone_permission_denied',
  MICROPHONE_NOT_AVAILABLE = 'microphone_not_available',
  RECORDING_FAILED = 'recording_failed',
  UPLOAD_FAILED = 'upload_failed',
  TRANSCRIPTION_FAILED = 'transcription_failed',
  NETWORK_ERROR = 'network_error',
  AUDIO_TOO_SHORT = 'audio_too_short',
  AUDIO_TOO_LONG = 'audio_too_long',
  UNSUPPORTED_BROWSER = 'unsupported_browser',
  INVALID_AUDIO_FORMAT = 'invalid_audio_format',
}

/**
 * 语音输入组件属性
 */
export interface VoiceInputProps {
  onTextConfirmed: (text: string) => void;
  disabled?: boolean;
  className?: string;
  language?: SupportedLanguage;
  placeholder?: string;
}

/**
 * 语音输入状态
 */
export interface VoiceInputState {
  status: VoiceInputStatus;
  isRecording: boolean;
  isProcessing: boolean;
  audioBlob: Blob | null;
  transcribedText: string;
  showConfirmDialog: boolean;
  error: string | null;
  recordingDuration: number;
  confidence?: number;
}

/**
 * 录音组件属性
 */
export interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  onError: (error: VoiceInputError, message: string) => void;
  onDurationUpdate?: (duration: number) => void;
  maxDuration?: number;
  minDuration?: number;
  sampleRate?: number;
  mimeType?: string;
}

/**
 * 录音状态
 */
export interface RecordingState {
  isRecording: boolean;
  duration: number;
  mediaRecorder: MediaRecorder | null;
  audioStream: MediaStream | null;
  audioChunks: Blob[];
}

/**
 * 确认对话框属性
 */
export interface VoiceConfirmDialogProps {
  isOpen: boolean;
  transcribedText: string;
  audioBlob: Blob | null;
  confidence?: number;
  onConfirm: (finalText: string) => void;
  onCancel: () => void;
  onRetry: () => void;
  onEdit?: (text: string) => void;
}

/**
 * 音频可视化组件属性
 */
export interface AudioVisualizerProps {
  isRecording: boolean;
  audioStream?: MediaStream;
  className?: string;
  barCount?: number;
  barColor?: string;
  backgroundColor?: string;
}

/**
 * 语音转文字请求接口
 */
export interface TranscribeRequest {
  audioData: string;        // Base64编码的音频数据
  format: 'wav' | 'mp3';   // 音频格式
  sampleRate: number;       // 采样率
  language?: SupportedLanguage; // 语言
  duration?: number;        // 音频时长（毫秒）
}

/**
 * 语音转文字响应接口
 */
export interface TranscribeResponse {
  success: boolean;
  text?: string;
  confidence?: number;
  error?: string;
  duration?: number;
  language?: SupportedLanguage;
}

/**
 * 语音输入上下文类型
 */
export interface VoiceInputContext {
  status: VoiceInputStatus;
  audioBlob: Blob | null;
  transcribedText: string;
  error: string | null;
  confidence: number;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetState: () => void;
}

/**
 * 音频分析数据
 */
export interface AudioAnalysisData {
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  volume: number;
  peak: number;
}

/**
 * 浏览器兼容性检查结果
 */
export interface BrowserCompatibility {
  mediaRecorder: boolean;
  getUserMedia: boolean;
  audioContext: boolean;
  webAudio: boolean;
  isSupported: boolean;
  unsupportedFeatures: string[];
}

/**
 * 语音输入事件类型
 */
export interface VoiceInputEvents {
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onTranscriptionStart?: () => void;
  onTranscriptionComplete?: (text: string, confidence?: number) => void;
  onError?: (error: VoiceInputError, message: string) => void;
  onPermissionRequest?: () => void;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

/**
 * 音频处理选项
 */
export interface AudioProcessingOptions {
  enableNoiseReduction?: boolean;
  enableEchoCancellation?: boolean;
  enableAutoGainControl?: boolean;
  channelCount?: number;
  sampleRate?: number;
  sampleSize?: number;
}

/**
 * 语音识别配置
 */
export interface VoiceRecognitionConfig {
  language: SupportedLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  serviceType?: 'volcengine' | 'browser' | 'custom';
}

/**
 * 错误处理配置
 */
export interface ErrorHandlingConfig {
  showErrorDialog?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  fallbackToTextInput?: boolean;
}