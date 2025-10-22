/**
 * 数据迁移验证脚本 - Week 1 Day 3-4
 *
 * 验证项：
 * 1. 所有用户进度记录都有正确的Level和解锁状态
 * 2. 所有题目都分配了正确的Level
 * 3. 所有练习记录的Level与题目Level一致
 * 4. 无孤立数据（外键完整性）
 * 5. Level统计数据准确性
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
}

/**
 * 验证1: 用户进度记录的Level和解锁状态
 */
async function validateUserProgress(): Promise<ValidationResult> {
  log('\n[验证1] 检查用户进度记录...', 'cyan');

  const progressRecords = await prisma.criticalThinkingProgress.findMany({
    include: {
      user: { select: { email: true } },
      thinkingType: { select: { name: true } },
    },
  });

  const issues: string[] = [];

  for (const progress of progressRecords) {
    const {
      currentLevel,
      level1Unlocked,
      level2Unlocked,
      level3Unlocked,
      level4Unlocked,
      level5Unlocked,
      questionsCompleted,
    } = progress;

    // 检查currentLevel范围
    if (currentLevel < 1 || currentLevel > 5) {
      issues.push(
        `${progress.user.email} - ${progress.thinkingType.name}: currentLevel=${currentLevel} 超出范围`
      );
    }

    // 检查解锁逻辑一致性
    if (!level1Unlocked) {
      issues.push(
        `${progress.user.email} - ${progress.thinkingType.name}: Level 1 未解锁（应该默认解锁）`
      );
    }

    // 验证解锁与questionsCompleted的对应关系
    if (questionsCompleted >= 10 && !level2Unlocked) {
      issues.push(
        `${progress.user.email} - ${progress.thinkingType.name}: 完成${questionsCompleted}题但Level 2未解锁`
      );
    }

    if (questionsCompleted >= 30 && !level3Unlocked) {
      issues.push(
        `${progress.user.email} - ${progress.thinkingType.name}: 完成${questionsCompleted}题但Level 3未解锁`
      );
    }

    // 检查lastPracticeAt字段存在性
    if (!progress.lastPracticeAt && questionsCompleted > 0) {
      issues.push(
        `${progress.user.email} - ${progress.thinkingType.name}: 有练习记录但lastPracticeAt为空`
      );
    }
  }

  if (issues.length === 0) {
    log(`  ✓ 所有 ${progressRecords.length} 条进度记录验证通过`, 'green');
    return { passed: true, message: '用户进度验证通过' };
  } else {
    log(`  ✗ 发现 ${issues.length} 个问题:`, 'red');
    issues.forEach((issue) => log(`    - ${issue}`, 'red'));
    return {
      passed: false,
      message: `用户进度验证失败: ${issues.length}个问题`,
      details: issues,
    };
  }
}

/**
 * 验证2: 题目Level分配
 */
async function validateQuestionLevels(): Promise<ValidationResult> {
  log('\n[验证2] 检查题目Level分配...', 'cyan');

  const questions = await prisma.criticalThinkingQuestion.findMany({
    include: {
      thinkingType: { select: { name: true } },
    },
  });

  const issues: string[] = [];

  for (const question of questions) {
    // 检查level范围 (difficulty字段已移除)
    if (question.level < 1 || question.level > 5) {
      issues.push(
        `题目ID ${question.id}: level=${question.level} 超出范围 (1-5)`
      );
    }
  }

  // 统计各Level题目数量
  const levelCounts = questions.reduce(
    (acc, q) => {
      acc[q.level] = (acc[q.level] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  log(`  题目分布: Level1=${levelCounts[1] || 0}, Level2=${levelCounts[2] || 0}, Level3=${levelCounts[3] || 0}`, 'yellow');

  if (issues.length === 0) {
    log(`  ✓ 所有 ${questions.length} 道题目验证通过`, 'green');
    return { passed: true, message: '题目Level验证通过' };
  } else {
    log(`  ✗ 发现 ${issues.length} 个问题:`, 'red');
    issues.slice(0, 5).forEach((issue) => log(`    - ${issue}`, 'red'));
    if (issues.length > 5) {
      log(`    ... 还有 ${issues.length - 5} 个问题`, 'red');
    }
    return {
      passed: false,
      message: `题目Level验证失败: ${issues.length}个问题`,
      details: issues,
    };
  }
}

/**
 * 验证3: 练习记录Level一致性
 */
async function validatePracticeSessionLevels(): Promise<ValidationResult> {
  log('\n[验证3] 检查练习记录Level一致性...', 'cyan');

  const sessions = await prisma.criticalThinkingPracticeSession.findMany({
    include: {
      question: { select: { level: true, topic: true } },
    },
  });

  const issues: string[] = [];

  for (const session of sessions) {
    if (session.level !== session.question.level) {
      issues.push(
        `练习记录ID ${session.id}: level=${session.level} 但题目level=${session.question.level}`
      );
    }
  }

  if (issues.length === 0) {
    log(`  ✓ 所有 ${sessions.length} 条练习记录验证通过`, 'green');
    return { passed: true, message: '练习记录Level验证通过' };
  } else {
    log(`  ✗ 发现 ${issues.length} 个不一致:`, 'red');
    issues.slice(0, 5).forEach((issue) => log(`    - ${issue}`, 'red'));
    if (issues.length > 5) {
      log(`    ... 还有 ${issues.length - 5} 个问题`, 'red');
    }
    return {
      passed: false,
      message: `练习记录Level验证失败: ${issues.length}个问题`,
      details: issues,
    };
  }
}

/**
 * 验证4: 外键完整性（无孤立数据）
 */
async function validateDataIntegrity(): Promise<ValidationResult> {
  log('\n[验证4] 检查数据完整性（外键约束）...', 'cyan');

  const issues: string[] = [];

  // 检查进度记录的用户和思维类型是否存在
  const progressRecords = await prisma.criticalThinkingProgress.findMany({
    include: {
      user: true,
      thinkingType: true,
    },
  });

  for (const progress of progressRecords) {
    if (!progress.user) {
      issues.push(`进度记录ID ${progress.id}: 关联的用户不存在`);
    }
    if (!progress.thinkingType) {
      issues.push(`进度记录ID ${progress.id}: 关联的思维类型不存在`);
    }
  }

  // 检查题目的思维类型是否存在
  const questions = await prisma.criticalThinkingQuestion.findMany({
    include: {
      thinkingType: true,
    },
  });

  for (const question of questions) {
    if (!question.thinkingType) {
      issues.push(`题目ID ${question.id}: 关联的思维类型不存在`);
    }
  }

  // 检查练习记录的用户和题目是否存在
  const sessions = await prisma.criticalThinkingPracticeSession.findMany({
    include: {
      user: true,
      question: true,
    },
  });

  for (const session of sessions) {
    if (!session.user) {
      issues.push(`练习记录ID ${session.id}: 关联的用户不存在`);
    }
    if (!session.question) {
      issues.push(`练习记录ID ${session.id}: 关联的题目不存在`);
    }
  }

  if (issues.length === 0) {
    log(`  ✓ 所有外键关系完整`, 'green');
    return { passed: true, message: '数据完整性验证通过' };
  } else {
    log(`  ✗ 发现 ${issues.length} 个孤立数据:`, 'red');
    issues.forEach((issue) => log(`    - ${issue}`, 'red'));
    return {
      passed: false,
      message: `数据完整性验证失败: ${issues.length}个问题`,
      details: issues,
    };
  }
}

/**
 * 验证5: Level统计数据准确性
 */
async function validateLevelStatistics(): Promise<ValidationResult> {
  log('\n[验证5] 检查Level统计数据准确性...', 'cyan');

  const progressRecords = await prisma.criticalThinkingProgress.findMany({
    include: {
      user: { select: { email: true } },
      thinkingType: { select: { name: true } },
    },
  });

  const issues: string[] = [];

  for (const progress of progressRecords) {
    // 查询实际练习记录
    const sessions = await prisma.criticalThinkingPracticeSession.findMany({
      where: {
        userId: progress.userId,
        question: {
          thinkingTypeId: progress.thinkingTypeId,
        },
      },
      include: {
        question: { select: { level: true } },
      },
    });

    // 按Level统计
    const actualStats: Record<number, { count: number; totalScore: number }> = {
      1: { count: 0, totalScore: 0 },
      2: { count: 0, totalScore: 0 },
      3: { count: 0, totalScore: 0 },
      4: { count: 0, totalScore: 0 },
      5: { count: 0, totalScore: 0 },
    };

    for (const session of sessions) {
      const level = session.question.level;
      if (level >= 1 && level <= 5) {
        actualStats[level].count++;
        if (session.score !== null) {
          actualStats[level].totalScore += session.score;
        }
      }
    }

    // 验证每个Level的统计
    for (let level = 1; level <= 5; level++) {
      const expectedCount = (progress as any)[`level${level}QuestionsCompleted`];
      const actualCount = actualStats[level].count;

      if (expectedCount !== actualCount) {
        issues.push(
          `${progress.user.email} - ${progress.thinkingType.name} - Level${level}: 记录${expectedCount}题，实际${actualCount}题`
        );
      }

      // 验证平均分（允许小数点误差）
      const expectedAvg = (progress as any)[`level${level}AverageScore`];
      const actualAvg =
        actualCount > 0 ? actualStats[level].totalScore / actualCount : 0;

      if (Math.abs(expectedAvg - actualAvg) > 0.01) {
        issues.push(
          `${progress.user.email} - ${progress.thinkingType.name} - Level${level}: 平均分${expectedAvg.toFixed(2)}，实际${actualAvg.toFixed(2)}`
        );
      }
    }
  }

  if (issues.length === 0) {
    log(`  ✓ 所有 ${progressRecords.length} 条进度的统计数据准确`, 'green');
    return { passed: true, message: 'Level统计验证通过' };
  } else {
    log(`  ✗ 发现 ${issues.length} 个统计错误:`, 'red');
    issues.slice(0, 5).forEach((issue) => log(`    - ${issue}`, 'red'));
    if (issues.length > 5) {
      log(`    ... 还有 ${issues.length - 5} 个问题`, 'red');
    }
    return {
      passed: false,
      message: `Level统计验证失败: ${issues.length}个问题`,
      details: issues,
    };
  }
}

/**
 * 打印验证摘要
 */
function printSummary(results: ValidationResult[]) {
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║        验证结果汇总                  ║', 'blue');
  log('╚════════════════════════════════════════╝\n', 'blue');

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  results.forEach((result, index) => {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} [验证${index + 1}] ${result.message}`, color);
  });

  log('', 'reset');

  if (passedCount === totalCount) {
    log('╔════════════════════════════════════════╗', 'green');
    log('║   ✅ 所有验证通过！                  ║', 'green');
    log('╚════════════════════════════════════════╝\n', 'green');
    log('数据迁移完成且验证通过，可以继续下一步开发。\n', 'green');
  } else {
    log('╔════════════════════════════════════════╗', 'red');
    log(`║   ❌ ${totalCount - passedCount}/${totalCount} 验证失败                  ║`, 'red');
    log('╚════════════════════════════════════════╝\n', 'red');
    log('请修复上述问题后重新运行迁移脚本。\n', 'red');
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    log('\n╔════════════════════════════════════════╗', 'blue');
    log('║   数据迁移验证脚本                  ║', 'blue');
    log('║   Week 1 Day 3-4                     ║', 'blue');
    log('╚════════════════════════════════════════╝', 'blue');

    const results: ValidationResult[] = [];

    // 执行所有验证
    results.push(await validateUserProgress());
    results.push(await validateQuestionLevels());
    results.push(await validatePracticeSessionLevels());
    results.push(await validateDataIntegrity());
    results.push(await validateLevelStatistics());

    // 打印汇总
    printSummary(results);

    // 根据结果设置退出码
    const allPassed = results.every((r) => r.passed);
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    log('\n❌ 验证过程发生错误:', 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行主函数
main();
