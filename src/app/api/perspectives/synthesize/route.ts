import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface SynthesizeRequest {
  issue: string;
  perspectives: Array<{
    roleId: string;
    roleName: string;
    analysis: string;
  }>;
}

interface SynthesisResult {
  consensus: string;
  conflicts: Array<{
    roles: string[];
    description: string;
  }>;
  insights: string[];
  recommendations: string;
}

/**
 * Parse AI synthesis text into structured format
 */
function parseSynthesisText(text: string): SynthesisResult {
  const result: SynthesisResult = {
    consensus: '',
    conflicts: [],
    insights: [],
    recommendations: ''
  };

  // Split by major sections
  const sections = text.split(/(?=##?\s+)/);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Extract consensus / 共识点
    if (trimmed.match(/#+\s*(共识|consensus|common ground)/i)) {
      result.consensus = trimmed;
    }
    // Extract conflicts / 视角冲突 / 主要分歧
    else if (trimmed.match(/#+\s*(冲突|分歧|conflict|disagree)/i)) {
      // Parse conflicts - look for bullet points or numbered lists
      const conflictMatches = trimmed.match(/[-*]\s*\*\*([^*]+)\*\*[：:]\s*([^\n]+)/g);
      if (conflictMatches) {
        conflictMatches.forEach(match => {
          const roleMatch = match.match(/\*\*([^*]+)\*\*/);
          const descMatch = match.match(/[：:]\s*(.+)/);
          if (roleMatch && descMatch) {
            result.conflicts.push({
              roles: roleMatch[1].split(/[、，,]/).map(r => r.trim()),
              description: descMatch[1].trim()
            });
          }
        });
      } else {
        // If no structured format, just add the whole section
        const lines = trimmed.split('\n').filter(l => l.trim() && !l.match(/^#+/));
        lines.forEach(line => {
          if (line.trim()) {
            result.conflicts.push({
              roles: [],
              description: line.replace(/^[-*\d.]\s*/, '').trim()
            });
          }
        });
      }
    }
    // Extract insights / 跨视角洞察
    else if (trimmed.match(/#+\s*(洞察|insight)/i)) {
      const insightLines = trimmed.split('\n')
        .filter(l => l.match(/^[-*💡]\s/) || l.match(/^\d+\./))
        .map(l => l.replace(/^[-*💡\d.]\s*/, '').trim())
        .filter(l => l.length > 0);
      result.insights = insightLines;
    }
    // Extract recommendations / 行动建议
    else if (trimmed.match(/#+\s*(建议|推荐|recommend|action)/i)) {
      result.recommendations = trimmed;
    }
  }

  // If no structured parsing worked, return full text as consensus
  if (!result.consensus && !result.conflicts.length && !result.insights.length && !result.recommendations) {
    result.consensus = text;
  }

  return result;
}

async function generateSynthesis(
  issue: string,
  perspectives: Array<{ roleId: string; roleName: string; analysis: string }>
): Promise<SynthesisResult> {
  const { aiRouter } = await import('@/lib/ai/router');

  const roleNames = perspectives.map(p => p.roleName).join('、');

  // Build comprehensive analysis from all perspectives
  const allAnalyses = perspectives.map(p =>
    `## ${p.roleName}的视角\n${p.analysis}`
  ).join('\n\n---\n\n');

  const systemPrompt = `你是一位擅长综合分析的专家，能够从多个专业视角中提取共识、识别冲突、发现深层洞察。

你的任务是分析来自${perspectives.length}位不同专业背景专家（${roleNames}）对同一议题的观点，并进行深度综合分析。

请按以下结构提供分析：

1. **共识点** (consensus)：所有或大多数角色都认同的核心观点（2-4点）
2. **主要分歧** (conflicts)：不同角色之间的关键冲突或分歧（2-3个，每个说明涉及哪些角色及分歧内容）
3. **跨视角洞察** (insights)：综合多个视角后产生的新见解（3-5点）
4. **平衡建议** (recommendations)：基于多视角分析的可行建议（包括近期、中期、长期行动）

要求：
- 使用清晰的 Markdown 格式
- 具体引用不同角色的观点
- 识别表面分歧下的深层共识
- 发现单一视角难以获得的洞察`;

  const userPrompt = `议题：${issue}

以下是${perspectives.length}位专家的分析：

${allAnalyses}

请提供综合分析。`;

  try {
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await aiRouter.chat(messages, {
      stream: false,
      temperature: 0.7,
      maxTokens: 2500
    });

    let synthesisText = '';
    if (typeof response === 'string') {
      synthesisText = response;
    } else {
      // Read stream if needed
      const reader = response.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        synthesisText += decoder.decode(value);
      }
    }

    // Parse the AI response into structured format
    return parseSynthesisText(synthesisText);

  } catch (error) {
    console.error('[AI] 综合分析失败:', error);

    // Fallback to mock data if AI fails
    return generateMockSynthesis(issue, perspectives, roleNames);
  }
}

function generateMockSynthesis(
  issue: string,
  perspectives: Array<{ roleId: string; roleName: string; analysis: string }>,
  roleNames: string
): SynthesisResult {

  return {
    consensus: `通过分析${perspectives.length}个不同视角（${roleNames}），我们发现所有角色都认识到"${issue}"这一议题的复杂性和多维性。他们共同强调：

1. **系统性思维的重要性**：问题不能孤立看待，需要考虑多方面因素的相互作用
2. **平衡各方利益**：任何解决方案都需要在不同价值观和利益群体之间寻找平衡
3. **长远视角**：短期效益和长期影响都需要纳入考量
4. **证据为基础**：决策应建立在可靠数据和科学论证的基础上`,

    conflicts: [
      {
        roles: perspectives.slice(0, 2).map(p => p.roleName),
        description: `**价值取向分歧**：${perspectives[0]?.roleName || '第一个角色'}更强调效率和实用性，而${perspectives[1]?.roleName || '第二个角色'}则优先考虑公平和道德原则。这种价值观的差异导致对问题优先级的不同判断。`
      },
      {
        roles: perspectives.length >= 3 ? perspectives.slice(1, 3).map(p => p.roleName) : [],
        description: `**方法论分歧**：在如何评估和验证解决方案的有效性上，不同角色采用不同的标准和方法。有的强调量化指标，有的重视质性评估。`
      }
    ],

    insights: [
      `💡 **跨视角洞察1**：经济效率和社会公平并非完全对立，通过创新的制度设计可以找到两者的结合点`,
      `💡 **跨视角洞察2**：短期成本和长期收益需要用更全面的评估框架来衡量，单一维度的分析容易产生误导`,
      `💡 **跨视角洞察3**：不同利益相关方的参与和对话是达成可持续解决方案的关键，而非单方面的决策`,
      `💡 **跨视角洞察4**：技术手段和制度建设需要协同推进，单纯依赖某一方面难以解决复杂问题`
    ],

    recommendations: `基于多视角的综合分析，我们建议采取以下行动：

**近期行动（3-6个月）**：
1. 建立多方利益相关者对话机制，确保不同声音被听到
2. 开展试点项目，在小范围内测试不同解决方案的可行性
3. 收集和分析相关数据，为后续决策提供证据基础

**中期规划（6-18个月）**：
1. 基于试点结果，优化和调整方案设计
2. 建立评估体系，综合考虑经济、社会、环境等多维度影响
3. 推动相关政策和制度的完善

**长期愿景（18个月以上）**：
1. 形成可持续的解决机制，而非一次性的应对措施
2. 培育支持性的社会文化氛围
3. 持续监测和改进，保持方案的适应性和有效性

**关键成功因素**：
- 保持开放和包容的态度，尊重不同观点
- 基于证据做决策，避免情绪化和极端化
- 注重过程的公平性和透明度
- 平衡理想目标和现实约束`
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const body: SynthesizeRequest = await request.json();
    const { issue, perspectives } = body;

    if (!issue || !issue.trim()) {
      return NextResponse.json(
        { error: '请提供议题描述' },
        { status: 400 }
      );
    }

    if (!perspectives || perspectives.length < 2) {
      return NextResponse.json(
        { error: '至少需要2个视角进行综合分析' },
        { status: 400 }
      );
    }

    // Generate synthesis
    const synthesis = await generateSynthesis(issue, perspectives);

    return NextResponse.json({
      issue,
      synthesis,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('综合分析生成失败:', error);
    return NextResponse.json(
      { error: '生成综合分析时发生错误' },
      { status: 500 }
    );
  }
}
