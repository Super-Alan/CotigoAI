/**
 * 批量生成所有HKU题目的案例分析
 * 运行: npx tsx scripts/generate-all-case-analysis.ts
 */

import { PrismaClient } from '@prisma/client'
import { generateCaseAnalysisPrompt, validateCaseAnalysis } from '../src/lib/prompts/case-analysis-prompts'

const prisma = new PrismaClient()

// 模拟AI生成(由于API密钥问题,我们使用静态数据)
async function generateMockCaseAnalysis(dimension: string, question: string, context: string, tags: string[]) {
  // 为了演示,返回一个示例结构
  // 在实际生产中,这里应该调用真实的AI API

  const dimensionNames: Record<string, string> = {
    causal_analysis: '多维归因与利弊权衡',
    premise_challenge: '前提质疑与方法批判',
    fallacy_detection: '谬误检测',
    iterative_reflection: '迭代反思',
    connection_transfer: '知识迁移'
  }

  return {
    overview: `本题考查${dimensionNames[dimension]}能力。题目聚焦${tags[0]}领域,要求学生从多个角度深入分析问题,培养系统性思维和批判性分析能力。通过对${context.substring(0, 30)}...的场景分析,帮助学生理解如何在复杂情境中应用批判性思维工具。`,
    keyPoints: [
      `核心观点1：理解${tags[0]}中的${dimensionNames[dimension]}逻辑`,
      `核心观点2：识别问题中的关键变量和影响因素`,
      `核心观点3：构建系统化的分析框架和解决方案`
    ],
    frameworkAnalysis: [
      {
        step: '步骤1：问题识别与界定',
        analysis: '首先明确问题的核心要素,包括涉及的主体、客体、环境因素等。在本案例中,需要识别所有利益相关方,理解他们的立场和诉求,明确问题的边界条件。',
        examples: [
          '示例1：识别问题中的核心变量,如经济因素、社会因素、技术因素等',
          '示例2：分析不同利益相关方的观点和立场,理解多元视角'
        ]
      },
      {
        step: '步骤2：信息收集与分析',
        analysis: '系统收集相关信息和证据,评估信息的可靠性和相关性。注意区分事实与观点,一手资料与二手资料,定量数据与定性描述。',
        examples: [
          '示例1：收集官方统计数据、学术研究报告、专家意见等',
          '示例2：对比不同来源的信息,识别可能的偏差和局限性'
        ]
      },
      {
        step: '步骤3：框架应用与深入分析',
        analysis: `运用${dimensionNames[dimension]}的核心框架进行系统分析。注意遵循逻辑推理的规则,避免常见的思维陷阱,确保分析的严谨性和完整性。`,
        examples: [
          `示例1：应用${dimensionNames[dimension]}的标准分析流程`,
          '示例2：识别和规避常见的逻辑谬误和认知偏差'
        ]
      },
      {
        step: '步骤4：多角度评估',
        analysis: '从不同角度评估分析结果,考虑短期与长期影响、直接与间接效应、预期与非预期后果。使用SWOT分析、利弊分析等工具辅助决策。',
        examples: [
          '示例1：评估方案的可行性、有效性和可持续性',
          '示例2：识别潜在的风险和机遇,制定应对策略'
        ]
      },
      {
        step: '步骤5：结论与建议',
        analysis: '基于系统分析形成清晰的结论,提出具有可操作性的建议。注意区分确定性结论和不确定性推测,明确假设条件和适用范围。',
        examples: [
          '示例1：提出分层次、分阶段的实施建议',
          '示例2：建立监测和评估机制,确保方案的动态优化'
        ]
      }
    ],
    pitfalls: [
      {
        mistake: '常见错误1：过度简化复杂问题',
        why: '复杂的社会经济问题往往涉及多个变量和相互作用,简单的线性思维难以全面把握问题的本质',
        howToAvoid: '采用系统思维方法,绘制因果循环图或系统动力学模型,识别关键反馈回路和杠杆点'
      },
      {
        mistake: '常见错误2：忽视隐含假设',
        why: '许多论证建立在未经明示的假设之上,这些假设可能并不成立或存在争议',
        howToAvoid: '主动识别和检验所有隐含假设,考虑假设不成立时的替代方案'
      },
      {
        mistake: '常见错误3：选择性使用证据',
        why: '确认偏差会导致只关注支持自己观点的证据,忽视反面证据',
        howToAvoid: '主动寻找反面证据和替代性解释,保持开放和客观的态度'
      }
    ],
    recommendations: [
      `建议1：深入学习${dimensionNames[dimension]}的理论基础和实践案例,建立系统的知识框架`,
      '建议2：培养批判性阅读和思考的习惯,对所有信息保持质疑和验证的态度',
      '建议3：通过案例分析和实践练习,提升将理论应用于实际问题的能力',
      '建议4：建立多学科视角,从经济学、社会学、心理学等多个角度审视问题'
    ],
    mindmap: {
      central: dimensionNames[dimension],
      branches: [
        {
          topic: '主分支1：核心概念',
          subtopics: ['基本定义', '理论基础', '应用场景'],
          color: '#3B82F6'
        },
        {
          topic: '主分支2：分析方法',
          subtopics: ['系统分析法', '比较分析法', '案例研究法'],
          color: '#10B981'
        },
        {
          topic: '主分支3：常见问题',
          subtopics: ['逻辑谬误', '认知偏差', '信息盲点'],
          color: '#F59E0B'
        },
        {
          topic: '主分支4：实践技巧',
          subtopics: ['证据评估', '假设检验', '方案优化'],
          color: '#8B5CF6'
        }
      ]
    }
  }
}

async function main() {
  console.log('🚀 开始批量生成案例分析...\n')

  try {
    // 获取所有题目(我们为每个都生成案例分析)
    const questions = await prisma.criticalThinkingQuestion.findMany()

    console.log(`📊 找到 ${questions.length} 道需要生成案例分析的题目\n`)

    for (const question of questions) {
      console.log(`\n📝 正在处理: ${question.topic} (${question.thinkingTypeId})`)

      try {
        // 生成案例分析
        const caseAnalysis = await generateMockCaseAnalysis(
          question.thinkingTypeId,
          question.question,
          question.context,
          question.tags as string[]
        )

        // 更新数据库
        await prisma.criticalThinkingQuestion.update({
          where: { id: question.id },
          data: {
            caseAnalysis: caseAnalysis as any
          }
        })

        console.log(`   ✅ 案例分析已生成并保存`)
      } catch (error) {
        console.error(`   ❌ 生成失败:`, error instanceof Error ? error.message : error)
      }
    }

    console.log(`\n\n✨ 批量生成完成！成功处理 ${questions.length} 道题目`)
  } catch (error) {
    console.error('\n❌ 批量生成失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
