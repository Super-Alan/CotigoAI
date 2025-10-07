# 批判性思维能力导向的智能话题推荐系统设计文档

## 一、系统目标

设计一个基于大模型的智能话题推荐系统，能够：
1. **精准诊断**用户在五大批判性思维维度的能力水平
2. **动态推荐**最适合当前用户的训练话题
3. **个性化引导**提供针对性的思维训练路径
4. **持续优化**基于对话反馈不断更新用户画像

## 二、批判性思维五大核心能力维度

### 1. 多维归因与利弊权衡 (Causal Analysis & Trade-off Evaluation)

**能力描述：**
- 识别问题的多重原因（直接原因、根本原因、促成因素）
- 分析不同解决方案的优劣势和权衡
- 理解复杂系统中的因果关系链

**典型话题场景：**
- 经济政策效果分析（如降息对通胀的影响）
- 技术决策的多方影响评估（如AI替代人工的利弊）
- 社会现象的多因素解释（如教育不平等的成因）

**引导性问题框架：**
```
第一层：原因识别
- "导致X现象的主要因素有哪些？"
- "这些因素之间是如何相互作用的？"

第二层：深度归因
- "为什么A会导致B？这个因果链条中有哪些中间环节？"
- "除了表面原因，还有哪些更根本的结构性因素？"

第三层：权衡分析
- "方案A的主要优势是什么？需要付出哪些代价？"
- "短期收益和长期风险之间如何平衡？"
```

### 2. 前提质疑与方法批判 (Premise Questioning & Method Critique)

**能力描述：**
- 识别论证中的隐含前提和假设
- 质疑研究方法、数据来源的可靠性
- 评估论证框架本身的合理性

**典型话题场景：**
- 科学研究结论的批判性评估（如新药试验报告）
- 统计数据的解读质疑（如就业率计算方法）
- 理论框架的适用性讨论（如经济模型的局限）

**引导性问题框架：**
```
第一层：前提识别
- "这个论证要成立，需要假设哪些前提条件为真？"
- "这些假设是显而易见的，还是存在争议的？"

第二层：方法批判
- "这个研究的数据收集方法有哪些潜在偏差？"
- "样本是否具有代表性？排除了哪些重要变量？"

第三层：框架质疑
- "这个分析框架本身有哪些理论盲点？"
- "换一个分析视角，结论会有什么变化？"
```

### 3. 谬误识别与证据评估 (Fallacy Detection & Evidence Assessment)

**能力描述：**
- 识别常见逻辑谬误（稻草人、滑坡、诉诸权威等）
- 评估证据的质量、相关性和充分性
- 区分相关性与因果性

**典型话题场景：**
- 广告宣传的逻辑分析（如"明星代言=产品优质"）
- 政治辩论中的论证质量评估
- 新闻报道的证据充分性检验

**引导性问题框架：**
```
第一层：谬误识别
- "这个论证中是否存在逻辑跳跃？"
- "作者是否将相关性错误地等同于因果性？"
- "是否使用了情绪化语言来替代理性论证？"

第二层：证据评估
- "支持这个观点的证据有哪些？它们的可信度如何？"
- "这些证据是否充分？还缺少哪些关键信息？"
- "是否存在与之矛盾的证据被忽略了？"

第三层：论证强度
- "即使证据为真，它对结论的支持力度有多强？"
- "这个论证是必然的（演绎）还是可能的（归纳）？"
```

### 4. 观点迭代与反思 (Iterative Refinement & Self-reflection)

**能力描述：**
- 在新信息出现时调整自己的观点
- 识别自己思维中的盲点和偏见
- 进行元认知思考（思考自己的思考过程）

**典型话题场景：**
- 自我观点演变历程的回顾
- 面对反驳意见的理性回应
- 认知偏差的自我诊断（确认偏误、锚定效应等）

**引导性问题框架：**
```
第一层：观点检视
- "你的观点在对话前后有什么变化？"
- "是什么新信息或论点促使你调整了看法？"

第二层：偏见识别
- "你是否更容易接受支持自己观点的证据？"
- "你对反对意见的态度是开放的还是防御性的？"
- "你的个人经历或身份如何影响了你的判断？"

第三层：元认知
- "你是如何得出这个结论的？思考过程是什么？"
- "如果你是对方，你会如何反驳自己的观点？"
- "你对这个话题的理解还有哪些不确定的部分？"
```

### 5. 关联与迁移 (Connection & Transfer)

**能力描述：**
- 将批判性思维能力应用到新情境
- 识别不同领域问题的共同结构
- 跨学科整合知识和思维方法

**典型话题场景：**
- 将历史案例的教训应用到当代问题
- 跨领域类比推理（如生物系统与社会系统的相似性）
- 将抽象原则具体化到实际决策

**引导性问题框架：**
```
第一层：模式识别
- "这个问题和你之前遇到的哪个问题类似？"
- "它们在结构上有什么共同点？"

第二层：跨域迁移
- "能否用一个不同领域的例子来说明这个原理？"
- "这个行业的解决方案能否借鉴到其他行业？"

第三层：抽象提炼
- "从这个具体案例中，你能总结出哪些普遍规律？"
- "这些规律在什么条件下成立？什么情况下会失效？"
```

## 三、智能推荐引擎技术实现

### 3.1 用户能力画像构建

**数据收集：**
```typescript
// 对话行为特征提取
interface ConversationAnalytics {
  conversationId: string;

  // 五维能力表现指标
  dimensionScores: {
    causal_analysis: {
      identifiedCauses: number;           // 识别出的原因数量
      depthOfAnalysis: number;            // 分析深度（1-5级）
      tradeoffConsiderations: number;     // 考虑的权衡点数量
    };
    premise_challenge: {
      assumptionsQuestioned: number;      // 质疑的前提数量
      methodCritiquesOffered: number;     // 提出的方法批判数量
      alternativeFrameworks: number;       // 提出的替代框架数量
    };
    fallacy_detection: {
      fallaciesIdentified: string[];      // 识别的谬误类型
      evidenceQualityAssessed: boolean;   // 是否评估了证据质量
      causalityDistinguished: boolean;    // 是否区分了相关性和因果性
    };
    iterative_reflection: {
      viewpointsRevised: number;          // 观点调整次数
      biasesAcknowledged: string[];       // 承认的偏见类型
      metacognitiveStatements: number;    // 元认知表述数量
    };
    connection_transfer: {
      crossDomainAnalogies: number;       // 跨域类比数量
      principlesAbstracted: number;       // 抽象出的原则数量
      applicationContexts: number;        // 应用到的新情境数量
    };
  };

  // 对话质量指标
  messageDepth: number;                   // 平均回复深度（字符数/复杂度）
  engagementLevel: number;                // 参与度评分
  completionRate: number;                 // 对话完成度
}
```

**能力评分算法：**
```typescript
async function calculateCapabilityProfile(
  userId: string
): Promise<CapabilityProfile> {
  // 1. 获取用户所有对话的分析数据
  const conversations = await fetchUserConversations(userId);

  // 2. 加权计算各维度得分（最近对话权重更高）
  const dimensionScores = {};

  for (const dim of Object.values(CriticalThinkingDimension)) {
    const recentScores = conversations
      .slice(-10) // 最近10次对话
      .map((conv, idx) => {
        const weight = Math.pow(0.9, 9 - idx); // 时间衰减
        return conv.dimensionScores[dim] * weight;
      });

    dimensionScores[dim] = {
      level: normalizeScore(recentScores),
      practiceCount: conversations.filter(c =>
        c.primaryDimension === dim
      ).length,
      lastUpdate: new Date()
    };
  }

  // 3. 识别最弱和最强维度
  const sorted = Object.entries(dimensionScores)
    .sort((a, b) => a[1].level - b[1].level);

  return {
    userId,
    dimensions: dimensionScores,
    weakestDimension: sorted[0][0],
    strongestDimension: sorted[sorted.length - 1][0]
  };
}
```

### 3.2 话题生成Prompt设计

**系统提示词（System Prompt）：**
```
你是Cogito AI的话题推荐专家，专注于批判性思维能力训练。

**核心任务：**
基于用户的能力画像，生成精准的个性化话题推荐，每个话题必须明确关联到五大批判性思维维度之一。

**五大批判性思维维度：**
1. 多维归因与利弊权衡 (causal_analysis)
2. 前提质疑与方法批判 (premise_challenge)
3. 谬误识别与证据评估 (fallacy_detection)
4. 观点迭代与反思 (iterative_reflection)
5. 关联与迁移 (connection_transfer)

**推荐原则：**
1. **针对性强**：优先推荐能训练用户最薄弱维度的话题
2. **难度适配**：根据用户当前水平选择合适难度（beginner/intermediate/advanced）
3. **多样性**：避免重复最近已讨论的话题和领域
4. **时效性**：结合最新的社会热点和科技动态
5. **启发性**：话题应具有争议性和多面性，能引发深度思考

**输出格式：**
JSON数组，每个话题包含：
- topic: 话题主题（简洁，问题形式）
- category: 话题分类
- context: 背景信息（50-100字）
- primaryDimension: 主要训练的批判性思维维度
- difficulty: 难度级别
- recommendationReason: 推荐理由（向用户解释为什么推荐这个话题）
- trainingGoals: 通过这个话题期望达成的训练目标（2-3个）
- guidingQuestions: 按维度组织的引导性问题列表
```

**用户查询模板：**
```typescript
const generateTopicPrompt = (request: TopicRecommendationRequest) => `
请为用户生成${request.count}个个性化话题推荐。

**用户能力画像：**
${JSON.stringify(request.capabilityProfile, null, 2)}

**优先训练维度：** ${request.targetDimension || request.capabilityProfile.weakestDimension}

**近期已讨论话题：** ${request.recentTopics.join(', ')}

**用户兴趣领域：** ${request.preferredCategories?.join(', ') || '不限'}

**特殊要求：**
1. 第一个话题必须针对用户最薄弱的维度（${request.capabilityProfile.weakestDimension}）
2. 话题难度应比用户当前水平高10-20%，形成"最近发展区"
3. 至少包含一个跨学科话题（训练关联与迁移能力）
4. 提供清晰的训练目标和引导性问题框架

请以JSON格式输出推荐结果。
`;
```

### 3.3 实时上下文感知推荐

**对话中动态推荐：**
```typescript
// 在用户完成一轮对话后，实时分析并推荐下一个话题
async function generateContextAwareRecommendations(
  conversationId: string,
  userId: string
): Promise<RecommendedTopic[]> {
  // 1. 分析当前对话表现
  const currentPerformance = await analyzeConversation(conversationId);

  // 2. 识别暴露的能力短板
  const identifiedWeaknesses = currentPerformance.dimensionScores
    .filter(score => score.level < 60)
    .map(score => score.dimension);

  // 3. 生成针对性推荐
  const prompt = `
  用户刚完成一次关于"${currentPerformance.topic}"的对话。

  **对话表现分析：**
  ${JSON.stringify(currentPerformance.dimensionScores)}

  **识别的能力短板：**
  ${identifiedWeaknesses.join(', ')}

  请推荐3个话题，帮助用户：
  1. 强化刚才暴露的薄弱环节
  2. 巩固和迁移刚才练习的思维方法
  3. 逐步提升综合批判性思维能力
  `;

  return await callLLM(prompt);
}
```

## 四、前端展示设计

### 4.1 推荐话题卡片升级

```typescript
<div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
  {/* 能力维度标签 */}
  <div className="flex items-center gap-2 mb-3">
    <span className="px-3 py-1 text-xs font-semibold rounded-full
      ${getDimensionColor(topic.primaryDimension)}">
      {getDimensionLabel(topic.primaryDimension)}
    </span>
    <span className="px-2 py-1 text-xs bg-gray-100 rounded">
      {topic.difficulty === 'beginner' ? '入门' :
       topic.difficulty === 'intermediate' ? '进阶' : '高级'}
    </span>
  </div>

  {/* 话题主题 */}
  <h3 className="font-bold text-lg mb-2">{topic.topic}</h3>

  {/* 推荐理由 */}
  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
    <p className="text-sm text-blue-900">
      💡 {topic.recommendationReason}
    </p>
  </div>

  {/* 训练目标 */}
  <div className="mb-3">
    <p className="text-xs text-gray-500 mb-2">🎯 训练目标：</p>
    <ul className="text-sm space-y-1">
      {topic.trainingGoals.map(goal => (
        <li key={goal} className="flex items-start gap-2">
          <span className="text-green-500 mt-1">✓</span>
          <span>{goal}</span>
        </li>
      ))}
    </ul>
  </div>

  {/* 引导性问题预览 */}
  <details className="text-sm">
    <summary className="cursor-pointer text-purple-600 font-medium">
      查看引导性问题框架 →
    </summary>
    <div className="mt-2 space-y-2">
      {topic.guidingQuestions.map(gq => (
        <div key={gq.dimension} className="pl-4 border-l-2 border-gray-200">
          <p className="font-medium text-gray-700">
            {getDimensionLabel(gq.dimension)}
          </p>
          <ul className="text-xs text-gray-600 space-y-1 mt-1">
            {gq.questions.slice(0, 2).map(q => (
              <li key={q}>• {q}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </details>

  {/* 开始按钮 */}
  <button onClick={() => startConversation(topic.topic)}
    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600
    text-white py-2 rounded-lg hover:opacity-90 transition">
    开始训练 →
  </button>
</div>
```

### 4.2 能力仪表盘

```typescript
<div className="bg-white rounded-xl shadow-md p-6 mb-6">
  <h3 className="text-lg font-bold mb-4">📊 你的批判性思维能力画像</h3>

  {/* 雷达图展示五维能力 */}
  <div className="mb-4">
    <RadarChart data={capabilityProfile.dimensions} />
  </div>

  {/* 维度详情 */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {Object.entries(capabilityProfile.dimensions).map(([dim, data]) => (
      <div key={dim} className="p-3 border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{getDimensionLabel(dim)}</span>
          <span className="text-sm font-bold">{data.level}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full ${getLevelColor(data.level)}"
            style={{ width: `${data.level}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          已练习 {data.practiceCount} 次
        </p>
      </div>
    ))}
  </div>

  {/* 训练建议 */}
  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
    <p className="text-sm text-amber-900">
      💪 <strong>训练建议：</strong>
      你在"{getDimensionLabel(capabilityProfile.weakestDimension)}"维度还有提升空间，
      建议优先选择标注为此维度的话题进行针对性训练。
    </p>
  </div>
</div>
```

## 五、实施路线图

### Phase 1: 基础架构（第1-2周）
- [ ] 建立五维能力评估数据模型
- [ ] 实现对话分析与能力评分算法
- [ ] 构建用户能力画像存储和更新机制

### Phase 2: 推荐引擎（第3-4周）
- [ ] 设计和测试话题生成Prompt
- [ ] 实现基于能力画像的个性化推荐API
- [ ] 集成实时上下文感知推荐

### Phase 3: 前端集成（第5周）
- [ ] 升级话题推荐卡片UI
- [ ] 开发能力仪表盘组件
- [ ] 实现话题与对话的无缝衔接

### Phase 4: 优化迭代（第6周+）
- [ ] 收集用户反馈和使用数据
- [ ] 优化推荐算法和Prompt
- [ ] A/B测试不同推荐策略

## 六、成功指标

**定量指标：**
- 用户选择推荐话题的点击率 > 60%
- 用户完成推荐话题对话的比例 > 40%
- 用户能力画像各维度均衡度（标准差）< 15分
- 用户回访率提升 > 20%

**定性指标：**
- 用户感知推荐话题的相关性和针对性
- 用户认可话题训练对批判性思维的帮助
- 用户愿意分享自己的能力进步

## 七、关键技术挑战与解决方案

### 挑战1：如何准确评估对话中的能力表现？

**解决方案：**
- 使用GPT-4级别模型进行对话分析，提取能力特征
- 设计结构化的评估Prompt，输出标准化的评分JSON
- 结合规则引擎（如关键词匹配）和AI判断（语义理解）

### 挑战2：如何避免推荐陷入"舒适区"或"挫败区"？

**解决方案：**
- 实现"最近发展区"算法：推荐难度=当前水平+10-20%
- 动态调整：如果用户连续完成高难度话题，提升推荐难度
- 提供难度选择权：允许用户手动选择"挑战自己"或"巩固基础"

### 挑战3：如何平衡个性化推荐与内容多样性？

**解决方案：**
- 70%推荐针对薄弱维度，30%推荐其他维度（保持综合训练）
- 引入"探索模式"：每10个推荐中包含1个意外话题
- 基于协同过滤：推荐相似用户喜欢但当前用户未尝试的话题

---

**文档版本：** v1.0
**最后更新：** 2025-10-07
**负责人：** AI Native开发团队
