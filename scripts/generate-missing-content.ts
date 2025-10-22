/**
 * 重新生成缺失的学习内容
 * 基于当前数据库状态，只生成缺失的内容单元
 */

import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

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

const DIMENSIONS = [
  'causal_analysis',
  'premise_challenge',
  'fallacy_detection',
  'iterative_reflection',
  'connection_transfer',
];

const CONTENT_TYPES = ['concepts', 'frameworks', 'examples', 'practice_guide'];

interface MissingContent {
  dimension: string;
  level: number;
  contentType: string;
}

/**
 * 检查哪些内容缺失
 */
async function findMissingContent(): Promise<MissingContent[]> {
  const missing: MissingContent[] = [];

  for (let level = 1; level <= 5; level++) {
    for (const dimension of DIMENSIONS) {
      for (const contentType of CONTENT_TYPES) {
        const existing = await prisma.levelLearningContent.findFirst({
          where: {
            thinkingTypeId: dimension,
            level,
            contentType,
          },
        });

        if (!existing) {
          missing.push({ dimension, level, contentType });
        }
      }
    }
  }

  return missing;
}

/**
 * 生成单个内容
 */
async function generateSingleContent(
  dimension: string,
  level: number,
  contentType: string,
  index: number,
  total: number
): Promise<boolean> {
  log(`\n[${index}/${total}] 生成: ${dimension} - Level ${level} - ${contentType}`, 'cyan');

  try {
    const { stdout, stderr } = await execAsync(
      `npx tsx scripts/generate-learning-content.ts ${dimension} ${level} ${contentType}`,
      { timeout: 300000 } // 5分钟超时
    );

    if (stderr && !stderr.includes('Prisma schema loaded')) {
      log(`  ⚠ 警告: ${stderr}`, 'yellow');
    }

    log(`  ✓ 完成`, 'green');
    return true;
  } catch (error: any) {
    log(`  ✗ 失败: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║   重新生成缺失内容脚本             ║', 'blue');
  log('╚════════════════════════════════════════╝\n', 'blue');

  // 查找缺失的内容
  log('检查缺失的内容...', 'yellow');
  const missing = await findMissingContent();

  if (missing.length === 0) {
    log('\n✅ 所有内容已完整！无需重新生成。\n', 'green');
    return;
  }

  log(`\n发现 ${missing.length} 个缺失的内容单元\n`, 'yellow');

  // 按Level分组显示
  const byLevel: Record<number, MissingContent[]> = {};
  missing.forEach((m) => {
    if (!byLevel[m.level]) byLevel[m.level] = [];
    byLevel[m.level].push(m);
  });

  Object.keys(byLevel)
    .sort()
    .forEach((level) => {
      log(`Level ${level}: ${byLevel[Number(level)].length} 个缺失`, 'cyan');
    });

  log('\n开始重新生成...\n', 'blue');

  // 生成所有缺失内容
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < missing.length; i++) {
    const { dimension, level, contentType } = missing[i];

    const success = await generateSingleContent(
      dimension,
      level,
      contentType,
      i + 1,
      missing.length
    );

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // 避免API限流，每个请求后等待3秒
    if (i < missing.length - 1) {
      log(`  ⏳ 等待3秒...`, 'yellow');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // 打印总结
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║           生成结果汇总               ║', 'blue');
  log('╚════════════════════════════════════════╝\n', 'blue');
  log(`✓ 成功: ${successCount}`, 'green');
  log(`✗ 失败: ${failCount}`, 'red');
  log(`总计: ${missing.length}\n`, 'cyan');

  if (failCount > 0) {
    log('⚠ 部分内容生成失败，请检查网络连接后重新运行此脚本', 'yellow');
    process.exit(1);
  } else {
    log('✅ 所有缺失内容已成功生成！', 'green');
  }
}

// 执行主函数
main()
  .catch((error) => {
    log(`\n❌ 执行失败: ${error}`, 'red');
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
