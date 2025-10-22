# 每日一问数据生成脚本

## 概述

`generate-daily-questions.ts` 是一个基于 AI 大模型的智能数据生成脚本，用于为"每日一问"功能批量生成高质量的批判性思维问题。

## 功能特性

### 1. AI 驱动的内容生成
- 使用项目现有的 AI Router (`@/lib/ai/router`) 调用 Deepseek 或 Qwen 模型
- 针对不同类别设计专业的 Prompt 模板
- 自动解析 AI 响应并提取结构化数据

### 2. 三大问题类别

#### 批判性思维 (critical_thinking)
- **数量目标**: 50+ 题
- **覆盖范围**:
  - 5 大思维维度（多维归因、前提质疑、谬误检测、迭代反思、知识迁移）
  - 3 种难度级别（beginner, intermediate, advanced）
- **生成策略**: 每个维度 × 每个难度级别生成若干问题

#### 国际学校面试 (interview)
- **数量目标**: 30+ 题
- **覆盖范围**: Top 10 国际学校面试主题
  - 个人成长与挑战
  - 领导力与团队合作
  - 全球化与文化理解
  - 创新思维与问题解决
  - 社会责任与公民意识
  - 学术兴趣与职业规划
  - 道德困境与价值选择
  - 科技发展与人类未来
  - 环境保护与可持续发展
  - 艺术人文与批判性思维
- **生成策略**: 每个主题生成不同难度的问题

#### 社会热点议题 (social_issue)
- **数量目标**: 20+ 题
- **覆盖范围**: 10 大热门社会议题
  - AI 与就业市场
  - 教育公平与机会
  - 气候变化与行动
  - 隐私保护与数据安全
  - 贫富差距与社会流动
  - 心理健康与社会压力
  - 网络治理与言论自由
  - 老龄化社会挑战
  - 性别平等与多元包容
  - 城市化与生活质量
- **生成策略**: 每个议题生成不同难度的问题

### 3. 数据质量保障

#### 去重机制
- 检查问题前 50 个字符是否与现有问题重复
- 跳过重复问题，避免数据冗余

#### 数据验证
- 严格遵循 `daily_critical_question` 表结构
- 自动验证 JSON 格式
- 确保所有必填字段完整

#### 错误处理
- API 调用失败时自动跳过
- 详细的错误日志输出
- 不会删除现有数据

### 4. 智能生成策略

#### Temperature 设置
- 使用 `temperature: 0.8` 提高问题创造性
- 避免生成过于模板化的问题

#### API 频率控制
- 每次生成后延迟 1 秒
- 避免触发 API 频率限制

#### 进度追踪
- 实时显示生成进度
- 统计新增、跳过、失败的问题数量

## 使用方法

### 环境要求

确保 `.env` 文件中已配置：
```env
DATABASE_URL="postgresql://..."
DEEPSEEK_API_KEY="your-key"
QWEN_API_KEY="your-key"
ACTIVE_AI_MODEL="deepseek-v3.1"  # 或 "qwen3-max"
```

### 执行脚本

```bash
npm run generate:daily-questions
```

### 预期输出

```
🚀 AI驱动的每日一问数据生成脚本
============================================================

📊 当前数据统计:
  critical_thinking: 0 个问题
  interview: 0 个问题
  social_issue: 0 个问题
  总计: 0 个问题

📚 开始生成批判性思维问题...

  处理维度: 多维归因与利弊权衡
    难度: beginner
      ✅ 已生成问题 1/50
    难度: intermediate
      ✅ 已生成问题 2/50
    ...

🎓 开始生成国际学校面试问题...
  ...

🌍 开始生成社会议题问题...
  ...

============================================================
📊 最终数据统计:
  critical_thinking: 52 个问题
  interview: 31 个问题
  social_issue: 21 个问题
  总计: 104 个问题
  新增: 104 个问题

✅ 数据生成完成!
```

## 数据结构

生成的每个问题包含以下字段：

```typescript
{
  question: string        // 问题文本
  category: string        // 类别 (critical_thinking | interview | social_issue)
  subcategory: string?    // 子类别（如"因果推理"、"个人发展"等）
  difficulty: string      // 难度 (beginner | intermediate | advanced)
  tags: string[]          // 标签数组
  thinkingTypes: string[] // 关联的思维维度ID（仅 critical_thinking 类别）
  context: string?        // 问题背景说明
  isActive: boolean       // 是否启用（默认 true）
  usageCount: number      // 使用次数（默认 0）
}
```

## Prompt 工程

### 设计原则

1. **角色定位明确**: 每个 Prompt 都有专业的角色身份
2. **要求具体**: 明确问题难度、开放性、现实性等要求
3. **格式严格**: 使用 JSON Schema 约束输出格式
4. **质量导向**: 强调问题的思维深度和教育价值

### 示例 Prompt (批判性思维)

```
你是一位资深的批判性思维教育专家，专门设计高质量的思维训练问题。

请基于以下思维维度设计一个中级难度的批判性思维问题：

思维维度：多维归因与利弊权衡
维度描述：分析因果关系，权衡多方面利弊
难度等级：中级 - 需要一定思维深度，情境复杂

请严格按照以下JSON格式输出（不要包含其他文字说明）：

{
  "question": "问题文本（开放性问题，引导深度思考）",
  "subcategory": "具体子类别（如'因果推理'、'前提识别'等）",
  "tags": ["标签1", "标签2", "标签3"],
  "context": "问题背景说明（可选，帮助理解问题情境）"
}

要求：
1. 问题必须开放性，没有标准答案
2. 问题应引发深度思考，而非简单的是非判断
3. 标签应准确描述问题涉及的关键概念
4. 难度应与指定等级相符
5. 问题应贴近现实生活或学术场景
```

## 注意事项

### 1. 不删除历史数据
- 脚本仅执行 `INSERT` 操作
- 已有数据完全保留
- 通过去重机制避免重复生成

### 2. AI 成本控制
- 每个问题约消耗 500-1000 tokens
- 总计约 100 个问题 = 50,000-100,000 tokens
- 预估成本：约 0.5-1.5 元（基于 Deepseek 定价）

### 3. 执行时间
- 每个问题生成 + 延迟约 2-3 秒
- 总计约 100 个问题 = 3-5 分钟
- 请保持网络连接稳定

### 4. 失败重试
- 如果部分问题生成失败，可重新执行脚本
- 去重机制确保不会重复生成
- 建议分批执行，避免一次性生成过多

## 扩展与定制

### 添加新的问题类别

1. 在 `PROMPTS` 对象中添加新的 Prompt 模板
2. 在 `main()` 函数中调用新的生成函数
3. 更新数据库 schema（如需要）

### 调整生成数量

修改函数调用的参数：
```typescript
await generateCriticalThinkingQuestions(100)  // 改为 100 题
await generateInterviewQuestions(50)          // 改为 50 题
```

### 修改 AI 模型

在 `.env` 中切换模型：
```env
ACTIVE_AI_MODEL="qwen3-max"  # 切换到 Qwen
```

## 故障排查

### 问题：AI 响应无法解析为 JSON
**原因**: AI 模型可能返回带有解释文字的响应
**解决**: 脚本已包含 JSON 提取逻辑，自动处理此情况

### 问题：API 频率限制
**原因**: 请求过于频繁
**解决**: 增加 `setTimeout` 延迟时间（当前为 1000ms）

### 问题：数据库连接失败
**原因**: DATABASE_URL 配置错误
**解决**: 检查 `.env` 文件中的数据库连接字符串

### 问题：重复问题过多
**原因**: AI 生成的问题相似度高
**解决**: 调整 Prompt，增加创造性要求，或提高 temperature

## 维护建议

1. **定期运行**: 建议每月运行一次，补充新问题
2. **质量审核**: 生成后人工抽查问题质量
3. **数据清理**: 定期清理低质量或过时的问题
4. **性能监控**: 关注 AI API 调用成本和响应时间

## 相关文件

- **脚本文件**: `scripts/generate-daily-questions.ts`
- **数据表**: `daily_critical_questions`
- **API 路由**: `src/app/api/daily-questions/route.ts`
- **前端组件**: `src/components/learn/AIQuestionChatbox.tsx`
- **AI 服务**: `src/lib/ai/router.ts`

## 技术栈

- **TypeScript**: 类型安全的脚本编写
- **Prisma**: 数据库 ORM
- **AI Router**: 多模型支持 (Deepseek/Qwen)
- **tsx**: 直接执行 TypeScript

## 许可证

MIT License - 仅供 Cogito AI 项目内部使用
