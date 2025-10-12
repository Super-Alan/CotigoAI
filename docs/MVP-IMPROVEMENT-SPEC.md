# Cogito AI - MVP学习流程科学性改进规格文档

## 📋 文档概述

**版本**: v1.0
**创建日期**: 2025-01-12
**目标**: 基于认知科学原理，完善五大思维维度的学习闭环，提升教学有效性
**策略**: 最小干预，最大收益 - 不增加新功能，仅优化现有流程的科学性

---

## 🎯 核心问题识别

### 当前系统缺陷分析

#### 1. **学习闭环不完整**（严重度: ⭐⭐⭐⭐⭐）
- **问题**: 缺少Kolb学习循环的"抽象概念化"和"主动实验"环节
- **影响**: 知识留存率低（~35%），无法形成深度理解
- **科学依据**: Kolb经验学习理论要求完整的四阶段循环

#### 2. **认知负荷过高**（严重度: ⭐⭐⭐⭐⭐）
- **问题**: 三Tab并行设计违反认知负荷理论
- **影响**: 用户迷失方向，学习效率低
- **科学依据**: 工作记忆容量有限（Miller 7±2法则）

#### 3. **元认知支持不足**（严重度: ⭐⭐⭐⭐）
- **问题**: 无反思环节，缺乏自我监控机制
- **影响**: 用户难以形成思维意识，重复同样错误
- **科学依据**: 元认知是批判性思维的核心能力

#### 4. **脚手架教学缺失**（严重度: ⭐⭐⭐⭐）
- **问题**: 引导问题静态展示，无即时反馈
- **影响**: 无法及时纠正思维偏差
- **科学依据**: Vygotsky最近发展区理论需要动态支持

#### 5. **概念学习薄弱**（严重度: ⭐⭐⭐）
- **问题**: 缺少系统化概念讲解
- **影响**: 新手入门门槛高
- **科学依据**: Bloom认知层级需要从"记忆"开始

---

## 🔧 MVP改进方案

### Phase 1: 核心学习闭环完善（P0 - 必须实现）

#### 改进1.1: 补全反思总结环节

**需求描述**:
在AI评估反馈后，增加强制性的反思总结步骤，完成Kolb学习循环的"抽象概念化"环节。

**用户故事**:
```
作为学习者
当我完成一道练习题并看到AI反馈后
我需要被引导进行深度反思
以便将个别经验抽象为通用认知模式
```

**功能要求**:

1. **反思问题设计**（必须回答）
   - 问题1: "通过这道题，我对【思维维度】有了哪些新理解？"（最少50字）
   - 问题2: "下次遇到类似问题，我会采取什么不同的策略？"（最少30字）
   - 可选: "我还有哪些困惑或疑问？"

2. **UI/UX设计**
   - 在评估反馈Card下方新增"学习反思"Card
   - 不可跳过（必须完成才能进入下一题）
   - 提供思维导图模板辅助反思

3. **数据存储**
   ```typescript
   // CriticalThinkingPracticeSession 扩展
   reflection: {
     learned: string          // 新理解
     nextSteps: string        // 改进策略
     questions?: string       // 困惑
     createdAt: Date
   }
   ```

4. **AI增强（可选）**
   - 分析反思质量，给予二次引导
   - 如反思流于表面，提示："能否更具体地说明...?"

**验收标准**:
- [ ] 用户完成练习后必须填写反思才能继续
- [ ] 反思内容至少50+30字
- [ ] 反思数据成功存储到数据库
- [ ] 反思内容在"学习进度"页面可查看

**时间估算**: 2天
**技术复杂度**: 低
**依赖项**: 无

---

#### 改进1.2: 重构为线性学习流程

**需求描述**:
将当前的三Tab并行设计，重构为符合认知层级的线性渐进流程。

**用户故事**:
```
作为学习者
当我开始一道新练习时
我希望系统按照学习规律引导我逐步深入
而不是面对多个Tab不知从何开始
```

**功能要求**:

1. **6步线性流程设计**
   ```
   Step 1: 概念激活 (Concept Activation)
     → 目标: 激活先验知识
     → 内容: 思维维度的核心概念卡片
     → 操作: "理解了，看案例"

   Step 2: 案例学习 (Case Study)
     → 目标: 理解概念在真实场景中的应用
     → 内容: AI生成的案例分析（现有功能）
     → 操作: "学习完毕，开始练习"

   Step 3: 题目呈现 (Problem Presentation)
     → 目标: 明确任务要求
     → 内容: 题目+背景信息
     → 操作: "开始思考"

   Step 4: 引导性思考 (Guided Thinking)
     → 目标: 脚手架式引导
     → 内容: 引导问题逐个回答（带即时反馈）
     → 操作: "完成引导思考"

   Step 5: 完整作答 (Full Answer)
     → 目标: 整合思考形成完整答案
     → 内容: Textarea输入（可参考引导问题答案）
     → 操作: "提交答案"

   Step 6: 评估与反馈 (Evaluation & Feedback)
     → 目标: 获得AI反馈
     → 内容: 得分+优缺点+改进建议
     → 操作: "查看反馈"

   Step 7: 反思总结 (Reflection)
     → 目标: 抽象概念化
     → 内容: 反思问题（改进1.1）
     → 操作: "完成本题"
   ```

2. **UI实现**
   ```typescript
   // 状态机设计
   type FlowStep =
     | 'concept'      // Step 1
     | 'case'         // Step 2
     | 'problem'      // Step 3
     | 'guided'       // Step 4
     | 'answer'       // Step 5
     | 'feedback'     // Step 6
     | 'reflection'   // Step 7

   const [currentStep, setCurrentStep] = useState<FlowStep>('concept')

   // 进度指示器
   <ProgressBar>
     {steps.map((step, index) => (
       <Step
         active={currentStep === step.id}
         completed={completedSteps.includes(step.id)}
       />
     ))}
   </ProgressBar>

   // 只渲染当前步骤
   {currentStep === 'concept' && <ConceptActivation />}
   {currentStep === 'case' && <CaseAnalysis />}
   {currentStep === 'problem' && <ProblemPresentation />}
   {currentStep === 'guided' && <GuidedThinking />}
   {currentStep === 'answer' && <AnswerInput />}
   {currentStep === 'feedback' && <AIFeedback />}
   {currentStep === 'reflection' && <ReflectionSummary />}
   ```

3. **步骤间数据传递**
   ```typescript
   interface PracticeSessionState {
     step: FlowStep
     conceptUnderstood: boolean
     caseStudyViewed: boolean
     guidedAnswers: { [questionId: string]: string }
     fullAnswer: string
     evaluation: PracticeEvaluation | null
     reflection: ReflectionData | null
   }
   ```

4. **返回机制**
   - 允许用户返回上一步查看内容
   - 不允许跳过步骤（除Step 1概念激活可跳过）

**验收标准**:
- [ ] 用户首次进入练习看到Step 1概念激活
- [ ] 必须按顺序完成每个步骤
- [ ] 进度条清晰显示当前位置
- [ ] 可以返回查看之前步骤的内容
- [ ] Step 4引导问题可逐个回答
- [ ] 完成Step 7才能开始下一题

**时间估算**: 3天
**技术复杂度**: 中
**依赖项**: 改进1.1（反思环节）

---

#### 改进1.3: 引导问题即时反馈系统

**需求描述**:
将静态的引导问题列表改造为交互式问答系统，每个引导问题可单独回答并获得AI即时反馈。

**用户故事**:
```
作为学习者
当我回答一个引导问题时
我希望立即知道我的思路是否正确
以便及时调整思维方向
```

**功能要求**:

1. **交互式引导问题组件**
   ```typescript
   interface GuidedQuestion {
     id: string
     question: string
     purpose: string          // 这个问题的目的
     orderIndex: number
     hints?: string[]         // 渐进式提示
     expectedKeyPoints: string[] // AI验证用
   }

   // 用户答案状态
   interface GuidedAnswer {
     questionId: string
     userAnswer: string
     feedback?: {
       isOnTrack: boolean
       message: string
       hint?: string
       encouragement?: string
     }
     submittedAt: Date
   }
   ```

2. **UI设计**
   ```tsx
   {guidingQuestions.map((gq, index) => (
     <GuidedQuestionCard key={gq.id}>
       {/* 问题标题 */}
       <div className="flex items-center justify-between">
         <Badge>{index + 1}/{total}</Badge>
         <span className="text-sm text-gray-500">{gq.purpose}</span>
       </div>

       <h4 className="font-semibold mt-3">{gq.question}</h4>

       {/* 答题区（可折叠） */}
       <Collapsible open={activeQuestion === gq.id}>
         <Textarea
           placeholder="写下你的思考..."
           value={guidedAnswers[gq.id]?.userAnswer || ''}
           onChange={(e) => updateGuidedAnswer(gq.id, e.target.value)}
           className="mt-3"
         />

         {/* 操作按钮 */}
         <div className="flex space-x-2 mt-2">
           <Button
             variant="outline"
             onClick={() => requestHint(gq.id)}
             disabled={!guidedAnswers[gq.id]?.userAnswer}
           >
             💡 需要提示
           </Button>
           <Button
             onClick={() => validateGuidedAnswer(gq.id)}
             disabled={!guidedAnswers[gq.id]?.userAnswer?.trim()}
           >
             ✅ 检查思路
           </Button>
         </div>

         {/* AI即时反馈 */}
         {guidedAnswers[gq.id]?.feedback && (
           <Alert
             variant={
               guidedAnswers[gq.id].feedback.isOnTrack
                 ? 'success'
                 : 'warning'
             }
             className="mt-3"
           >
             {guidedAnswers[gq.id].feedback.message}
             {guidedAnswers[gq.id].feedback.hint && (
               <div className="mt-2 text-sm">
                 <strong>提示：</strong>{guidedAnswers[gq.id].feedback.hint}
               </div>
             )}
           </Alert>
         )}
       </Collapsible>

       {/* 展开/收起 */}
       <Button
         variant="ghost"
         onClick={() => toggleQuestion(gq.id)}
       >
         {activeQuestion === gq.id ? '收起' : '展开回答'}
       </Button>
     </GuidedQuestionCard>
   ))}

   {/* 完成所有引导问题后 */}
   {allQuestionsAnswered && (
     <Button onClick={() => proceedToFullAnswer()}>
       完成引导思考，开始整合答案 →
     </Button>
   )}
   ```

3. **后端API设计**
   ```typescript
   // POST /api/critical-thinking/validate-guided-answer
   interface ValidateGuidedAnswerRequest {
     questionId: string
     guidingQuestionId: string
     userAnswer: string
     thinkingTypeId: string
   }

   interface ValidateGuidedAnswerResponse {
     success: boolean
     data: {
       isOnTrack: boolean      // 思路是否正确
       message: string         // 即时反馈文本
       hint?: string           // 提示（如果偏离）
       encouragement?: string  // 鼓励语
       keyPointsCovered: string[] // 已覆盖的要点
       missingPoints: string[]    // 缺失的要点
     }
   }
   ```

4. **AI Prompt设计**
   ```typescript
   const GUIDED_ANSWER_VALIDATION_PROMPT = `
   你是批判性思维教练。请评估学生对引导问题的回答。

   思维维度: {thinkingType}
   引导问题: {guidingQuestion}
   引导问题目的: {purpose}
   预期关键点: {expectedKeyPoints}
   学生回答: {userAnswer}

   请评估：
   1. 学生的思路是否在正确方向？（是/否）
   2. 给予简短反馈（1-2句话，苏格拉底式引导）
   3. 如果偏离，提供一个渐进式提示（不直接给答案）
   4. 识别学生已覆盖的关键点和缺失的关键点

   返回JSON格式：
   {
     "isOnTrack": boolean,
     "message": "反馈文本",
     "hint": "提示（可选）",
     "keyPointsCovered": ["要点1"],
     "missingPoints": ["缺失要点1"]
   }
   `
   ```

5. **渐进式提示机制**
   - 第1次请求提示：给出思考方向
   - 第2次请求提示：给出部分关键词
   - 第3次请求提示：给出示例答案

**验收标准**:
- [ ] 用户可以逐个回答引导问题
- [ ] 点击"检查思路"后3秒内得到AI反馈
- [ ] AI反馈准确判断思路是否正确
- [ ] 提示系统渐进式展开
- [ ] 所有引导问题完成后才能进入下一步
- [ ] 引导问题答案可编辑（在提交最终答案前）

**时间估算**: 4天
**技术复杂度**: 中高
**依赖项**: 改进1.2（线性流程中的Step 4）

---

### Phase 2: 概念学习与知识追踪（P1 - 重要但非紧急）

#### 改进2.1: 扩展概念知识库

**需求描述**:
利用现有`ThinkingType.learningContent` JSON字段，为每个思维维度添加结构化的概念讲解内容。

**用户故事**:
```
作为新手学习者
当我第一次接触一个思维维度时
我需要先理解核心概念和方法
然后再进行练习
```

**功能要求**:

1. **learningContent数据结构扩展**
   ```typescript
   interface LearningContent {
     // 核心定义
     definition: string              // 清晰的定义（100字内）

     // 核心方法/步骤
     coreMethod: {
       title: string
       description: string
       example: string
     }[]

     // 常见陷阱
     commonPitfalls: {
       title: string
       description: string
       example: string
       howToAvoid: string
     }[]

     // 关键问题（检查清单）
     keyQuestions: string[]

     // 实例演示
     examples: {
       scenario: string
       question: string
       goodAnswer: string          // 好的回答示例
       poorAnswer: string          // 差的回答示例
       analysis: string            // 分析两者差异
     }[]

     // 进阶资源
     furtherReading?: {
       title: string
       url: string
       description: string
     }[]
   }
   ```

2. **五大维度的内容填充**（示例：因果分析）
   ```typescript
   {
     id: 'causal_analysis',
     name: '多维归因与利弊权衡',
     learningContent: {
       definition: '多维归因是指从多个角度分析事件的原因，区分相关性与因果性，识别混淆因素，建立可靠的因果推理链。',

       coreMethod: [
         {
           title: '第一步：区分相关性与因果性',
           description: '两个现象同时发生不代表有因果关系',
           example: '冰淇淋销量↑ 与 溺水人数↑ 同时发生，但真正原因是气温↑'
         },
         {
           title: '第二步：识别混淆因素',
           description: '寻找可能同时影响两个变量的第三因素',
           example: '...'
         },
         {
           title: '第三步：建立因果链',
           description: '确认时间顺序、机制和必要性',
           example: '...'
         }
       ],

       commonPitfalls: [
         {
           title: '将相关性等同于因果性',
           description: '仅因为A和B同时发生就认为A导致B',
           example: '研究发现喝咖啡的人更聪明 → 结论：咖啡让人聪明',
           howToAvoid: '问自己：是否存在第三因素（如本来聪明的人更爱喝咖啡）？'
         },
         // ...更多陷阱
       ],

       keyQuestions: [
         '这两个现象是巧合还是有因果关系？',
         '是否存在未考虑的混淆因素？',
         '因果方向是否明确？（A→B 还是 B→A？）',
         '是直接因果还是间接因果？',
         '因果关系是必然还是概率性的？'
       ],

       examples: [
         {
           scenario: '某城市犯罪率下降与警察数量增加同时发生',
           question: '是警察数量增加导致犯罪率下降吗？',
           goodAnswer: '需要考虑：1) 时间顺序（警察增加是否在犯罪率下降之前）2) 其他因素（经济改善、教育水平提升）3) 相邻城市的对比数据',
           poorAnswer: '是的，警察多了犯罪当然少',
           analysis: '好的回答识别了多个可能的混淆因素，差的回答直接假设因果关系'
         }
       ]
     }
   }
   ```

3. **概念激活组件设计**（Step 1使用）
   ```tsx
   <ConceptActivationCard>
     {/* 定义 */}
     <Section title="什么是{typeName}？">
       <p className="text-lg">{learningContent.definition}</p>
     </Section>

     {/* 核心方法 */}
     <Section title="核心方法">
       <div className="space-y-4">
         {learningContent.coreMethod.map((method, i) => (
           <MethodCard key={i}>
             <Badge>{i + 1}</Badge>
             <h4>{method.title}</h4>
             <p>{method.description}</p>
             <Alert variant="info">
               <Lightbulb />
               <span>示例：{method.example}</span>
             </Alert>
           </MethodCard>
         ))}
       </div>
     </Section>

     {/* 常见陷阱 */}
     <Section title="常见陷阱" collapsible>
       {learningContent.commonPitfalls.map((pitfall, i) => (
         <PitfallCard key={i}>
           <AlertTriangle className="text-orange-500" />
           <h4>{pitfall.title}</h4>
           <p>{pitfall.description}</p>
           <div className="bg-red-50 p-3 rounded">
             <strong>❌ 错误示例：</strong>{pitfall.example}
           </div>
           <div className="bg-green-50 p-3 rounded">
             <strong>✅ 如何避免：</strong>{pitfall.howToAvoid}
           </div>
         </PitfallCard>
       ))}
     </Section>

     {/* 检查清单 */}
     <Section title="思考检查清单">
       <Checklist items={learningContent.keyQuestions} />
     </Section>

     {/* 好答案 vs 差答案示例 */}
     <Section title="答题示例对比">
       {learningContent.examples.map((ex, i) => (
         <ExampleCard key={i}>
           <h4>{ex.scenario}</h4>
           <p><strong>问题：</strong>{ex.question}</p>
           <ComparisonView>
             <div className="good-answer">
               <Badge variant="success">优秀回答</Badge>
               <p>{ex.goodAnswer}</p>
             </div>
             <div className="poor-answer">
               <Badge variant="destructive">欠佳回答</Badge>
               <p>{ex.poorAnswer}</p>
             </div>
           </ComparisonView>
           <Alert>
             <Info />
             <strong>分析：</strong>{ex.analysis}
           </Alert>
         </ExampleCard>
       ))}
     </Section>

     {/* 行动按钮 */}
     <div className="flex space-x-3 mt-6">
       <Button onClick={proceedToCaseStudy} size="lg">
         理解了，看实际案例 →
       </Button>
       <Button variant="outline" onClick={skipToPractice}>
         我已熟悉，直接练习
       </Button>
     </div>
   </ConceptActivationCard>
   ```

4. **内容填充任务**
   - [ ] 因果分析（causal_analysis）
   - [ ] 前提质疑（premise_challenge）
   - [ ] 谬误检测（fallacy_detection）
   - [ ] 迭代反思（iterative_reflection）
   - [ ] 知识迁移（connection_transfer）

**验收标准**:
- [ ] 五个思维维度的learningContent字段全部填充
- [ ] 每个维度至少包含3个核心方法、3个陷阱、5个关键问题
- [ ] 概念激活组件在Step 1正确渲染
- [ ] 用户可选择"跳过概念"直接进入练习
- [ ] 概念内容可在任何时候通过侧边栏访问

**时间估算**: 2天（开发1天+内容填充1天）
**技术复杂度**: 低
**依赖项**: 改进1.2（线性流程Step 1）

---

#### 改进2.2: 知识点掌握度追踪

**需求描述**:
建立轻量级的知识点掌握度追踪系统，为未来的智能推荐提供数据基础。

**用户故事**:
```
作为学习者
我希望系统能记住我在每个知识点上的掌握情况
这样我可以看到自己的进步
也能得到针对性的练习推荐
```

**功能要求**:

1. **数据库Schema**
   ```typescript
   // prisma/schema.prisma 新增
   model KnowledgePointMastery {
     id            String   @id @default(cuid())
     userId        String
     thinkingTypeId String
     conceptKey    String   // 概念标识符
     masteryLevel  Float    @default(0.0) // 0-1
     lastPracticed DateTime @default(now())
     practiceCount Int      @default(0)
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt

     user User @relation(fields: [userId], references: [id], onDelete: Cascade)

     @@unique([userId, thinkingTypeId, conceptKey])
     @@index([userId, lastPracticed])
     @@index([userId, masteryLevel])
     @@map("knowledge_point_mastery")
   }
   ```

2. **概念映射表**（每个维度的核心概念）
   ```typescript
   const CONCEPT_MAPPING = {
     causal_analysis: [
       { key: 'correlation_vs_causation', name: '相关性与因果性' },
       { key: 'confounding_factors', name: '混淆因素识别' },
       { key: 'causal_chain', name: '因果链建立' },
       { key: 'necessity_sufficiency', name: '必要条件与充分条件' },
       { key: 'reverse_causality', name: '反向因果' }
     ],
     premise_challenge: [
       { key: 'implicit_premises', name: '隐含前提识别' },
       { key: 'premise_evaluation', name: '前提合理性评估' },
       { key: 'reframe_problem', name: '问题重新框定' },
       { key: 'assumption_testing', name: '假设检验' }
     ],
     // ... 其他维度
   }
   ```

3. **掌握度计算逻辑**
   ```typescript
   // 简化版算法（MVP阶段）
   async function updateKnowledgeMastery(
     userId: string,
     thinkingTypeId: string,
     questionId: string,
     score: number // 0-100
   ) {
     // 1. 提取本题涉及的概念（基于tags或题目分析）
     const concepts = await extractConceptsFromQuestion(questionId)

     // 2. 更新每个概念的掌握度
     for (const conceptKey of concepts) {
       const existing = await prisma.knowledgePointMastery.findUnique({
         where: {
           userId_thinkingTypeId_conceptKey: {
             userId,
             thinkingTypeId,
             conceptKey
           }
         }
       })

       // 加权平均算法：70%历史 + 30%本次
       const newMasteryLevel = existing
         ? existing.masteryLevel * 0.7 + (score / 100) * 0.3
         : score / 100

       await prisma.knowledgePointMastery.upsert({
         where: { userId_thinkingTypeId_conceptKey: {...} },
         update: {
           masteryLevel: newMasteryLevel,
           lastPracticed: new Date(),
           practiceCount: { increment: 1 }
         },
         create: {
           userId,
           thinkingTypeId,
           conceptKey,
           masteryLevel: score / 100,
           practiceCount: 1
         }
       })
     }
   }

   // 根据题目tags提取概念
   function extractConceptsFromQuestion(question: Question): string[] {
     // 简单规则匹配（MVP阶段）
     const concepts = []
     const tags = question.tags as string[]

     // 示例规则
     if (tags.includes('因果关系') || tags.includes('相关性')) {
       concepts.push('correlation_vs_causation')
     }
     if (tags.includes('混淆因素') || tags.includes('第三变量')) {
       concepts.push('confounding_factors')
     }
     // ... 更多规则

     return concepts
   }
   ```

4. **前端可视化组件**
   ```tsx
   // /learn/dashboard 新增
   <Card title="知识点掌握雷达图">
     <RadarChart
       data={knowledgeMasteryData.map(kp => ({
         concept: kp.conceptName,
         mastery: kp.masteryLevel * 100,
         fullMark: 100
       }))}
     />
     <div className="grid grid-cols-2 gap-3 mt-4">
       {knowledgeMasteryData.map(kp => (
         <div key={kp.conceptKey} className="flex items-center justify-between">
           <span className="text-sm">{kp.conceptName}</span>
           <div className="flex items-center space-x-2">
             <Progress value={kp.masteryLevel * 100} className="w-20" />
             <span className="text-sm font-semibold">
               {Math.round(kp.masteryLevel * 100)}%
             </span>
           </div>
         </div>
       ))}
     </div>
   </Card>
   ```

5. **API端点**
   ```typescript
   // GET /api/knowledge-mastery/summary?userId={userId}
   interface KnowledgeMasterySummary {
     thinkingTypeId: string
     thinkingTypeName: string
     concepts: {
       conceptKey: string
       conceptName: string
       masteryLevel: number      // 0-1
       practiceCount: number
       lastPracticed: Date | null
     }[]
     overallMastery: number      // 平均值
   }
   ```

**验收标准**:
- [ ] 用户完成练习后自动更新知识点掌握度
- [ ] 掌握度数据正确存储到数据库
- [ ] /learn/dashboard显示雷达图
- [ ] 雷达图数据准确反映用户掌握情况
- [ ] 可点击知识点查看详细练习历史

**时间估算**: 3天
**技术复杂度**: 中
**依赖项**: 无（独立功能）

---

#### 改进2.3: 智能练习推荐优化

**需求描述**:
基于知识点掌握度数据，优化每日练习推荐算法。

**用户故事**:
```
作为学习者
当我开始每日练习时
我希望系统推荐我最需要练习的内容
而不是随机或仅基于次数的推荐
```

**功能要求**:

1. **推荐算法设计**
   ```typescript
   interface SmartRecommendation {
     thinkingTypeId: string
     reason: string
     priority: 'high' | 'medium' | 'low'
     targetConcepts: string[]  // 本次推荐针对的知识点
   }

   async function getSmartRecommendation(
     userId: string
   ): Promise<SmartRecommendation> {
     // 1. 获取用户所有知识点掌握度
     const masteryData = await prisma.knowledgePointMastery.findMany({
       where: { userId },
       include: { thinkingType: true }
     })

     // 2. 计算每个维度的平均掌握度
     const dimensionScores = groupBy(masteryData, 'thinkingTypeId')
       .map(([typeId, concepts]) => ({
         thinkingTypeId: typeId,
         avgMastery: average(concepts.map(c => c.masteryLevel)),
         conceptCount: concepts.length,
         lowestConcept: minBy(concepts, 'masteryLevel')
       }))

     // 3. 考虑遗忘曲线（最后练习时间）
     const forgettingScore = masteryData.map(kp => {
       const daysSinceLastPractice =
         (Date.now() - kp.lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
       // 3天后开始遗忘
       const forgettingFactor = Math.min(daysSinceLastPractice / 7, 1)
       return {
         ...kp,
         adjustedMastery: kp.masteryLevel * (1 - forgettingFactor * 0.3)
       }
     })

     // 4. 综合评分：掌握度（40%） + 遗忘因素（30%） + 练习频率（30%）
     const recommendationScores = dimensionScores.map(dim => {
       const masteryWeight = (1 - dim.avgMastery) * 0.4
       const forgettingWeight = getForgettingWeight(dim.thinkingTypeId) * 0.3
       const practiceFreqWeight = getPracticeFrequency(dim.thinkingTypeId) * 0.3

       return {
         thinkingTypeId: dim.thinkingTypeId,
         score: masteryWeight + forgettingWeight + practiceFreqWeight,
         reason: generateReason(dim)
       }
     })

     // 5. 返回得分最高的推荐
     const topRecommendation = maxBy(recommendationScores, 'score')

     return {
       thinkingTypeId: topRecommendation.thinkingTypeId,
       reason: topRecommendation.reason,
       priority: topRecommendation.score > 0.7 ? 'high' :
                 topRecommendation.score > 0.4 ? 'medium' : 'low',
       targetConcepts: getWeakConcepts(topRecommendation.thinkingTypeId)
     }
   }

   function generateReason(dim: DimensionScore): string {
     if (dim.avgMastery < 0.3) {
       return `【${dim.name}】掌握度较低（${Math.round(dim.avgMastery * 100)}%），建议重点练习`
     }
     if (dim.daysSinceLastPractice > 7) {
       return `距离上次练习【${dim.name}】已有${dim.daysSinceLastPractice}天，建议复习巩固`
     }
     return `继续练习【${dim.name}】以进一步提升`
   }
   ```

2. **UI展示**
   ```tsx
   // DailyPracticeMain.tsx 改进
   <RecommendationSection>
     <Badge
       variant={recommendation.priority === 'high' ? 'destructive' : 'default'}
     >
       {recommendation.priority === 'high' ? '重点推荐' : 'AI推荐'}
     </Badge>

     <Card className="mt-3">
       <CardHeader>
         <div className="flex items-center space-x-2">
           <Sparkles className="h-5 w-5 text-yellow-500" />
           <CardTitle>今日智能推荐</CardTitle>
         </div>
       </CardHeader>
       <CardContent>
         <h3 className="text-xl font-bold mb-2">
           {getThinkingTypeName(recommendation.thinkingTypeId)}
         </h3>
         <p className="text-gray-600 mb-4">{recommendation.reason}</p>

         {/* 目标知识点 */}
         <div className="mb-4">
           <span className="text-sm text-gray-500">本次练习重点：</span>
           <div className="flex flex-wrap gap-2 mt-2">
             {recommendation.targetConcepts.map(concept => (
               <Badge key={concept} variant="outline">
                 {getConceptName(concept)}
               </Badge>
             ))}
           </div>
         </div>

         <Button
           size="lg"
           onClick={() => startPractice(recommendation.thinkingTypeId)}
           className="w-full"
         >
           <Rocket className="mr-2" />
           开始智能推荐练习
         </Button>
       </CardContent>
     </Card>
   </RecommendationSection>
   ```

3. **推荐多样性**
   - 允许用户"换一个推荐"
   - 保存推荐历史（避免重复推荐）
   - 用户可选择"我想练习其他维度"

**验收标准**:
- [ ] 推荐算法基于掌握度数据运行
- [ ] 推荐理由清晰合理
- [ ] 优先推荐掌握度低的维度
- [ ] 考虑遗忘曲线（7天未练习提示复习）
- [ ] 用户可以忽略推荐自主选择

**时间估算**: 1天
**技术复杂度**: 中低
**依赖项**: 改进2.2（知识点追踪）

---

## 📊 实施计划

### Sprint 1: 核心闭环完善（Week 1）

**目标**: 完成最关键的学习流程改进

**任务列表**:
- [ ] Day 1-2: 实现反思总结环节（改进1.1）
  - [ ] 设计Reflection表单组件
  - [ ] 扩展PracticeSession表字段
  - [ ] 实现反思数据存储API
  - [ ] 集成到PracticeSession流程

- [ ] Day 3-5: 重构为线性流程（改进1.2）
  - [ ] 设计状态机和Step组件
  - [ ] 重构PracticeSession组件架构
  - [ ] 实现7步流程渲染逻辑
  - [ ] 测试流程完整性

**验收标准**:
- 用户完成练习必须填写反思
- 线性流程运行流畅无阻塞
- 进度条清晰展示当前步骤

---

### Sprint 2: 交互式引导系统（Week 2, Day 1-4）

**目标**: 实现引导问题的即时反馈

**任务列表**:
- [ ] Day 1: API开发
  - [ ] 设计AI Prompt模板
  - [ ] 实现/api/critical-thinking/validate-guided-answer
  - [ ] 测试AI反馈准确性

- [ ] Day 2-3: 前端组件开发
  - [ ] 开发GuidedQuestionCard组件
  - [ ] 实现折叠/展开交互
  - [ ] 集成AI反馈显示

- [ ] Day 4: 集成与测试
  - [ ] 集成到线性流程Step 4
  - [ ] 端到端测试
  - [ ] 优化用户体验

**验收标准**:
- 每个引导问题可独立回答
- AI反馈在3秒内返回
- 渐进式提示机制工作正常

---

### Sprint 3: 概念学习与追踪（Week 2, Day 5 - Week 3）

**目标**: 补全概念学习环节，建立知识追踪系统

**任务列表**:
- [ ] Week 2, Day 5: 概念内容填充
  - [ ] 五大维度learningContent填充
  - [ ] 编写核心方法、陷阱、示例

- [ ] Week 3, Day 1-2: 概念展示组件
  - [ ] 开发ConceptActivationCard
  - [ ] 集成到线性流程Step 1
  - [ ] 测试概念内容渲染

- [ ] Week 3, Day 3-5: 知识点追踪系统
  - [ ] 创建KnowledgePointMastery模型
  - [ ] 实现掌握度计算逻辑
  - [ ] 开发Dashboard雷达图组件
  - [ ] 实现智能推荐算法
  - [ ] 集成到每日练习

**验收标准**:
- 五大维度概念内容完整
- 知识点掌握度正确计算
- 雷达图可视化清晰
- 智能推荐合理有效

---

## 🎯 验收标准总结

### 功能完整性
- [ ] 7步线性学习流程运行正常
- [ ] 反思总结环节强制完成
- [ ] 引导问题交互式反馈生效
- [ ] 概念知识库内容完整
- [ ] 知识点掌握度追踪准确
- [ ] 智能推荐算法运行

### 科学性验证
- [ ] 完整Kolb学习循环实现
- [ ] 符合Bloom认知层级设计
- [ ] 元认知支持机制完善
- [ ] 脚手架教学有效实施
- [ ] 认知负荷控制合理

### 用户体验
- [ ] 新手用户完成率 >70%
- [ ] 平均练习时长增加至15分钟
- [ ] 用户反馈"感觉学到东西" >80%
- [ ] 系统响应时间 <3秒

### 技术质量
- [ ] 代码通过TypeScript编译
- [ ] 所有API端点有错误处理
- [ ] 数据库迁移成功运行
- [ ] 前端组件通过ESLint检查

---

## 📈 预期效果

### 学习效果指标
| 指标 | 当前 | 改进后目标 |
|------|------|-----------|
| 练习完成率 | ~50% | >70% |
| 知识留存率（30天） | ~35% | >55% |
| 平均学习时长 | 8-12分钟 | 15分钟 |
| 用户满意度 | 未测量 | NPS >40 |

### 教学科学性指标
| 维度 | 改进前 | 改进后 |
|------|--------|--------|
| Kolb循环完整性 | 50% | 100% |
| Bloom层级覆盖 | 60% | 90% |
| 元认知支持 | 20% | 80% |
| 脚手架教学 | 30% | 85% |

---

## 🚨 风险与缓解策略

### 技术风险
1. **AI反馈质量不稳定**
   - 风险: 引导问题验证准确率低
   - 缓解:
     - 多轮Prompt工程优化
     - 建立验证数据集
     - 人工审核样本输出

2. **线性流程过长导致用户流失**
   - 风险: 7步流程太长，用户中途放弃
   - 缓解:
     - 允许老用户跳过概念激活
     - 显示预计完成时间
     - 中途保存进度

### 业务风险
1. **改动影响现有用户习惯**
   - 风险: 老用户不适应新流程
   - 缓解:
     - 灰度发布（10% → 50% → 100%）
     - 提供"经典模式"开关
     - 收集用户反馈快速迭代

2. **开发周期延长**
   - 风险: 实际开发超过3周
   - 缓解:
     - 严格按优先级实施（P0必须，P1可延后）
     - 每日站会同步进度
     - 关键路径提前识别

---

## 📝 后续优化方向（Post-MVP）

### Phase 3: 间隔重复系统（未来）
- 基于SM-2算法的复习调度
- 遗忘曲线预测
- 自动复习提醒

### Phase 4: 社交与游戏化（未来）
- 成就系统
- 排行榜
- 好友PK

### Phase 5: 高阶功能（未来）
- 跨维度综合练习
- AI学习教练
- 个性化学习路径

---

## 📚 参考文献

**认知科学理论**:
- Kolb, D. A. (1984). *Experiential Learning: Experience as the Source of Learning and Development*
- Bloom, B. S. (1956). *Taxonomy of Educational Objectives*
- Vygotsky, L. S. (1978). *Mind in Society: The Development of Higher Psychological Processes*

**教学设计**:
- Sweller, J. (1988). Cognitive Load Theory
- Schön, D. A. (1983). The Reflective Practitioner
- Ebbinghaus, H. (1885). Memory: A Contribution to Experimental Psychology

---

**文档版本**: v1.0
**最后更新**: 2025-01-12
**下次审查**: Sprint 1完成后
