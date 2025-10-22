/**
 * 批量生成学习内容脚本 - Week 2 Day 6-8
 *
 * 功能：批量生成5维度×多Level的学习内容
 *
 * 用法：
 *   npx tsx scripts/batch-generate-content.ts --level 1  # 生成Level 1所有内容
 *   npx tsx scripts/batch-generate-content.ts --level 1,2  # 生成Level 1-2所有内容
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

// 维度配置
const DIMENSIONS = [
  'causal_analysis',
  'premise_challenge',
  'fallacy_detection',
  'iterative_reflection',
  'connection_transfer',
];

const CONTENT_TYPES = ['concepts', 'frameworks', 'examples', 'practice_guide'];

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
      `npx tsx scripts/generate-learning-content.ts ${dimension} ${level} ${contentType}`
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
  const args = process.argv.slice(2);

  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║   批量内容生成脚本                  ║', 'blue');
  log('║   Week 2 Day 6-8                     ║', 'blue');
  log('╚════════════════════════════════════════╝\n', 'blue');

  // 解析Level参数
  let levels: number[] = [1]; // 默认Level 1
  const levelArg = args.find((arg) => arg.startsWith('--level'));
  if (levelArg) {
    const levelStr = levelArg.split('=')[1];
    levels = levelStr.split(',').map((l) => parseInt(l.trim()));
  }

  log(`生成Level: ${levels.join(', ')}`, 'yellow');
  log(`维度数量: ${DIMENSIONS.length}`, 'yellow');
  log(`内容类型: ${CONTENT_TYPES.length}`, 'yellow');

  const total = levels.length * DIMENSIONS.length * CONTENT_TYPES.length;
  log(`总计: ${total} 个内容单元\n`, 'yellow');

  // 生成所有内容
  let successCount = 0;
  let failCount = 0;
  let index = 0;

  for (const level of levels) {
    log(`\n${'='.repeat(50)}`, 'blue');
    log(`开始生成 Level ${level} 内容`, 'blue');
    log(`${'='.repeat(50)}\n`, 'blue');

    for (const dimension of DIMENSIONS) {
      for (const contentType of CONTENT_TYPES) {
        index++;

        const success = await generateSingleContent(dimension, level, contentType, index, total);

        if (success) {
          successCount++;
        } else {
          failCount++;
        }

        // 避免API限流，每个请求后等待2秒
        if (index < total) {
          log(`  ⏳ 等待2秒...`, 'yellow');
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }
  }

  // 打印总结
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║           生成结果汇总               ║', 'blue');
  log('╚════════════════════════════════════════╝\n', 'blue');
  log(`✓ 成功: ${successCount}`, 'green');
  log(`✗ 失败: ${failCount}`, 'red');
  log(`总计: ${total}\n`, 'cyan');

  if (failCount > 0) {
    log('⚠ 部分内容生成失败，请检查错误日志', 'yellow');
    process.exit(1);
  } else {
    log('✅ 所有内容生成成功！', 'green');
  }
}

// 执行主函数
main().catch((error) => {
  log(`\n❌ 批量生成失败: ${error}`, 'red');
  process.exit(1);
});
