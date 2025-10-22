#!/usr/bin/env tsx

/**
 * Generate Sample Theory Content
 *
 * Generates a sample theory content for causal_analysis Level 1
 * This serves as a template and test for the full generation
 *
 * Usage: npx tsx scripts/generate-sample-theory.ts
 */

import { prisma } from '../src/lib/prisma';

async function generateSampleContent() {
  console.log('🚀 Generating Sample Theory Content...\n');

  try {
    // Sample content for Causal Analysis - Level 1
    const sampleContent = {
      thinkingTypeId: 'causal_analysis',
      level: 1,
      title: '多维归因与利弊权衡 - Level 1',
      subtitle: '基础识别',
      description: '学习因果分析的基础概念，理解因果关系与相关性的区别，掌握简单的归因方法。',
      learningObjectives: [
        '理解因果关系的基本定义和特征',
        '区分因果关系与相关性',
        '掌握简单的因果分析方法',
        '识别日常生活中的因果关系',
      ],

      // Section 1: Concepts
      conceptsIntro: '本章节介绍因果分析的核心基础概念，帮助你建立对因果关系的正确理解。我们将学习什么是因果关系，以及如何将它与简单的相关性区分开来。',
      conceptsContent: {
        concepts: [
          {
            id: 'causation-definition',
            name: '因果关系的定义',
            definition: '因果关系是指一个事件（原因）直接或间接地导致另一个事件（结果）发生的关系。这种关系具有方向性和必然性。',
            keyPoints: [
              '时间顺序：原因必须发生在结果之前',
              '逻辑联系：原因的发生会增加结果发生的概率',
              '可验证性：因果关系可以通过实验或观察来验证',
              '非偶然性：因果关系不是偶然的巧合',
            ],
            examples: [
              '学习时间增加导致考试成绩提高：更多的学习投入直接影响知识掌握程度',
              '缺乏运动导致身体素质下降：长期不运动会削弱肌肉力量和心肺功能',
              '吸烟导致肺癌风险增加：烟草中的有害物质会损害肺部细胞',
            ],
            commonMisconceptions: [
              '混淆时间顺序与因果关系：A在B之前发生，不代表A导致B（如：公鸡打鸣与太阳升起）',
              '忽略其他可能的原因：只看到一个原因就认为是唯一原因',
              '将相关性误认为因果性：两个事件同时发生或有统计关联，不一定有因果关系',
            ],
          },
          {
            id: 'correlation-vs-causation',
            name: '相关性与因果性',
            definition: '相关性是指两个变量之间存在统计上的关联，但不一定有因果关系。因果性则明确一方导致另一方的发生。',
            keyPoints: [
              '相关性只表明两者有联系，不说明谁导致谁',
              '因果性有明确的方向：从原因到结果',
              '第三变量问题：两个相关变量可能都受第三个变量影响',
              '双向因果：有时两个变量互为因果',
            ],
            examples: [
              '冰淇淋销量与溺水事故：两者在夏季都增加，但没有因果关系（第三变量：天气炎热）',
              '鞋码与阅读能力：儿童鞋码越大阅读能力越强，但没有因果关系（第三变量：年龄增长）',
              '咖啡消费与工作效率：相关但可能是双向因果（压力大的人喝更多咖啡，咖啡也能提升效率）',
            ],
            commonMisconceptions: [
              '认为所有相关的事物都有因果关系',
              '忽略混淆变量的存在',
              '过于简化复杂的因果网络',
            ],
          },
        ],
      },

      // Section 2: Models
      modelsIntro: '掌握了基本概念后，我们需要学习一些实用的思维模型来帮助我们更系统地进行因果分析。这些模型将指导我们如何识别和验证因果关系。',
      modelsContent: {
        models: [
          {
            id: 'five-whys',
            name: '5个为什么分析法',
            description: '这是一个简单但强大的工具，通过连续追问"为什么"来挖掘问题的根本原因。每次回答后继续追问，通常5次就能找到核心原因。',
            steps: [
              {
                step: '明确问题',
                description: '清楚地描述你要分析的问题或现象。确保问题具体、可观察。',
                tips: '用"什么"和"何时"来描述问题，避免包含推测的"为什么"',
              },
              {
                step: '第一次追问',
                description: '问"为什么会发生这个问题？"基于事实给出答案。',
                tips: '聚焦于直接原因，不要一开始就跳到根本原因',
              },
              {
                step: '持续追问',
                description: '对上一步的答案继续问"为什么"，重复这个过程。',
                tips: '每次只追问一个主要原因，避免同时追问多个分支',
                commonMistakes: '停留在表面原因就不再追问',
              },
              {
                step: '识别根本原因',
                description: '当再追问"为什么"已经没有更深层次的原因时，通常就找到了根本原因。',
                tips: '根本原因通常是可以采取行动改变的',
              },
              {
                step: '验证因果链',
                description: '反向检查：如果解决了最后一个"为什么"，前面的问题是否都会消失？',
              },
            ],
            useCases: [
              '生产质量问题分析',
              '项目延期原因调查',
              '个人习惯改善',
              '团队协作障碍诊断',
            ],
            examples: [
              '问题：项目延期交付\n为什么1：测试发现太多bug\n为什么2：代码质量不高\n为什么3：开发时间紧张\n为什么4：需求变更频繁\n为什么5：前期需求沟通不充分\n根本原因：需要改进需求分析流程',
            ],
          },
        ],
      },

      // Section 3: Demonstrations
      demonstrationsIntro: '通过真实案例来巩固我们学到的概念和方法。观察专家如何分析因果关系，并思考如何应用到自己的情况中。',
      demonstrationsContent: {
        demonstrations: [
          {
            id: 'coffee-productivity-case',
            title: '咖啡与生产力的关系',
            scenario: '某科技公司观察到，员工喝咖啡的数量与工作产出呈正相关：喝咖啡较多的员工往往完成更多任务。公司因此考虑免费提供咖啡以提升整体生产力。',
            question: '喝咖啡真的能提高生产力吗？这是因果关系还是相关性？',
            analysis: `这是一个典型的"相关性不等于因果性"的案例。我们需要仔细分析：

**观察到的现象**：咖啡消费量 ↔ 工作产出（正相关）

**可能的解释**：

1. **因果关系（咖啡 → 产出）**
   - 咖啡因确实能提高注意力和警觉性
   - 短期内可能有积极效果

2. **反向因果（产出 → 咖啡）**
   - 工作量大的员工需要更多咖啡来应对疲劳
   - 繁忙的人更依赖咖啡提神

3. **第三变量（工作投入）**
   - 工作热情高的员工既产出多，也愿意加班（需要咖啡）
   - 这是最可能的解释

**正确的分析方法**：
- 不能仅凭相关性就下结论
- 需要考虑其他可能的解释
- 应该通过实验来验证（如：随机分配咖啡摄入量）

**启示**：
盲目提供咖啡可能不会提高生产力，反而应该关注员工的工作热情和工作环境。`,
            keyInsights: [
              '相关性不能直接推导因果性',
              '需要考虑反向因果和第三变量',
              '真正的因果关系需要实验验证',
              '复杂现象往往有多重原因',
            ],
            reflectionQuestions: [
              '你能想到其他第三变量可能同时影响咖啡消费和工作产出吗？',
              '如果要设计一个实验来验证咖啡与生产力的因果关系，你会怎么做？',
              '在你的生活中，有哪些你之前认为是因果关系，但可能只是相关性的例子？',
            ],
          },
          {
            id: 'study-time-grades-case',
            title: '学习时间与考试成绩',
            scenario: '某学校研究发现，平均每天学习时间超过4小时的学生，考试成绩明显高于学习时间少于2小时的学生。学校建议所有学生增加学习时间。',
            question: '增加学习时间一定能提高成绩吗？',
            analysis: `这个案例看似有明显的因果关系，但需要更细致的分析：

**表面结论**：学习时间 → 考试成绩（似乎成立）

**深入分析**：

1. **是否有因果关系？**
   - 有一定的因果关系，但不是线性的
   - 学习质量比时间更重要

2. **可能的混淆因素**：
   - 学习方法：有效学习2小时 > 无效学习4小时
   - 基础水平：基础好的学生学习效率更高
   - 学习动机：自主学习比被动学习效果好
   - 身体状态：过度学习导致疲劳，反而降低效果

3. **因果关系的边界**：
   - 从0增加到适量：正面效果
   - 超过阈值（如每天6小时）：边际收益递减
   - 过度学习：可能产生负面效果（疲劳、焦虑）

**正确的建议**：
不是简单地增加时间，而是：
- 优化学习方法
- 保证学习质量
- 找到适合自己的学习时长
- 注意劳逸结合`,
            keyInsights: [
              '因果关系可能是非线性的',
              '质量往往比数量更重要',
              '需要考虑个体差异',
              '过度追求某个因素可能适得其反',
            ],
            reflectionQuestions: [
              '你认为自己的最佳学习时长是多少？如何验证？',
              '除了时间，还有哪些因素影响学习效果？',
              '如何设计一个实验来测试学习时间与成绩的真实关系？',
            ],
          },
        ],
      },

      // Metadata
      estimatedTime: 30,
      difficulty: 'beginner',
      tags: ['causal_analysis', 'level-1', 'beginner', '因果关系', '相关性'],
      keywords: ['因果分析', '因果关系', '相关性', '归因', '5个为什么'],
      prerequisites: [],
      relatedTopics: [],
      version: '1.0.0',
      isPublished: true,
      publishedAt: new Date(),
    };

    // Check if already exists
    const existing = await prisma.theoryContent.findFirst({
      where: {
        thinkingTypeId: sampleContent.thinkingTypeId,
        level: sampleContent.level,
        version: sampleContent.version,
      },
    });

    if (existing) {
      console.log('⚠️  Sample content already exists. Deleting old version...');
      await prisma.theoryContent.delete({ where: { id: existing.id } });
    }

    // Create new content
    const created = await prisma.theoryContent.create({ data: sampleContent });

    console.log('✅ Sample theory content created successfully!\n');
    console.log('─'.repeat(80));
    console.log(`ID: ${created.id}`);
    console.log(`Thinking Type: ${created.thinkingTypeId}`);
    console.log(`Level: ${created.level}`);
    console.log(`Title: ${created.title}`);
    console.log(`Subtitle: ${created.subtitle}`);
    console.log(`Difficulty: ${created.difficulty}`);
    console.log(`Estimated Time: ${created.estimatedTime} minutes`);
    console.log(`Published: ${created.isPublished}`);
    console.log('─'.repeat(80));

    console.log('\n📊 Content Structure:');
    console.log(`  Concepts: ${sampleContent.conceptsContent.concepts.length}`);
    console.log(`  Models: ${sampleContent.modelsContent.models.length}`);
    console.log(`  Demonstrations: ${sampleContent.demonstrationsContent.demonstrations.length}`);

    console.log('\n🌐 You can now view this content at:');
    console.log(`   http://localhost:3000/learn/critical-thinking/causal_analysis/theory/1`);

    console.log('\n✨ Next steps:');
    console.log('   1. Visit the URL above to see the content in action');
    console.log('   2. Test the progress tracking by marking sections as complete');
    console.log('   3. Review the quality and structure');
    console.log('   4. If satisfied, generate content for other dimensions/levels');
  } catch (error) {
    console.error('\n❌ Error generating sample content:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

generateSampleContent();
