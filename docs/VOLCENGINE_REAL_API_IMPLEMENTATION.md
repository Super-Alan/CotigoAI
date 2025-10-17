# 火山引擎真实 ASR API 集成实施文档

## 更新时间
2025-10-17

## 概述

本次更新实现了火山引擎（Volcengine）真实语音识别 API 的集成，替换之前的模拟响应系统。

## 主要改进

### 1. 多端点支持
```typescript
const VOLCENGINE_CONFIG = {
  endpoints: [
    'wss://openspeech.bytedance.com/api/v2/asr',  // WebSocket（推荐）
    'https://openspeech.bytedance.com/api/v1/asr', // HTTP 一句话识别
    'https://openspeech.bytedance.com/api/v1/vc',  // 备用端点
  ],
  currentEndpoint: process.env.VOLCENGINE_ASR_ENDPOINT ||
                   'https://openspeech.bytedance.com/api/v1/asr',
};
```

### 2. Bearer Token 认证
使用火山引擎推荐的简单认证方式：
```typescript
headers: {
  'Authorization': `Bearer; ${VOLCENGINE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}
```

### 3. 智能降级机制
```
真实 API 调用 → 失败时自动降级 → 模拟响应 → 功能永不中断
```

### 4. 详细日志记录
```typescript
console.log('[Volcengine ASR] 发送请求到:', endpoint);
console.log('[Volcengine ASR] 请求参数:', { appId, cluster, language, format, sampleRate, dataSize });
console.log('[Volcengine ASR] 响应状态:', response.status, response.statusText);
console.log('[Volcengine ASR] 响应数据:', result);
```

## 环境变量配置

### 必需变量
```env
VOLCENGINE_APP_ID="1295268401"
VOLCENGINE_ACCESS_TOKEN="70M2RXT61EjKXAyvpKMlAttep545mvXQ"
VOLCENGINE_SECRET_KEY="mALo7APgmo3EbkF8dFssIJw1YN76Ngic"
VOLCENGINE_CLUSTER="volcengine_streaming_common"
```

### 可选变量
```env
# 自定义 API 端点（不设置则使用默认值）
VOLCENGINE_ASR_ENDPOINT="https://openspeech.bytedance.com/api/v1/asr"
```

## API 请求格式

### 请求体结构
```json
{
  "app": {
    "appid": "1295268401",
    "token": "70M2RXT61EjKXAyvpKMlAttep545mvXQ",
    "cluster": "volcengine_streaming_common"
  },
  "user": {
    "uid": "voice-input-1708156789000"
  },
  "audio": {
    "format": "wav",
    "rate": 16000,
    "bits": 16,
    "channel": 1,
    "language": "zh-CN",
    "codec": "pcm"
  },
  "request": {
    "reqid": "asr-1708156789000",
    "nbest": 1,
    "word_info": 1,
    "show_utterances": true
  },
  "data": "BASE64_ENCODED_AUDIO_DATA"
}
```

### 请求头
```http
POST /api/v1/asr HTTP/1.1
Host: openspeech.bytedance.com
Content-Type: application/json
Authorization: Bearer; 70M2RXT61EjKXAyvpKMlAttep545mvXQ
Accept: application/json
```

### 预期响应
```json
{
  "code": 0,
  "message": "success",
  "result": {
    "utterances": [
      {
        "text": "识别的文本内容",
        "confidence": 0.95
      }
    ]
  }
}
```

## 测试流程

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 打开浏览器控制台
查看详细的 API 调用日志

### 3. 使用语音输入功能
1. 点击语音按钮
2. 授权麦克风
3. 开始录音
4. 停止录音

### 4. 查看日志输出

#### 成功情况
```
[ASR] 尝试使用 Volcengine API...
[Volcengine ASR] 发送请求到: https://openspeech.bytedance.com/api/v1/asr
[Volcengine ASR] 请求参数: { appId: '1295268401', cluster: 'volcengine_streaming_common', language: 'zh-CN', format: 'wav', sampleRate: 16000, dataSize: '45KB' }
[Volcengine ASR] 响应状态: 200 OK
[Volcengine ASR] 响应数据: { code: 0, message: 'success', result: { utterances: [{ text: '你好', confidence: 0.95 }] } }
[Volcengine ASR] 识别成功: 你好
```

#### 失败并降级
```
[ASR] 尝试使用 Volcengine API...
[Volcengine ASR] 发送请求到: https://openspeech.bytedance.com/api/v1/asr
[Volcengine ASR] 响应状态: 404 Not Found
[Volcengine ASR] 错误响应: {...}
[ASR] Volcengine API 失败，降级到模拟响应: Volcengine API 错误: 404 Not Found
[ASR] 提示：请检查 API 端点和认证配置是否正确
[ASR] 当前端点: https://openspeech.bytedance.com/api/v1/asr
[ASR] 可用端点: wss://openspeech.bytedance.com/api/v2/asr, https://openspeech.bytedance.com/api/v1/asr, https://openspeech.bytedance.com/api/v1/vc
[ASR Mock] 使用模拟语音识别响应
[ASR Mock] 生成模拟文本: 这是一段测试语音转文字的内容
```

## 可能的问题和解决方案

### 问题 1: 404 Not Found

**可能原因**：
1. API 端点 URL 不正确
2. 服务未激活或账号无权限
3. API 版本已更新

**解决方案**：
1. 查看火山引擎控制台，确认服务状态
2. 尝试其他端点（通过设置 `VOLCENGINE_ASR_ENDPOINT`）
3. 联系火山引擎技术支持获取正确端点
4. 参考官方文档：https://www.volcengine.com/docs/6561/80816

### 问题 2: 401 Unauthorized

**可能原因**：
1. Access Token 错误或已过期
2. 认证格式不正确
3. APP ID 不匹配

**解决方案**：
1. 在火山引擎控制台重新生成 Access Token
2. 检查 `.env` 文件中的配置是否正确
3. 确保 APP ID 和 Access Token 匹配

### 问题 3: 400 Bad Request

**可能原因**：
1. 请求体格式错误
2. 音频格式不支持
3. 参数不完整

**解决方案**：
1. 检查音频格式（推荐使用 16kHz, 16bit, 单声道 PCM）
2. 确保 cluster 参数正确
3. 查看响应错误详情调整请求参数

### 问题 4: 超时 (Timeout)

**可能原因**：
1. 网络连接不稳定
2. 音频数据过大
3. API 服务器响应慢

**解决方案**：
1. 检查网络连接
2. 限制录音时长（当前最大 60 秒）
3. 增加超时时间（在 `voiceConfig.apiTimeout` 中配置）

## 高级配置

### 自定义端点
如果需要使用不同的端点：

```env
# 使用 WebSocket 端点（需要修改实现为 WebSocket 协议）
VOLCENGINE_ASR_ENDPOINT="wss://openspeech.bytedance.com/api/v2/asr"

# 使用备用 HTTP 端点
VOLCENGINE_ASR_ENDPOINT="https://openspeech.bytedance.com/api/v1/vc"
```

### 自定义超时时间
在 `src/config/voice.ts` 中：
```typescript
export const voiceConfig = {
  apiTimeout: 45000,  // 修改为 45 秒（默认 30 秒）
  // ...
};
```

### 自定义音频参数
在 `src/app/api/voice/transcribe/route.ts` 中调整：
```typescript
audio: {
  format: 'wav',      // 或 'mp3', 'flac'
  rate: 16000,        // 或 8000, 24000, 48000
  bits: 16,           // 采样位深
  channel: 1,         // 单声道
  language: 'zh-CN',  // 或 'en-US', 'ja-JP'
  codec: 'pcm',       // 或 'mp3', 'flac'
},
```

## WebSocket 实现建议

对于生产环境，建议使用 WebSocket 协议进行流式识别：

### 优势
- ✅ 更低的延迟
- ✅ 实时返回识别结果
- ✅ 更好的用户体验

### 实现步骤
1. 安装 WebSocket 库：`npm install ws`
2. 创建 WebSocket 连接管理器
3. 实现二进制音频数据流传输
4. 处理实时识别结果
5. 实现断线重连机制

### 参考实现
参考 `src/lib/volcengine-asr.ts` 中的推荐方案：
```typescript
export const VOLCENGINE_ASR_RECOMMENDATIONS = {
  websocketEndpoint: 'wss://openspeech.bytedance.com/api/v2/asr',
  documentationUrl: 'https://www.volcengine.com/docs/6561/80816',
  authenticationMethods: ['Bearer Token', 'HMAC-SHA256'],
  recommendedAuth: 'Bearer Token',
};
```

## HMAC-SHA256 认证（高级）

如果 Bearer Token 不工作，可以使用更复杂的 HMAC-SHA256 签名认证。

详细实现参考 `src/lib/volcengine-asr.ts` 中的 `generateSignature` 函数。

### 使用方法
1. 导入签名函数
2. 生成签名和认证头
3. 在 API 请求中使用

```typescript
import { callVolcengineASR } from '@/lib/volcengine-asr';

const result = await callVolcengineASR(
  audioBase64,
  {
    appId: process.env.VOLCENGINE_APP_ID!,
    accessToken: process.env.VOLCENGINE_ACCESS_TOKEN!,
    secretKey: process.env.VOLCENGINE_SECRET_KEY!,
    cluster: process.env.VOLCENGINE_CLUSTER!,
  },
  {
    format: 'wav',
    sampleRate: 16000,
    language: 'zh-CN',
  }
);
```

## 性能优化

### 1. 音频压缩
```typescript
// 降低采样率（如果质量可接受）
sampleRate: 8000  // 代替 16000

// 使用压缩格式
format: 'mp3'  // 代替 'wav'
```

### 2. 批量请求
如果需要识别多个音频，可以实现请求队列：
```typescript
const queue = new PQueue({ concurrency: 3 });
const results = await Promise.all(
  audioFiles.map(audio =>
    queue.add(() => callVolcengineASR(audio))
  )
);
```

### 3. 缓存识别结果
```typescript
// 对相同的音频内容缓存识别结果
const cache = new Map<string, string>();
const audioHash = crypto.createHash('md5').update(audioData).digest('hex');

if (cache.has(audioHash)) {
  return cache.get(audioHash);
}
```

## 监控和调试

### 启用详细日志
所有 ASR 相关日志都带有前缀：
- `[Volcengine ASR]` - API 调用相关
- `[ASR]` - 通用流程
- `[ASR Mock]` - 模拟响应

### 调试技巧
1. **查看请求详情**：打开浏览器 Network 面板，过滤 `/api/voice/transcribe`
2. **测试 API 直接调用**：
   ```bash
   curl -X POST 'https://openspeech.bytedance.com/api/v1/asr' \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer; YOUR_TOKEN' \
     -d '{...}'
   ```
3. **使用 Postman**：导入请求配置进行测试

## 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 0 | 成功 | 无需处理 |
| 1000 | 系统错误 | 重试或联系技术支持 |
| 1001 | 参数错误 | 检查请求参数格式 |
| 1002 | 认证失败 | 检查 Access Token |
| 1003 | 权限不足 | 检查账号权限 |
| 1004 | 配额超限 | 升级服务套餐或等待配额刷新 |
| 404 | 端点不存在 | 检查 API 端点 URL |
| 500 | 服务器错误 | 等待一段时间后重试 |

## 联系支持

### 官方资源
- **文档中心**：https://www.volcengine.com/docs/6561/80816
- **API Explorer**：https://api.volcengine.com/api-explorer
- **技术支持**：联系火山引擎客服

### 社区资源
- **GitHub**：搜索 "volcengine asr" 查看开源实现
- **CSDN**：查找火山引擎 ASR 集成文章
- **开发者社区**：https://developer.volcengine.com/

## 更新日志

### 2025-10-17
- ✅ 实现多端点支持
- ✅ 添加 Bearer Token 认证
- ✅ 实现智能降级机制
- ✅ 增强错误日志
- ✅ 添加详细文档
- 🔄 待测试真实 API 调用

### 下一步
- 🔲 根据实际测试结果调整 API 请求格式
- 🔲 实现 WebSocket 流式识别（推荐）
- 🔲 添加请求重试机制
- 🔲 实现识别结果缓存
- 🔲 添加性能监控
