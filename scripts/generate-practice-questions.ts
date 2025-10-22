#!/usr/bin/env tsx

/**
 * 批量生成批判性思维练习题
 *
 * 任务：为每个思维类型的每个Level生成至少5道练习题
 * 要求：
 * 1. 题目需要与level_learning_content和theory_content相对应
 * 2. 覆盖对应学习内容的核心批判性思维概念和思维框架
 * 3. 每个thinkingTypeId + level组合至少5道题
 */

import { prisma } from '../src/lib/prisma';
import { aiRouter } from '../src/lib/ai/router';
import type { ChatMessage } from '../src/types';

// 5个思维类型定义
const THINKING_TYPES = [
  {
    id: 'causal_analysis',
    name: '多维归因与利弊权衡',
    description: '区分相关性与因果性，识别混淆因素，建立可靠的因果推理',
  },
  {
    id: 'premise_challenge',
    name: '前提质疑与方法批判',
    description: '识别论证中的隐含前提，质疑其合理性，重新框定问题',
  },
  {
    id: 'fallacy_detection',
    name: '谬误检测',
    description: '识别常见逻辑谬误，理解其危害，学会避免思维陷阱',
  },
  {
    id: 'iterative_reflection',
    name: '迭代反思',
    description: '培养元认知能力，识别思维模式，持续改进思维质量',
  },
  {
    id: 'connection_transfer',
    name: '关联和迁移',
    description: '识别深层结构相似性，实现跨领域迁移',
  },
];

// Level难度映射已移除 - 直接使用level字段 (1-5)

/**
 * 为指定的思维类型和Level生成练习题
 */
async function generateQuestionsForLevel(
  thinkingTypeId: string,
  thinkingTypeName: string,
  level: number,
  questionsToGenerate: number = 5
) {
  console.log(`\n🎯 生成 ${thinkingTypeName} Level ${level} 的练习题...`);

  // 1. 获取该Level的理论内容
  const theoryContent = await prisma.theoryContent.findFirst({
    where: {
      thinkingTypeId,
      level,
      isPublished: true,
    },
    select: {
      title: true,
      learningObjectives: true,
      conceptsContent: true,
      modelsContent: true,
      demonstrationsContent: true,
    },
  });

  if (!theoryContent) {
    console.warn(`  ⚠️  未找到 ${thinkingTypeId} Level ${level} 的理论内容，跳过`);
    return [];
  }

  // 2. 构造AI生成Prompt
  const systemPrompt = `你是一位资深的批判性思维教育专家，专门设计高质量的练习题。你的任务是根据学习内容生成符合香港大学面试标准的批判性思维练习题。

**题目设计原则**：
1. **真实性**：基于真实的社会议题、热点事件或经典案例
2. **复杂性**：包含多个维度和视角，避免简单的对错判断
3. **思维深度**：引导学生运用批判性思维框架进行深度分析
4. **可操作性**：提供明确的引导问题，帮助学生逐步分析

**输出要求**：
- 必须严格返回JSON格式
- 每道题包含完整的字段：topic, context, question, guidingQuestions, thinkingFramework, expectedOutcomes, tags`;

  const userPrompt = `请为【${thinkingTypeName}】Level ${level} 生成 ${questionsToGenerate} 道练习题。

**学习目标**：
${JSON.stringify(theoryContent.learningObjectives, null, 2)}

**核心概念**：
${JSON.stringify(theoryContent.conceptsContent, null, 2).substring(0, 1000)}

**思维模型**：
${JSON.stringify(theoryContent.modelsContent, null, 2).substring(0, 1000)}

**Level ${level} 特点**：
${getLevelCharacteristics(level)}

**输出格式**（严格JSON数组）：
\`\`\`json
[
  {
    "topic": "题目标题（简洁有力，吸引思考）",
    "context": "背景情境（300-500字，提供足够的信息和复杂性）",
    "question": "核心问题（开放式，引导深度思考）",
    "guidingQuestions": [
      {
        "question": "引导问题1（帮助学生逐步分析）",
        "purpose": "该问题的教学目的",
        "orderIndex": 0
      },
      {
        "question": "引导问题2",
        "purpose": "教学目的",
        "orderIndex": 1
      }
      // 至少3-5个引导问题
    ],
    "thinkingFramework": {
      "coreChallenge": "核心挑战（学生需要克服的思维障碍）",
      "commonPitfalls": ["常见误区1", "常见误区2"],
      "excellentResponseIndicators": ["优秀回答的特征1", "优秀回答的特征2"]
    },
    "expectedOutcomes": ["预期学习成果1", "预期学习成果2"],
    "tags": ["标签1", "标签2", "标签3"]
  }
  // ... 共${questionsToGenerate}道题
]
\`\`\`

请严格按照以上格式生成JSON，确保可以直接解析。`;

  try {
    // 3. 调用AI生成题目
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    console.log(`  🤖 调用AI生成题目...`);
    const aiResponse = await aiRouter.chat(messages, {
      temperature: 0.8,
      maxTokens: 4000,
    }) as string;

    // 4. 解析AI响应
    let questionsData;
    try {
      // 尝试提取JSON（去除可能的markdown代码块）
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[0]);
      } else {
        questionsData = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error(`  ❌ JSON解析失败:`, parseError);
      console.error(`  原始响应:`, aiResponse.substring(0, 500));
      return [];
    }

    if (!Array.isArray(questionsData)) {
      console.error(`  ❌ 返回的不是数组格式`);
      return [];
    }

    console.log(`  ✅ 成功生成 ${questionsData.length} 道题`);
    return questionsData;

  } catch (error) {
    console.error(`  ❌ 生成题目失败:`, error);
    return [];
  }
}

/**
 * 获取Level特点描述
 */
function getLevelCharacteristics(level: number): string {
  const characteristics: Record<number, string> = {
    1: `Level 1 (基础入门)：
- 识别和理解：帮助学生识别基本概念和常见模式
- 思维脚手架：提供清晰的框架和工具
- 简单场景：使用日常生活中容易理解的例子
- 引导性强：通过引导问题逐步引导思考`,

    2: `Level 2 (应用实践)：
- 应用概念：将Level 1学到的概念应用到实际案例
- 中等复杂度：增加情境的复杂性和多样性
- 初步独立：减少脚手架，鼓励独立思考
- 对比分析：引入对比和比较的元素`,

    3: `Level 3 (综合分析)：
- 多维度分析：要求从多个角度分析问题
- 复杂情境：涉及多方利益、多重因素的真实案例
- 批判性评估：对论证和证据进行批判性评估
- 深层思考：触及问题的本质和深层原因`,

    4: `Level 4 (创新综合)：
- 系统性思考：要求系统地分析复杂问题
- 跨领域迁移：将批判性思维应用于不同领域
- 创新性解决：鼓励创新性的问题解决方法
- 元认知反思：对自己的思维过程进行反思`,

    5: `Level 5 (专家掌握)：
- 高度复杂性：涉及高度复杂和有争议的问题
- 独立分析：完全独立地进行深度分析
- 原创性思考：提出原创性的见解和解决方案
- 理论整合：整合多个理论框架进行分析`,
  };

  return characteristics[level] || '';
}

/**
 * 将生成的题目保存到数据库
 */
async function saveQuestionToDatabase(
  questionData: any,
  thinkingTypeId: string,
  level: number
) {
  try {
    // 创建题目
    const question = await prisma.criticalThinkingQuestion.create({
      data: {
        thinkingTypeId,
        level,
        topic: questionData.topic,
        context: questionData.context,
        question: questionData.question,
        tags: questionData.tags || [],
        thinkingFramework: questionData.thinkingFramework || {},
        expectedOutcomes: questionData.expectedOutcomes || [],
        guidingQuestions: {
          create: (questionData.guidingQuestions || []).map((gq: any, index: number) => ({
            level: `level_${level}`,
            stage: `step_${index + 1}`,
            question: gq.question,
            orderIndex: gq.orderIndex ?? index,
          })),
        },
      },
    });

    console.log(`    ✅ 保存题目: ${questionData.topic}`);
    return question;
  } catch (error) {
    console.error(`    ❌ 保存题目失败:`, error);
    throw error;
  }
}

/**
 * 主函数：批量生成所有题目
 */
async function main() {
  console.log('🚀 开始批量生成批判性思维练习题...\n');

  const QUESTIONS_PER_LEVEL = 5; // 每个Level生成5道题
  let totalGenerated = 0;
  let totalSaved = 0;

  for (const thinkingType of THINKING_TYPES) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📚 处理思维类型: ${thinkingType.name} (${thinkingType.id})`);
    console.log(`${'='.repeat(60)}`);

    for (let level = 1; level <= 5; level++) {
      // 检查是否已有题目
      const existingCount = await prisma.criticalThinkingQuestion.count({
        where: {
          thinkingTypeId: thinkingType.id,
          level,
        },
      });

      if (existingCount >= QUESTIONS_PER_LEVEL) {
        console.log(`\n  ⏭️  ${thinkingType.name} Level ${level} 已有 ${existingCount} 道题，跳过`);
        continue;
      }

      const neededQuestions = QUESTIONS_PER_LEVEL - existingCount;
      console.log(`\n  📝 需要生成 ${neededQuestions} 道题 (已有${existingCount}道)`);

      // 生成题目
      const questions = await generateQuestionsForLevel(
        thinkingType.id,
        thinkingType.name,
        level,
        neededQuestions
      );

      totalGenerated += questions.length;

      // 保存到数据库
      for (const questionData of questions) {
        try {
          await saveQuestionToDatabase(questionData, thinkingType.id, level);
          totalSaved++;
        } catch (error) {
          console.error(`    ❌ 保存失败，跳过该题`);
        }

        // 添加延迟，避免AI API限流
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.log(`\n\n${'='.repeat(60)}`);
  console.log(`✅ 生成完成！`);
  console.log(`   - 总共生成: ${totalGenerated} 道题`);
  console.log(`   - 成功保存: ${totalSaved} 道题`);
  console.log(`${'='.repeat(60)}\n`);

  await prisma.$disconnect();
}

// 执行主函数
main().catch((error) => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
