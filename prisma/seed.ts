import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 数据库种子文件
 * 用于初始化基础数据和示例数据
 */

async function main() {
  console.log('🌱 开始数据库种子数据初始化...');

  try {
    // 创建示例用户
    const testUser = await prisma.user.upsert({
      where: { email: 'test@cogito.ai' },
      update: {},
      create: {
        email: 'test@cogito.ai',
        name: '测试用户',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      },
    });

    console.log('✅ 创建测试用户:', testUser.email);

    // 创建用户设置
    const userSettings = await prisma.userSettings.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        defaultModel: 'deepseek-v3.1',
        theme: 'light',
        language: 'zh-CN',
        enableAnalytics: true,
      },
    });

    console.log('✅ 创建用户设置');

    // 创建示例对话
    const conversation = await prisma.conversation.create({
      data: {
        userId: testUser.id,
        title: '什么是批判性思维？',
        topic: '批判性思维的定义和重要性',
      },
    });

    console.log('✅ 创建示例对话:', conversation.title);

    // 创建对话消息
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          role: 'user',
          content: '什么是批判性思维？为什么它很重要？',
        },
        {
          conversationId: conversation.id,
          role: 'assistant',
          content: '批判性思维是一种理性、反思性的思维过程，它涉及分析、评估和综合信息以形成判断。让我们深入探讨一下：你认为在日常生活中，哪些情况下批判性思维最为重要？',
        },
        {
          conversationId: conversation.id,
          role: 'user',
          content: '我觉得在做重要决定时，比如选择职业或投资时。',
        },
        {
          conversationId: conversation.id,
          role: 'assistant',
          content: '很好的例子！职业选择和投资决策确实需要批判性思维。那么，你认为在这些决策过程中，我们应该如何避免认知偏见的影响呢？',
        },
      ],
    });

    console.log('✅ 创建对话消息');

    // 创建示例论点分析
    const argumentAnalysis = await prisma.argumentAnalysis.create({
      data: {
        userId: testUser.id,
        inputText: '所有的天鹅都是白色的，因为我见过的天鹅都是白色的。',
        analysis: {
          premise: '我见过的天鹅都是白色的',
          conclusion: '所有的天鹅都是白色的',
          logicalStructure: '归纳推理',
          fallacies: ['以偏概全', '样本偏差'],
          strength: 'weak',
          improvements: [
            '需要更大的样本量',
            '需要考虑不同地区的天鹅',
            '需要查阅科学文献'
          ]
        },
      },
    });

    console.log('✅ 创建示例论点分析');

    // 创建示例多棱镜视角会话
    const perspectiveSession = await prisma.perspectiveSession.create({
      data: {
        userId: testUser.id,
        topic: '人工智能是否会取代人类工作？',
      },
    });

    console.log('✅ 创建多棱镜视角会话');

    // 创建不同视角
    const perspectives = await prisma.perspective.createMany({
      data: [
        {
          sessionId: perspectiveSession.id,
          roleName: '技术专家',
          roleConfig: {
            background: '计算机科学博士，AI研究员',
            viewpoint: '技术乐观主义',
            expertise: ['机器学习', '自动化技术', '技术发展趋势']
          },
          viewpoint: 'AI将创造新的工作机会，提高生产效率，人类应该专注于创造性和情感性工作。',
        },
        {
          sessionId: perspectiveSession.id,
          roleName: '劳工代表',
          roleConfig: {
            background: '工会领导，关注工人权益',
            viewpoint: '谨慎现实主义',
            expertise: ['劳工权益', '就业市场', '社会保障']
          },
          viewpoint: 'AI确实会取代许多传统工作，需要政府和企业提供再培训和社会保障。',
        },
        {
          sessionId: perspectiveSession.id,
          roleName: '经济学家',
          roleConfig: {
            background: '宏观经济学教授',
            viewpoint: '数据驱动分析',
            expertise: ['经济模型', '就业统计', '技术经济学']
          },
          viewpoint: '历史上技术进步总是创造了更多工作，但转型期需要政策支持和教育改革。',
        },
      ],
    });

    console.log('✅ 创建多个视角');

    // 创建公开话题
    const publicTopics = await prisma.generatedConversationTopic.createMany({
      data: [
        {
          topic: '社交媒体对青少年心理健康的影响',
          category: '社会心理学',
          context: '随着社交媒体的普及，越来越多的研究关注其对青少年心理健康的影响。',
          referenceUniversity: '斯坦福大学',
          dimension: 'causal_analysis',
          difficulty: 'intermediate',
          tags: ['心理健康', '社交媒体', '青少年', '因果关系'],
          thinkingFramework: {
            coreChallenge: '如何区分相关性和因果性',
            commonPitfalls: ['混淆相关性与因果性', '忽略第三变量', '过度简化复杂现象'],
            excellentResponseIndicators: ['考虑多重因素', '引用实证研究', '承认复杂性']
          },
          guidingQuestions: [
            {
              level: 'beginner',
              stage: 'exploration',
              question: '你认为社交媒体使用和心理健康问题之间存在什么关系？'
            },
            {
              level: 'intermediate',
              stage: 'analysis',
              question: '如何区分社交媒体使用是心理健康问题的原因还是结果？'
            },
            {
              level: 'advanced',
              stage: 'synthesis',
              question: '考虑到个体差异和环境因素，我们应该如何制定相关政策？'
            }
          ],
          expectedOutcomes: [
            '理解相关性与因果性的区别',
            '识别影响心理健康的多重因素',
            '发展批判性评估研究的能力'
          ],
          isPublic: true,
          usageCount: 0,
        },
        {
          topic: '气候变化的经济成本与环保政策的权衡',
          category: '环境经济学',
          context: '各国政府在制定环保政策时需要平衡经济发展与环境保护。',
          referenceUniversity: '哈佛大学',
          dimension: 'premise_challenge',
          difficulty: 'advanced',
          tags: ['气候变化', '经济政策', '环境保护', '成本效益'],
          thinkingFramework: {
            coreChallenge: '如何量化长期环境效益与短期经济成本',
            commonPitfalls: ['只考虑短期成本', '忽略外部性', '假设技术不变'],
            excellentResponseIndicators: ['考虑长期视角', '量化分析', '多方利益平衡']
          },
          guidingQuestions: [
            {
              level: 'beginner',
              stage: 'exploration',
              question: '环保政策通常会带来哪些经济成本？'
            },
            {
              level: 'intermediate',
              stage: 'analysis',
              question: '如何评估气候变化的长期经济损失？'
            },
            {
              level: 'advanced',
              stage: 'synthesis',
              question: '在不确定性下，如何制定最优的环保投资策略？'
            }
          ],
          expectedOutcomes: [
            '理解环境政策的经济学原理',
            '学会权衡短期成本与长期收益',
            '发展政策分析思维'
          ],
          isPublic: true,
          usageCount: 0,
        },
        {
          topic: '人工智能在医疗诊断中的伦理问题',
          category: '医学伦理学',
          context: 'AI诊断系统越来越准确，但也带来了责任归属、隐私保护等伦理挑战。',
          referenceUniversity: '约翰霍普金斯大学',
          dimension: 'fallacy_detection',
          difficulty: 'advanced',
          tags: ['人工智能', '医疗伦理', '隐私保护', '责任归属'],
          thinkingFramework: {
            coreChallenge: '平衡技术效益与伦理风险',
            commonPitfalls: ['技术决定论', '忽略患者自主权', '过度依赖算法'],
            excellentResponseIndicators: ['多方利益考量', '伦理原则应用', '实际案例分析']
          },
          guidingQuestions: [
            {
              level: 'beginner',
              stage: 'exploration',
              question: 'AI诊断系统可能带来哪些伦理问题？'
            },
            {
              level: 'intermediate',
              stage: 'analysis',
              question: '当AI诊断出错时，责任应该如何分配？'
            },
            {
              level: 'advanced',
              stage: 'synthesis',
              question: '如何设计既高效又符合伦理的AI医疗系统？'
            }
          ],
          expectedOutcomes: [
            '识别技术应用中的伦理问题',
            '学会应用伦理学原则',
            '发展负责任的技术思维'
          ],
          isPublic: true,
          usageCount: 0,
        },
      ],
    });

    console.log('✅ 创建公开话题');

    console.log('\n🎉 数据库种子数据初始化完成！');
    console.log(`📊 创建了以下数据：`);
    console.log(`   - 1 个测试用户`);
    console.log(`   - 1 个用户设置`);
    console.log(`   - 1 个示例对话（包含 4 条消息）`);
    console.log(`   - 1 个论点分析示例`);
    console.log(`   - 1 个多棱镜视角会话（包含 3 个视角）`);
    console.log(`   - 3 个公开话题`);

  } catch (error) {
    console.error('❌ 种子数据初始化失败:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });