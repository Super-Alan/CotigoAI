/**
 * 语音输入功能配置
 */
export const voiceConfig = {
  // 录音设置
  maxRecordingDuration: 60000, // 60秒
  minRecordingDuration: 1000,  // 1秒
  sampleRate: 16000,           // 16kHz采样率
  audioFormat: 'wav' as const, // 音频格式
  
  // API设置
  apiTimeout: 30000,           // 30秒超时
  retryAttempts: 3,            // 重试次数
  
  // UI设置
  enableAudioVisualization: true,
  visualizerBars: 20,          // 可视化条数
  
  // 音频质量设置
  audioBitsPerSecond: 128000,  // 128kbps
  mimeType: 'audio/wav',
  
  // 支持的语言
  supportedLanguages: {
    'zh-CN': '中文（简体）',
    'zh-TW': '中文（繁体）',
    'en-US': 'English (US)',
    'ja-JP': '日本語',
    'ko-KR': '한국어'
  },
  
  // 默认语言
  defaultLanguage: 'zh-CN' as const,
  
  // 错误重试间隔
  retryDelay: 1000, // 1秒
  
  // 音频可视化更新频率
  visualizerUpdateInterval: 100, // 100ms
} as const;

export type VoiceConfig = typeof voiceConfig;
export type SupportedLanguage = keyof typeof voiceConfig.supportedLanguages;