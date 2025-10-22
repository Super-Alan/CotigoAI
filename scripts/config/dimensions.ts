/**
 * Theory System V3 - Dimensions and Levels Configuration
 *
 * Defines the 5 core thinking dimensions and their level configurations
 * for the Critical Thinking Theory System
 */

import type { LevelConfig, DimensionConfig } from '../prompts/theory-generation-prompts-v3';

/**
 * 5大核心思维维度配置
 */
export const DIMENSIONS: DimensionConfig[] = [
  {
    id: 'causal_analysis',
    name: '多维归因与利弊权衡',
    description:
      '培养识别真正因果关系的能力，区分相关性与因果性，识别混淆因素，建立可靠的因果推理。',
  },
  {
    id: 'premise_challenge',
    name: '前提质疑与方法批判',
    description:
      '培养质疑隐含前提的能力，识别论证中的未明言假设，重新框定问题，挑战既定方法。',
  },
  {
    id: 'fallacy_detection',
    name: '谬误检测',
    description:
      '培养识别常见逻辑谬误的能力，理解其危害，学会避免思维陷阱。',
  },
  {
    id: 'iterative_reflection',
    name: '迭代反思',
    description:
      '培养元认知能力，识别自己的思维模式，持续改进思维质量。',
  },
  {
    id: 'connection_transfer',
    name: '知识迁移',
    description:
      '培养跨领域迁移能力，识别深层结构相似性，实现知识和技能的广泛应用。',
  },
];

/**
 * Level配置 - 每个维度5个Level
 */
export const DIMENSION_LEVELS: Record<string, LevelConfig[]> = {
  causal_analysis: [
    {
      level: 1,
      levelTitle: '基础因果识别',
      cognitiveLoad: '低',
      learningGoals: [
        '理解因果关系的基本概念',
        '区分时间先后与因果关系',
        '识别简单场景中的因果链',
      ],
      difficulty: 'beginner',
    },
    {
      level: 2,
      levelTitle: '相关性与因果性',
      cognitiveLoad: '中',
      learningGoals: [
        '区分相关性与因果性',
        '识别虚假相关',
        '理解混淆因素的概念',
      ],
      difficulty: 'intermediate',
    },
    {
      level: 3,
      levelTitle: '多因素因果分析',
      cognitiveLoad: '中',
      learningGoals: [
        '识别主要原因与次要原因',
        '分析多因素共同作用',
        '运用控制变量思维',
      ],
      difficulty: 'intermediate',
    },
    {
      level: 4,
      levelTitle: '因果链与反馈循环',
      cognitiveLoad: '高',
      learningGoals: [
        '分析复杂因果链',
        '识别正反馈与负反馈',
        '理解系统性因果关系',
      ],
      difficulty: 'advanced',
    },
    {
      level: 5,
      levelTitle: '因果推理的综合应用',
      cognitiveLoad: '高',
      learningGoals: [
        '综合运用多种因果分析方法',
        '在复杂场景中建立因果模型',
        '评估因果推理的可靠性',
      ],
      difficulty: 'advanced',
    },
  ],

  premise_challenge: [
    {
      level: 1,
      levelTitle: '识别明显前提',
      cognitiveLoad: '低',
      learningGoals: [
        '理解什么是前提',
        '识别明确陈述的前提',
        '区分前提与结论',
      ],
      difficulty: 'beginner',
    },
    {
      level: 2,
      levelTitle: '发现隐含假设',
      cognitiveLoad: '中',
      learningGoals: [
        '识别未明言的假设',
        '理解隐含前提的作用',
        '质疑常见假设',
      ],
      difficulty: 'intermediate',
    },
    {
      level: 3,
      levelTitle: '前提的合理性检验',
      cognitiveLoad: '中',
      learningGoals: [
        '评估前提的合理性',
        '寻找反例',
        '提出替代前提',
      ],
      difficulty: 'intermediate',
    },
    {
      level: 4,
      levelTitle: '重新框定问题',
      cognitiveLoad: '高',
      learningGoals: [
        '挑战问题框架',
        '识别框架背后的假设',
        '提出新的问题框架',
      ],
      difficulty: 'advanced',
    },
    {
      level: 5,
      levelTitle: '方法论批判',
      cognitiveLoad: '高',
      learningGoals: [
        '质疑方法论假设',
        '评估方法的适用性',
        '提出改进方法',
      ],
      difficulty: 'advanced',
    },
  ],

  fallacy_detection: [
    {
      level: 1,
      levelTitle: '常见逻辑谬误',
      cognitiveLoad: '低',
      learningGoals: [
        '认识5种基本逻辑谬误',
        '理解谬误的危害',
        '识别简单场景中的谬误',
      ],
      difficulty: 'beginner',
    },
    {
      level: 2,
      levelTitle: '论证结构谬误',
      cognitiveLoad: '中',
      learningGoals: [
        '识别论证结构问题',
        '理解循环论证',
        '发现偷换概念',
      ],
      difficulty: 'intermediate',
    },
    {
      level: 3,
      levelTitle: '情感与权威谬误',
      cognitiveLoad: '中',
      learningGoals: [
        '识别诉诸情感的谬误',
        '识别诉诸权威的谬误',
        '理解人身攻击谬误',
      ],
      difficulty: 'intermediate',
    },
    {
      level: 4,
      levelTitle: '统计与数据谬误',
      cognitiveLoad: '高',
      learningGoals: [
        '识别统计数据的误用',
        '理解样本偏差',
        '发现数据操纵',
      ],
      difficulty: 'advanced',
    },
    {
      level: 5,
      levelTitle: '综合谬误识别',
      cognitiveLoad: '高',
      learningGoals: [
        '在复杂论证中识别多种谬误',
        '分析谬误的组合使用',
        '构建无谬误的论证',
      ],
      difficulty: 'advanced',
    },
  ],

  iterative_reflection: [
    {
      level: 1,
      levelTitle: '基础思维觉察',
      cognitiveLoad: '低',
      learningGoals: [
        '觉察自己的思维过程',
        '识别思维习惯',
        '记录思维模式',
      ],
      difficulty: 'beginner',
    },
    {
      level: 2,
      levelTitle: '识别思维偏差',
      cognitiveLoad: '中',
      learningGoals: [
        '认识常见认知偏差',
        '识别自己的思维盲点',
        '理解偏差的影响',
      ],
      difficulty: 'intermediate',
    },
    {
      level: 3,
      levelTitle: '反思与改进',
      cognitiveLoad: '中',
      learningGoals: [
        '系统性反思思维过程',
        '从错误中学习',
        '制定改进计划',
      ],
      difficulty: 'intermediate',
    },
    {
      level: 4,
      levelTitle: '元认知策略',
      cognitiveLoad: '高',
      learningGoals: [
        '运用元认知策略',
        '监控思维质量',
        '调整思维策略',
      ],
      difficulty: 'advanced',
    },
    {
      level: 5,
      levelTitle: '持续思维优化',
      cognitiveLoad: '高',
      learningGoals: [
        '建立思维反馈循环',
        '持续追踪思维进步',
        '培养批判性思维习惯',
      ],
      difficulty: 'advanced',
    },
  ],

  connection_transfer: [
    {
      level: 1,
      levelTitle: '识别表面相似性',
      cognitiveLoad: '低',
      learningGoals: [
        '识别明显的相似案例',
        '理解类比推理',
        '简单场景迁移',
      ],
      difficulty: 'beginner',
    },
    {
      level: 2,
      levelTitle: '结构相似性识别',
      cognitiveLoad: '中',
      learningGoals: [
        '识别深层结构相似性',
        '区分表面与本质相似',
        '跨领域类比',
      ],
      difficulty: 'intermediate',
    },
    {
      level: 3,
      levelTitle: '原理抽象与迁移',
      cognitiveLoad: '中',
      learningGoals: [
        '从具体案例抽象原理',
        '将原理应用到新场景',
        '评估迁移的有效性',
      ],
      difficulty: 'intermediate',
    },
    {
      level: 4,
      levelTitle: '跨学科知识整合',
      cognitiveLoad: '高',
      learningGoals: [
        '整合不同学科的知识',
        '识别跨学科的共同模式',
        '创造性应用知识',
      ],
      difficulty: 'advanced',
    },
    {
      level: 5,
      levelTitle: '创新性知识迁移',
      cognitiveLoad: '高',
      learningGoals: [
        '在全新领域应用已有知识',
        '创造新的思维模型',
        '解决复杂跨域问题',
      ],
      difficulty: 'advanced',
    },
  ],
};

/**
 * Helper: Get dimension by ID
 */
export function getDimensionById(dimensionId: string): DimensionConfig | undefined {
  return DIMENSIONS.find((d) => d.id === dimensionId);
}

/**
 * Helper: Get level config by dimension and level number
 */
export function getLevelConfig(
  dimensionId: string,
  level: number
): LevelConfig | undefined {
  const levels = DIMENSION_LEVELS[dimensionId];
  if (!levels) return undefined;
  return levels.find((l) => l.level === level);
}

/**
 * Helper: Get all dimension IDs
 */
export function getAllDimensionIds(): string[] {
  return DIMENSIONS.map((d) => d.id);
}

/**
 * Helper: Validate dimension and level
 */
export function validateDimensionLevel(
  dimensionId: string,
  level: number
): { valid: boolean; error?: string } {
  const dimension = getDimensionById(dimensionId);
  if (!dimension) {
    return { valid: false, error: `Invalid dimension: ${dimensionId}` };
  }

  if (level < 1 || level > 5) {
    return { valid: false, error: `Invalid level: ${level} (must be 1-5)` };
  }

  const levelConfig = getLevelConfig(dimensionId, level);
  if (!levelConfig) {
    return {
      valid: false,
      error: `Level ${level} not found for dimension ${dimensionId}`,
    };
  }

  return { valid: true };
}
