# 批判性思维练习题生成脚本

## 📋 概述

`generate-practice-questions.ts` 脚本用于批量生成批判性思维练习题，自动填充 `critical_thinking_questions` 表。

## 🎯 功能特性

- **智能生成**：基于 `theory_content` 表的学习内容，使用AI生成高质量练习题
- **完整覆盖**：为5个思维类型的每个Level（1-5）生成至少5道题，共125道题
- **质量保证**：题目设计符合香港大学面试标准，包含多维度分析和批判性思维引导
- **增量更新**：自动检测已有题目，只生成缺失的部分
- **错误恢复**：单个题目失败不影响整体流程

## 🚀 使用方法

### 基本用法

```bash
npm run generate:practice-questions
```

### 执行流程

脚本会依次处理：
1. `causal_analysis` (多维归因与利弊权衡) - 5个Level × 5道题 = 25道
2. `premise_challenge` (前提质疑与方法批判) - 5个Level × 5道题 = 25道
3. `fallacy_detection` (谬误检测) - 5个Level × 5道题 = 25道
4. `iterative_reflection` (迭代反思) - 5个Level × 5道题 = 25道
5. `connection_transfer` (关联和迁移) - 5个Level × 5道题 = 25道

**总计**：125道练习题

## 📊 生成的题目结构

每道题包含以下字段：

```typescript
{
  thinkingTypeId: string,           // 思维类型ID
  level: number,                    // Level 1-5
  difficulty: string,               // beginner | intermediate | advanced
  topic: string,                    // 题目标题
  context: string,                  // 背景情境（300-500字）
  question: string,                 // 核心问题
  guidingQuestions: [               // 引导问题（3-5个）
    {
      question: string,
      purpose: string,
      orderIndex: number
    }
  ],
  thinkingFramework: {              // 思维框架
    coreChallenge: string,
    commonPitfalls: string[],
    excellentResponseIndicators: string[]
  },
  expectedOutcomes: string[],       // 预期学习成果
  tags: string[]                    // 标签
}
```

## ⚙️ 配置选项

### Level难度映射

```typescript
Level 1-2: beginner      // 基础入门，识别和理解
Level 3-4: intermediate  // 应用实践，综合分析
Level 5:   advanced      // 专家掌握，创新综合
```

### Level特点

- **Level 1**：识别基本概念，思维脚手架，简单场景
- **Level 2**：应用概念，中等复杂度，初步独立
- **Level 3**：多维度分析，复杂情境，批判性评估
- **Level 4**：系统性思考，跨领域迁移，创新性解决
- **Level 5**：高度复杂性，独立分析，原创性思考

## 🔍 验证生成的题目

### 查看生成数量

```bash
npx tsx -e "
import { prisma } from './src/lib/prisma.ts';

async function check() {
  const count = await prisma.criticalThinkingQuestion.count();
  console.log('总题目数:', count);

  const groupBy = await prisma.criticalThinkingQuestion.groupBy({
    by: ['thinkingTypeId', 'level'],
    _count: true,
  });

  console.log('\\n按思维类型和Level分组:');
  groupBy.forEach(g => {
    console.log(\`  \${g.thinkingTypeId} Level \${g.level}: \${g._count} 道题\`);
  });

  await prisma.\$disconnect();
}

check();
"
```

### 查看示例题目

```bash
npx tsx -e "
import { prisma } from './src/lib/prisma.ts';

async function sample() {
  const question = await prisma.criticalThinkingQuestion.findFirst({
    where: {
      thinkingTypeId: 'fallacy_detection',
      level: 1,
    },
    include: {
      guidingQuestions: true,
    },
  });

  console.log(JSON.stringify(question, null, 2));
  await prisma.\$disconnect();
}

sample();
"
```

## 🛠️ 故障排查

### 常见问题

1. **AI API超时**：
   - 脚本已内置1秒延迟，避免限流
   - 如遇超时，脚本会自动跳过并继续

2. **JSON解析失败**：
   - AI返回格式不标准，脚本会尝试提取JSON块
   - 失败的题目会被跳过，不影响其他题目

3. **数据库连接失败**：
   - 检查 `.env` 文件中的 `DATABASE_URL`
   - 确保PostgreSQL服务正在运行

### 手动清理（如需重新生成）

```bash
# ⚠️ 警告：仅删除critical_thinking_questions，不影响其他表
npx tsx -e "
import { prisma } from './src/lib/prisma.ts';

async function cleanup() {
  const deleted = await prisma.criticalThinkingQuestion.deleteMany({});
  console.log(\`已删除 \${deleted.count} 道题目\`);
  await prisma.\$disconnect();
}

cleanup();
"
```

## 📈 性能指标

- **生成速度**：约1-2分钟/道题（包含AI调用和数据库保存）
- **总耗时**：约2-4小时（125道题）
- **成功率**：预期 >90%（AI API稳定情况下）

## 🔗 相关资源

- **数据库表**：`critical_thinking_questions`, `theory_content`, `level_learning_content`
- **AI接口**：`src/lib/ai/router.ts`
- **类型定义**：`src/types/index.ts`

## 📝 日志示例

```
🚀 开始批量生成批判性思维练习题...

============================================================
📚 处理思维类型: 多维归因与利弊权衡 (causal_analysis)
============================================================

  📝 需要生成 5 道题 (已有0道)

🎯 生成 多维归因与利弊权衡 Level 1 的练习题...
  🤖 调用AI生成题目...
  ✅ 成功生成 5 道题
    ✅ 保存题目: 公鸡打鸣与日出：谁导致了谁？
    ✅ 保存题目: 冰淇淋销量与溺水事件：因果还是巧合？
    ...

============================================================
✅ 生成完成！
   - 总共生成: 125 道题
   - 成功保存: 123 道题
============================================================
```

## ⚠️ 注意事项

1. **数据完整性**：脚本仅操作 `critical_thinking_questions` 表，不会影响其他数据
2. **增量生成**：重复运行脚本安全，只会补充缺失的题目
3. **AI成本**：每次完整运行约消耗125次AI API调用
4. **网络要求**：需要稳定的网络连接访问AI服务

## 🎓 题目质量标准

所有生成的题目遵循以下标准：

✅ 基于真实社会议题或经典案例
✅ 包含充分的背景信息和复杂性
✅ 提供3-5个渐进式引导问题
✅ 明确标注核心挑战和常见误区
✅ 与对应Level的学习内容紧密关联
✅ 符合批判性思维教学目标
