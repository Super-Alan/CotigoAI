/**
 * 火山引擎语音识别 (ASR) API 集成
 * 文档：https://www.volcengine.com/docs/6561/80816
 *
 * 注意：火山引擎 ASR 主要使用 WebSocket 协议进行流式识别
 * 对于一句话识别，推荐使用官方 SDK 或 WebSocket 接口
 */

import crypto from 'crypto';

/**
 * 火山引擎 API 配置
 */
interface VolcengineConfig {
  appId: string;
  accessToken: string;
  secretKey: string;
  cluster: string;
}

/**
 * 火山引擎签名参数
 */
interface SignatureParams {
  method: string;
  uri: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string;
  service: string;
  region: string;
  date: string;
}

/**
 * 生成 HMAC-SHA256 签名
 */
function hmacSha256(key: string | Buffer, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data).digest();
}

/**
 * 生成火山引擎 API 签名
 * 参考：https://www.volcengine.com/docs/6561/1105162
 */
function generateSignature(
  params: SignatureParams,
  accessKey: string,
  secretKey: string
): { authorization: string; xDate: string; xContentSha256: string } {
  const { method, uri, query, headers, body, service, region, date } = params;

  // 1. 生成 Canonical Request
  const sortedQuery = Object.keys(query)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join('&');

  const sortedHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key.toLowerCase()}:${headers[key].trim()}`)
    .join('\n');

  const signedHeaders = Object.keys(headers)
    .sort()
    .map((key) => key.toLowerCase())
    .join(';');

  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');

  const canonicalRequest = [
    method.toUpperCase(),
    uri,
    sortedQuery,
    sortedHeaders,
    '',
    signedHeaders,
    bodyHash,
  ].join('\n');

  const hashedCanonicalRequest = crypto
    .createHash('sha256')
    .update(canonicalRequest)
    .digest('hex');

  // 2. 生成 String to Sign
  const credentialScope = `${date}/${region}/${service}/request`;
  const stringToSign = ['HMAC-SHA256', date, credentialScope, hashedCanonicalRequest].join('\n');

  // 3. 计算签名
  const kDate = hmacSha256(secretKey, date);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'request');
  const signature = hmacSha256(kSigning, stringToSign).toString('hex');

  // 4. 生成 Authorization Header
  const authorization = `HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    authorization,
    xDate: date,
    xContentSha256: bodyHash,
  };
}

/**
 * 调用火山引擎一句话识别 API
 *
 * 注意：这是一个简化的实现示例
 * 火山引擎 ASR 推荐使用 WebSocket 协议或官方 SDK
 */
export async function callVolcengineASR(
  audioData: string, // Base64 编码的音频数据
  config: VolcengineConfig,
  options: {
    format?: 'pcm' | 'wav' | 'mp3';
    sampleRate?: number;
    language?: string;
  } = {}
): Promise<{ success: boolean; text?: string; error?: string; confidence?: number }> {
  try {
    const {
      format = 'wav',
      sampleRate = 16000,
      language = 'zh-CN',
    } = options;

    // 火山引擎 ASR 服务信息
    const service = 'sami';
    const region = 'cn-north-1';
    const endpoint = 'https://openspeech.bytedance.com';
    const uri = '/api/v1/asr';

    // 当前时间 (ISO 8601 格式)
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = now.toISOString();

    // 构建请求体
    const requestBody = {
      app: {
        appid: config.appId,
        token: config.accessToken,
        cluster: config.cluster,
      },
      user: {
        uid: `voice-input-${Date.now()}`,
      },
      audio: {
        format: format,
        rate: sampleRate,
        bits: 16,
        channel: 1,
        language: language,
        codec: format === 'wav' ? 'pcm' : format,
      },
      request: {
        reqid: `asr-${Date.now()}`,
        nbest: 1,
        word_info: 1,
        show_utterances: true,
      },
      data: audioData,
    };

    const body = JSON.stringify(requestBody);

    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Host': 'openspeech.bytedance.com',
      'X-Date': timestamp,
    };

    // 生成签名
    const signatureParams: SignatureParams = {
      method: 'POST',
      uri,
      query: {},
      headers,
      body,
      service,
      region,
      date,
    };

    const { authorization, xContentSha256 } = generateSignature(
      signatureParams,
      config.appId,
      config.secretKey
    );

    // 添加认证头
    headers['Authorization'] = authorization;
    headers['X-Content-Sha256'] = xContentSha256;

    console.log('[Volcengine ASR] 请求端点:', `${endpoint}${uri}`);
    console.log('[Volcengine ASR] 请求头:', headers);

    // 发送请求
    const response = await fetch(`${endpoint}${uri}`, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(30000),
    });

    console.log('[Volcengine ASR] 响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[Volcengine ASR] 错误响应:', errorText);
      throw new Error(`Volcengine API 错误: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[Volcengine ASR] 响应数据:', JSON.stringify(result, null, 2));

    // 解析响应
    if (result.code !== 0 && result.code !== undefined) {
      throw new Error(`ASR 识别失败: ${result.message || '未知错误'}`);
    }

    // 提取识别结果
    const transcription = result.result?.utterances?.[0]?.text || result.text || '';
    const confidence = result.result?.utterances?.[0]?.confidence || result.confidence || 0;

    if (!transcription) {
      return {
        success: false,
        error: '未识别到语音内容',
      };
    }

    return {
      success: true,
      text: transcription.trim(),
      confidence,
    };
  } catch (error) {
    console.error('[Volcengine ASR] API 调用失败:', error);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: '请求超时',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: '语音识别服务不可用',
    };
  }
}

/**
 * 推荐方案：使用火山引擎 WebSocket ASR
 *
 * 对于生产环境，建议使用：
 * 1. 官方 SDK：@volcengine/openspeech（如果有）
 * 2. WebSocket 协议：wss://openspeech.bytedance.com/api/v2/asr
 * 3. 参考官方文档实现完整的认证和通信流程
 */
export const VOLCENGINE_ASR_RECOMMENDATIONS = {
  websocketEndpoint: 'wss://openspeech.bytedance.com/api/v2/asr',
  documentationUrl: 'https://www.volcengine.com/docs/6561/80816',
  authenticationMethods: ['Bearer Token', 'HMAC-SHA256'],
  recommendedAuth: 'Bearer Token', // 更简单
};
