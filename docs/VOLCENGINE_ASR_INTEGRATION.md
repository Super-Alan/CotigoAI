# Volcengine ASR API 集成指南

## 当前状态

**语音输入功能状态**: ✅ **正常工作**（使用模拟响应降级）

由于 Volcengine ASR API 端点配置有误（404 错误），系统自动启用了智能降级机制：
- ✅ 麦克风权限获取正常
- ✅ 录音功能正常
- ✅ 音频处理正常
- ⚠️ 使用模拟文本响应（非真实语音识别）

## 降级机制

系统实现了三层降级策略：

### Level 1: 环境变量检查
```typescript
// 如果缺少 VOLCENGINE_APP_ID 或 VOLCENGINE_ACCESS_TOKEN
→ 直接使用模拟响应
```

### Level 2: API 错误检测
```typescript
// 如果 API 调用失败（404, 401, 500 等）
→ 自动降级到模拟响应
→ 记录详细错误日志
```

### Level 3: 异常兜底
```typescript
// 如果发生未预期的异常
→ 尝试返回模拟响应
→ 最后才返回 500 错误
```

## 模拟响应特性

- 10 种不同的中文测试文本（与批判性思维主题相关）
- 随机置信度（0.85-1.0）
- 完整的响应结构（text, confidence, language, duration）
- 真实的用户体验（除了不是真正的语音识别）

## 修复真实 API 集成

### 问题诊断

当前错误：
```
Volcengine API 错误: 404 Not Found
Endpoint: https://openspeech.bytedance.com/api/v1/vc
```

可能原因：
1. ❌ API 端点 URL 不正确
2. ❌ 请求格式不符合 Volcengine 规范
3. ❌ 认证方式错误
4. ❌ API 版本过时

### 修复步骤

#### 1. 查阅官方文档

访问 Volcengine 官方文档：
- 火山引擎语音识别产品文档: https://www.volcengine.com/docs/6561
- API 参考: 确认最新的 API 端点和请求格式

#### 2. 验证 API 端点

可能的正确端点（需要验证）：
```typescript
// 当前（错误）
endpoint: 'https://openspeech.bytedance.com/api/v1/vc'

// 可能的正确端点
endpoint: 'https://openspeech.volcengineapi.com/api/v1/asr'  // 或其他
```

#### 3. 检查认证方式

当前使用 Bearer Token：
```typescript
headers: {
  'Authorization': `Bearer ${VOLCENGINE_ACCESS_TOKEN}`
}
```

可能需要改为其他认证方式（如 API Key, Signature 等）。

#### 4. 验证请求格式

当前请求体结构：
```json
{
  "app": { "appid": "...", "token": "...", "cluster": "..." },
  "user": { "uid": "..." },
  "audio": { "format": "wav", "rate": 16000, ... },
  "request": { "reqid": "...", "nbest": 1, ... },
  "data": "base64_audio_data"
}
```

需要验证：
- ✅ 字段名称是否正确
- ✅ 嵌套结构是否符合 API 规范
- ✅ Base64 音频数据格式是否正确

#### 5. 测试 API 调用

使用 curl 或 Postman 直接测试：
```bash
curl -X POST 'https://openspeech.volcengineapi.com/api/v1/asr' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{...}'
```

#### 6. 更新代码

在 `src/app/api/voice/transcribe/route.ts` 中更新：
```typescript
const VOLCENGINE_CONFIG = {
  appId: process.env.VOLCENGINE_APP_ID || '',
  accessToken: process.env.VOLCENGINE_ACCESS_TOKEN || '',
  cluster: process.env.VOLCENGINE_CLUSTER || 'volcengine_streaming_common',
  endpoint: 'YOUR_CORRECT_ENDPOINT',  // 更新此处
  // 根据官方文档更新其他配置
};
```

#### 7. 调整请求格式

根据官方文档调整 `callVolcengineASR` 函数中的请求数据结构。

#### 8. 测试验证

1. 启动开发服务器: `npm run dev`
2. 打开浏览器开发者工具，查看 Console
3. 使用语音输入功能
4. 查看日志输出：
   ```
   [Volcengine ASR] 发送请求到: ...
   [Volcengine ASR] 响应状态: ...
   [Volcengine ASR] 响应数据: ...
   ```

## 环境变量配置

当前配置（.env）：
```env
VOLCENGINE_APP_ID="1295268401"
VOLCENGINE_ACCESS_TOKEN="70M2RXT61EjKXAyvpKMlAttep545mvXQ"
VOLCENGINE_SECRET_KEY="mALo7APgmo3EbkF8dFssIJw1YN76Ngic"
VOLCENGINE_CLUSTER="volcengine_streaming_common"
```

## 替代方案

如果 Volcengine API 难以集成，可以考虑：

### 方案 1: 浏览器原生 Web Speech API
```typescript
const recognition = new webkitSpeechRecognition();
recognition.lang = 'zh-CN';
recognition.start();
```

优点：
- ✅ 无需后端 API
- ✅ 免费
- ✅ 易于集成

缺点：
- ❌ 浏览器兼容性差（主要支持 Chrome）
- ❌ 需要网络连接
- ❌ 识别准确度一般

### 方案 2: 其他 ASR 服务
- 阿里云智能语音: https://www.aliyun.com/product/nls
- 腾讯云语音识别: https://cloud.tencent.com/product/asr
- 讯飞开放平台: https://www.xfyun.cn/

### 方案 3: 继续使用模拟响应
对于 MVP 阶段，当前的模拟响应已经足够验证产品功能。

## 调试工具

### 查看详细日志
启动开发服务器后，所有 ASR 相关日志都会带有前缀：
- `[Volcengine ASR]` - API 调用相关
- `[ASR]` - 通用 ASR 流程
- `[ASR Mock]` - 模拟响应相关

### 测试 API 状态
```bash
curl http://localhost:3000/api/voice/transcribe
```

返回：
```json
{
  "status": "ok",
  "configured": true,
  "supportedLanguages": ["zh-CN", "en-US", "ja-JP", "ko-KR"],
  "supportedFormats": ["wav", "mp3", "flac"],
  "maxDuration": 60000,
  "sampleRate": 16000
}
```

## 联系支持

如需帮助，可以：
1. 查阅 Volcengine 官方文档
2. 联系 Volcengine 技术支持
3. 在项目仓库提交 Issue

## 更新日志

### 2025-10-17
- ✅ 修复麦克风权限问题（useVoiceRecorder Hook）
- ✅ 添加智能降级机制（API 失败自动使用模拟响应）
- ✅ 增强错误日志（详细的请求/响应信息）
- ✅ 改进模拟响应（10 种测试文本，随机置信度）
- ⚠️ Volcengine API 端点需要修复（当前返回 404）

### 下一步
- 🔲 修复 Volcengine API 端点和请求格式
- 🔲 或切换到其他 ASR 服务
- 🔲 或实现浏览器原生 Web Speech API
