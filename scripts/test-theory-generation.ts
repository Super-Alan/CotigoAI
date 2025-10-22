#!/usr/bin/env tsx

/**
 * Test Theory Content Generation
 *
 * Simple test to verify AI generation and database save work correctly
 * Usage: npx tsx scripts/test-theory-generation.ts
 */

import { prisma } from '../src/lib/prisma';
import { aiRouter } from '../src/lib/ai/router';

async function testGeneration() {
  console.log('🧪 Testing Theory Content Generation...\n');

  const prompt = `你是一位资深的批判性思维教育专家。

请为"因果分析"的Level 1（基础识别）设计1个核心概念。

请严格按照JSON格式输出（只输出JSON，不要markdown代码块）：

{
  "intro": "本章节介绍因果分析的基础概念",
  "concepts": [
    {
      "id": "cause-effect-basic",
      "name": "因果关系基础",
      "definition": "因果关系是指一个事件导致另一个事件发生的关系",
      "keyPoints": ["时间顺序：原因在前", "逻辑必然性：有因必有果", "可验证性：可以观察"],
      "examples": ["吸烟导致肺癌风险增加", "学习导致知识积累"],
      "commonMisconceptions": ["混淆因果与相关：两件事同时发生不代表有因果关系"]
    }
  ]
}`;

  try {
    console.log('📡 Calling AI...');
    const response = await aiRouter.chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.7, maxTokens: 1000 }
    );

    console.log('\n✅ AI Response received\n');
    console.log('─'.repeat(80));
    console.log(response);
    console.log('─'.repeat(80));

    // Try to parse JSON
    console.log('\n📊 Parsing JSON...');
    const responseText = typeof response === 'string' ? response : '(stream response)';
    let jsonStr = responseText.trim();

    // Remove markdown code blocks if present
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const data = JSON.parse(jsonStr);
    console.log('✅ JSON parsed successfully');
    console.log(JSON.stringify(data, null, 2));

    // Test database save
    console.log('\n💾 Testing database save...');
    const testContent = await prisma.theoryContent.create({
      data: {
        thinkingTypeId: 'causal_analysis',
        level: 1,
        title: '【测试】因果分析 - Level 1',
        subtitle: '基础识别',
        description: '这是一个测试生成的内容',
        learningObjectives: ['测试目标1', '测试目标2'],
        conceptsIntro: data.intro,
        conceptsContent: { concepts: data.concepts },
        modelsIntro: '模型介绍（测试）',
        modelsContent: { models: [] },
        demonstrationsIntro: '示例介绍（测试）',
        demonstrationsContent: { demonstrations: [] },
        estimatedTime: 30,
        difficulty: 'beginner',
        tags: ['test', 'causal_analysis', 'level-1'],
        keywords: ['因果分析', '测试'],
        prerequisites: [],
        relatedTopics: [],
        version: '1.0.0-test',
        isPublished: false,
      },
    });

    console.log('✅ Saved to database:');
    console.log(`   ID: ${testContent.id}`);
    console.log(`   Title: ${testContent.title}`);
    console.log(`   Thinking Type: ${testContent.thinkingTypeId}`);
    console.log(`   Level: ${testContent.level}`);

    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await prisma.theoryContent.delete({ where: { id: testContent.id } });
    console.log('✅ Test content deleted');

    console.log('\n' + '='.repeat(80));
    console.log('🎉 All tests passed! Ready for full generation.');
    console.log('='.repeat(80));
    console.log('\nNext step: Run full generation for all dimensions and levels');
    console.log('Command: npx tsx scripts/generate-theory-content-v2.ts');
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testGeneration();
