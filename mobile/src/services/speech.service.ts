/**
 * 语音识别服务 - 阿里云 Paraformer 实时语音识别
 * 基于官方 WebSocket API 文档实现
 *
 * 功能：
 * 1. 实时语音录制
 * 2. WebSocket 连接阿里云 DashScope
 * 3. 音频流式上传
 * 4. 实时文本识别结果返回
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

// 阿里云 DashScope 配置
interface DashScopeConfig {
  apiKey: string;
  wsUrl?: string;
  model?: string; // 模型名称，默认 paraformer-realtime-v2
  sampleRate?: number; // 采样率，默认 16000
  format?: string; // 音频格式，默认 wav
}

// 识别结果事件
export interface RecognitionEvent {
  type: 'task-started' | 'result-generated' | 'task-finished' | 'task-failed' | 'error';
  text?: string; // 识别文本
  isFinal?: boolean; // 是否是最终结果
  error?: string; // 错误信息
  timestamp?: number; // 时间戳
  duration?: number; // 计费时长（秒）
}

// 录音状态
export type RecordingState = 'idle' | 'connecting' | 'recording' | 'processing' | 'error';

export class SpeechRecognitionService {
  private ws: WebSocket | null = null;
  private recording: Audio.Recording | null = null;
  private config: DashScopeConfig;
  private taskId: string = '';
  private taskStarted = false;
  private recordingState: RecordingState = 'idle';
  private onEventCallback: ((event: RecognitionEvent) => void) | null = null;
  private audioChunks: string[] = []; // 存储音频块的 base64
  private sendingInterval: NodeJS.Timeout | null = null;

  constructor(config: DashScopeConfig) {
    this.config = {
      wsUrl: 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/',
      model: 'paraformer-realtime-v2',
      sampleRate: 16000,
      format: 'pcm',
      ...config,
    };
  }

  /**
   * 初始化音频权限
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('[Speech] Audio permission not granted');
        return false;
      }

      // 设置音频模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      return true;
    } catch (error) {
      console.error('[Speech] Failed to request audio permissions:', error);
      return false;
    }
  }

  /**
   * 生成任务 ID（32位随机字符串）
   */
  private generateTaskId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 连接 WebSocket
   */
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.taskId = this.generateTaskId();
        console.log('[Speech] Task ID:', this.taskId);

        // 创建 WebSocket 连接
        // React Native WebSocket 构造函数: new WebSocket(url, protocols, options)
        // 阿里云要求在 Authorization header 中传递 token
        this.ws = new WebSocket(
          this.config.wsUrl!,
          undefined,
          {
            headers: {
              Authorization: `bearer ${this.config.apiKey}`,
            },
          }
        );

        this.ws.onopen = () => {
          console.log('[Speech] WebSocket connected');
          this.sendRunTask();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data as string);
            this.handleWebSocketMessage(message);
          } catch (error) {
            console.error('[Speech] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[Speech] WebSocket error:', error);
          this.emitEvent({
            type: 'error',
            error: 'WebSocket connection failed',
          });
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[Speech] WebSocket closed');
          if (!this.taskStarted) {
            console.error('[Speech] Task not started, connection closed');
          }
        };
      } catch (error) {
        console.error('[Speech] Failed to connect WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * 发送 run-task 指令
   */
  private sendRunTask() {
    if (!this.ws) return;

    const runTaskMessage = {
      header: {
        action: 'run-task',
        task_id: this.taskId,
        streaming: 'duplex',
      },
      payload: {
        task_group: 'audio',
        task: 'asr',
        function: 'recognition',
        model: this.config.model,
        parameters: {
          sample_rate: this.config.sampleRate,
          format: this.config.format,
        },
        input: {},
      },
    };

    console.log('[Speech] Sending run-task');
    this.ws.send(JSON.stringify(runTaskMessage));
  }

  /**
   * 处理 WebSocket 消息
   */
  private handleWebSocketMessage(message: any) {
    const { header, payload } = message;

    if (!header || !header.event) {
      return;
    }

    console.log('[Speech] Event:', header.event);

    switch (header.event) {
      case 'task-started':
        console.log('[Speech] Task started');
        this.taskStarted = true;
        this.emitEvent({ type: 'task-started' });
        // 注意：不在这里启动发送，因为音频数据还没准备好
        // 音频数据会在 stopRecording() 中准备并发送
        break;

      case 'result-generated':
        // 识别结果
        if (payload && payload.output && payload.output.sentence) {
          const text = payload.output.sentence.text;
          const duration = payload.usage?.duration;

          console.log('[Speech] Recognition result:', text);

          this.emitEvent({
            type: 'result-generated',
            text,
            isFinal: true,
            timestamp: Date.now(),
            duration,
          });
        }
        break;

      case 'task-finished':
        console.log('[Speech] Task finished');
        this.emitEvent({ type: 'task-finished' });
        this.cleanup();
        break;

      case 'task-failed':
        const errorMessage = header.error_message || 'Recognition failed';
        console.error('[Speech] Task failed:', errorMessage);
        this.emitEvent({
          type: 'task-failed',
          error: errorMessage,
        });
        this.cleanup();
        break;

      default:
        console.log('[Speech] Unknown event:', header.event);
    }
  }

  /**
   * 发送音频流数据
   */
  private startSendingAudioStream() {
    if (this.sendingInterval) {
      clearInterval(this.sendingInterval);
    }

    console.log('[Speech] Starting to send audio chunks, total:', this.audioChunks.length);

    // 每 100ms 发送一个音频块
    let sentCount = 0;
    this.sendingInterval = setInterval(() => {
      if (this.audioChunks.length > 0) {
        const chunk = this.audioChunks.shift();
        if (chunk && this.ws && this.ws.readyState === WebSocket.OPEN) {
          // 将 base64 转换为二进制并发送
          const binaryData = this.base64ToArrayBuffer(chunk);
          this.ws.send(binaryData);
          sentCount++;
          console.log(`[Speech] Sent chunk ${sentCount}, remaining: ${this.audioChunks.length}`);
        }
      } else {
        // 所有音频块已发送完毕
        if (this.sendingInterval) {
          clearInterval(this.sendingInterval);
          this.sendingInterval = null;
          console.log('[Speech] All audio chunks sent');
        }
      }
    }, 100);
  }

  /**
   * Base64 转 ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * 开始录音
   */
  async startRecording(onEvent: (event: RecognitionEvent) => void): Promise<void> {
    try {
      // 清理旧的连接和状态
      this.cleanup();

      this.onEventCallback = onEvent;
      this.recordingState = 'connecting';
      this.audioChunks = [];
      this.taskStarted = false;

      // 1. 请求权限
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Audio permission denied');
      }

      // 2. 连接 WebSocket
      await this.connectWebSocket();

      // 3. 开始录音
      this.recordingState = 'recording';
      this.recording = new Audio.Recording();

      // 配置录音参数 - 使用 PCM 格式
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: this.config.sampleRate || 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: this.config.sampleRate || 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      });

      await this.recording.startAsync();
      console.log('[Speech] Recording started');

      // 开始定期读取音频数据
      this.startCapturingAudio();

    } catch (error) {
      console.error('[Speech] Failed to start recording:', error);
      this.recordingState = 'error';
      this.emitEvent({
        type: 'error',
        error: error instanceof Error ? error.message : 'Failed to start recording',
      });
      throw error;
    }
  }

  /**
   * 定期捕获音频数据
   */
  private startCapturingAudio() {
    // 注意：expo-av 不支持实时流式音频捕获
    // 这里我们使用定期读取的方式模拟
    // 实际生产环境可能需要使用原生模块或其他音频库

    // 由于 expo-av 的限制，我们在停止录音时一次性读取所有音频
    // 并分块发送
  }

  /**
   * 停止录音
   */
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) {
        return null;
      }

      this.recordingState = 'processing';
      console.log('[Speech] Stopping recording...');

      // 1. 停止录音
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      console.log('[Speech] Recording stopped, URI:', uri);

      // 2. 读取音频文件
      if (uri) {
        const audioData = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });

        // 将音频数据分块（每块约 0.1 秒的数据）
        const chunkSize = Math.floor((this.config.sampleRate! * 2 * 0.1)); // 16位PCM，单声道
        const totalChunks = Math.ceil(audioData.length / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, audioData.length);
          const chunk = audioData.substring(start, end);
          this.audioChunks.push(chunk);
        }

        console.log('[Speech] Audio split into', this.audioChunks.length, 'chunks');

        // 如果任务已启动，立即开始发送
        if (this.taskStarted) {
          this.startSendingAudioStream();
        }

        // 等待所有音频块发送完成
        await this.waitForAudioSent();

        // 3. 发送 finish-task 指令
        this.sendFinishTask();
      }

      // 4. 重置录音对象
      this.recording = null;
      this.recordingState = 'idle';

      return uri;
    } catch (error) {
      console.error('[Speech] Failed to stop recording:', error);
      this.recordingState = 'error';
      this.emitEvent({
        type: 'error',
        error: error instanceof Error ? error.message : 'Failed to stop recording',
      });
      return null;
    }
  }

  /**
   * 等待音频数据发送完成
   */
  private async waitForAudioSent(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.audioChunks.length === 0) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // 超时保护（最多等待 10 秒）
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  /**
   * 发送 finish-task 指令
   */
  private sendFinishTask() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Speech] WebSocket not ready');
      return;
    }

    const finishTaskMessage = {
      header: {
        action: 'finish-task',
        task_id: this.taskId,
        streaming: 'duplex',
      },
      payload: {
        input: {},
      },
    };

    console.log('[Speech] Sending finish-task');
    this.ws.send(JSON.stringify(finishTaskMessage));
  }

  /**
   * 取消录音
   */
  async cancelRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }

      this.cleanup();
      this.recordingState = 'idle';
      console.log('[Speech] Recording cancelled');
    } catch (error) {
      console.error('[Speech] Failed to cancel recording:', error);
    }
  }

  /**
   * 触发事件回调
   */
  private emitEvent(event: RecognitionEvent) {
    if (this.onEventCallback) {
      this.onEventCallback(event);
    }
  }

  /**
   * 获取当前录音状态
   */
  getState(): RecordingState {
    return this.recordingState;
  }

  /**
   * 清理资源
   */
  private cleanup() {
    if (this.sendingInterval) {
      clearInterval(this.sendingInterval);
      this.sendingInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.audioChunks = [];
    this.taskStarted = false;
  }

  /**
   * 完全清理
   */
  async destroy() {
    await this.cancelRecording();
    this.cleanup();
    this.onEventCallback = null;
  }
}
