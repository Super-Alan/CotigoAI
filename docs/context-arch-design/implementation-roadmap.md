# 学习内容体系重构 - 实施路线图

## 文档信息

- **版本**: v1.0
- **创建日期**: 2025-10-19
- **预计总工期**: 5周
- **团队**: 全栈开发者 + 内容审核员

---

## 📋 总览

### 项目目标

- ✅ 移除现有4个经典模块
- ✅ 构建5维度 × 5级别学习内容体系
- ✅ 实现Level渐进式解锁机制
- ✅ 整合Practice Flow与学习内容

### 成功指标

- 📊 学习完成率: 40% → 65%
- 📊 Level 2解锁率: ≥70%
- 📊 平均学习时长: 20min → 30min
- 📊 用户满意度(NPS): ≥40分

---

## Week 1: 数据库与架构 (Phase 1)

### Day 1-2: 数据库Schema设计与迁移

**任务清单**:
- [ ] 阅读[数据库Schema迁移方案](./database-schema-migration.md)
- [ ] 备份现有数据库
  ```bash
  npm run db:backup:local
  ```
- [ ] 更新`prisma/schema.prisma`
  - 添加`LevelLearningContent`模型
  - 扩展`CriticalThinkingQuestion`
  - 扩展`CriticalThinkingProgress`
  - 扩展`CriticalThinkingPracticeSession`
- [ ] 生成并审查迁移文件
  ```bash
  npx prisma migrate dev --name add_level_based_learning_system
  ```
- [ ] 执行迁移到本地测试数据库
- [ ] 重新生成Prisma Client
  ```bash
  npm run db:generate
  ```

**输出**:
- ✅ 数据库Schema已更新
- ✅ Prisma Client已重新生成
- ✅ 迁移文件已审查

---

### Day 3-4: 数据迁移脚本

**任务清单**:
- [ ] 创建`prisma/migrations/migrate-existing-data.ts`
- [ ] 实现用户进度迁移逻辑
  - 根据`questionsCompleted`判断初始Level
  - 自动解锁Level 2（如果≥10题）
- [ ] 实现题目Level分配逻辑
  - beginner → Level 1
  - intermediate → Level 2
  - advanced → Level 3
- [ ] 执行迁移脚本
  ```bash
  npx tsx prisma/migrations/migrate-existing-data.ts
  ```
- [ ] 创建验证脚本`scripts/verify-migration.ts`
- [ ] 执行验证
  ```bash
  npx tsx scripts/verify-migration.ts
  ```

**输出**:
- ✅ 现有数据已迁移
- ✅ 数据完整性已验证
- ✅ 无孤立数据

---

### Day 5: 内容生成准备

**任务清单**:
- [ ] 阅读[五大维度详细内容规格](./five-dimensions-content-specs.md)
- [ ] 阅读[内容生成Prompt模板](./content-generation-prompts.md)
- [ ] 准备AI内容生成环境（DeepSeek/Qwen API）
- [ ] 创建内容生成脚本`scripts/generate-learning-content.ts`
- [ ] 生成5个示例内容（测试）
  - 因果分析 Level 1 - Concepts
  - 因果分析 Level 1 - Frameworks
  - 因果分析 Level 1 - Examples
  - 因果分析 Level 1 - Practice Guide
  - 前提质疑 Level 1 - Concepts

**输出**:
- ✅ 内容生成流程已建立
- ✅ 5个示例内容已生成并审核

---

## Week 2: 内容生成与API开发 (Phase 2)

### Day 6-8: 批量内容生成

**任务清单**:
- [ ] 批量生成内容
  - 5个维度 × 5个Level × 4个内容类型 = 100个内容单元
  - 优先生成Level 1-3（用户最常使用）
- [ ] 内容审核
  - 概念准确性
  - 示例真实性
  - 语言通俗性
  - 时长合理性
- [ ] 格式化为JSON
- [ ] 导入数据库
  ```bash
  npx tsx prisma/seed-learning-content.ts
  ```
- [ ] 验证导入结果

**内容生成优先级**:
1. **Level 1** (全部5个维度) - Week 2 完成
2. **Level 2** (全部5个维度) - Week 2 完成
3. **Level 3** (全部5个维度) - Week 3 完成
4. **Level 4-5** (全部5个维度) - Week 3 完成

**输出**:
- ✅ 至少50个内容单元已生成并导入（Level 1-2优先）
- ✅ 内容质量符合标准

---

### Day 9-10: API端点开发

**任务清单**:
- [ ] 阅读[API实现指南](./api-implementation-guide.md)
- [ ] 创建`/api/critical-thinking/learning-content/route.ts`
  - 实现GET方法
  - 参数验证
  - 数据库查询
  - 错误处理
- [ ] 创建`/api/critical-thinking/questions/by-level/route.ts`
  - 实现GET方法
  - 集成用户进度查询
- [ ] 创建`/api/critical-thinking/progress/update-level/route.ts`
  - 实现POST方法
  - Level解锁逻辑
  - 进度计算
- [ ] 编写API单元测试
- [ ] Postman测试集

**输出**:
- ✅ 3个核心API端点已实现
- ✅ API测试通过

---

## Week 3: 前端组件开发 (Phase 3)

### Day 11-13: 核心组件开发

**任务清单**:
- [ ] 创建`LevelSelector`组件
  - 显示Level 1-5进度
  - 解锁/未解锁状态
  - 解锁条件提示
  - 点击切换Level
- [ ] 创建`LevelProgressIndicator`组件
  - 圆形进度条
  - 百分比显示
  - 统计卡片
- [ ] 创建`LearningContentViewer`组件
  - Markdown渲染
  - 表格支持
  - 代码高亮
  - 交互式元素（检查清单等）
  - 进度追踪
- [ ] 创建`NextLevelGuidance`组件（Practice Flow Step 6）
  - 显示解锁进度
  - 推荐下一题
  - 成就徽章

**技术栈**:
- React Markdown for content rendering
- Tailwind CSS for styling
- Lucide React for icons
- Framer Motion for animations (optional)

**输出**:
- ✅ 4个核心组件已开发
- ✅ 组件库Storybook已建立（可选）

---

### Day 14-15: LearningCenter重构

**任务清单**:
- [ ] 移除经典学习模块
  - 删除`legacyModules`数组
  - 移除相关路由和组件
    - `/learn/fallacies`
    - `/learn/templates`
    - `/learn/methodology`
    - `/learn/topics`
- [ ] 重构`LearningCenter.tsx`
  - 集成`LevelProgressIndicator`
  - 为每个思维维度添加Level进度显示
  - 添加"查看学习内容"入口
- [ ] 创建`/learn/critical-thinking/[id]/content`页面
  - 显示Level选择器
  - 显示学习内容（4个类型标签页）
  - "开始练习"按钮跳转到Practice
- [ ] 更新导航和链接

**输出**:
- ✅ LearningCenter已重构
- ✅ 经典模块已移除
- ✅ 新的学习内容入口已添加

---

## Week 4: Practice Flow集成 (Phase 3 续)

### Day 16-18: PracticeSessionV2重构

**任务清单**:
- [ ] 重构`PracticeSessionV2.tsx`
  - 添加Tab布局（3个标签页）
    - Tab 1: 📚 理论学习
    - Tab 2: 💡 实例分析
    - Tab 3: 🎯 核心技能（原6步流程）
- [ ] 在Tab 1集成`LearningContentViewer`
  - 显示Concepts和Frameworks
- [ ] 在Tab 2集成案例分析
  - 显示Examples内容
  - 可选：集成现有`CaseAnalysisDisplay`
- [ ] 保留Tab 3的6步练习流程
  - Step 1-5保持不变
  - 重构Step 6为`NextLevelGuidance`
- [ ] 实现stepProgress状态管理
  - 6步进度JSON
  - 自动保存到数据库
- [ ] 添加反思笔记和改进计划输入
  - Step 5新增字段

**输出**:
- ✅ 3-Tab布局已实现
- ✅ 学习内容与练习已整合
- ✅ 6步流程已保留并增强

---

### Day 19-20: Level进度追踪

**任务清单**:
- [ ] 实现前端进度更新逻辑
  - 练习完成后调用`/api/progress/update-level`
  - 实时更新UI（无需刷新）
- [ ] 实现Level解锁通知
  - Toast提示"恭喜解锁Level X"
  - 动画效果（可选）
- [ ] 实现进度持久化
  - LocalStorage缓存（可选）
  - 与后端同步
- [ ] 创建`/learn/critical-thinking/progress`页面
  - 详细的进度仪表板
  - 5个维度的Level进度可视化
  - 学习时长统计
  - 成就展示

**输出**:
- ✅ 进度追踪已实现
- ✅ Level解锁通知已添加
- ✅ 进度仪表板已创建

---

## Week 5: 测试与优化 (Phase 4)

### Day 21-22: 端到端测试

**任务清单**:
- [ ] 用户流程测试
  - 新用户注册 → 学习中心 → 选择维度 → 查看内容 → 开始练习
  - 完成10道Level 1题目 → 解锁Level 2
  - Level 2练习 → 解锁Level 3
- [ ] 浏览器兼容性测试
  - Chrome, Safari, Firefox, Edge
- [ ] 移动端响应式测试
  - iOS Safari, Android Chrome
- [ ] 性能测试
  - Lighthouse评分 ≥90
  - API响应时间 <500ms
  - 首屏加载 <3s
- [ ] 数据一致性测试
  - 进度同步
  - 并发操作
  - 错误恢复

**输出**:
- ✅ 测试报告已生成
- ✅ 关键bug已修复

---

### Day 23-24: 用户体验优化

**任务清单**:
- [ ] 加载状态优化
  - Skeleton屏幕
  - 进度指示器
  - 错误提示友好化
- [ ] 交互优化
  - 平滑过渡动画
  - 响应式反馈
  - 快捷键支持（可选）
- [ ] 内容可读性优化
  - 字体大小调整
  - 行间距优化
  - 深色模式支持（可选）
- [ ] 性能优化
  - 图片懒加载
  - 代码分割
  - Redis缓存学习内容
  - CDN配置

**输出**:
- ✅ UX优化已完成
- ✅ 性能指标达标

---

### Day 25: 文档与部署

**任务清单**:
- [ ] 更新README.md
  - 新功能说明
  - Level体系介绍
- [ ] 创建用户指南（可选）
  - 如何使用Level系统
  - 学习路径建议
- [ ] 准备部署
  - 环境变量配置
  - 数据库迁移脚本
  - Vercel配置
- [ ] 测试环境部署
  - 验证功能完整性
- [ ] 生产环境部署
  - 分阶段发布（可选）
  - 监控错误日志

**输出**:
- ✅ 文档已更新
- ✅ 已部署到生产环境

---

## 风险管理

### 技术风险

| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|---------|
| 数据库迁移失败 | 中 | 高 | 完整备份 + 回滚方案 |
| AI内容质量不稳定 | 高 | 中 | 人工审核 + 迭代Prompt |
| 性能问题 | 低 | 中 | Redis缓存 + 代码分割 |
| 用户不适应新体系 | 中 | 中 | 渐进式发布 + 用户引导 |

### 时间风险

**缓冲策略**:
- Week 1-2设置1天缓冲
- Week 3-4设置2天缓冲
- Week 5设置2天缓冲

**如果进度延期**:
1. 优先完成Level 1-2（核心用户使用）
2. Level 3-5可后续迭代
3. 非核心功能（动画、深色模式）可延后

---

## 质量检查清单

### 开发完成标准

**数据库**:
- [ ] 所有迁移已执行
- [ ] 数据完整性已验证
- [ ] 索引已优化

**API**:
- [ ] 所有端点已实现并测试
- [ ] 错误处理完整
- [ ] 性能达标（<500ms）

**前端**:
- [ ] 所有组件已开发
- [ ] 响应式设计已实现
- [ ] 浏览器兼容性已测试

**内容**:
- [ ] 至少50个内容单元已生成
- [ ] 内容质量已审核
- [ ] 数据已导入数据库

**集成**:
- [ ] 学习内容与Practice Flow已整合
- [ ] Level解锁机制已实现
- [ ] 进度追踪已完成

**测试**:
- [ ] 端到端测试已完成
- [ ] 性能测试已达标
- [ ] 用户体验已优化

---

## 发布计划

### Beta测试 (可选)

**Week 5 Day 23-24**:
- 邀请10-20名beta用户
- 收集反馈
- 快速迭代

### 正式发布

**Week 5 Day 25**:
- 部署到生产环境
- 发布公告
- 监控用户反馈

### 后续迭代

**Week 6+**:
- 收集用户数据
- 分析学习效果
- 持续优化内容
- 添加Level 4-5内容（如果初期未完成）

---

## 团队协作

### 角色分工

**全栈开发者**:
- 数据库设计与迁移
- API开发
- 前端组件开发
- 集成测试

**内容审核员**:
- AI生成内容审核
- 概念准确性验证
- 示例真实性检查
- 语言润色

**产品经理（可选）**:
- 需求确认
- 优先级排序
- 用户验收

---

## 每日站会议程

**时间**: 每天早上10:00，15分钟

**议程**:
1. 昨日完成的任务 (5分钟)
2. 今日计划的任务 (5分钟)
3. 遇到的阻碍 (5分钟)

---

## 相关文档

- 📄 [学习内容体系重构方案](./learning-content-system-redesign.md)
- 📄 [五大维度详细内容规格](./five-dimensions-content-specs.md)
- 📄 [数据库Schema迁移方案](./database-schema-migration.md)
- 📄 [API实现指南](./api-implementation-guide.md)
- 📄 [内容生成Prompt模板](./content-generation-prompts.md)

---

**文档状态**: ✅ 实施路线图已完成，可开始执行
