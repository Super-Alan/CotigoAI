/**
 * 学习内容生成脚本 - Week 1 Day 5
 *
 * 功能：使用AI生成5维度×5级别的学习内容
 *
 * 用法：
 *   npx tsx scripts/generate-learning-content.ts [dimension] [level] [contentType]
 *
 * 示例：
 *   npx tsx scripts/generate-learning-content.ts causal_analysis 1 concepts
 *   npx tsx scripts/generate-learning-content.ts --all  # 生成所有内容
 */

import { PrismaClient } from '@prisma/client';
import { aiRouter } from '@/lib/ai/router';

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

// 维度配置
const DIMENSIONS = {
  causal_analysis: {
    id: 'causal_analysis',
    name: '多维归因与利弊权衡',
    description: '因果分析能力',
  },
  premise_challenge: {
    id: 'premise_challenge',
    name: '前提质疑与方法批判',
    description: '前提质疑能力',
  },
  fallacy_detection: {
    id: 'fallacy_detection',
    name: '谬误检测',
    description: '逻辑谬误识别能力',
  },
  iterative_reflection: {
    id: 'iterative_reflection',
    name: '迭代反思',
    description: '元认知和反思能力',
  },
  connection_transfer: {
    id: 'connection_transfer',
    name: '关联和迁移',
    description: '知识迁移能力',
  },
};

// 内容类型
type ContentType = 'concepts' | 'frameworks' | 'examples' | 'practice_guide';

/**
 * 构建生成Prompt
 */
function buildPrompt(
  dimension: string,
  level: number,
  contentType: ContentType
): string {
  const dimensionName = DIMENSIONS[dimension as keyof typeof DIMENSIONS]?.name || dimension;

  const basePrompts = {
    concepts: `你是批判性思维教育专家，需要为**Level ${level}学习者**编写"${dimensionName}"维度的**概念讲解**内容。

## 学习目标
${getLearningObjectives(dimension, level, 'concepts')}

## 认知负荷: ${getCognitiveLoad(level)}

## 内容要求

### 1. 核心概念
- 使用通俗易懂的语言定义核心概念
- 提供清晰的例子和类比
- 避免过度学术化

### 2. 关键知识点
- 列出3-5个关键知识点
- 每个知识点包含定义和示例
- 使用表格或列表增强可读性

### 3. 常见误区
- 指出2-3个学习者容易犯的错误
- 解释为什么会犯这些错误
- 提供正确的思考方式

### 4. 实际应用
- 至少3个真实场景的应用
- 涵盖日常生活、学习、工作等领域

### 5. 快速自测
- 提供3个简单的自测问题
- 帮助学习者检验理解程度

## 输出格式
使用Markdown格式，结构清晰，包含：
- 一级标题 (#)
- 二级标题 (##)
- 三级标题 (###)
- 列表（有序和无序）
- 表格
- 代码块（如果需要）
- 引用块（用于重点提示）

## 预计阅读时间: ${getEstimatedTime(level, 'concepts')}分钟

请直接输出Markdown内容，不要包含其他说明文字。`,

    frameworks: `你是批判性思维教育专家，需要为**Level ${level}学习者**设计"${dimensionName}"的**实用分析框架**。

## 学习目标
${getLearningObjectives(dimension, level, 'frameworks')}

## 框架要求

### 框架名称
简洁、易记的名称（例如：三步法、ABCD框架等）

### 框架结构
设计3-5个清晰的步骤或维度，每个步骤包含：
- 步骤名称和目的
- 3-4个关键问题
- 具体的操作方法
- 注意事项

### 应用示例
提供一个完整的案例，展示如何应用该框架：
- 场景描述（100-150字）
- 每个步骤的详细分析
- 最终结论

### 可视化工具
提供文本格式的检查清单或流程图（ASCII art）

### 框架局限性
说明该框架的适用范围和局限性

## 输出格式
使用Markdown格式，包含清晰的步骤化结构。

## 预计阅读时间: ${getEstimatedTime(level, 'frameworks')}分钟

请直接输出Markdown内容，不要包含其他说明文字。`,

    examples: `你是批判性思维教育专家，需要为**Level ${level}学习者**编写"${dimensionName}"的**典型案例分析**。

## 学习目标
${getLearningObjectives(dimension, level, 'examples')}

## 案例要求

### 1. 案例背景（200-300字）
- 描述一个真实或高度仿真的场景
- 提供必要的背景信息和数据
- 设置明确的问题情境

### 2. 问题设定
- 提出2-3个思考问题
- 问题层层递进
- 引导深入思考

### 3. 分析过程（600-800字）
- 运用该维度的思维方法进行分析
- 展示完整的思考过程
- 指出关键洞察点

### 4. 多角度视角
- 从至少2个不同角度分析
- 对比不同观点
- 说明每种观点的优缺点

### 5. 关键启示
- 总结3-5个关键启示
- 说明如何应用到其他场景
- 提供延伸思考问题

### 6. 反思与讨论
- 提出2-3个开放性问题
- 鼓励读者批判性思考

## 案例类型
选择以下之一：
- 日常生活场景
- 社会热点问题
- 商业决策案例
- 科学研究问题
- 教育场景

## 输出格式
使用Markdown格式，叙事清晰，逻辑严密。

## 预计阅读时间: ${getEstimatedTime(level, 'examples')}分钟

请直接输出Markdown内容，不要包含其他说明文字。`,

    practice_guide: `你是批判性思维教育专家，需要为**Level ${level}学习者**编写"${dimensionName}"的**实践练习指南**。

## 学习目标
${getLearningObjectives(dimension, level, 'practice_guide')}

## 指南要求

### 1. 练习目标
- 明确说明通过练习要达到的能力
- 列出3-5个具体的练习目标

### 2. 练习类型
设计3-4种不同类型的练习：
- 基础练习：强化基本概念
- 应用练习：实际场景应用
- 综合练习：整合多个知识点
- 反思练习：元认知训练

### 3. 练习步骤
每种练习提供：
- 练习说明（如何做）
- 时间建议
- 难度标记
- 自我评估标准

### 4. 示例题目
为每种练习类型提供1-2个示例题目和参考答案

### 5. 常见问题
列出练习中常见的困难和解决方法

### 6. 进阶建议
- 如何提高练习效果
- 下一步学习方向
- 推荐资源

## 练习难度
适合Level ${level}学习者，循序渐进。

## 输出格式
使用Markdown格式，结构化的练习设计。

## 预计完成时间: ${getEstimatedTime(level, 'practice_guide')}分钟

请直接输出Markdown内容，不要包含其他说明文字。`,
  };

  return basePrompts[contentType];
}

/**
 * 获取学习目标
 */
function getLearningObjectives(
  dimension: string,
  level: number,
  contentType: ContentType
): string {
  const objectives: Record<string, Record<number, string>> = {
    causal_analysis: {
      1: '- 区分相关性与因果性的基本概念\n- 识别简单场景中的因果关系\n- 避免后此谬误等基础错误',
      2: '- 理解混淆变量的影响\n- 掌握基础的因果推理方法\n- 分析多因素场景中的因果关系',
      3: '- 运用系统化方法分析复杂因果关系\n- 识别因果链条和反馈循环\n- 评估证据的质量和可靠性',
    },
    premise_challenge: {
      1: '- 识别论证中的明显前提\n- 理解前提对结论的影响\n- 提出基础的质疑问题',
      2: '- 发现隐含前提\n- 评估前提的合理性\n- 重构论证结构',
      3: '- 深入分析前提的层次结构\n- 质疑研究方法和数据来源\n- 提出替代性框架',
    },
  };

  return objectives[dimension]?.[level] || '- 待定义的学习目标';
}

/**
 * 获取认知负荷
 */
function getCognitiveLoad(level: number): string {
  const loads = {
    1: '低',
    2: '中低',
    3: '中等',
    4: '中高',
    5: '高',
  };
  return loads[level as keyof typeof loads] || '中等';
}

/**
 * 获取预计时间
 */
function getEstimatedTime(level: number, contentType: ContentType): number {
  const baseTimes = {
    concepts: { 1: 15, 2: 20, 3: 25, 4: 30, 5: 35 },
    frameworks: { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30 },
    examples: { 1: 20, 2: 25, 3: 30, 4: 35, 5: 40 },
    practice_guide: { 1: 25, 2: 30, 3: 35, 4: 40, 5: 45 },
  };

  return baseTimes[contentType][level as keyof typeof baseTimes[typeof contentType]] || 20;
}

/**
 * 使用AI生成内容
 */
async function generateContent(
  dimension: string,
  level: number,
  contentType: ContentType
): Promise<string> {
  log(
    `\n[生成] ${DIMENSIONS[dimension as keyof typeof DIMENSIONS]?.name} - Level ${level} - ${contentType}`,
    'cyan'
  );

  const prompt = buildPrompt(dimension, level, contentType);

  try {
    const response = await aiRouter.chat(
      [
        {
          role: 'system',
          content:
            '你是批判性思维教育专家，擅长创作清晰、实用、有启发性的学习内容。请严格按照要求输出Markdown格式的内容。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      { stream: false }
    );

    // aiRouter.chat 返回 string | ReadableStream，这里不使用stream所以是string
    if (typeof response !== 'string') {
      throw new Error('AI返回类型错误，期望字符串');
    }

    if (!response || response.trim().length === 0) {
      throw new Error('AI返回内容为空');
    }

    log('  ✓ 内容生成成功', 'green');
    return response;
  } catch (error) {
    log(`  ✗ 生成失败: ${error}`, 'red');
    throw error;
  }
}

/**
 * 保存内容到数据库
 */
async function saveContent(
  dimension: string,
  level: number,
  contentType: ContentType,
  content: string,
  orderIndex: number = 1
): Promise<void> {
  const dimensionConfig = DIMENSIONS[dimension as keyof typeof DIMENSIONS];
  if (!dimensionConfig) {
    throw new Error(`未知的维度: ${dimension}`);
  }

  // 确保思维类型存在
  const thinkingType = await prisma.thinkingType.findUnique({
    where: { id: dimension },
  });

  if (!thinkingType) {
    log(`  ⚠ 思维类型 ${dimension} 不存在，跳过保存`, 'yellow');
    return;
  }

  // 生成标题
  const title = generateTitle(dimension, level, contentType);

  // 生成描述
  const description = generateDescription(dimension, level, contentType);

  // 将Markdown内容转换为JSON结构
  const contentJson = {
    markdown: content,
    sections: parseMarkdownSections(content),
  };

  // 预计时间
  const estimatedTime = getEstimatedTime(level, contentType);

  try {
    // 检查是否已存在
    const existing = await prisma.levelLearningContent.findFirst({
      where: {
        thinkingTypeId: dimension,
        level,
        contentType,
      },
    });

    if (existing) {
      log(`  ⚠ 内容已存在，更新中...`, 'yellow');
      await prisma.levelLearningContent.update({
        where: { id: existing.id },
        data: {
          title,
          description,
          content: contentJson,
          estimatedTime,
          orderIndex,
          tags: generateTags(dimension, level, contentType),
          prerequisites: generatePrerequisites(dimension, level, contentType),
        },
      });
      log(`  ✓ 内容已更新到数据库`, 'green');
    } else {
      await prisma.levelLearningContent.create({
        data: {
          thinkingTypeId: dimension,
          level,
          contentType,
          title,
          description,
          content: contentJson,
          estimatedTime,
          orderIndex,
          tags: generateTags(dimension, level, contentType),
          prerequisites: generatePrerequisites(dimension, level, contentType),
        },
      });
      log(`  ✓ 内容已保存到数据库`, 'green');
    }
  } catch (error) {
    log(`  ✗ 保存失败: ${error}`, 'red');
    throw error;
  }
}

/**
 * 生成标题
 */
function generateTitle(dimension: string, level: number, contentType: ContentType): string {
  const dimensionName = DIMENSIONS[dimension as keyof typeof DIMENSIONS]?.name || dimension;
  const typeName = {
    concepts: '概念讲解',
    frameworks: '分析框架',
    examples: '典型案例',
    practice_guide: '实践指南',
  }[contentType];

  return `${dimensionName} - Level ${level} - ${typeName}`;
}

/**
 * 生成描述
 */
function generateDescription(dimension: string, level: number, contentType: ContentType): string {
  const descriptions = {
    concepts: `Level ${level} 的核心概念讲解，帮助学习者建立扎实的理论基础`,
    frameworks: `Level ${level} 的实用分析框架，提供系统化的思维工具`,
    examples: `Level ${level} 的典型案例分析，通过实例加深理解`,
    practice_guide: `Level ${level} 的实践练习指南，巩固所学知识和技能`,
  };

  return descriptions[contentType];
}

/**
 * 生成标签
 */
function generateTags(dimension: string, level: number, contentType: ContentType): string[] {
  const baseTags = [
    `Level${level}`,
    contentType,
    DIMENSIONS[dimension as keyof typeof DIMENSIONS]?.name || dimension,
  ];

  const levelTags = {
    1: ['入门', '基础'],
    2: ['进阶', '应用'],
    3: ['中级', '综合'],
    4: ['高级', '深入'],
    5: ['专家', '精通'],
  };

  return [...baseTags, ...(levelTags[level as keyof typeof levelTags] || [])];
}

/**
 * 生成前置内容
 */
function generatePrerequisites(
  dimension: string,
  level: number,
  contentType: ContentType
): string[] {
  // Level 1 没有前置要求
  if (level === 1) {
    return [];
  }

  // 更高级别需要先完成前一个Level的相同内容类型
  // 这里返回空数组，实际的前置ID需要在内容全部生成后再更新
  return [];
}

/**
 * 解析Markdown为sections
 */
function parseMarkdownSections(markdown: string): any[] {
  // 简单的section解析，将markdown按一级标题分段
  const sections: any[] = [];
  const lines = markdown.split('\n');
  let currentSection: any = null;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'text',
        title: line.substring(2).trim(),
        content: '',
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections.length > 0 ? sections : [{ type: 'text', title: '内容', content: markdown }];
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║   学习内容生成脚本                  ║', 'blue');
  log('║   Week 1 Day 5                       ║', 'blue');
  log('╚════════════════════════════════════════╝\n', 'blue');

  try {
    if (args[0] === '--test') {
      // 测试模式：生成5个示例内容
      log('测试模式：生成5个示例内容\n', 'yellow');

      const testCases = [
        { dimension: 'causal_analysis', level: 1, contentType: 'concepts' as ContentType },
        { dimension: 'causal_analysis', level: 1, contentType: 'frameworks' as ContentType },
        { dimension: 'causal_analysis', level: 1, contentType: 'examples' as ContentType },
        { dimension: 'causal_analysis', level: 1, contentType: 'practice_guide' as ContentType },
        { dimension: 'premise_challenge', level: 1, contentType: 'concepts' as ContentType },
      ];

      for (let i = 0; i < testCases.length; i++) {
        const { dimension, level, contentType } = testCases[i];
        log(`\n[${i + 1}/5] 生成内容...`, 'cyan');

        const content = await generateContent(dimension, level, contentType);
        await saveContent(dimension, level, contentType, content, i + 1);

        // 避免API限流
        if (i < testCases.length - 1) {
          log('  ⏳ 等待2秒...', 'yellow');
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      log('\n✅ 测试完成！已生成5个示例内容\n', 'green');
    } else if (args.length === 3) {
      // 单个内容生成
      const [dimension, levelStr, contentType] = args;
      const level = parseInt(levelStr);

      if (!DIMENSIONS[dimension as keyof typeof DIMENSIONS]) {
        log(`❌ 错误：未知的维度 "${dimension}"`, 'red');
        log(`可用维度: ${Object.keys(DIMENSIONS).join(', ')}`, 'yellow');
        process.exit(1);
      }

      if (level < 1 || level > 5) {
        log(`❌ 错误：Level必须在1-5之间`, 'red');
        process.exit(1);
      }

      const validContentTypes = ['concepts', 'frameworks', 'examples', 'practice_guide'];
      if (!validContentTypes.includes(contentType)) {
        log(`❌ 错误：未知的内容类型 "${contentType}"`, 'red');
        log(`可用类型: ${validContentTypes.join(', ')}`, 'yellow');
        process.exit(1);
      }

      const content = await generateContent(dimension, level, contentType as ContentType);
      await saveContent(dimension, level, contentType as ContentType, content);

      log('\n✅ 内容生成完成！\n', 'green');
    } else {
      // 显示使用说明
      log('用法:', 'yellow');
      log('  npx tsx scripts/generate-learning-content.ts <dimension> <level> <contentType>', 'cyan');
      log('  npx tsx scripts/generate-learning-content.ts --test', 'cyan');
      log('\n示例:', 'yellow');
      log('  npx tsx scripts/generate-learning-content.ts causal_analysis 1 concepts', 'cyan');
      log('  npx tsx scripts/generate-learning-content.ts --test', 'cyan');
      log('\n可用维度:', 'yellow');
      Object.keys(DIMENSIONS).forEach((key) => {
        log(`  - ${key}`, 'cyan');
      });
      log('\n可用级别: 1, 2, 3, 4, 5', 'yellow');
      log('\n可用内容类型:', 'yellow');
      log('  - concepts (概念讲解)', 'cyan');
      log('  - frameworks (分析框架)', 'cyan');
      log('  - examples (典型案例)', 'cyan');
      log('  - practice_guide (实践指南)', 'cyan');
    }
  } catch (error) {
    log('\n❌ 生成失败:', 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行主函数
main();
