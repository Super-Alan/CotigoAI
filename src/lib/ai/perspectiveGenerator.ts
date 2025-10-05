import { aiRouter } from './router';
import { ChatMessage } from '@/types';

interface RoleDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
}

/**
 * Generate perspective analysis using real AI with streaming support
 */
export async function generatePerspectiveAnalysis(
  role: RoleDefinition,
  issue: string,
  stream: boolean = false
): Promise<string | ReadableStream> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: role.systemPrompt + `\n\n作为批判性思维教育工具，请提供深度结构化的分析：

**必需结构**:
1. **核心观点** - 你的立场和主要论断
2. **论证依据**
   - 为每个要点标注证据类型：[实证数据/理论推导/案例分析/专家共识]
   - 标注证据强度：🔴高度可信/🟡中等可信/⚪️需要验证
3. **关键假设** - 你的论证基于哪些未证明的前提？
4. **认知盲区** - 从你的专业角度，你可能忽略了什么？
5. **反驳预演** - 其他视角可能如何挑战你的观点？

**批判性思维要求**:
- 区分事实(fact)和观点(opinion)
- 承认不确定性
- 指出需要更多证据的地方
- 使用清晰的逻辑结构

使用 Markdown 格式，便于阅读。`
    },
    {
      role: 'user',
      content: `请从${role.name}的专业角度，运用批判性思维深入分析以下议题：\n\n议题：${issue}\n\n请给出详细、严谨、自我批判的分析。`
    }
  ];

  try {
    const response = await aiRouter.chat(messages, {
      stream,
      temperature: 0.7,
      maxTokens: 2000
    });

    return response;
  } catch (error) {
    console.error(`[AI] ${role.name} 分析失败:`, error);

    // Fallback to mock data if AI fails
    const perspectives: Record<string, string> = {
    economist: `作为经济学家，我认为这个议题需要从市场效率和资源配置的角度来审视。

**经济影响分析：**
- **成本效益**：需要权衡实施成本与预期收益，建立量化评估模型
- **市场机制**：分析市场能否有效调节相关资源配置，识别潜在的市场失灵
- **激励结构**：评估政策如何影响各方经济激励，预测行为变化

**经济学视角的核心观点：**
理性的经济决策应该建立在边际分析和效率优化的基础上，同时要考虑外部性和市场失灵的可能性。建议采用实证研究方法，收集数据验证假设，并通过试点项目测试政策效果。`,

    ethicist: `从伦理学角度，这个议题触及了深层的价值冲突和道德边界。

**伦理维度分析：**
- **道德基础**：审视行为的道德正当性，探讨其哲学和伦理学依据
- **公平正义**：评估是否符合分配正义和程序正义原则
- **权利保护**：分析如何保障相关各方的基本权利和人格尊严

**伦理学视角的核心观点：**
任何政策或行为都应该尊重人的尊严和自主性。在权利冲突时需要寻找道德上可接受的平衡点，坚持最小伤害原则，优先保护弱势群体的利益。`,

    scientist: `作为科学家，我要求用证据和数据来支撑论断。

**科学分析框架：**
- **实证证据**：梳理现有研究和数据，评估证据的质量和可靠性
- **因果关系**：区分相关性和因果性，设计严格的验证方法
- **不确定性**：明确科学认识的边界和局限，量化不确定性水平

**科学视角的核心观点：**
应该基于可验证的事实和科学共识来做决策，同时承认科学知识的演进性和不确定性。建议采用系统性文献综述、元分析、随机对照试验等科学方法来验证假设。`,

    environmentalist: `从环保视角，我们必须考虑这个议题对生态系统和可持续发展的长远影响。

**生态影响评估：**
- **环境足迹**：评估资源消耗和环境负担，计算碳足迹和生态足迹
- **可持续性**：验证是否符合代际公平原则，确保子孙后代的发展权利
- **生态风险**：分析对生物多样性和生态平衡的潜在影响

**环保视角的核心观点：**
经济发展不能以牺牲环境为代价。我们要为子孙后代保护好地球家园，实现人与自然的和谐共生。建议采用生命周期评估和环境影响评价等工具。`,

    educator: `作为教育工作者，我关注这个议题对人才培养和教育公平的影响。

**教育维度思考：**
- **教育机会**：分析是否促进还是阻碍教育公平，关注弱势群体
- **能力发展**：评估对学生综合素质培养的影响，包括认知和非认知能力
- **长期效应**：考虑对下一代的教育价值导向和社会流动性的影响

**教育视角的核心观点：**
教育的根本目的是培养全面发展的人。任何政策都应该有利于扩大教育机会、提升教育质量、促进社会流动。建议重视教育的育人功能而非仅关注工具价值。`,

    policymaker: `作为政策制定者，我需要综合考虑可行性、有效性和社会影响。

**政策评估框架：**
- **法律依据**：评估现有法律框架下的可行性和合法性
- **执行成本**：估算政策实施的行政和社会成本，评估财政可持续性
- **利益平衡**：分析如何协调不同群体的诉求，建立共识

**政策视角的核心观点：**
好的政策需要在理想和现实之间找到平衡，确保可执行性的同时最大化社会福祉，最小化负面影响。建议采用试点先行、逐步推广的策略，建立动态调整机制。`
    };

    return perspectives[role.id] || `从${role.name}的角度，针对"${issue}"的分析...（AI服务暂时不可用，显示备用内容）`;
  }
}

/**
 * Generate chat response using real AI
 */
export async function generateChatResponse(
  role: { name: string; systemPrompt: string },
  issue: string,
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${role.systemPrompt}\n\n当前讨论的议题：${issue}\n\n请保持你作为${role.name}的专业视角，结合议题背景和对话历史，给出深入、有见地的回应。`
    },
    // Add conversation history
    ...history.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    // Add current user message
    {
      role: 'user' as const,
      content: message
    }
  ];

  try {
    const response = await aiRouter.chat(messages, {
      stream: false,
      temperature: 0.8,
      maxTokens: 1500
    });

    if (typeof response === 'string') {
      return response;
    }

    // If somehow we get a stream, read it all
    const reader = response.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullResponse += decoder.decode(value);
    }

    return fullResponse;
  } catch (error) {
    console.error(`[AI] ${role.name} 对话失败:`, error);

    // Fallback responses if AI fails
    const responses = [
    `从${role.name}的角度来看，您提出的这个问题很有意思。

针对您的问题："${message}"，我认为需要考虑以下几个方面：

1. **与议题的关联**：这与我们最初讨论的"${issue}"密切相关，需要在这个框架下理解
2. **多维度考量**：需要平衡多方面的因素和利益，不能简单化处理
3. **渐进式方法**：建议采取渐进式的方法来解决，避免激进变革带来的风险

您对此有什么看法？希望听到您的进一步思考。`,

    `作为${role.name}，我理解您的关切。让我从专业角度分析一下：

这个问题涉及到几个关键维度：
- **时间维度**：短期影响与长期效应的平衡
- **理论与实践**：理论原则与实践可行性的结合
- **个体与集体**：个体权益与集体利益的协调

在"${issue}"这个议题的框架下，我建议我们深入探讨其中的关键要素。您认为哪个维度最为重要？`,

    `很高兴继续与您探讨。从${role.name}的视角，我注意到您刚才提到的观点触及了这个议题的核心。

让我们回到"${issue}"这个基本问题，结合您的新问题："${message}"，我想强调几点：

1. **复杂性认知**：问题的复杂性需要我们保持谨慎和开放的态度
2. **多方诉求**：不同利益相关方的诉求都应该得到充分考虑
3. **平衡艺术**：解决方案需要兼顾效率与公平

您希望我在哪个方面做更深入的分析？我可以提供更具体的建议。`
    ];

    return responses[Math.floor(Math.random() * responses.length)] + '\n\n（注：AI服务暂时不可用，这是备用回复）';
  }
}
