/**
 * 实时语音识别服务 - 阿里云 Paraformer
 * 支持真正的流式识别：边说边显示文字
 *
 * 技术栈：
 * - expo-audio: 实时音频流采集
 * - WebSocket: 双向流式通信
 * - 阿里云 DashScope: Paraformer 实时语音识别
 */

import { AudioRecorder, RecordingStatus } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

// 阿里云 DashScope 配置
interface DashScopeConfig {
  apiKey: string;
  wsUrl?: string;
  model?: string;
  sampleRate?: number;
  format?: string;
}

// 识别结果事件
export interface RecognitionEvent {
  type: 'task-started' | 'result-generated' | 'task-finished' | 'task-failed' | 'error';
  text?: string; // 识别文本
  isFinal?: boolean; // 是否是最终结果（false=中间结果，true=最终结果）
  error?: string; // 错误信息
  timestamp?: number;
  duration?: number;
}

// 录音状态
export type RecordingState = 'idle' | 'connecting' | 'recording' | 'processing' | 'error';

export class SpeechRecognitionService {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  private config: DashScopeConfig;
  private taskId: string = '';
  private taskStarted = false;
  private recordingState: RecordingState = 'idle';
  private onEventCallback: ((event: RecognitionEvent) => void) | null = null;
  private recordingInterval: NodeJS.Timeout | null = null;

  constructor(config: DashScopeConfig) {
    this.config = {
      wsUrl: 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/',
      model: 'paraformer-realtime-v2',
      sampleRate: 16000,
      format: 'pcm', // 流式使用 PCM 格式
      ...config,
    };
  }

  /**
   * 生成任务 ID
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

        // React Native WebSocket 构造函数
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
        streaming: 'duplex', // 双向流式
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
        console.log('[Speech] Task started, ready for streaming');
        this.taskStarted = true;
        this.emitEvent({ type: 'task-started' });
        break;

      case 'result-generated':
        // 识别结果（中间结果 + 最终结果）
        if (payload && payload.output && payload.output.sentence) {
          const text = payload.output.sentence.text;
          const isFinal = payload.output.sentence.end_time !== undefined; // 有 end_time 表示最终结果
          const duration = payload.usage?.duration;

          console.log('[Speech] Recognition result:', { text, isFinal });

          this.emitEvent({
            type: 'result-generated',
            text,
            isFinal,
            timestamp: Date.now(),
            duration,
          });
        }
        break;

      case 'task-finished':
        console.log('[Speech] Task finished');
        this.emitEvent({ type: 'task-finished' });
        break;

      case 'task-failed':
        const errorMessage = header.error_message || 'Recognition failed';
        console.error('[Speech] Task failed:', errorMessage);
        this.emitEvent({
          type: 'task-failed',
          error: errorMessage,
        });
        break;

      default:
        console.log('[Speech] Unknown event:', header.event);
    }
  }

  /**
   * 开始实时录音
   */
  async startRecording(onEvent: (event: RecognitionEvent) => void): Promise<void> {
    try {
      // 清理旧资源
      await this.cleanup();

      this.onEventCallback = onEvent;
      this.recordingState = 'connecting';

      // 1. 请求麦克风权限
      const permission = await AudioRecorder.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Audio permission denied');
      }

      // 2. 连接 WebSocket
      await this.connectWebSocket();

      // 等待 task-started
      await this.waitForTaskStarted();

      // 3. 创建录音器
      this.recorder = new AudioRecorder({
        android: {
          extension: '.pcm',
          outputFormat: 0, // PCM
          audioEncoder: 0,
          sampleRate: this.config.sampleRate || 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.pcm',
          outputFormat: 0, // LINEARPCM
          audioQuality: 127,
          sampleRate: this.config.sampleRate || 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      // 4. 开始录音
      await this.recorder.record();
      this.recordingState = 'recording';
      console.log('[Speech] Recording started - streaming mode');

      // 5. 开始实时发送音频流
      this.startStreamingAudio();

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
   * 等待任务启动
   */
  private waitForTaskStarted(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Task start timeout'));
      }, 5000);

      const checkInterval = setInterval(() => {
        if (this.taskStarted) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * 实时流式发送音频
   */
  private startStreamingAudio() {
    // 每 100ms 读取一次音频数据并发送
    this.recordingInterval = setInterval(async () => {
      try {
        if (!this.recorder || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
          return;
        }

        // 获取录音 URI
        const uri = this.recorder.getUri();
        if (!uri) {
          return;
        }

        // 读取整个文件（累积的音频数据）
        const audioData = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });

        if (audioData && audioData.length > 0) {
          // 转换为二进制并发送
          const binaryData = this.base64ToArrayBuffer(audioData);
          this.ws.send(binaryData);
          console.log('[Speech] Sent audio chunk, size:', binaryData.byteLength);
        }
      } catch (error) {
        console.error('[Speech] Failed to stream audio:', error);
      }
    }, 100); // 每 100ms 发送一次
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
   * 停止录音
   */
  async stopRecording(): Promise<void> {
    try {
      console.log('[Speech] Stopping recording...');
      this.recordingState = 'processing';

      // 1. 停止音频流发送
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
        this.recordingInterval = null;
      }

      // 2. 停止录音
      if (this.recorder) {
        await this.recorder.stop();
        this.recorder = null;
      }

      // 3. 等待服务器处理剩余音频
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4. 发送 finish-task
      this.sendFinishTask();

      this.recordingState = 'idle';
      console.log('[Speech] Recording stopped');
    } catch (error) {
      console.error('[Speech] Failed to stop recording:', error);
      this.recordingState = 'error';
    }
  }

  /**
   * 取消录音
   */
  async cancelRecording(): Promise<void> {
    try {
      console.log('[Speech] Cancelling recording...');

      // 停止音频流
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
        this.recordingInterval = null;
      }

      // 停止录音
      if (this.recorder) {
        await this.recorder.stop();
        this.recorder = null;
      }

      // 清理 WebSocket
      await this.cleanup();

      this.recordingState = 'idle';
      console.log('[Speech] Recording cancelled');
    } catch (error) {
      console.error('[Speech] Failed to cancel recording:', error);
    }
  }

  /**
   * 发送 finish-task
   */
  private sendFinishTask() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Speech] WebSocket not ready for finish-task');
      return;
    }

    const finishTaskMessage = {
      header: {
        action: 'finish-task',
        task_id: this.taskId,
      },
    };

    console.log('[Speech] Sending finish-task');
    this.ws.send(JSON.stringify(finishTaskMessage));
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
   * 获取当前状态
   */
  getState(): RecordingState {
    return this.recordingState;
  }

  /**
   * 清理资源
   */
  private async cleanup() {
    // 停止录音间隔
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    // 停止录音
    if (this.recorder) {
      try {
        await this.recorder.stop();
      } catch (error) {
        console.warn('[Speech] Failed to stop recorder:', error);
      }
      this.recorder = null;
    }

    // 关闭 WebSocket
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;

      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }

    this.taskStarted = false;
  }

  /**
   * 完全销毁
   */
  async destroy() {
    await this.cancelRecording();
    this.onEventCallback = null;
  }
}
