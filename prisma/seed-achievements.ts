import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const achievements = [
  // ========== 里程碑成就 (Milestone) ==========
  {
    id: 'first_practice',
    name: '初次练习',
    description: '完成第一次思维练习',
    category: 'milestone',
    criteria: {
      type: 'practice_count',
      value: 1,
      scope: 'any'
    },
    badgeIcon: 'star',
    rarity: 1
  },
  {
    id: 'practice_10',
    name: '勤学苦练',
    description: '完成10次思维练习',
    category: 'milestone',
    criteria: {
      type: 'practice_count',
      value: 10,
      scope: 'any'
    },
    badgeIcon: 'target',
    rarity: 2
  },
  {
    id: 'practice_50',
    name: '百炼成钢',
    description: '完成50次思维练习',
    category: 'milestone',
    criteria: {
      type: 'practice_count',
      value: 50,
      scope: 'any'
    },
    badgeIcon: 'trophy',
    rarity: 3
  },
  {
    id: 'practice_100',
    name: '思维大师',
    description: '完成100次思维练习',
    category: 'milestone',
    criteria: {
      type: 'practice_count',
      value: 100,
      scope: 'any'
    },
    badgeIcon: 'crown',
    rarity: 4
  },

  // ========== 连续练习成就 (Streak) ==========
  {
    id: 'streak_3',
    name: '三日坚持',
    description: '连续练习3天',
    category: 'streak',
    criteria: {
      type: 'streak_days',
      value: 3
    },
    badgeIcon: 'calendar',
    rarity: 1
  },
  {
    id: 'streak_7',
    name: '七日连击',
    description: '连续练习7天',
    category: 'streak',
    criteria: {
      type: 'streak_days',
      value: 7
    },
    badgeIcon: 'flame',
    rarity: 2
  },
  {
    id: 'streak_30',
    name: '持之以恒',
    description: '连续练习30天',
    category: 'streak',
    criteria: {
      type: 'streak_days',
      value: 30
    },
    badgeIcon: 'zap',
    rarity: 4
  },

  // ========== 表现成就 (Accuracy) ==========
  {
    id: 'perfect_score',
    name: '完美表现',
    description: '单次练习获得满分(100分)',
    category: 'accuracy',
    criteria: {
      type: 'perfect_score',
      value: 100
    },
    badgeIcon: 'award',
    rarity: 3
  },
  {
    id: 'high_scorer',
    name: '高分选手',
    description: '平均分数达到85分以上',
    category: 'accuracy',
    criteria: {
      type: 'average_score',
      value: 85
    },
    badgeIcon: 'trending-up',
    rarity: 3
  },
  {
    id: 'perfectionist',
    name: '完美主义者',
    description: '连续5次练习都获得90分以上',
    category: 'accuracy',
    criteria: {
      type: 'consecutive_high_scores',
      value: 5,
      threshold: 90
    },
    badgeIcon: 'sparkles',
    rarity: 4
  },

  // ========== 维度掌握成就 (Knowledge) ==========
  {
    id: 'dimension_master_causal',
    name: '因果分析大师',
    description: '在多维归因与利弊权衡维度达到90%正确率',
    category: 'knowledge',
    criteria: {
      type: 'dimension_accuracy',
      dimension: 'causal_analysis',
      value: 90
    },
    badgeIcon: 'search',
    rarity: 4
  },
  {
    id: 'dimension_master_premise',
    name: '前提质疑专家',
    description: '在前提质疑与方法批判维度达到90%正确率',
    category: 'knowledge',
    criteria: {
      type: 'dimension_accuracy',
      dimension: 'premise_challenge',
      value: 90
    },
    badgeIcon: 'help-circle',
    rarity: 4
  },
  {
    id: 'dimension_master_fallacy',
    name: '谬误侦探',
    description: '在谬误检测维度达到90%正确率',
    category: 'knowledge',
    criteria: {
      type: 'dimension_accuracy',
      dimension: 'fallacy_detection',
      value: 90
    },
    badgeIcon: 'eye',
    rarity: 4
  },
  {
    id: 'dimension_master_reflection',
    name: '反思达人',
    description: '在迭代反思维度达到90%正确率',
    category: 'knowledge',
    criteria: {
      type: 'dimension_accuracy',
      dimension: 'iterative_reflection',
      value: 90
    },
    badgeIcon: 'rotate-ccw',
    rarity: 4
  },
  {
    id: 'dimension_master_transfer',
    name: '知识迁移专家',
    description: '在知识迁移维度达到90%正确率',
    category: 'knowledge',
    criteria: {
      type: 'dimension_accuracy',
      dimension: 'connection_transfer',
      value: 90
    },
    badgeIcon: 'link-2',
    rarity: 4
  },
  {
    id: 'all_dimensions_master',
    name: '全维度大师',
    description: '在所有5个思维维度都达到90%正确率',
    category: 'knowledge',
    criteria: {
      type: 'all_dimensions_mastery',
      value: 90
    },
    badgeIcon: 'brain',
    rarity: 5
  },

  // ========== 学习时长成就 (Milestone) ==========
  {
    id: 'study_1_hour',
    name: '初露锋芒',
    description: '累计学习时长达到1小时',
    category: 'milestone',
    criteria: {
      type: 'total_study_time',
      value: 3600 // 秒
    },
    badgeIcon: 'clock',
    rarity: 1
  },
  {
    id: 'study_10_hours',
    name: '刻苦钻研',
    description: '累计学习时长达到10小时',
    category: 'milestone',
    criteria: {
      type: 'total_study_time',
      value: 36000
    },
    badgeIcon: 'timer',
    rarity: 2
  },
  {
    id: 'study_50_hours',
    name: '学海无涯',
    description: '累计学习时长达到50小时',
    category: 'milestone',
    criteria: {
      type: 'total_study_time',
      value: 180000
    },
    badgeIcon: 'book-open',
    rarity: 3
  },

  // ========== 探索成就 (Milestone) ==========
  {
    id: 'first_conversation',
    name: '初次对话',
    description: '与AI导师完成第一次对话',
    category: 'milestone',
    criteria: {
      type: 'conversation_count',
      conversationType: 'ai_tutor',
      value: 1
    },
    badgeIcon: 'message-circle',
    rarity: 1
  },
  {
    id: 'perspective_explorer',
    name: '多元视角探索者',
    description: '完成10次多视角对话练习',
    category: 'milestone',
    criteria: {
      type: 'perspective_count',
      value: 10
    },
    badgeIcon: 'users',
    rarity: 2
  },
  {
    id: 'argument_analyst',
    name: '论证分析师',
    description: '完成20次论证分解练习',
    category: 'milestone',
    criteria: {
      type: 'argument_analysis_count',
      value: 20
    },
    badgeIcon: 'bar-chart',
    rarity: 2
  }
]

async function seedAchievements() {
  console.log('开始植入成就数据...')

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      update: achievement,
      create: achievement
    })
    console.log(`✅ 成就已植入: ${achievement.name}`)
  }

  console.log(`\n🎉 成功植入 ${achievements.length} 个成就!`)
}

seedAchievements()
  .catch((e) => {
    console.error('❌ 植入失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
