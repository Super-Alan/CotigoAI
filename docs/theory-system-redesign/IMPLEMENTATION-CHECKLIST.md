# 批判性思维理论体系V3 - 实施检查清单

## 📋 Phase 1: 准备阶段 (Week 1, Day 1-2)

### 文档审阅
- [ ] 阅读 `00-REDESIGN-SUMMARY-V3.md` - 理解整体方案
- [ ] 阅读 `07-QUALITY-IMPROVEMENT-PLAN.md` - 理解三大核心问题
- [ ] 阅读 `02-DATA-ARCHITECTURE-V3.md` - 理解数据结构变化
- [ ] 阅读 `05-CONTENT-GENERATION-V3.md` - 理解AI Prompt设计
- [ ] 阅读 `08-IMPLEMENTATION-ROADMAP.md` - 理解实施计划

### 团队对齐
- [ ] 召开项目启动会议
- [ ] 确认重设计方案可行性
- [ ] 分配开发任务和时间表
- [ ] 设置项目里程碑

---

## 📋 Phase 2: 数据库和类型 (Week 1, Day 3-4)

### 数据库Migration
- [ ] 创建migration文件: `prisma/migrations/YYYYMMDDHHMMSS_theory_content_v3/`
- [ ] 添加新字段到`theory_content`表:
  - [ ] `qualityMetrics` JSONB
  - [ ] `validationStatus` TEXT DEFAULT 'draft'
  - [ ] `validationErrors` JSONB
  - [ ] `reviewNotes` TEXT
  - [ ] `feedbackCount` INTEGER DEFAULT 0
- [ ] 创建索引: `idx_theory_content_validation_status`
- [ ] 创建新表: `theory_content_feedback`
- [ ] 运行migration: `npm run db:migrate`
- [ ] 验证migration成功

### TypeScript类型
- [ ] 更新 `prisma/schema.prisma`
- [ ] 生成Prisma Client: `npm run db:generate`
- [ ] 创建TypeScript类型文件: `src/types/theory-content-v3.ts`
- [ ] 定义接口:
  - [ ] `ConceptsContent`
  - [ ] `ConceptLevel`
  - [ ] `ModelsContent`
  - [ ] `DemonstrationsContent`
  - [ ] `QualityMetrics`
- [ ] 验证类型定义正确

---

## 📋 Phase 3: 验证器开发 (Week 1, Day 5-7)

### 创建验证器文件
- [ ] 创建目录: `scripts/validators/`
- [ ] 创建文件: `scripts/validators/theory-content-validator.ts`

### 实现验证逻辑
- [ ] 实现 `TheoryContentValidator` 类
- [ ] 实现 `validateConcepts()` 方法:
  - [ ] intro字数检查 (200-400字)
  - [ ] coreIdea字数检查 (50-120字)
  - [ ] conceptBreakdown必填检查
  - [ ] criticalThinkingFramework步骤数检查 (≥3步)
  - [ ] commonMisconceptions数量检查 (≥2个)
  - [ ] visualizationGuide必填检查
- [ ] 实现 `validateModels()` 方法:
  - [ ] intro字数检查 (150-250字)
  - [ ] coreLogic必填检查
  - [ ] steps[].description字数检查 (≥300字) **核心要求!**
  - [ ] steps[].keyThinkingPoints数量检查 (≥3个)
  - [ ] steps[].commonPitfalls数量检查 (≥2个)
  - [ ] fullApplicationExample必填检查
  - [ ] visualization.stepByStepDrawing必填检查
- [ ] 实现 `validateDemonstrations()` 方法:
  - [ ] learningObjective必填检查
  - [ ] theoreticalFoundation必填检查 **核心要求!**
  - [ ] stepByStepAnalysis[].conceptApplied必填检查 **核心要求!**
  - [ ] stepByStepAnalysis[].thinkingProcess字数检查 (≥200字)
  - [ ] keyInsights数量检查 (≥3个)
  - [ ] transferableSkills数量检查 (≥3个)
- [ ] 实现 `calculateScore()` 方法
- [ ] 实现质量指标计算方法

### 测试验证器
- [ ] 创建测试文件: `scripts/validators/theory-content-validator.test.ts`
- [ ] 编写单元测试:
  - [ ] 测试合格内容通过验证
  - [ ] 测试不合格内容被拦截
  - [ ] 测试评分计算准确性
- [ ] 运行测试: `npm test`

---

## 📋 Phase 4: Prompt模板开发 (Week 2, Day 1-2)

### 创建Prompt文件
- [ ] 创建目录: `scripts/prompts/`
- [ ] 创建文件: `scripts/prompts/theory-generation-prompts-v3.ts`

### 实现Prompt函数
- [ ] 实现 `CONCEPTS_PROMPT_V3(dimension, levelInfo)`:
  - [ ] 包含任务背景说明
  - [ ] 包含JSON格式要求
  - [ ] 包含质量要求清单
  - [ ] 包含Level难度递增示例
  - [ ] 包含最后提醒
- [ ] 实现 `MODELS_PROMPT_V3(dimension, levelInfo)`:
  - [ ] 强调步骤描述≥300字 **核心要求!**
  - [ ] 包含coreLogic要求
  - [ ] 包含fullApplicationExample要求
  - [ ] 包含Level难度递增示例
- [ ] 实现 `DEMONSTRATIONS_PROMPT_V3(dimension, levelInfo, conceptsList, modelsList)`:
  - [ ] 传递已生成的概念和模型列表
  - [ ] 强调theoreticalFoundation **核心要求!**
  - [ ] 强调每步conceptApplied **核心要求!**
  - [ ] 包含完整案例示例

### 测试Prompt
- [ ] 手动测试单个Prompt生成效果
- [ ] 检查AI返回的JSON格式正确性
- [ ] 验证内容质量符合预期

---

## 📋 Phase 5: 生成脚本开发 (Week 2, Day 3-5)

### 创建配置文件
- [ ] 创建目录: `scripts/config/`
- [ ] 创建文件: `scripts/config/dimensions.ts`
- [ ] 定义 `DIMENSIONS` 数组 (5个思维维度)
- [ ] 定义 `DIMENSION_LEVELS` 对象 (每个维度5个Level配置)

### 创建主生成脚本
- [ ] 创建文件: `scripts/generate-theory-content-v3.ts`
- [ ] 实现 `generateTheoryContentV3()` 主函数:
  - [ ] 生成核心概念 (带重试机制)
  - [ ] 生成思维模型 (带重试机制)
  - [ ] 生成实例演示 (带重试机制,传递概念和模型列表)
  - [ ] 调用验证器验证质量
  - [ ] 不合格自动重试 (最多3次)
  - [ ] 计算质量指标
  - [ ] 保存到数据库
- [ ] 实现辅助函数:
  - [ ] `calculateEstimatedTime(level)`
  - [ ] `extractKeywords(conceptsContent, modelsContent)`
  - [ ] `calculateQualityMetrics()`
- [ ] 实现CLI命令行接口:
  - [ ] 支持 `--dimension=xxx --level=N`
  - [ ] 支持 `--all` 批量生成
  - [ ] 支持 `--validate` 标志
  - [ ] 支持 `--retry` 标志

### 添加NPM脚本
- [ ] 更新 `package.json`:
  ```json
  {
    "scripts": {
      "generate:theory-v3": "tsx scripts/generate-theory-content-v3.ts"
    }
  }
  ```

---

## 📋 Phase 6: 试点生成 (Week 3, Day 1-3)

### 生成单个Level测试
- [ ] 运行命令: `npm run generate:theory-v3 -- --dimension=causal_analysis --level=1 --validate --retry`
- [ ] 检查生成日志:
  - [ ] 是否成功生成3个章节
  - [ ] 验证器是否通过
  - [ ] 评分是否≥85分
- [ ] 人工审核生成内容:
  - [ ] 核心概念是否结构清晰
  - [ ] 思维模型步骤是否≥300字
  - [ ] 实例演示是否标注理论关联
- [ ] 记录问题点:
  - [ ] 哪些地方不符合预期
  - [ ] 哪些Prompt需要调整

### Prompt迭代优化
- [ ] 根据问题调整Prompt
- [ ] 重新生成Level 1
- [ ] 对比优化前后差异
- [ ] 确认质量达标

### 完成单维度5个Level
- [ ] 生成Level 1 (已完成)
- [ ] 生成Level 2
- [ ] 生成Level 3
- [ ] 生成Level 4
- [ ] 生成Level 5
- [ ] 全面质量审核
- [ ] 标记任何低质量内容

---

## 📋 Phase 7: 批量生成 (Week 3, Day 4-7)

### 生成所有维度
- [ ] 运行命令: `npm run generate:theory-v3 -- --all --validate --retry`
- [ ] 监控生成进度:
  - [ ] causal_analysis (5个Level)
  - [ ] premise_challenge (5个Level)
  - [ ] fallacy_detection (5个Level)
  - [ ] iterative_reflection (5个Level)
  - [ ] connection_transfer (5个Level)
- [ ] 每5个内容暂停人工抽查
- [ ] 发现问题及时调整

### 质量审核
- [ ] 检查数据库: 确认25个TheoryContent记录已创建
- [ ] 运行质量报告查询:
  ```sql
  SELECT
    "thinkingTypeId",
    level,
    "validationStatus",
    "qualityMetrics"->'overallQualityScore' as score
  FROM theory_content
  WHERE version = '3.0.0'
  ORDER BY "thinkingTypeId", level;
  ```
- [ ] 标记低质量内容 (评分<80)
- [ ] 制定修复计划

---

## 📋 Phase 8: 优化和发布 (Week 4)

### 内容优化
- [ ] 重新生成低质量内容
- [ ] 人工修改难以自动化的部分
- [ ] 最终质量验证:
  - [ ] 所有内容评分≥85
  - [ ] 思维模型步骤100%达到≥300字
  - [ ] 实例演示100%标注理论关联

### 前端集成
- [ ] 更新 `TheorySystemContainerV2.tsx` (如需要)
- [ ] 创建新的渲染组件:
  - [ ] `ConceptsViewer.tsx` - 渲染多层级概念
  - [ ] `ModelsViewer.tsx` - 渲染详细步骤
  - [ ] `DemonstrationsViewer.tsx` - 渲染理论关联分析
- [ ] 测试所有交互:
  - [ ] 概念层级展开/收起
  - [ ] 思维模型步骤导航
  - [ ] 实例演示理论高亮

### 灰度发布
- [ ] 设置前10个内容 `validationStatus = 'published'`
- [ ] 监控用户反馈:
  - [ ] 查看浏览量
  - [ ] 收集用户评分
  - [ ] 阅读用户评论
- [ ] 根据反馈微调

### 全量发布
- [ ] 将所有25个内容设为published
- [ ] 公告新版理论体系上线
- [ ] 持续监控质量指标

---

## 📋 验收标准

### 自动验证 (100%通过)
- [ ] 思维模型步骤描述 ≥ 300字: **25/25通过**
- [ ] 实例演示分析步骤 ≥ 200字: **25/25通过**
- [ ] 核心概念有conceptBreakdown: **≥20/25通过**
- [ ] 思维模型有fullApplicationExample: **25/25通过**
- [ ] 实例演示标注theoreticalFoundation: **25/25通过**

### 质量评分 (≥85分)
- [ ] 25个内容平均评分: **≥85分**
- [ ] 最低评分: **≥80分**
- [ ] 优秀内容(≥95分)占比: **≥30%**

### 人工审核 (≥95%通过)
- [ ] 内容准确性: **0个明显错误**
- [ ] 逻辑连贯性: **≥95%清晰**
- [ ] 实用性: **≥95%可实际应用**
- [ ] 可读性: **≥95%易于理解**

---

## 📊 进度跟踪

### Week 1进度
- [ ] Day 1-2: 准备阶段 ✅
- [ ] Day 3-4: 数据库和类型 ✅
- [ ] Day 5-7: 验证器开发 ✅

### Week 2进度
- [ ] Day 1-2: Prompt模板开发 ⏳
- [ ] Day 3-5: 生成脚本开发 ⏳

### Week 3进度
- [ ] Day 1-3: 试点生成 ⏳
- [ ] Day 4-7: 批量生成 ⏳

### Week 4进度
- [ ] Day 1-3: 内容优化 ⏳
- [ ] Day 4-5: 前端集成 ⏳
- [ ] Day 6-7: 灰度发布 ⏳

---

## 🚨 风险检查

### 技术风险
- [ ] AI生成质量不稳定 → 启用重试机制
- [ ] 验证器误报 → 调整验证规则
- [ ] 数据库性能问题 → 添加索引优化

### 内容风险
- [ ] 步骤描述仍不够详细 → 调整Prompt强调字数
- [ ] 理论关联标注遗漏 → 验证器强制检查
- [ ] 案例过于学术化 → Prompt强调贴近生活

### 时间风险
- [ ] 试点生成耗时超预期 → 并行处理多个Level
- [ ] 人工审核工作量大 → 提高自动验证标准
- [ ] 前端开发延期 → 提前准备mock数据

---

## ✅ 最终检查

### 上线前检查清单
- [ ] 所有25个内容已生成
- [ ] 所有内容通过自动验证
- [ ] 所有内容通过人工审核
- [ ] 前端集成测试通过
- [ ] 数据库备份已创建
- [ ] 回滚方案已准备

### 上线后监控
- [ ] 查看用户浏览数据
- [ ] 收集用户反馈
- [ ] 监控系统性能
- [ ] 准备快速修复方案

---

**检查清单使用说明**:
1. 按顺序执行每个阶段的任务
2. 完成一项勾选一项
3. 遇到问题及时记录并解决
4. 定期回顾进度,确保按时完成

**重要提醒**: 这是批判性思维学习的核心内容,每一步都要认真对待!
