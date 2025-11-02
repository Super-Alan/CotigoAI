const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestConceptData() {
  try {
    // 首先获取一个思维类型
    const thinkingType = await prisma.thinkingType.findFirst()
    
    if (!thinkingType) {
      console.log('没有找到思维类型，请先创建思维类型')
      return
    }

    // 创建测试概念内容
    const conceptContent = await prisma.conceptContent.create({
      data: {
        thinkingTypeId: thinkingType.id,
        level: 1,
        order: 1,
        title: '什么是反思',
        subtitle: '达代反思的第一步',
        description: '反思是代反思思维的基本文义，它帮助我们停下来思考自己的想法、行为和结果，从而...',
        learningObjectives: [
          '学习目标1: 掌握反思的基本文义和重要性',
          '学习目标2: 能够识别生活中需要反思的常见情境'
        ],
        conceptsIntro: '反思是代反思思维的第一步',
        conceptsContent: {
          sections: [
            {
              title: '反思的定义',
              content: '反思是指对自己的思维过程、行为和经验进行深入思考和分析的过程。'
            }
          ]
        },
        modelsIntro: '反思的模型和框架',
        modelsContent: {
          sections: [
            {
              title: 'Gibbs反思循环',
              content: 'Gibbs反思循环是一个经典的反思框架，包含六个步骤...'
            }
          ]
        },
        demonstrationsIntro: '反思的实际应用',
        demonstrationsContent: {
          sections: [
            {
              title: '学习中的反思',
              content: '在学习过程中，我们可以通过反思来提高学习效果...'
            }
          ]
        },
        estimatedTime: 7,
        difficulty: 'beginner',
        tags: ['反思', '批判性思维', '自我认知'],
        keywords: ['反思', '思维', '分析', '自我评估'],
        isPublished: true,
        publishedAt: new Date(),
        generatedBy: 'manual'
      }
    })

    console.log('创建测试概念内容成功:', conceptContent.id)

    // 创建第二个概念
    const conceptContent2 = await prisma.conceptContent.create({
      data: {
        thinkingTypeId: thinkingType.id,
        level: 1,
        order: 2,
        title: '批判性思维的核心要素',
        subtitle: '理解批判性思维的基本组成',
        description: '批判性思维包含多个核心要素，包括分析、评估、推理和解释等能力...',
        learningObjectives: [
          '学习目标1: 了解批判性思维的核心要素',
          '学习目标2: 能够在实际情境中应用这些要素'
        ],
        conceptsIntro: '批判性思维的核心要素包括分析、评估、推理等',
        conceptsContent: {
          sections: [
            {
              title: '分析能力',
              content: '分析是将复杂问题分解为更小、更易管理的部分的能力。'
            },
            {
              title: '评估能力',
              content: '评估是判断信息、论证或观点的可信度和有效性的能力。'
            }
          ]
        },
        modelsIntro: '批判性思维的框架模型',
        modelsContent: {
          sections: [
            {
              title: 'Paul-Elder模型',
              content: 'Paul-Elder批判性思维模型提供了一个系统的思维框架...'
            }
          ]
        },
        demonstrationsIntro: '批判性思维在实际中的应用',
        demonstrationsContent: {
          sections: [
            {
              title: '学术研究中的应用',
              content: '在学术研究中，批判性思维帮助我们评估文献的质量...'
            }
          ]
        },
        estimatedTime: 10,
        difficulty: 'intermediate',
        tags: ['批判性思维', '分析', '评估', '推理'],
        keywords: ['批判性思维', '分析', '评估', '推理', '核心要素'],
        isPublished: true,
        publishedAt: new Date(),
        generatedBy: 'manual'
      }
    })

    console.log('创建第二个测试概念内容成功:', conceptContent2.id)

  } catch (error) {
    console.error('创建测试数据失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestConceptData()