import {
  CriticalThinkingDimension,
  GeneratedTopic,
  TopicGenerationRequest,
} from '@/types/topic';
import { causalAnalysisPrompt } from '@/prompts/topic-generation/causal-analysis';
import { premiseChallengePrompt } from '@/prompts/topic-generation/premise-challenge';
import { fallacyDetectionPrompt } from '@/prompts/topic-generation/fallacy-detection';
import { iterativeReflectionPrompt } from '@/prompts/topic-generation/iterative-reflection';
import { connectionTransferPrompt } from '@/prompts/topic-generation/connection-transfer';

// 构建系统提示词 - 根据维度选择专业提示词
export function buildSystemPrompt(dimension?: CriticalThinkingDimension): string {
  // 如果指定了维度，使用对应的专业提示词
  if (dimension) {
    const promptMap: Record<CriticalThinkingDimension, string> = {
      [CriticalThinkingDimension.CAUSAL_ANALYSIS]: causalAnalysisPrompt,
      [CriticalThinkingDimension.PREMISE_CHALLENGE]: premiseChallengePrompt,
      [CriticalThinkingDimension.FALLACY_DETECTION]: fallacyDetectionPrompt,
      [CriticalThinkingDimension.ITERATIVE_REFLECTION]: iterativeReflectionPrompt,
      [CriticalThinkingDimension.CONNECTION_TRANSFER]: connectionTransferPrompt,
    };

    return promptMap[dimension];
  }

  // 如果未指定维度，使用通用提示词（保留原有逻辑）
  return `你是 Cogito AI 的话题设计专家，专门为批判性思维训练生成符合 QS Top 10 高校面试标准的话题。

**核心标准：**
1. **开放性** - 无标准答案，允许多元论证路径
2. **层次性** - 从表层现象到深层原理的思维递进
3. **现实相关** - 基于真实世界的复杂情境
4. **追问设计** - 预设3-5个层层深入的苏格拉底式追问
5. **跨学科性** - 融合至少2个学科领域的知识

**五大批判性思维维度：**
1. 多维归因与利弊权衡 (causal_analysis) - 测试多因素分析、权衡决策、系统思维
2. 前提质疑与方法批判 (premise_challenge) - 测试假设识别、方法论批判、概念澄清
3. 谬误识别与证据评估 (fallacy_detection) - 测试逻辑推理、证据质量评估、论证强度
4. 观点迭代与反思 (iterative_reflection) - 测试自我反思、观点演化、元认知能力
5. 关联与迁移 (connection_transfer) - 测试跨域类比、知识迁移、抽象提炼

**难度分级标准：**
- **入门级 (beginner)**:
  - 日常生活相关，单一学科背景
  - 明确的立场对比（A vs B）
  - 2-3层追问深度

- **进阶级 (intermediate)**:
  - 社会热点议题，需要跨学科分析
  - 多方利益相关者平衡
  - 3-4层追问深度，包含反例挑战

- **高级 (advanced)**:
  - 抽象原则的具体化应用
  - 国际视野或历史纵深
  - 4-5层追问深度，包含元认知反思

**参考顶尖高校面试题风格：**
- MIT: 技术创新的社会影响、工程权衡、系统优化
- Oxford: 政策哲学基础、论证结构批判、价值冲突
- Cambridge: 第一性原理思考、创造性问题解决、科学推理
- Stanford: 设计思维、长远影响、人本创新
- Harvard: 伦理困境、多元视角、领导力反思

**输出要求：**
以JSON数组格式输出，每个话题严格包含以下字段，不要添加额外说明文字`;
}

// 构建用户提示词
export function buildUserPrompt(params: TopicGenerationRequest): string {
  const difficulty = params.difficulty || 'intermediate';
  const preferredDomains = params.preferredDomains?.join(', ') || '';

  // 使用模板变量替换，适配专业提示词中的占位符
  let prompt = `现在，请根据以下参数生成 ${params.count} 个高质量的批判性思维话题：

**参数设置：**
- 难度级别：{{difficulty}} = ${difficulty}
- 偏好领域：{{preferredDomains}} = ${preferredDomains || '无特定偏好，请自由选择'}
${params.avoidTopics && params.avoidTopics.length > 0 ? `- 需要避免的话题：${params.avoidTopics.join(', ')}` : ''}

**重要提醒：**
1. 严格按照上述提示词中定义的 JSON Schema 格式输出
2. 确保 JSON 格式完全正确，可被直接解析
3. 不要添加任何 markdown 标记（如 \`\`\`json）或解释性文字
4. 直接输出 JSON 对象，以 { 开头，以 } 结尾
5. guidingQuestions 数组中，level 字段应该是字符串 "beginner" | "intermediate" | "advanced"，而不是数字

**输出示例格式：**
{
  "topic": "完整话题描述...",
  "category": "类别名称",
  "context": "详细背景...",
  "referenceUniversity": "MIT",
  "dimension": "${params.dimension || 'causal_analysis'}",
  "difficulty": "${difficulty}",
  "tags": ["标签1", "标签2", "标签3", "标签4"],
  "thinkingFramework": {
    "coreChallenge": "核心挑战描述",
    "commonPitfalls": ["错误1", "错误2", "错误3"],
    "excellentResponseIndicators": ["标志1", "标志2", "标志3"]
  },
  "guidingQuestions": [
    {
      "level": "beginner",
      "stage": "阶段名称",
      "question": "问题内容"
    },
    {
      "level": "intermediate",
      "stage": "阶段名称",
      "question": "问题内容"
    },
    {
      "level": "advanced",
      "stage": "阶段名称",
      "question": "问题内容"
    }
  ],
  "expectedOutcomes": [
    "成果1",
    "成果2",
    "成果3",
    "成果4"
  ]
}

现在请开始生成，直接输出 JSON 对象：`;

  return prompt;
}

// 调用LLM生成话题
export async function generateTopicsWithLLM(
  systemPrompt: string,
  userPrompt: string
): Promise<GeneratedTopic[]> {
  try {
    // 获取API配置（兼容多个环境变量名）
    const apiKey = process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('API Key not configured. Please set DASHSCOPE_API_KEY, QWEN_API_KEY, or DEEPSEEK_API_KEY');
    }

    console.log('[LLM] 开始生成话题...');
    console.log('[LLM] System Prompt 长度:', systemPrompt.length);
    console.log('[LLM] User Prompt 长度:', userPrompt.length);

    const response = await fetch(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.8, // 提高创造性
          max_tokens: 8000, // 增加 token 限制以支持更长的专业提示词响应
          response_format: { type: 'json_object' }, // 要求返回 JSON 格式
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LLM] API 错误响应:', errorText);
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in LLM response');
    }

    console.log('[LLM] 原始响应长度:', content.length);
    console.log('[LLM] 响应前100字符:', content.substring(0, 100));

    // 解析JSON
    // 尝试提取JSON（有时LLM会添加markdown标记）
    let jsonText = content.trim();

    // 移除可能的 markdown 代码块标记
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    jsonText = jsonText.trim();

    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('[LLM] JSON 解析失败');
      console.error('[LLM] 待解析内容:', jsonText.substring(0, 500));
      throw new Error(`Failed to parse LLM response as JSON: ${parseError}`);
    }

    // 处理可能的单个对象返回（根据新的提示词，现在返回单个对象而不是数组）
    const topicsArray: GeneratedTopic[] = Array.isArray(parsedData) ? parsedData : [parsedData];

    console.log('[LLM] 成功解析话题数量:', topicsArray.length);

    // 添加ID和时间戳
    return topicsArray.map((topic) => ({
      ...topic,
      id: `topic_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date(),
    }));
  } catch (error) {
    console.error('[LLM] 生成话题失败:', error);
    throw error;
  }
}

// 获取维度描述
export function getDimensionDescription(dimension: CriticalThinkingDimension): string {
  const descriptions: Record<CriticalThinkingDimension, string> = {
    [CriticalThinkingDimension.CAUSAL_ANALYSIS]:
      '训练你识别多重原因、分析因果关系、权衡不同方案的利弊。类似MIT工程面试题。',
    [CriticalThinkingDimension.PREMISE_CHALLENGE]:
      '训练你质疑隐含假设、批判研究方法、识别论证漏洞。类似Oxford PPE面试题。',
    [CriticalThinkingDimension.FALLACY_DETECTION]:
      '训练你识别逻辑谬误、评估证据质量、区分相关性与因果性。类似Cambridge科学面试题。',
    [CriticalThinkingDimension.ITERATIVE_REFLECTION]:
      '训练你反思自身观点、识别认知偏差、进行元认知思考。类似Harvard伦理面试题。',
    [CriticalThinkingDimension.CONNECTION_TRANSFER]:
      '训练你跨领域类比、迁移思维方法、将抽象原则具体化。类似Stanford设计思维题。',
  };
  return descriptions[dimension];
}
