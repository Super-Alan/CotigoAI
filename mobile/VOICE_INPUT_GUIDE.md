# 语音输入功能使用指南

基于阿里云 Paraformer 实时语音识别实现的移动端语音输入功能。

## 功能特性

### ✨ 核心功能
- ✅ 实时语音录制
- ✅ 语音转文字 (中文识别)
- ✅ 用户确认编辑
- ✅ 一键发送到对话

### 🎯 交互体验
- **长按录音**: 按住语音按钮开始录音
- **上滑取消**: 录音时向上滑动可取消录音
- **松开完成**: 松开按钮结束录音
- **编辑确认**: 识别结果可编辑后发送

### 📱 视觉设计
- 科技蓝主题配色
- 实时波形动画
- 录音状态提示
- Apple 风格交互

## 快速开始

### 1. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# 阿里云 DashScope API Key
EXPO_PUBLIC_DASHSCOPE_API_KEY=your_api_key_here
```

**获取 API Key**:
1. 访问 [阿里云百炼平台](https://dashscope.console.aliyun.com/)
2. 登录/注册阿里云账号
3. 进入 API-KEY 管理页面
4. 创建新的 API Key
5. 复制 API Key 到 `.env` 文件

### 2. 安装依赖

```bash
cd mobile
npm install
```

新增依赖：
- `expo-av`: 音频录制和播放
- `expo-file-system`: 文件系统访问

### 3. 权限配置

#### iOS (`mobile/app.json`)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "我们需要使用您的麦克风进行语音输入"
      }
    }
  }
}
```

#### Android (`mobile/app.json`)
```json
{
  "expo": {
    "android": {
      "permissions": [
        "RECORD_AUDIO"
      ]
    }
  }
}
```

### 4. 启动应用

```bash
npm start
```

选择运行平台：
- `i` - iOS 模拟器
- `a` - Android 模拟器
- 扫描二维码 - 真机测试 (推荐)

## 使用方法

### 基本使用

1. **打开对话页面**
   - 进入任意对话详情页
   - 输入框左侧会显示 🎙️ 语音按钮

2. **开始录音**
   - 长按语音按钮
   - 出现录音浮层提示
   - 开始说话

3. **取消录音**
   - 录音时向上滑动
   - 显示 "松开取消" 提示
   - 松开手指取消

4. **完成录音**
   - 说完后直接松开按钮
   - 等待识别结果

5. **编辑发送**
   - 弹出识别结果对话框
   - 可编辑识别的文本
   - 点击 "发送" 或 "取消"

### 高级功能

#### 自定义配置

编辑 `mobile/src/services/speech.service.ts`:

```typescript
// 修改采样率
const config = {
  apiKey: 'your_key',
  sampleRate: 16000, // 8000/16000/48000
  format: 'pcm',     // pcm/opus/speex
  model: 'paraformer-realtime-v2', // 模型版本
};
```

#### 独立使用语音服务

```typescript
import { SpeechRecognitionService } from '@/src/services/speech.service';

// 初始化
const speechService = new SpeechRecognitionService({
  apiKey: 'your_api_key',
});

// 开始录音
await speechService.startRecording((event) => {
  if (event.type === 'result-generated') {
    console.log('识别结果:', event.text);
  }
});

// 停止录音
await speechService.stopRecording();

// 取消录音
await speechService.cancelRecording();

// 清理资源
await speechService.destroy();
```

## 技术实现

### 架构设计

```
┌─────────────────────────────────────────────┐
│           对话页面 (conversations/[id])       │
│  ┌───────────────────────────────────────┐  │
│  │    VoiceInputButton (语音按钮)        │  │
│  │  - 长按录音                           │  │
│  │  - 上滑取消                           │  │
│  │  - 状态动画                           │  │
│  └───────────────┬───────────────────────┘  │
│                  │ onResult(text)            │
│  ┌───────────────▼───────────────────────┐  │
│  │  VoiceInputModal (确认对话框)        │  │
│  │  - 显示识别结果                       │  │
│  │  - 编辑文本                           │  │
│  │  - 确认/取消                          │  │
│  └───────────────┬───────────────────────┘  │
│                  │ onConfirm(text)           │
│                  ▼                            │
│              sendMessage()                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│   SpeechRecognitionService (语音服务)       │
│  ┌───────────────────────────────────────┐  │
│  │  1. 请求麦克风权限                    │  │
│  │  2. 连接 WebSocket                    │  │
│  │  3. 发送 run-task 指令                │  │
│  │  4. 开始录音 (expo-av)                │  │
│  │  5. 分块上传音频                      │  │
│  │  6. 接收识别结果                      │  │
│  │  7. 发送 finish-task                  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│     阿里云 DashScope API (Paraformer)       │
│  wss://dashscope.aliyuncs.com/api-ws/v1/   │
│  - 实时语音识别                             │
│  - Paraformer-realtime-v2 模型              │
│  - WebSocket 双工通信                       │
└─────────────────────────────────────────────┘
```

### 核心流程

#### 1. WebSocket 连接流程
```typescript
// 1. 建立连接
ws = new WebSocket(url, { headers: { Authorization: `bearer ${apiKey}` }});

// 2. 发送 run-task
ws.send({
  header: { action: 'run-task', task_id, streaming: 'duplex' },
  payload: {
    task_group: 'audio',
    task: 'asr',
    function: 'recognition',
    model: 'paraformer-realtime-v2',
    parameters: { sample_rate: 16000, format: 'pcm' }
  }
});

// 3. 等待 task-started 事件
// 4. 发送音频数据 (二进制)
// 5. 接收 result-generated 事件
// 6. 发送 finish-task
```

#### 2. 音频录制流程
```typescript
// 1. 请求权限
await Audio.requestPermissionsAsync();

// 2. 配置录音参数
await recording.prepareToRecordAsync({
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    sampleRate: 16000,
    numberOfChannels: 1,
    linearPCMBitDepth: 16,
  }
});

// 3. 开始录音
await recording.startAsync();

// 4. 停止录音
await recording.stopAndUnloadAsync();
const uri = recording.getURI();

// 5. 读取音频文件
const base64Data = await FileSystem.readAsStringAsync(uri, {
  encoding: FileSystem.EncodingType.Base64
});

// 6. 转换并发送
const binaryData = base64ToArrayBuffer(base64Data);
ws.send(binaryData);
```

#### 3. 识别事件处理
```typescript
ws.onmessage = (event) => {
  const { header, payload } = JSON.parse(event.data);

  switch (header.event) {
    case 'task-started':
      // 任务开始，开始发送音频
      break;
    case 'result-generated':
      // 识别结果
      const text = payload.output.sentence.text;
      onEvent({ type: 'result-generated', text });
      break;
    case 'task-finished':
      // 任务完成
      break;
    case 'task-failed':
      // 任务失败
      onEvent({ type: 'error', error: header.error_message });
      break;
  }
};
```

### 文件结构

```
mobile/
├── src/
│   ├── services/
│   │   └── speech.service.ts         # 语音识别服务
│   └── components/
│       ├── VoiceInputButton.tsx      # 语音按钮组件
│       └── VoiceInputModal.tsx       # 确认对话框组件
├── app/(tabs)/conversations/
│   └── [id].tsx                      # 对话详情页（已集成）
└── VOICE_INPUT_GUIDE.md              # 本文档
```

## 常见问题

### Q1: 语音按钮不显示？

**原因**: API Key 未配置

**解决**:
1. 检查 `.env` 文件是否存在
2. 确认 `EXPO_PUBLIC_DASHSCOPE_API_KEY` 已设置
3. 重启 Expo 服务器 (`npm start`)

### Q2: 麦克风权限被拒绝？

**iOS**:
1. 设置 → 隐私 → 麦克风
2. 找到 Expo Go 并开启权限

**Android**:
1. 设置 → 应用 → Expo
2. 权限 → 麦克风 → 允许

### Q3: 识别结果不准确？

**优化建议**:
- 在安静环境录音
- 清晰发音，语速适中
- 避免背景噪音
- 手机麦克风距离 10-15cm

### Q4: WebSocket 连接失败？

**检查项**:
1. API Key 是否有效
2. 网络连接是否正常
3. 阿里云服务是否可用
4. 查看控制台错误日志

### Q5: 录音没有声音？

**检查**:
- 麦克风硬件是否正常
- 权限是否已授予
- 是否静音或音量过低
- iOS: 查看静音开关

## 性能优化

### 1. 音频分块策略

当前实现每 100ms 发送一个音频块：

```typescript
// 优化音频分块大小
const chunkSize = sampleRate * 2 * 0.1; // 16000 * 2 * 0.1 = 3200 bytes

// 建议范围: 0.05s - 0.2s
// - 更小: 更低延迟，但 WebSocket 开销更大
// - 更大: 更少请求，但延迟增加
```

### 2. 内存管理

```typescript
// 及时清理音频缓冲
this.audioChunks = [];

// 关闭 WebSocket
if (this.ws) {
  this.ws.close();
  this.ws = null;
}

// 停止录音
if (this.recording) {
  await this.recording.stopAndUnloadAsync();
  this.recording = null;
}
```

### 3. 错误恢复

```typescript
// 自动重连（可选）
ws.onerror = async (error) => {
  console.error('WebSocket error:', error);
  // 等待 2 秒后重试
  await new Promise(resolve => setTimeout(resolve, 2000));
  this.connectWebSocket();
};
```

## API 费用

### 阿里云 Paraformer 定价

- **免费额度**: 每月前 2 小时免费
- **按量付费**: ¥0.003/秒 (约 ¥10.8/小时)
- **包月套餐**: 参考阿里云官网

**费用估算**:
- 单次对话 (1 分钟): ¥0.18
- 日均 100 次对话: ¥18
- 月费: 约 ¥540

**省钱建议**:
1. 开发测试使用免费额度
2. 设置合理的录音时长限制
3. 考虑使用包月套餐
4. 监控 API 调用量

## 安全建议

### 1. API Key 保护

❌ **不要这样**:
```typescript
// 硬编码在代码中
const apiKey = 'sk-xxxxxxxxxxxxx';
```

✅ **应该这样**:
```typescript
// 使用环境变量
const apiKey = process.env.EXPO_PUBLIC_DASHSCOPE_API_KEY;
```

### 2. 权限最小化

```typescript
// 只在需要时请求权限
if (recordingState === 'idle') {
  await requestPermissions();
}
```

### 3. 用户隐私

- 不存储录音文件
- 不上传未经用户确认的音频
- 明确告知用户数据用途

## 后续优化

### 待实现功能

- [ ] 实时流式识别（边说边显示）
- [ ] 多语言支持（英文、日文等）
- [ ] 录音时长限制（防止过度使用）
- [ ] 离线识别（小语种）
- [ ] 语音播放功能
- [ ] 语音转发功能

### 性能提升

- [ ] 使用原生模块实现真正的流式录音
- [ ] WebSocket 连接池复用
- [ ] 音频压缩优化
- [ ] 缓存识别结果

## 相关链接

- [阿里云百炼平台](https://dashscope.console.aliyun.com/)
- [Paraformer 模型文档](https://help.aliyun.com/zh/model-studio/developer-reference/use-paraformer-for-real-time-speech-recognition)
- [Expo AV 文档](https://docs.expo.dev/versions/latest/sdk/av/)
- [Expo File System 文档](https://docs.expo.dev/versions/latest/sdk/filesystem/)

## 技术支持

遇到问题？
1. 查看控制台日志 (`console.log`)
2. 检查网络请求（Expo DevTools）
3. 阅读本文档的常见问题部分
4. 提交 Issue 到项目仓库

## 更新日志

### v1.0.0 (2025-10-08)
- ✨ 初始版本发布
- ✅ 集成阿里云 Paraformer
- ✅ 实现语音转文字
- ✅ 用户确认编辑流程
- ✅ Apple 设计风格 UI

---

**Enjoy coding! 🚀**
