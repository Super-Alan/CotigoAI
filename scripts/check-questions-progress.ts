#!/usr/bin/env tsx

/**
 * 检查练习题生成进度
 */

import { prisma } from '../src/lib/prisma';

const THINKING_TYPES = [
  { id: 'causal_analysis', name: '多维归因与利弊权衡' },
  { id: 'premise_challenge', name: '前提质疑与方法批判' },
  { id: 'fallacy_detection', name: '谬误检测' },
  { id: 'iterative_reflection', name: '迭代反思' },
  { id: 'connection_transfer', name: '关联和迁移' },
];

async function checkProgress() {
  console.log('📊 批判性思维练习题生成进度\n');

  let totalQuestions = 0;
  const targetPerLevel = 5;
  const totalLevels = 5;
  const totalExpected = THINKING_TYPES.length * totalLevels * targetPerLevel;

  for (const thinkingType of THINKING_TYPES) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📚 ${thinkingType.name} (${thinkingType.id})`);
    console.log(`${'='.repeat(60)}`);

    for (let level = 1; level <= totalLevels; level++) {
      const count = await prisma.criticalThinkingQuestion.count({
        where: {
          thinkingTypeId: thinkingType.id,
          level,
        },
      });

      totalQuestions += count;

      const status = count >= targetPerLevel ? '✅' : count > 0 ? '⏳' : '❌';
      const progress = Math.min(100, (count / targetPerLevel) * 100);

      console.log(
        `  Level ${level}: ${status} ${count}/${targetPerLevel} 道题 (${progress.toFixed(0)}%)`
      );
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📈 总体进度`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  已生成: ${totalQuestions}/${totalExpected} 道题`);
  console.log(`  完成度: ${((totalQuestions / totalExpected) * 100).toFixed(1)}%`);

  if (totalQuestions >= totalExpected) {
    console.log(`\n✅ 恭喜！所有练习题已生成完毕！`);
  } else {
    console.log(`\n⏳ 还需生成 ${totalExpected - totalQuestions} 道题`);
  }

  await prisma.$disconnect();
}

checkProgress().catch((error) => {
  console.error('❌ 检查失败:', error);
  process.exit(1);
});
