# 批判性思维理论体系质量改进 - 实施路线图

## 📋 改进总览

### 核心问题与解决方案

| 问题 | 现状 | 目标 | 解决方案 |
|------|------|------|----------|
| **思维模型过于简洁** | 步骤描述50-100字,无关键思考点 | 步骤描述300-500字,包含思考点和陷阱 | 重新设计JSON Schema,增强AI Prompt |
| **核心概念缺乏结构** | 长段落文本,重点不突出 | 多层级分解,批判性思维框架 | 引入conceptBreakdown和criticalThinkingFramework |
| **实例演示脱节** | 案例独立,未关联理论 | 每步标注使用的概念/模型 | 增加theoreticalFoundation和conceptApplied字段 |

---

## 🏗️ 技术架构改进

### 数据库Schema变更

参考: `02-DATA-ARCHITECTURE-V3.md`

**新增字段**:
```sql
ALTER TABLE theory_content
ADD COLUMN "qualityMetrics" JSONB,
ADD COLUMN "validationStatus" TEXT DEFAULT 'draft',
ADD COLUMN "validationErrors" JSONB,
ADD COLUMN "reviewNotes" TEXT,
ADD COLUMN "feedbackCount" INTEGER DEFAULT 0;

CREATE INDEX idx_theory_content_validation_status
ON theory_content(validation_status);
```

**新增反馈表**:
```sql
CREATE TABLE theory_content_feedback (
  id TEXT PRIMARY KEY,
  theory_content_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL,
  section TEXT NOT NULL,
  rating INTEGER,
  comment TEXT NOT NULL,
  specific_issue JSONB,
  status TEXT DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### JSON结构增强

参考: `02-DATA-ARCHITECTURE-V3.md` 中的TypeScript类型定义

**核心概念新增**:
- `coreIdea`: 一句话精髓
- `conceptBreakdown`: 多层级分解 (level1/level2/level3)
- `criticalThinkingFramework`: 批判性思维检验步骤
- `visualizationGuide.structure`: 详细可视化结构

**思维模型新增**:
- `coreLogic`: 框架核心逻辑 (principle/whenWorks/whenFails)
- `steps[].keyThinkingPoints`: 关键思考点 (3-5个)
- `steps[].commonPitfalls`: 常见陷阱 (2-3个)
- `steps[].nextStepRationale`: 下一步理由
- `fullApplicationExample`: 完整应用案例

**实例演示新增**:
- `learningObjective`: 学习目标
- `theoreticalFoundation`: 理论基础 (关联概念和模型)
- `stepByStepAnalysis[].conceptApplied`: 使用的概念
- `stepByStepAnalysis[].criticalThinkingPoint`: 关键思考点
- `keyInsights[].generalPrinciple`: 可迁移通用原则
- `transferableSkills`: 可迁移技能列表

---

## 📝 AI Prompt改进

参考: `05-CONTENT-GENERATION-V3.md`

### 核心改进点

1. **强制详细度要求**:
   - 思维模型步骤: ≥300字
   - 实例演示分析: ≥200字/步
   - 明确标注"必须严格遵守!"

2. **结构化要求**:
   - 多层级概念分解
   - 批判性思维框架
   - 完整应用案例

3. **理论关联要求**:
   - 实例演示必须标注使用的概念和模型
   - 提炼可迁移的通用原则

4. **质量检查项**:
   - 字数要求明确
   - 必填字段列表
   - 示例参考

---

## 🔧 生成脚本更新

### 创建 `generate-theory-content-v3.ts`

```typescript
// scripts/generate-theory-content-v3.ts

import { PrismaClient } from '@prisma/client';
import { aiRouter } from '../src/lib/ai/router';
import { TheoryContentValidator } from './validators/theory-content-validator';

const prisma = new PrismaClient();
const validator = new TheoryContentValidator();

// 导入新的Prompt模板
import {
  CONCEPTS_PROMPT_V3,
  MODELS_PROMPT_V3,
  DEMONSTRATIONS_PROMPT_V3,
} from './prompts/theory-generation-prompts-v3';

// 导入维度配置
import { DIMENSIONS, DIMENSION_LEVELS } from './config/dimensions';

async function generateTheoryContentV3(
  dimensionId: string,
  level: number,
  options: {
    validate?: boolean;
    retry?: boolean;
    maxRetries?: number;
  } = {}
) {
  const { validate = true, retry = true, maxRetries = 3 } = options;

  console.log(`\n🚀 开始生成: ${dimensionId} Level ${level}`);

  const dimension = DIMENSIONS.find((d) => d.id === dimensionId);
  const levelInfo = DIMENSION_LEVELS[dimensionId]?.find((l) => l.level === level);

  if (!dimension || !levelInfo) {
    throw new Error(`Invalid dimension or level: ${dimensionId} Level ${level}`);
  }

  let attemptCount = 0;
  let conceptsContent: any;
  let modelsContent: any;
  let demonstrationsContent: any;

  // 生成核心概念 (带重试)
  while (attemptCount < maxRetries) {
    try {
      console.log(`\n📚 生成核心概念... (尝试 ${attemptCount + 1}/${maxRetries})`);

      const conceptsPrompt = CONCEPTS_PROMPT_V3(dimension, levelInfo);
      const conceptsResponse = await aiRouter.chat(
        [{ role: 'user', content: conceptsPrompt }],
        {
          model: 'deepseek-v3.1',
          temperature: 0.7,
          stream: false,
        }
      );

      conceptsContent = JSON.parse(conceptsResponse as string);

      if (validate) {
        const validation = validator.validateConcepts(conceptsContent);
        if (!validation.isValid) {
          console.error(`❌ 核心概念验证失败:`);
          validation.errors.forEach((err) => console.error(`  - ${err}`));

          if (retry && attemptCount < maxRetries - 1) {
            console.log(`🔄 重试生成...`);
            attemptCount++;
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          } else {
            throw new Error('核心概念质量验证失败');
          }
        } else {
          console.log(`✅ 核心概念验证通过 (评分: ${validation.score}/100)`);
          console.log(`   - 概念数量: ${validation.metrics.totalConcepts}`);
          console.log(`   - 结构化程度: ${validation.metrics.conceptsWithBreakdown}/${validation.metrics.totalConcepts}`);
          break;
        }
      } else {
        break;
      }
    } catch (error) {
      console.error(`❌ 核心概念生成失败: ${error}`);
      if (retry && attemptCount < maxRetries - 1) {
        attemptCount++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        throw error;
      }
    }
  }

  // 生成思维模型 (带重试)
  attemptCount = 0;
  while (attemptCount < maxRetries) {
    try {
      console.log(`\n🧩 生成思维模型... (尝试 ${attemptCount + 1}/${maxRetries})`);

      const modelsPrompt = MODELS_PROMPT_V3(dimension, levelInfo);
      const modelsResponse = await aiRouter.chat(
        [{ role: 'user', content: modelsPrompt }],
        {
          model: 'deepseek-v3.1',
          temperature: 0.7,
          stream: false,
        }
      );

      modelsContent = JSON.parse(modelsResponse as string);

      if (validate) {
        const validation = validator.validateModels(modelsContent);
        if (!validation.isValid) {
          console.error(`❌ 思维模型验证失败:`);
          validation.errors.forEach((err) => console.error(`  - ${err}`));

          if (retry && attemptCount < maxRetries - 1) {
            console.log(`🔄 重试生成...`);
            attemptCount++;
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          } else {
            throw new Error('思维模型质量验证失败');
          }
        } else {
          console.log(`✅ 思维模型验证通过 (评分: ${validation.score}/100)`);
          console.log(`   - 模型数量: ${validation.metrics.totalModels}`);
          console.log(`   - 平均步骤数: ${validation.metrics.avgStepsPerModel.toFixed(1)}`);
          console.log(`   - 平均步骤字数: ${Math.round(validation.metrics.avgWordCountPerStep)}`);
          break;
        }
      } else {
        break;
      }
    } catch (error) {
      console.error(`❌ 思维模型生成失败: ${error}`);
      if (retry && attemptCount < maxRetries - 1) {
        attemptCount++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        throw error;
      }
    }
  }

  // 生成实例演示 (带重试)
  attemptCount = 0;
  while (attemptCount < maxRetries) {
    try {
      console.log(`\n💡 生成实例演示... (尝试 ${attemptCount + 1}/${maxRetries})`);

      // 传递已生成的概念和模型信息
      const conceptsList = conceptsContent.concepts.map((c: any) => c.name).join(', ');
      const modelsList = modelsContent.models.map((m: any) => m.name).join(', ');

      const demonstrationsPrompt = DEMONSTRATIONS_PROMPT_V3(dimension, levelInfo, conceptsList, modelsList);
      const demonstrationsResponse = await aiRouter.chat(
        [{ role: 'user', content: demonstrationsPrompt }],
        {
          model: 'deepseek-v3.1',
          temperature: 0.7,
          stream: false,
        }
      );

      demonstrationsContent = JSON.parse(demonstrationsResponse as string);

      if (validate) {
        const validation = validator.validateDemonstrations(demonstrationsContent);
        if (!validation.isValid) {
          console.error(`❌ 实例演示验证失败:`);
          validation.errors.forEach((err) => console.error(`  - ${err}`));

          if (retry && attemptCount < maxRetries - 1) {
            console.log(`🔄 重试生成...`);
            attemptCount++;
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          } else {
            throw new Error('实例演示质量验证失败');
          }
        } else {
          console.log(`✅ 实例演示验证通过 (评分: ${validation.score}/100)`);
          console.log(`   - 案例数量: ${validation.metrics.totalDemonstrations}`);
          console.log(`   - 理论关联率: ${Math.round((validation.metrics.stepsWithTheoryLink / (validation.metrics.totalDemonstrations * validation.metrics.avgStepsPerDemo)) * 100)}%`);
          break;
        }
      } else {
        break;
      }
    } catch (error) {
      console.error(`❌ 实例演示生成失败: ${error}`);
      if (retry && attemptCount < maxRetries - 1) {
        attemptCount++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        throw error;
      }
    }
  }

  // 计算质量指标
  const qualityMetrics = calculateQualityMetrics(conceptsContent, modelsContent, demonstrationsContent);

  // 保存到数据库
  console.log(`\n💾 保存到数据库...`);

  const theoryContent = await prisma.theoryContent.create({
    data: {
      thinkingTypeId: dimensionId,
      level,
      title: `Level ${level}: ${levelInfo.title}`,
      subtitle: `${dimension.name}的${levelInfo.title}阶段`,
      description: levelInfo.description,
      learningObjectives: levelInfo.objectives,

      conceptsIntro: conceptsContent.intro,
      conceptsContent: conceptsContent.concepts,

      modelsIntro: modelsContent.intro,
      modelsContent: modelsContent.models,

      demonstrationsIntro: demonstrationsContent.intro,
      demonstrationsContent: demonstrationsContent.demonstrations,

      estimatedTime: calculateEstimatedTime(level),
      difficulty: levelInfo.difficulty,
      tags: [dimensionId, `level-${level}`, levelInfo.difficulty],
      keywords: extractKeywords(conceptsContent, modelsContent),
      prerequisites: level > 1 ? [`${dimensionId}-level-${level - 1}`] : [],
      relatedTopics: [],

      qualityMetrics,
      validationStatus: 'validated',
      validationErrors: null,

      version: '3.0.0',
      isPublished: false,
    },
  });

  console.log(`\n✅ 生成完成! ID: ${theoryContent.id}`);
  console.log(`   - 总字数: ${qualityMetrics.totalWords}`);
  console.log(`   - 质量评分: ${qualityMetrics.overallQualityScore}/100`);

  return theoryContent;
}

// 辅助函数
function calculateEstimatedTime(level: number): number {
  const baseTime = 45; // 基础45分钟
  const levelMultiplier = 1 + (level - 1) * 0.3;
  return Math.round(baseTime * levelMultiplier);
}

function extractKeywords(conceptsContent: any, modelsContent: any): string[] {
  const keywords = new Set<string>();

  conceptsContent.concepts.forEach((concept: any) => {
    keywords.add(concept.name);
    concept.keyPoints?.forEach((point: string) => {
      const words = point.split(/[，。、\s]+/).filter((w: string) => w.length > 1);
      words.forEach((word: string) => keywords.add(word));
    });
  });

  modelsContent.models.forEach((model: any) => {
    keywords.add(model.name);
  });

  return Array.from(keywords).slice(0, 10);
}

function calculateQualityMetrics(conceptsContent: any, modelsContent: any, demonstrationsContent: any): any {
  const validator = new TheoryContentValidator();

  const conceptsValidation = validator.validateConcepts(conceptsContent);
  const modelsValidation = validator.validateModels(modelsContent);
  const demonstrationsValidation = validator.validateDemonstrations(demonstrationsContent);

  const totalWords =
    JSON.stringify(conceptsContent).length +
    JSON.stringify(modelsContent).length +
    JSON.stringify(demonstrationsContent).length;

  const overallQualityScore = Math.round(
    (conceptsValidation.score + modelsValidation.score + demonstrationsValidation.score) / 3
  );

  return {
    conceptsScore: conceptsValidation.metrics,
    modelsScore: modelsValidation.metrics,
    demonstrationsScore: demonstrationsValidation.metrics,
    totalWords,
    structureScore: 100, // TODO: 实现结构完整性评分
    overallQualityScore,
  };
}

// CLI命令行接口
async function main() {
  const args = process.argv.slice(2);

  // 解析参数
  const dimensionArg = args.find((arg) => arg.startsWith('--dimension='))?.split('=')[1];
  const levelArg = args.find((arg) => arg.startsWith('--level='))?.split('=')[1];
  const validateFlag = args.includes('--validate');
  const retryFlag = args.includes('--retry');
  const allFlag = args.includes('--all');

  if (allFlag) {
    // 批量生成所有维度和Level
    console.log('🚀 开始批量生成所有理论内容...\n');

    for (const dimension of DIMENSIONS) {
      const levels = DIMENSION_LEVELS[dimension.id] || [];

      for (const levelInfo of levels) {
        try {
          await generateTheoryContentV3(dimension.id, levelInfo.level, {
            validate: validateFlag,
            retry: retryFlag,
          });

          // API限流
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ 生成失败: ${dimension.id} Level ${levelInfo.level}`);
          console.error(error);
        }
      }
    }

    console.log('\n✅ 批量生成完成!');
  } else if (dimensionArg && levelArg) {
    // 生成单个维度和Level
    await generateTheoryContentV3(dimensionArg, parseInt(levelArg), {
      validate: validateFlag,
      retry: retryFlag,
    });
  } else {
    console.log('用法:');
    console.log('  npm run generate:theory-v3 -- --dimension=causal_analysis --level=1 --validate --retry');
    console.log('  npm run generate:theory-v3 -- --all --validate --retry');
  }

  await prisma.$disconnect();
}

if (require.main === module) {
  main();
}

export { generateTheoryContentV3 };
```

---

## 📅 实施时间表

### 第一周: 基础设施建设

**Day 1-2: 数据库和类型定义**
- [ ] 创建数据库migration文件
- [ ] 更新Prisma schema
- [ ] 运行migration: `npm run db:migrate`
- [ ] 生成TypeScript类型: `npm run db:generate`

**Day 3-4: 生成脚本开发**
- [ ] 创建 `generate-theory-content-v3.ts`
- [ ] 实现Prompt模板函数
- [ ] 实现内容验证器 `TheoryContentValidator`
- [ ] 添加CLI参数解析

**Day 5: 测试和调试**
- [ ] 单元测试验证器
- [ ] 集成测试生成流程
- [ ] 修复bug

### 第二周: 试点生成

**Day 6-7: 单个维度试点**
```bash
npm run generate:theory-v3 -- --dimension=causal_analysis --level=1 --validate --retry
```
- [ ] 生成Level 1内容
- [ ] 人工审核质量
- [ ] 记录问题点

**Day 8-9: Prompt迭代优化**
- [ ] 根据问题调整Prompt
- [ ] 重新生成对比
- [ ] 确认质量达标

**Day 10: 完成单维度5个Level**
```bash
for level in 1 2 3 4 5; do
  npm run generate:theory-v3 -- --dimension=causal_analysis --level=$level --validate --retry
done
```
- [ ] 生成全部5个Level
- [ ] 全面质量审核

### 第三周: 批量生成

**Day 11-14: 生成所有维度**
```bash
npm run generate:theory-v3 -- --all --validate --retry
```
- [ ] 生成5个维度 × 5个Level = 25个内容
- [ ] 每5个内容暂停人工抽查
- [ ] 发现问题及时调整

**Day 15: 质量审核**
- [ ] 全量人工审核
- [ ] 标记低质量内容
- [ ] 制定修复计划

### 第四周: 优化和发布

**Day 16-18: 内容优化**
- [ ] 重新生成低质量内容
- [ ] 人工修改难以自动化的部分
- [ ] 最终质量验证

**Day 19: 前端集成测试**
- [ ] 更新TheorySystemContainerV2组件
- [ ] 渲染新结构内容
- [ ] 测试所有交互

**Day 20: 灰度发布**
- [ ] 设置validationStatus为'published'
- [ ] 监控用户反馈
- [ ] 收集改进建议

---

## 🎯 质量验收标准

### 自动验证指标

- ✅ 思维模型步骤描述 ≥ 300字: **100%通过**
- ✅ 实例演示分析步骤 ≥ 200字: **100%通过**
- ✅ 核心概念有conceptBreakdown: **≥80%**
- ✅ 思维模型有fullApplicationExample: **100%通过**
- ✅ 实例演示标注theoreticalFoundation: **100%通过**

### 人工审核指标

- ✅ 内容准确性: 无明显错误
- ✅ 逻辑连贯性: 思路清晰
- ✅ 实用性: 可实际应用
- ✅ 可读性: 易于理解

### 用户反馈指标 (发布后1个月)

- ✅ 内容满意度: ≥4.0/5.0
- ✅ 学习完成率: ≥70%
- ✅ 练习应用率: ≥60%

---

## 🚨 风险和应对

### 风险1: AI生成质量不稳定

**应对**:
- 实施严格的验证器,不合格内容自动重试
- 设置最大重试次数(3次),超过则标记人工处理
- 建立人工审核和修复流程

### 风险2: 生成成本高

**应对**:
- 分批生成,先完成试点验证
- 优化Prompt减少token消耗
- 设置合理的超时和重试策略

### 风险3: 前端渲染性能

**应对**:
- JSON结构虽然复杂,但渲染时按需加载
- 使用虚拟滚动处理大内容
- 缓存已加载的内容

---

## 📊 成功指标

### 短期指标 (1个月)

- ✅ 完成25个TheoryContent的生成和审核
- ✅ 自动验证通过率 ≥ 90%
- ✅ 人工审核通过率 ≥ 95%
- ✅ 前端集成无重大bug

### 中期指标 (3个月)

- ✅ 用户学习完成率提升20%
- ✅ 用户满意度 ≥ 4.0/5.0
- ✅ 练习应用率提升15%

### 长期指标 (6个月)

- ✅ 成为批判性思维在线学习的标杆产品
- ✅ 用户主动推荐率 ≥ 30%
- ✅ 内容迭代机制成熟,支持持续优化

---

## 下一步行动

1. **立即执行**:
   - [ ] 阅读并审核所有设计文档
   - [ ] 确认技术方案可行性
   - [ ] 分配开发任务

2. **本周完成**:
   - [ ] 数据库migration
   - [ ] 生成脚本框架
   - [ ] 验证器实现

3. **下周完成**:
   - [ ] 试点生成causal_analysis Level 1
   - [ ] 人工审核并迭代Prompt

4. **两周后**:
   - [ ] 批量生成所有内容
   - [ ] 质量审核和优化

---

## 附录: 快速参考

### 文档索引

1. **质量改进方案**: `07-QUALITY-IMPROVEMENT-PLAN.md`
2. **数据架构V3**: `02-DATA-ARCHITECTURE-V3.md`
3. **内容生成V3**: `05-CONTENT-GENERATION-V3.md`
4. **实施路线图**: `08-IMPLEMENTATION-ROADMAP.md` (本文档)

### 常用命令

```bash
# 数据库操作
npm run db:migrate
npm run db:generate

# 生成单个内容
npm run generate:theory-v3 -- --dimension=causal_analysis --level=1 --validate --retry

# 批量生成
npm run generate:theory-v3 -- --all --validate --retry

# 验证现有内容
npm run validate:theory-content
```

### 关键文件路径

```
scripts/
├── generate-theory-content-v3.ts      # 主生成脚本
├── validators/
│   └── theory-content-validator.ts    # 内容验证器
├── prompts/
│   └── theory-generation-prompts-v3.ts # Prompt模板
└── config/
    └── dimensions.ts                   # 维度配置

prisma/
└── migrations/
    └── YYYYMMDDHHMMSS_add_quality_metrics/ # 新migration

docs/theory-system-redesign/
├── 07-QUALITY-IMPROVEMENT-PLAN.md     # 质量改进方案
├── 02-DATA-ARCHITECTURE-V3.md         # 数据架构V3
├── 05-CONTENT-GENERATION-V3.md        # 内容生成V3
└── 08-IMPLEMENTATION-ROADMAP.md       # 实施路线图(本文档)
```
