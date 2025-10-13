'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Target,
  Lightbulb,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Loader2,
  AlertCircle,
  Info,
  AlertTriangle
} from 'lucide-react'
import { ThinkingType, CriticalThinkingProgress } from '@/types'
import FishboneChart from './visualizations/FishboneChart'
import MindMap from './visualizations/MindMap'
import WeightChart from './visualizations/WeightChart'
import ComparisonTable from './visualizations/ComparisonTable'
import CaseAnalysisDisplay from './CaseAnalysisDisplay'
import { CaseAnalysisResult } from '@/lib/prompts/case-analysis-prompts'
import { ALL_LEARNING_CONTENT } from '@/lib/knowledge/learning-content-data'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ThinkingTypeDetailProps {
  thinkingTypeId: string
}

interface TopicData {
  id: string
  title: string
  description: string
  scenario: string
  context: string
  difficulty: string
  category: string
  tags: string[]
  dimension: string
  createdAt: string
}

interface AnalysisData {
  topic: TopicData
  dimension: string
  visualizationType: string
  analysis: any
  generatedAt: string
}

// Hook for fetching topics by dimension
function useTopicsByDimension(dimension: string) {
  const [topics, setTopics] = useState<TopicData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTopics() {
      try {
        setLoading(true)
        const response = await fetch(`/api/topics/by-dimension?dimension=${dimension}&limit=2`)

        if (!response.ok) {
          throw new Error('Failed to fetch topics')
        }

        const result = await response.json()
        setTopics(result.data.topics || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (dimension) {
      fetchTopics()
    }
  }, [dimension])

  return { topics, loading, error }
}

// Hook for fetching HKU critical thinking questions with case analysis
function useHKUCaseAnalysis(thinkingTypeId: string) {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true)
        const response = await fetch(`/api/thinking-types/${thinkingTypeId}/questions?limit=2`)

        if (!response.ok) {
          throw new Error('Failed to fetch HKU questions')
        }

        const result = await response.json()
        if (result.success && result.data.questions) {
          setQuestions(result.data.questions)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (thinkingTypeId) {
      fetchQuestions()
    }
  }, [thinkingTypeId])

  return { questions, loading, error }
}

// Hook for generating AI analysis
function useAnalysisGeneration() {
  const [analyses, setAnalyses] = useState<Map<string, AnalysisData>>(new Map())
  const [loading, setLoading] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Map<string, string>>(new Map())

  const generateAnalysis = async (topic: TopicData, visualizationType: string) => {
    const key = `${topic.id}-${visualizationType}`
    
    if (analyses.has(key)) {
      return analyses.get(key)
    }

    try {
      setLoading(prev => new Set([...prev, key]))
      setErrors(prev => {
        const newErrors = new Map(prev)
        newErrors.delete(key)
        return newErrors
      })

      const response = await fetch('/api/analysis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          dimension: topic.dimension,
          visualizationType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate analysis')
      }

      const result = await response.json()
      const analysisData = result.data

      setAnalyses(prev => new Map([...prev, [key, analysisData]]))
      return analysisData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setErrors(prev => new Map([...prev, [key, errorMessage]]))
      throw err
    } finally {
      setLoading(prev => {
        const newLoading = new Set(prev)
        newLoading.delete(key)
        return newLoading
      })
    }
  }

  return { analyses, generateAnalysis, loading, errors }
}

const thinkingTypeData = {
  causal_analysis: {
    id: 'causal_analysis',
    name: '多维归因与利弊权衡',
    description: '识别复杂问题的多重原因，权衡不同方案的利弊得失。培养系统性思维，学会从多个角度分析问题的成因，并能够客观评估各种解决方案的优缺点。',
    icon: 'Search',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    learningContent: {
      definition: '多维归因与利弊权衡是一种系统性的分析方法，通过识别复杂问题的多重原因，并权衡不同解决方案的利弊得失。它强调从多个角度分析问题的成因，客观评估各种方案的优缺点。',
      keySkills: [
        '问题识别：明确需要分析的核心问题',
        '因素梳理：列出所有可能的影响因素',
        '因果关系：分析各因素之间的相互关系',
        '权重评估：评估不同因素的重要程度',
        '方案比较：对比不同解决方案的利弊'
      ],
      applications: [
        '鱼骨图分析法：系统性地识别问题的各种可能原因',
        '决策矩阵法：量化比较不同方案的优劣',
        '系统思维模型：从整体角度理解问题的复杂性',
        '多维度分析：考虑问题的各个方面和影响因素'
      ],
      examples: [
        {
          title: '【基础案例】大学生学习效率低下的多维原因分析',
          scenario: '假设你是一名大学学习顾问，需要帮助一位大二学生分析其学习效率低下的问题。该学生反映虽然每天花费大量时间学习，但成绩始终无法提升，感到困惑和焦虑。你需要运用多维归因分析，识别影响学习效率的各种因素，并提出系统性的改进方案。',
          context: '该学生是工程专业大二学生，每天学习8-10小时，但期中考试成绩仍然不理想。学生自述：上课认真听讲，课后大量刷题，但考试时经常出现时间不够、知识点混淆等问题。同时，学生还需要参与社团活动，偶尔熬夜，饮食不规律。',
          difficulty: '基础',
          category: '教育心理',
          tags: ['学习方法', '时间管理', '多维归因与利弊权衡'],
          analysis: `**【问题识别与定义】**
核心问题：该学生投入大量学习时间但效率低下，需要系统分析影响学习效果的多重因素，并制定针对性的改进策略。

**【多重原因分析（系统性鱼骨图）】**

1. **学习方法层面**
   - 学习策略单一：过度依赖刷题，缺乏概念理解
   - 复习方式低效：机械重复，缺乏主动回忆和间隔复习
   - 知识整合不足：各科目孤立学习，缺乏知识点间的联系
   - 学习反馈缺失：不及时检验学习效果，错误得不到纠正

2. **时间管理层面**
   - 时间分配不当：各科目时间分配不均，重点不突出
   - 学习节奏混乱：没有固定的学习时间表，效率波动大
   - 拖延症问题：重要任务延后，临时抱佛脚现象严重
   - 干扰因素多：手机、社交媒体等分散注意力

3. **身心状态层面**
   - 睡眠质量差：熬夜导致白天精神不振，记忆力下降
   - 饮食不规律：营养不均衡影响大脑功能和专注力
   - 压力管理不当：焦虑情绪影响学习状态和考试表现
   - 缺乏运动：身体素质下降，影响学习耐力

4. **环境支持层面**
   - 学习环境嘈杂：宿舍或图书馆环境不利于专注学习
   - 同伴影响消极：室友学习习惯不良，缺乏学习氛围
   - 资源利用不充分：未充分利用老师答疑、学习小组等资源
   - 家庭期望压力：过高期望导致心理负担，影响学习动力

**【影响因素权重分析】**
- 学习方法与策略：40%（直接影响学习效果的核心因素）
- 时间管理与规划：25%（决定学习效率的关键因素）
- 身心健康状态：20%（影响学习能力的基础因素）
- 环境与支持系统：15%（外部条件对学习的促进作用）

**【改进方案的多维权衡】**

**方案一：学习方法全面改革**
✅ 优势：
- 直击问题核心，改善学习效果最明显
- 培养科学学习习惯，长期受益
- 提升学习兴趣和成就感
- 为后续专业学习奠定基础

❌ 劣势：
- 改变习惯需要较长适应期
- 初期可能感觉学习进度放慢
- 需要较强的自制力和坚持
- 可能与现有考试要求存在冲突

**方案二：时间管理优化**
✅ 优势：
- 实施相对简单，见效较快
- 提升整体生活质量
- 减少学习压力和焦虑
- 为其他改进创造条件

❌ 劣势：
- 治标不治本，学习方法问题仍存在
- 需要持续的自我监督
- 外部干扰因素难以完全控制
- 效果可能不够持久

**方案三：综合系统改进**
✅ 优势：
- 全面解决各层面问题
- 各方面改进相互促进
- 建立可持续的学习生活模式
- 培养全面的自我管理能力

❌ 劣势：
- 改变幅度大，执行难度高
- 需要较长时间才能看到效果
- 可能在初期造成更大压力
- 需要强大的意志力和外部支持

**【综合评估矩阵】**

| 评估维度 | 方法改革 | 时间管理 | 综合改进 |
|---------|---------|----------|-----------|
| 效果持久性 | 8/10 | 6/10 | 9/10 |
| 实施难度 | 7/10 | 8/10 | 5/10 |
| 见效速度 | 6/10 | 8/10 | 7/10 |
| 全面性 | 7/10 | 5/10 | 9/10 |
| 可操作性 | 7/10 | 9/10 | 6/10 |
| **加权总分** | **7.0** | **7.2** | **7.4** |

**【推荐方案：分阶段综合改进策略】**

**第一阶段（第1-2周）：基础调整**
- 建立规律作息：固定睡眠时间，保证7-8小时睡眠
- 优化学习环境：选择安静的学习场所，减少干扰
- 制定学习计划：合理分配各科目学习时间
- 目标：建立基本的学习生活节奏

**第二阶段（第3-6周）：方法改进**
- 学习主动学习策略：费曼学习法、思维导图等
- 实施间隔复习：建立复习时间表，定期回顾
- 加强知识整合：寻找学科间联系，构建知识网络
- 目标：提升学习方法的科学性和有效性

**第三阶段（第7-12周）：系统优化**
- 建立学习小组：与同学互相监督和讨论
- 定期自我评估：每周回顾学习效果，调整策略
- 寻求专业指导：主动向老师请教，参加答疑
- 目标：形成可持续的高效学习模式

**【关键成功因素】**
- 循序渐进：避免一次性改变过多，确保每个阶段都能适应
- 及时反馈：建立学习效果监测机制，及时调整策略
- 外部支持：寻求室友、同学、老师的理解和帮助
- 心态调整：保持耐心和信心，接受改进过程中的波动

这个案例体现了香港大学批评性思维面试的特点：关注学生实际问题，注重实用性和可操作性，强调系统性思维和循证分析。`
        },
        {
          title: '【进阶案例】香港青年就业困难的系统性分析',
          scenario: '假设你是香港特区政府青年事务委员会的政策研究员，需要分析近年来香港青年就业困难的问题。数据显示，18-29岁青年失业率持续高于整体失业率，许多大学毕业生面临就业难、薪资低、职业发展受限等问题。你需要运用系统性思维，分析造成这一现象的多重原因，并提出综合性的政策建议。',
          context: '香港作为国际金融中心，传统优势行业包括金融、贸易、物流等。然而，近年来受到全球经济变化、科技发展、区域竞争加剧等因素影响，就业市场结构发生变化。同时，教育体系、住房成本、社会流动性等因素也影响着青年的就业选择和职业发展。',
          difficulty: '进阶',
          category: '社会政策',
          tags: ['就业政策', '青年发展', '社会分析'],
          analysis: `**【问题识别与定义】**
核心问题：香港青年面临就业困难，需要从经济结构、教育体系、社会环境等多个维度分析原因，并制定系统性的政策干预措施。

**【多重原因分析（系统性鱼骨图）】**

1. **经济结构层面**
   - 产业转型滞后：传统优势行业增长放缓，新兴产业发展不足
   - 职位供需错配：高技能岗位要求与毕业生能力存在差距
   - 薪资水平停滞：生活成本上升但起薪增长缓慢
   - 中小企业困境：创业环境不佳，中小企业提供就业机会有限

2. **教育培训层面**
   - 专业设置滞后：大学专业与市场需求脱节
   - 实践经验不足：理论学习多，实习和实践机会少
   - 技能培训缺失：缺乏针对性的职业技能培训
   - 终身学习意识薄弱：适应变化的学习能力不足

3. **社会环境层面**
   - 住房成本高企：高房价影响青年工作地点选择和生活质量
   - 社会流动性下降：向上流动机会减少，阶层固化趋势
   - 家庭期望压力：传统观念与现实就业环境的冲突
   - 心理健康问题：就业压力导致焦虑、抑郁等心理问题

4. **政策制度层面**
   - 就业支持不足：政府就业服务覆盖面和效果有限
   - 创业扶持缺乏：创业资金、场地、指导等支持不够
   - 劳动法规限制：某些规定可能影响企业招聘意愿
   - 区域合作不够：与大湾区等地区的人才流动机制不完善

**【影响因素权重分析】**
- 经济结构与产业发展：35%（决定就业机会的根本因素）
- 教育培训体系匹配度：30%（影响就业能力的关键因素）
- 社会环境与生活成本：20%（影响就业选择的重要因素）
- 政策制度支持力度：15%（政府干预的直接作用）

**【政策方案的多维权衡】**

**方案一：产业升级驱动就业**
✅ 优势：
- 从根本上创造更多高质量就业机会
- 提升香港经济竞争力和可持续发展能力
- 吸引国际人才，形成人才集聚效应
- 为青年提供更广阔的职业发展空间

❌ 劣势：
- 见效周期长，短期内难以缓解就业压力
- 需要大量资金投入和政策协调
- 可能加剧不同行业间的发展不平衡
- 对传统行业从业者造成冲击

**方案二：教育培训体系改革**
✅ 优势：
- 直接提升青年就业能力和竞争力
- 相对容易实施，成本可控
- 可以快速响应市场需求变化
- 有助于培养终身学习习惯

❌ 劣势：
- 无法解决就业机会不足的根本问题
- 教育改革需要时间才能显现效果
- 可能加剧教育竞争和社会焦虑
- 需要教育机构和企业的密切配合

**方案三：综合政策干预**
✅ 优势：
- 全面解决多层面问题
- 政策间相互支撑，效果更佳
- 可以兼顾短期缓解和长期发展
- 体现政府对青年发展的全面关注

❌ 劣势：
- 政策协调难度大，执行复杂
- 资源需求量大，财政压力重
- 效果评估困难，问责机制复杂
- 可能出现政策冲突或重复

**【综合评估矩阵】**

| 评估维度 | 产业升级 | 教育改革 | 综合干预 |
|---------|---------|----------|-----------|
| 根本性解决 | 9/10 | 6/10 | 8/10 |
| 实施可行性 | 5/10 | 8/10 | 6/10 |
| 见效速度 | 4/10 | 7/10 | 6/10 |
| 资源效率 | 6/10 | 8/10 | 5/10 |
| 可持续性 | 9/10 | 7/10 | 8/10 |
| **加权总分** | **6.6** | **7.2** | **6.6** |

**【推荐方案：分层次综合政策框架】**

**短期措施（6-12个月）：就业促进与技能提升**
- 扩大政府实习计划：提供3000个实习岗位，涵盖公私营部门
- 启动技能提升资助：为青年提供职业培训补贴
- 建立就业配对平台：利用大数据提升求职匹配效率
- 目标：降低青年失业率2个百分点

**中期措施（1-3年）：教育改革与产业对接**
- 推动产学合作：要求大学与企业建立合作培养机制
- 发展职业教育：加强技术技能培训，提升职业教育地位
- 支持新兴产业：重点发展创科、绿色经济等新兴领域
- 目标：实现教育与就业市场更好匹配

**长期措施（3-5年）：结构性改革与环境优化**
- 推进经济多元化：减少对传统行业依赖，培育新增长点
- 改善住房政策：增加青年住房供应，降低生活成本
- 深化区域合作：促进大湾区人才流动和就业机会共享
- 目标：建立可持续的青年就业生态系统

**【关键成功因素】**
- 政府统筹协调：建立跨部门青年就业工作小组
- 社会各界参与：动员企业、教育机构、社会组织共同参与
- 数据驱动决策：建立就业数据监测和分析系统
- 持续评估调整：定期评估政策效果，及时优化调整

这个案例体现了香港大学批评性思维面试的特点：结合本地实际情况，注重多元化分析，强调政策的可操作性和社会责任。`
        },
        {
          title: '【高级案例】在线教育平台用户留存率下降的综合分析',
          scenario: '假设你是一家知名在线教育平台的产品总监，平台拥有500万注册用户，提供K12、职业培训、语言学习等多类课程。近6个月来，用户留存率从75%下降到45%，付费转化率也显著下滑。董事会要求你进行全面分析，找出问题根源并制定系统性的改进方案。',
          context: '该平台成立5年，曾是行业领军者。主要竞争对手包括传统教育机构的线上化转型、新兴AI教育产品、免费学习资源平台等。用户反馈显示课程质量参差不齐、学习体验不佳、价格偏高等问题。同时，疫情后线下教育恢复，在线教育热度下降。',
          difficulty: '高级',
          category: '商业分析',
          tags: ['用户体验', '商业模式', '数据分析'],
          analysis: `**【问题识别与定义】**
核心问题：在线教育行业竞争加剧和用户需求变化的背景下，如何系统性分析用户留存率下降的根本原因，并制定有效的产品优化和商业模式调整策略，重新获得市场竞争优势？

**【多重原因分析（系统性鱼骨图）】**

1. **产品体验因素**
   - 课程质量问题：内容陈旧、讲师水平参差不齐、缺乏实用性
   - 学习体验不佳：界面设计过时、交互流程复杂、技术稳定性差
   - 个性化不足：缺乏智能推荐、学习路径单一、无法适应不同学习风格
   - 学习效果评估：缺乏有效的进度跟踪、成果验证机制不完善

2. **市场竞争因素**
   - 竞争对手崛起：传统机构线上化转型、AI教育产品快速发展
   - 免费资源冲击：YouTube、B站等免费学习内容质量提升
   - 差异化不足：产品同质化严重、缺乏独特价值主张
   - 品牌影响力下降：市场声量减弱、用户认知模糊、口碑传播力不足

3. **商业模式因素**
   - 定价策略问题：价格偏高、性价比感知不足、缺乏灵活付费选项
   - 付费转化困难：免费试用到付费的转化路径不顺畅、价值体现不明显
   - 会员体系缺陷：权益设计不合理、续费动机不足、用户粘性低
   - 营销获客成本：获客成本持续上升、ROI下降、营销效率低

4. **外部环境因素**
   - 疫情影响消退：线下教育恢复、在线学习需求自然下降
   - 政策监管变化：教育行业政策收紧、合规要求提高、运营成本增加
   - 经济环境影响：消费降级趋势、教育支出减少、用户价格敏感度提高
   - 技术发展趋势：AI、VR等新技术改变用户期望、传统模式显得落后

**【利益相关方权重分析】**
- 用户体验与满意度：35%（学习效果、使用便利性、价值感知）
- 商业价值与盈利能力：25%（营收增长、成本控制、投资回报）
- 内容质量与教学效果：20%（课程品质、师资水平、学习成果）
- 技术创新与产品功能：15%（平台稳定性、功能完善度、创新能力）
- 品牌声誉与市场地位：5%（市场认知、口碑传播、行业影响力）

**【解决方案的多维权衡】**

**方案一：产品体验全面升级**
✅ 优势：
- 直接改善用户体验，提升学习效果和满意度
- 增强产品竞争力，建立差异化优势
- 提升用户粘性和口碑传播效果
- 为长期发展奠定坚实基础

❌ 劣势：
- 投入成本高，需要大量技术和内容资源
- 见效周期长，短期内难以显著改善财务指标
- 实施复杂度高，需要跨部门协调配合
- 存在技术风险，新功能可能影响系统稳定性

**方案二：差异化内容战略**
✅ 优势：
- 打造独特价值主张，建立竞争壁垒
- 提升品牌影响力和市场认知度
- 吸引特定用户群体，提高用户忠诚度
- 支持溢价策略，改善盈利能力

❌ 劣势：
- 内容开发周期长，需要持续投入
- 优质师资难以获得，成本较高
- 市场验证风险，新内容可能不被接受
- 规模化困难，难以快速扩张

**方案三：商业模式创新**
✅ 优势：
- 降低用户门槛，提高转化率和留存率
- 快速适应市场变化，灵活调整策略
- 改善现金流，减少用户流失
- 实施相对简单，见效较快

❌ 劣势：
- 短期营收可能下降，影响财务表现
- 模式验证需要时间，存在不确定性
- 运营复杂度增加，管理成本上升
- 可能影响品牌定位和用户认知

**【综合决策矩阵】**

| 评估维度 | 产品升级 | 内容战略 | 模式创新 |
|---------|---------|----------|-----------|
| 用户留存提升 | 9/10 | 8/10 | 7/10 |
| 实施可行性 | 6/10 | 7/10 | 8/10 |
| 投资回报率 | 7/10 | 8/10 | 8/10 |
| 竞争优势建立 | 8/10 | 9/10 | 7/10 |
| 风险控制 | 7/10 | 6/10 | 8/10 |
| **加权总分** | **7.6** | **7.7** | **7.6** |

**【推荐方案：分阶段综合优化策略】**

**第一阶段（前3个月）：紧急止损与快速优化**
- 商业模式调整：推出灵活付费选项，降低用户门槛
- 核心功能优化：修复关键bug，改善基础用户体验
- 用户反馈收集：建立快速反馈机制，了解用户真实需求
- 目标：止住用户流失趋势，稳定核心用户群体

**第二阶段（3-9个月）：产品体验升级**
- 个性化学习系统：基于AI技术实现智能推荐和学习路径定制
- 内容质量提升：优化现有课程，引入优质师资和内容
- 学习效果跟踪：建立完善的学习进度和成果评估体系
- 目标：显著提升用户体验和学习效果

**第三阶段（9-18个月）：差异化竞争优势建立**
- 独特内容开发：打造平台专属的高质量课程体系
- 技术创新应用：整合VR/AR、AI辅导等前沿技术
- 生态系统构建：建立学习社区，增强用户粘性
- 目标：建立可持续的竞争优势，重新获得市场领导地位

**【关键成功因素】**
- 数据驱动决策：建立完善的用户行为分析和效果监测体系
- 快速迭代优化：保持敏捷开发模式，快速响应用户需求变化
- 跨部门协作：确保产品、技术、运营、市场等部门高效协同
- 用户中心思维：始终以用户价值为核心，避免为了创新而创新
- 财务平衡管理：在投入产品优化的同时，确保现金流健康和业务可持续性

这个案例体现了香港大学批评性思维面试的特点：关注现实商业问题，注重多维度分析，强调实证数据支持，体现系统性思维和战略规划能力。

**第三阶段（2030-2032）：生态系统协同与创新引领**
- 核心策略：构建供应链生态系统，实现协同创新
- 循环经济：建立闭环供应链，废料回收率达到80%
- 投资规模：10亿美元，专注于创新和生态建设
- 目标：成为行业供应链韧性标杆，客户满意度达到98%

**【关键实施机制】**
1. **供应商发展基金**：投入5亿美元支持关键供应商能力建设
2. **风险共担机制**：与核心供应商建立风险分担和收益共享模式
3. **数字化协同平台**：建立统一的供应商协作和数据共享平台
4. **可持续发展联盟**：联合行业伙伴推动供应链可持续标准

**【成功关键因素】**
- 高层承诺：CEO直接领导供应链转型委员会
- 跨部门协作：整合采购、运营、IT、可持续发展等职能
- 供应商伙伴关系：从交易关系转向战略合作伙伴关系
- 持续监控：建立动态KPI体系，定期评估和调整策略
- 人才培养：培养具备数字化和可持续发展能力的供应链专业人才

这个案例体现了香港大学式批判性思维的特点：全球视野下的多维度分析，平衡短期效益与长期价值，注重实用性和可操作性，同时考虑文化和制度因素的影响。

**【推荐方案的核心优势】**

1. **风险分散**：避免一次性大投入的风险，每个阶段都有明确的回报预期

2. **能力建设**：循序渐进地培养组织的数字化能力和变革适应性

3. **资金优化**：分阶段投入符合企业现金流状况，降低财务压力

4. **市场验证**：每个阶段都能获得市场反馈，及时调整策略

5. **协同效应**：各阶段相互支撑，形成完整的数字化生态

**【关键成功因素】**
- 建立专门的数字化转型团队，配备必要的技术和管理人才
- 制定详细的变革管理计划，重视员工培训和文化建设
- 建立明确的KPI体系，定期评估转型效果
- 保持与外部专业机构的合作，借助外部经验和技术
- 建立风险预警机制，及时应对转型过程中的挑战`
        },
        {
          title: '【高级】城市交通拥堵的系统性解决方案分析',
          scenario: '某大型城市面临严重的交通拥堵问题，市政府需要制定综合性的解决方案。这是一个涉及多个利益相关方、多重原因交织的复杂系统性问题，需要运用高级的多维归因与利弊权衡思维进行深度分析。',
          context: '该城市人口800万，机动车保有量300万辆，日均通勤人次超过1000万。主要问题包括：早晚高峰严重拥堵、公共交通覆盖不足、停车位紧缺、交通事故频发、空气污染加剧。政府面临经济发展、民生改善、环境保护等多重压力，需要在有限的财政预算下找到最优解决方案。',
          difficulty: '高级',
          category: '公共政策',
          tags: ['城市规划', '交通管理', '系统思维', '公共政策'],
          analysis: `**【问题识别与定义】**
核心问题：如何在复杂的城市系统中，通过多维度干预措施，有效缓解交通拥堵，实现交通效率、经济发展、环境保护和社会公平的多重目标平衡？

**【多重原因分析（系统性鱼骨图）】**

**1. 供需失衡层面**
- **需求侧过度**：
  - 城市化进程加速，人口持续流入
  - 经济发展带来的出行需求增长
  - 私家车拥有量快速增长（年增长15%）
  - 职住分离现象严重，通勤距离长

- **供给侧不足**：
  - 道路建设速度滞后于车辆增长
  - 公共交通系统覆盖率低（仅60%）
  - 停车设施严重不足（缺口约50万个）
  - 交通基础设施老化，通行能力下降

**2. 结构性问题层面**
- **空间布局不合理**：
  - 城市功能区过度集中
  - 居住区与就业中心距离过远
  - 商业中心布局不均衡
  - 缺乏有效的城市副中心

- **交通结构失衡**：
  - 私人交通占比过高（70%）
  - 公共交通分担率低（25%）
  - 慢行交通系统不完善
  - 货运与客运混行严重

**3. 管理效率层面**
- **交通管理技术落后**：
  - 信号灯配时不科学
  - 缺乏智能交通管理系统
  - 交通信息发布不及时
  - 违法行为执法不严

- **政策协调不足**：
  - 各部门缺乏统一规划
  - 政策执行力度不够
  - 缺乏长期战略规划
  - 公众参与度不高

**4. 外部影响因素**
- **经济社会因素**：
  - 收入水平提高推动购车需求
  - 消费观念变化，私车成为身份象征
  - 工作时间集中，形成潮汐式交通
  - 教育资源分布不均，加剧接送需求

**【各因素权重评估（层次分析法）】**

**一级因素权重：**
- 供需失衡问题：40%（根本性矛盾）
- 结构性问题：30%（系统性障碍）
- 管理效率问题：20%（可快速改善）
- 外部影响因素：10%（长期性因素）

**二级因素权重（供需失衡内部）：**
- 私家车增长过快：35%
- 公共交通不足：30%
- 道路供给滞后：25%
- 停车设施缺乏：10%

**【解决方案的利弊权衡分析】**

**方案一：限制性措施为主（限行、限购、拥堵费）**

✅ 优势：
- 见效快，能够立即缓解拥堵
- 实施成本相对较低
- 有成功案例可参考（北京、伦敦等）
- 能够增加财政收入（拥堵费）

❌ 劣势：
- 可能引发强烈社会反对
- 影响经济活力和消费
- 存在公平性争议（富人不受影响）
- 可能导致周边区域拥堵转移

**社会影响评估：**
- 经济影响：短期GDP可能下降0.5-1%
- 社会公平：中低收入群体受益，高收入群体受限
- 政治风险：较高，需要强有力的政治支持

**方案二：供给扩张为主（道路建设、公交发展）**

✅ 优势：
- 符合公众期望，社会阻力小
- 能够促进经济发展和就业
- 提升城市基础设施水平
- 改善公共服务质量

❌ 劣势：
- 投资巨大，财政压力大（预计需要2000亿元）
- 建设周期长，短期内难见效果
- 可能诱发更多交通需求（诱增交通）
- 占用大量土地资源

**投资回报分析：**
- 直接经济效益：通过时间节约，年收益约300亿元
- 间接经济效益：促进区域发展，带动投资1000亿元
- 投资回收期：约8-10年

**方案三：智能化管理为主（智慧交通、大数据优化）**

✅ 优势：
- 技术先进，符合发展趋势
- 能够精准优化交通流
- 相对投资较少（约200亿元）
- 提升城市形象和竞争力

❌ 劣势：
- 技术复杂，实施风险较高
- 需要大量专业人才
- 数据安全和隐私保护挑战
- 效果依赖于系统完整性

**技术可行性评估：**
- 技术成熟度：70%（部分技术仍在发展中）
- 实施难度：中等（需要跨部门协调）
- 维护成本：年均50亿元

**【综合决策矩阵（多准则决策分析）】**

| 评估维度 | 权重 | 限制措施 | 供给扩张 | 智能管理 | 综合方案 |
|---------|------|----------|----------|----------|----------|
| 效果显著性 | 25% | 8 | 6 | 7 | 9 |
| 实施可行性 | 20% | 6 | 7 | 5 | 7 |
| 经济合理性 | 20% | 7 | 4 | 6 | 6 |
| 社会接受度 | 15% | 3 | 8 | 7 | 6 |
| 可持续性 | 10% | 5 | 6 | 8 | 8 |
| 创新性 | 10% | 4 | 3 | 9 | 7 |
| **加权总分** | | **6.1** | **5.9** | **6.7** | **7.4** |

**【最终决策建议：分层次、分阶段的综合治理方案】**

**核心策略：构建"1+3+N"的综合治理体系**

**"1"：统一的智慧交通大脑**
- 建设城市级交通数据中心
- 实现多部门数据共享和协同决策
- 投资：100亿元，建设期2年

**"3"：三大核心措施并行**

**措施一：精准化需求管理（第1年实施）**
- 实施差异化拥堵收费（工作日高峰期，核心区域）
- 推行错峰上下班和弹性工作制
- 建立绿色出行激励机制
- 预期效果：减少高峰期交通量15%

**措施二：高质量供给提升（第2-5年实施）**
- 优先发展轨道交通，新建3条地铁线路
- 建设快速公交系统（BRT），覆盖主要走廊
- 完善慢行交通网络，建设自行车专用道
- 预期效果：公共交通分担率提升至45%

**措施三：智能化管理优化（持续实施）**
- 部署自适应信号控制系统
- 建设智能停车诱导系统
- 推广车路协同技术试点
- 预期效果：道路通行效率提升20%

**"N"：多元化配套政策**
- 城市规划：推进职住平衡，发展多中心格局
- 产业政策：鼓励新能源汽车，发展共享出行
- 社会治理：加强交通安全教育，提升文明出行意识
- 区域协调：与周边城市协调发展，避免虹吸效应

**【实施路径与时间安排】**

**第一阶段（1-2年）：基础建设与试点启动**
- 建设智慧交通基础设施
- 在核心区域试点拥堵收费
- 启动重点公交线路改造
- 投资：300亿元

**第二阶段（3-5年）：全面推进与效果显现**
- 地铁线路建成通车
- 智能管理系统全面运行
- 需求管理政策全面实施
- 投资：800亿元

**第三阶段（6-10年）：优化完善与可持续发展**
- 系统运行优化调整
- 新技术应用推广
- 长效机制建立完善
- 投资：400亿元

**【预期效果与风险控制】**

**预期效果：**
- 高峰期平均车速提升30%（从15km/h到20km/h）
- 公共交通分担率达到50%
- 交通事故率下降25%
- 空气质量显著改善（PM2.5下降20%）
- 年经济效益超过500亿元

**风险控制措施：**
- 建立社会稳定风险评估机制
- 设立公众参与和监督平台
- 制定应急预案和调整机制
- 建立跨部门协调机制
- 设立专项资金和绩效考核体系

**【关键成功因素】**
1. **政治决心**：需要市委市政府的坚强领导和持续支持
2. **社会共识**：通过充分沟通形成全社会的理解和支持
3. **技术保障**：引进先进技术和专业团队
4. **资金保障**：多渠道筹措资金，确保项目顺利实施
5. **制度保障**：建立完善的法规制度和管理体系

这个综合方案体现了多维归因与利弊权衡思维的精髓：既考虑了问题的复杂性和系统性，又平衡了各方利益和约束条件，提出了科学、可行、可持续的解决方案。`
        }
      ],
      practiceStrategies: [
        '练习使用鱼骨图分析日常问题的多重原因，从人员、方法、机器、材料、环境等维度系统梳理',
        '制作决策矩阵来比较不同选择的利弊，量化评估各方案在成本、效果、风险等维度的表现',
        '培养从多个角度思考问题的习惯，避免单一视角的局限性，考虑利益相关方的不同立场',
        '学会量化评估不同因素的重要性，使用权重分析法确定各因素对结果的影响程度',
        '定期进行案例复盘，分析决策过程中的成功经验和失误教训，持续优化分析框架',
        '练习多方案比较分析，培养权衡利弊的能力，学会在复杂约束条件下做出最优选择'
      ]
    }
  },
  premise_challenge: {
    id: 'premise_challenge',
    name: '前提质疑与方法批判',
    description: '质疑既定假设，批判性评估方法论的有效性。培养独立思考能力，学会识别和挑战隐含的假设，评估研究方法和论证逻辑的合理性。',
    icon: 'HelpCircle',
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    learningContent: {
      definition: '前提质疑与方法批判是一种独立思考的方法，通过质疑既定假设和批判性评估方法论的有效性，培养深度思考能力。它强调识别和挑战隐含假设，评估研究方法和论证逻辑的合理性。',
      keySkills: [
        '假设识别：找出论证中的隐含假设',
        '假设检验：评估假设的合理性和证据支持',
        '方法评估：分析研究方法的适用性和局限性',
        '逻辑检查：检验推理过程的逻辑严密性',
        '替代方案：考虑其他可能的解释或方法'
      ],
      applications: [
        '苏格拉底式提问：通过连续提问揭示假设和逻辑漏洞',
        '方法论批判：系统评估研究设计和数据收集方法',
        '反证法思维：通过寻找反例来检验假设',
        '批判性阅读：深入分析文本中的论证结构'
      ],
      examples: [
        {
          title: '媒体报道分析',
          scenario: '对新闻报道进行批判性分析',
          analysis: '质疑报道的信息来源、统计方法、样本代表性等，形成更客观、全面的认知'
        },
        {
          title: '学术论文评估',
          scenario: '评估研究论文的方法论和结论',
          analysis: '检查研究假设、实验设计、数据分析方法的合理性，提高学术批判思维能力'
        }
      ],
      practiceStrategies: [
        '对每个观点都问"为什么"和"凭什么"',
        '主动寻找论证中的隐含假设',
        '练习识别不同类型的逻辑谬误',
        '培养质疑权威和常识的习惯'
      ]
    }
  },
  fallacy_detection: {
    id: 'fallacy_detection',
    name: '谬误识别与证据评估',
    description: '识别逻辑谬误，评估证据的可靠性和相关性。培养逻辑思维能力，学会识别常见的推理错误，并能够客观评估信息的质量和可信度。',
    icon: 'Scale',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    learningContent: {
      definition: '谬误识别与证据评估是一种逻辑思维方法，通过识别逻辑谬误和评估证据的可靠性，提高信息处理和判断能力。它强调识别常见的推理错误，客观评估信息的质量和可信度。',
      keySkills: [
        '论证结构分析：识别前提和结论',
        '逻辑关系检查：评估前提与结论的逻辑联系',
        '谬误识别：发现常见的逻辑错误',
        '证据评估：检查证据的来源、质量和相关性',
        '结论评价：判断论证的整体可信度'
      ],
      applications: [
        '形式逻辑分析：检查论证的逻辑结构是否有效',
        '证据层次评估：根据证据类型和质量进行分级评估',
        '偏见识别技术：识别认知偏见对判断的影响',
        '信息素养：提高对信息真实性的判断能力'
      ],
      examples: [
        {
          title: '网络信息辨别',
          scenario: '识别网络上的虚假信息和误导性内容',
          analysis: '识别虚假信息、确认偏见、权威谬误等，提高信息素养和批判能力'
        },
        {
          title: '商业广告分析',
          scenario: '分析广告中的逻辑漏洞和误导手法',
          analysis: '识别情感诉求、虚假类比、统计误用等手法，做出更理性的消费决策'
        }
      ],
      practiceStrategies: [
        '学习识别常见的逻辑谬误类型',
        '练习分析论证的逻辑结构',
        '培养质疑证据来源和质量的习惯',
        '提高对统计数据的理解和分析能力'
      ]
    }
  },
  iterative_reflection: {
    id: 'iterative_reflection',
    name: '观点迭代与反思',
    description: '持续反思和改进自己的观点，接受新信息并调整立场。培养元认知能力，学会监控自己的思维过程，并能够根据新证据灵活调整观点。',
    icon: 'RotateCcw',
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
    learningContent: {
      definition: '观点迭代与反思是一种元认知方法，通过持续反思和改进自己的观点，培养灵活的思维能力。它强调接受新信息并调整立场，监控自己的思维过程，根据新证据灵活调整观点。',
      keySkills: [
        '观点记录：明确表达当前的观点和理由',
        '证据收集：主动寻找支持和反对的证据',
        '偏见检查：识别可能影响判断的认知偏见',
        '观点调整：根据新信息修正或完善观点',
        '学习总结：反思思维过程中的收获和改进'
      ],
      applications: [
        '元认知策略：监控和调节自己的思维过程',
        '观点演化追踪：记录和分析观点变化的轨迹',
        '反思性写作：通过写作来深化思考和自我反省',
        '持续学习：在新信息面前保持开放和灵活'
      ],
      examples: [
        {
          title: '学术观点演化',
          scenario: '在研究过程中不断修正理论观点',
          analysis: '在研究过程中不断修正和完善理论观点，形成更成熟和准确的学术认知'
        },
        {
          title: '职业发展规划',
          scenario: '根据经验调整职业目标和策略',
          analysis: '根据经验和环境变化调整职业目标和策略，实现更好的职业发展轨迹'
        }
      ],
      practiceStrategies: [
        '定期回顾和反思自己的观点变化',
        '主动寻找挑战自己观点的信息',
        '记录思维过程和决策理由',
        '培养承认错误和调整观点的勇气'
      ]
    }
  },
  connection_transfer: {
    id: 'connection_transfer',
    name: '关联和迁移',
    description: '识别不同领域的共性，将知识和方法跨领域应用。培养创新思维能力，学会发现看似无关事物之间的联系，并能够将成功的方法和经验迁移到新的情境中。',
    icon: 'Link',
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-600',
    learningContent: {
      definition: '关联和迁移是一种创新思维方法，通过识别不同领域的共性，将知识和方法跨领域应用。它强调发现看似无关事物之间的联系，将成功的方法和经验迁移到新的情境中。',
      keySkills: [
        '模式识别：发现不同情境中的共同模式',
        '结构分析：分析问题的深层结构特征',
        '类比推理：建立不同领域间的类比关系',
        '方法迁移：将成功方法应用到新情境',
        '效果验证：检验迁移应用的有效性'
      ],
      applications: [
        '跨学科思维：整合不同学科的知识和方法',
        '类比推理法：通过相似性建立不同事物间的联系',
        '系统映射技术：将一个系统的结构映射到另一个系统',
        '创新方法论：通过跨领域借鉴产生创新解决方案'
      ],
      examples: [
        {
          title: '生物学启发的技术创新',
          scenario: '将生物机制应用到工程设计',
          analysis: '将生物结构和机制应用到工程设计中，产生仿生学技术突破'
        },
        {
          title: '管理方法的跨行业应用',
          scenario: '将成功管理模式迁移到新行业',
          analysis: '将成功的管理模式从一个行业迁移到另一个行业，实现管理创新和效率提升'
        }
      ],
      practiceStrategies: [
        '主动寻找不同领域间的相似性',
        '练习类比思维和跨界联想',
        '学习多个领域的基础知识',
        '尝试将一个领域的方法应用到另一个领域'
      ]
    }
  }
}

export default function ThinkingTypeDetail({ thinkingTypeId }: ThinkingTypeDetailProps) {
  const [progress, setProgress] = useState<CriticalThinkingProgress | null>(null)
  const [loading, setLoading] = useState(false)

  const typeData = thinkingTypeData[thinkingTypeId as keyof typeof thinkingTypeData]
  
  // 获取真实题目数据
  const { topics, loading: topicsLoading, error: topicsError } = useTopicsByDimension(thinkingTypeId)
  const { questions: hkuQuestions, loading: hkuLoading, error: hkuError } = useHKUCaseAnalysis(thinkingTypeId)
  
  // AI分析生成
  const { analyses, generateAnalysis, loading: analysisLoading, errors: analysisErrors } = useAnalysisGeneration()

  useEffect(() => {
    fetchProgress()
  }, [thinkingTypeId])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/critical-thinking/progress')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const typeProgress = data.data.progress?.find((p: any) => p.thinkingTypeId === thinkingTypeId)
          setProgress(typeProgress || null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!typeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">思维类型不存在</h1>
          <Link href="/learn">
            <Button>返回学习中心</Button>
          </Link>
        </div>
      </div>
    )
  }

  const progressPercentage = progress ? Math.round(progress.progressPercentage) : 0

  // 主题可视化子组件（修复 Hook 违规）
  function TopicVisualization({
    topic,
    index,
    analyses,
    analysisLoading,
    analysisErrors,
    generateAnalysis,
  }: {
    topic: TopicData
    index: number
    analyses: Map<string, AnalysisData>
    analysisLoading: Set<string>
    analysisErrors: Map<string, string>
    generateAnalysis: (topic: TopicData, visualizationType: string) => Promise<AnalysisData>
  }) {
    const visualizationTypes = ['FishboneChart', 'MindMap', 'WeightChart', 'ComparisonTable']
    const visualizationType = visualizationTypes[index % visualizationTypes.length]
    const key = `${topic.id}-${visualizationType}`

    const isLoading = analysisLoading.has(key)
    const error = analysisErrors.get(key)
    const analysis = analyses.get(key)

    // 自动生成分析（如果还没有）
    useEffect(() => {
      if (!analysis && !isLoading && !error) {
        generateAnalysis(topic, visualizationType).catch(console.error)
      }
    }, [topic, visualizationType, analysis, isLoading, error, generateAnalysis])

    // 将 AI 分析结果映射到各可视化组件所需的 Props，并提供合理的回退默认值
    const mapFishboneProps = (data: any) => {
      const d = data?.fishbone ?? data
      const title = d?.title ?? `${topic.title}原因分析`
      const problem = d?.problem ?? (topic?.title || '待分析问题')
      const defaultNodes = [
        { category: '关键因素', factors: Array.isArray(topic.tags) ? topic.tags : [], color: '#3B82F6' },
      ]
      const nodes = Array.isArray(d?.nodes) ? d.nodes : defaultNodes
      return { title, problem, nodes }
    }

    const mapMindMapProps = (data: any) => {
      const d = data?.mindMap ?? data
      const title = d?.title ?? `${topic.title}思维导图`
      const centerNode = d?.centerNode ?? {
        id: 'center',
        label: topic.title,
        color: '#3B82F6',
        children: []
      }
      return { title, centerNode }
    }

    const mapWeightChartProps = (data: any) => {
      const d = data?.weight ?? data
      const title = d?.title ?? `${topic.title}权重评估`
      const defaultItems = (Array.isArray(topic.tags) ? topic.tags : []).map((tag, i) => ({
        label: tag,
        weight: Math.round(100 / (topic.tags?.length || 1)),
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][i % 4],
      }))
      const items = Array.isArray(d?.items) ? d.items : defaultItems
      const type = d?.type ?? 'bar'
      return { title, items, type }
    }

    const mapComparisonTableProps = (data: any) => {
      const d = data?.comparison ?? data
      const title = d?.title ?? `${topic.title}方案对比`
      const option1Name = d?.option1Name ?? '方案A'
      const option2Name = d?.option2Name ?? '方案B'
      const items = Array.isArray(d?.items) ? d.items : [
        {
          aspect: '整体价值',
          weight: 50,
          option1: { value: '一般', score: 3 },
          option2: { value: '一般', score: 3 },
        },
      ]
      return { title, option1Name, option2Name, items }
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-gray-600">正在生成AI分析...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-8 text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>分析生成失败: {error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4"
            onClick={() => generateAnalysis(topic, visualizationType)}
          >
            重试
          </Button>
        </div>
      )
    }

    if (!analysis) {
      return (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <span>暂无分析数据</span>
        </div>
      )
    }

    // 根据可视化类型渲染对应组件
    switch (visualizationType) {
      case 'FishboneChart':
        return <FishboneChart {...mapFishboneProps(analysis.analysis)} />
      case 'MindMap':
        return <MindMap {...mapMindMapProps(analysis.analysis)} />
      case 'WeightChart':
        return <WeightChart {...mapWeightChartProps(analysis.analysis)} />
      case 'ComparisonTable':
        return <ComparisonTable {...mapComparisonTableProps(analysis.analysis)} />
      default:
        return null
    }
  }

  // 为不同实例渲染可视化组件
  const renderVisualizationForExample = (example: any, index: number) => {
    if (thinkingTypeId !== 'causal_analysis') {
      return null
    }

    switch (index) {
      case 0: // 【基础案例】大学生学习效率低下的多维原因分析
        return (
          <div className="space-y-6">
            {/* 学习效率低下原因分析 - 鱼骨图 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">学习效率低下原因分析</h4>
              <FishboneChart
                title="大学生学习效率低下原因分析"
                problem="学习效率低下"
                nodes={[
                  {
                    category: "学习方法层面",
                    factors: ["学习策略单一", "复习方式低效", "知识整合不足", "学习反馈缺失"],
                    color: "#3B82F6"
                  },
                  {
                    category: "时间管理层面",
                    factors: ["时间分配不当", "学习节奏混乱", "拖延症问题", "干扰因素多"],
                    color: "#10B981"
                  },
                  {
                    category: "身心状态层面",
                    factors: ["睡眠质量差", "饮食不规律", "压力管理不当", "缺乏运动"],
                    color: "#F59E0B"
                  },
                  {
                    category: "环境支持层面",
                    factors: ["学习环境嘈杂", "同伴影响消极", "资源利用不充分", "家庭期望压力"],
                    color: "#EF4444"
                  }
                ]}
              />
            </div>

            {/* 影响因素权重分析 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">影响因素权重分析</h4>
              <WeightChart
                title="学习效率影响因素重要性分析"
                items={[
                  { label: "学习方法与策略", weight: 40, color: "#3B82F6" },
                  { label: "时间管理与规划", weight: 25, color: "#10B981" },
                  { label: "身心健康状态", weight: 20, color: "#F59E0B" },
                  { label: "环境与支持系统", weight: 15, color: "#EF4444" }
                ]}
              />
            </div>

            {/* 改进方案对比分析 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">改进方案对比分析</h4>
              <ComparisonTable
                title="学习方法改革 vs 综合系统改进"
                option1Name="学习方法改革"
                option2Name="综合系统改进"
                items={[
                  {
                    aspect: "效果持久性",
                    weight: 25,
                    option1: { value: "较好", score: 4, description: "培养科学学习习惯，长期受益" },
                    option2: { value: "很好", score: 5, description: "建立可持续的学习生活模式" }
                  },
                  {
                    aspect: "实施难度",
                    weight: 20,
                    option1: { value: "中等", score: 3, description: "改变习惯需要适应期" },
                    option2: { value: "较难", score: 2, description: "改变幅度大，执行难度高" }
                  },
                  {
                    aspect: "见效速度",
                    weight: 20,
                    option1: { value: "中等", score: 3, description: "初期可能感觉进度放慢" },
                    option2: { value: "较快", score: 4, description: "多方面同时改进" }
                  },
                  {
                    aspect: "全面性",
                    weight: 20,
                    option1: { value: "较好", score: 4, description: "直击问题核心" },
                    option2: { value: "很好", score: 5, description: "全面解决各层面问题" }
                  },
                  {
                    aspect: "可操作性",
                    weight: 15,
                    option1: { value: "较好", score: 4, description: "具体方法明确" },
                    option2: { value: "中等", score: 3, description: "需要强大意志力和外部支持" }
                  }
                ]}
              />
            </div>

            {/* 分阶段改进策略思维导图 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">分阶段改进策略框架</h4>
              <MindMap
                title="大学生学习效率提升策略"
                centerNode={{
                  id: "center",
                  label: "学习效率提升",
                  color: "#3B82F6",
                  children: [
                    {
                      id: "phase1",
                      label: "第一阶段：基础调整",
                      color: "#10B981",
                      children: [
                        { id: "sleep", label: "建立规律作息", color: "#10B981" },
                        { id: "env", label: "优化学习环境", color: "#10B981" },
                        { id: "plan", label: "制定学习计划", color: "#10B981" },
                        { id: "rhythm", label: "建立学习节奏", color: "#10B981" }
                      ]
                    },
                    {
                      id: "phase2",
                      label: "第二阶段：方法改进",
                      color: "#F59E0B",
                      children: [
                        { id: "active", label: "主动学习策略", color: "#F59E0B" },
                        { id: "spaced", label: "间隔复习法", color: "#F59E0B" },
                        { id: "integration", label: "知识整合", color: "#F59E0B" },
                        { id: "feedback", label: "学习反馈机制", color: "#F59E0B" }
                      ]
                    },
                    {
                      id: "phase3",
                      label: "第三阶段：系统优化",
                      color: "#EF4444",
                      children: [
                        { id: "group", label: "建立学习小组", color: "#EF4444" },
                        { id: "assess", label: "定期自我评估", color: "#EF4444" },
                        { id: "guidance", label: "寻求专业指导", color: "#EF4444" },
                        { id: "sustain", label: "形成可持续模式", color: "#EF4444" }
                      ]
                    }
                  ]
                }}
              />
            </div>
          </div>
        )

      case 1: // 【进阶案例】香港青年就业困难的系统性分析
        return (
          <div className="space-y-6">
            {/* 香港青年就业困难原因分析 - 鱼骨图 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">香港青年就业困难成因分析</h4>
              <FishboneChart
                title="香港青年就业困难成因分析"
                problem="青年就业困难"
                nodes={[
                  {
                    category: "经济结构层面",
                    factors: ["产业转型滞后", "职位供需错配", "薪资水平停滞", "创业环境不足"],
                    color: "#3B82F6"
                  },
                  {
                    category: "教育体系层面",
                    factors: ["技能培训缺失", "实习机会有限", "课程设置滞后", "职业规划不足"],
                    color: "#10B981"
                  },
                  {
                    category: "社会环境层面",
                    factors: ["住房成本高昂", "生活压力巨大", "社会流动性低", "代际竞争激烈"],
                    color: "#F59E0B"
                  },
                  {
                    category: "政策制度层面",
                    factors: ["就业政策不完善", "青年支持不足", "劳动法规限制", "税收政策影响"],
                    color: "#EF4444"
                  }
                ]}
              />
            </div>

            {/* 影响因素权重分析 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">影响因素权重分析</h4>
              <WeightChart
                title="香港青年就业困难影响因素重要性分析"
                items={[
                  { label: "经济结构转型", weight: 35, color: "#3B82F6" },
                  { label: "教育技能匹配", weight: 25, color: "#10B981" },
                  { label: "社会环境压力", weight: 25, color: "#F59E0B" },
                  { label: "政策制度支持", weight: 15, color: "#EF4444" }
                ]}
              />
            </div>

            {/* 政策方案对比分析 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">政策方案对比分析</h4>
              <ComparisonTable
                title="技能培训计划 vs 综合就业支持"
                option1Name="技能培训计划"
                option2Name="综合就业支持"
                items={[
                  {
                    aspect: "实施成本",
                    weight: 25,
                    option1: { value: "较低", score: 4, description: "主要为培训费用，相对可控" },
                    option2: { value: "较高", score: 2, description: "涉及多个政策领域，投入巨大" }
                  },
                  {
                    aspect: "见效速度",
                    weight: 20,
                    option1: { value: "中等", score: 3, description: "培训周期6-12个月" },
                    option2: { value: "较慢", score: 2, description: "政策协调需要较长时间" }
                  },
                  {
                    aspect: "覆盖范围",
                    weight: 30,
                    option1: { value: "有限", score: 2, description: "主要解决技能匹配问题" },
                    option2: { value: "全面", score: 5, description: "涵盖就业各个环节" }
                  },
                  {
                    aspect: "可持续性",
                    weight: 15,
                    option1: { value: "中等", score: 3, description: "需要持续投入培训资源" },
                    option2: { value: "较好", score: 4, description: "建立长效机制" }
                  },
                  {
                    aspect: "政治可行性",
                    weight: 10,
                    option1: { value: "较高", score: 4, description: "社会共识度高" },
                    option2: { value: "中等", score: 3, description: "需要跨部门协调" }
                  }
                ]}
              />
            </div>

            {/* 综合政策框架思维导图 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">综合政策框架</h4>
              <MindMap
                title="香港青年就业支持政策框架"
                centerNode={{
                  id: "center",
                  label: "青年就业支持",
                  color: "#3B82F6",
                  children: [
                    {
                      id: "education",
                      label: "教育培训改革",
                      color: "#10B981",
                      children: [
                        { id: "skill-training", label: "技能培训计划", color: "#10B981" },
                        { id: "internship", label: "实习机会扩展", color: "#10B981" },
                        { id: "career-guidance", label: "职业规划指导", color: "#10B981" },
                        { id: "industry-link", label: "产学研合作", color: "#10B981" }
                      ]
                    },
                    {
                      id: "economic",
                      label: "经济结构优化",
                      color: "#F59E0B",
                      children: [
                        { id: "innovation", label: "创新产业发展", color: "#F59E0B" },
                        { id: "startup", label: "创业支持计划", color: "#F59E0B" },
                        { id: "sme-support", label: "中小企业扶持", color: "#F59E0B" },
                        { id: "digital-economy", label: "数字经济推进", color: "#F59E0B" }
                      ]
                    },
                    {
                      id: "social",
                      label: "社会环境改善",
                      color: "#EF4444",
                      children: [
                        { id: "housing", label: "青年住房政策", color: "#EF4444" },
                        { id: "transport", label: "交通补贴计划", color: "#EF4444" },
                        { id: "mental-health", label: "心理健康支持", color: "#EF4444" },
                        { id: "work-life", label: "工作生活平衡", color: "#EF4444" }
                      ]
                    },
                    {
                      id: "policy",
                      label: "政策制度完善",
                      color: "#8B5CF6",
                      children: [
                        { id: "employment-law", label: "就业法规优化", color: "#8B5CF6" },
                        { id: "tax-incentive", label: "税收优惠政策", color: "#8B5CF6" },
                        { id: "subsidy", label: "就业补贴计划", color: "#8B5CF6" },
                        { id: "monitoring", label: "效果监测机制", color: "#8B5CF6" }
                      ]
                    }
                  ]
                }}
              />
            </div>

            {/* 推荐政策实施策略 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h5 className="font-medium text-blue-800 mb-3">推荐政策：分阶段综合干预策略</h5>
              <div className="text-sm text-blue-700 space-y-3">
                <div className="flex items-start space-x-3">
                   <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full flex-shrink-0 mt-0.5">1</span>
                   <div>
                     <strong>短期（6-12个月）：</strong>技能培训计划 + 实习机会扩展，投资5亿港元，预期帮助2万青年提升就业能力
                   </div>
                 </div>
                 <div className="flex items-start space-x-3">
                   <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full flex-shrink-0 mt-0.5">2</span>
                   <div>
                     <strong>中期（1-2年）：</strong>产业结构优化 + 创业支持计划，投资15亿港元，创造3万个新就业岗位
                   </div>
                 </div>
                 <div className="flex items-start space-x-3">
                   <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full flex-shrink-0 mt-0.5">3</span>
                   <div>
                     <strong>长期（3-5年）：</strong>社会环境改善 + 政策制度完善，建立可持续的青年就业支持体系
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )

      case 2: // 【高级案例】在线教育平台用户留存率下降的综合分析
        return (
          <div className="space-y-6">
            {/* 用户留存率下降原因分析 - 鱼骨图 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">用户留存率下降成因分析</h4>
              <FishboneChart
                title="在线教育平台用户留存率下降成因分析"
                problem="用户留存率持续下降"
                nodes={[
                  {
                    category: "产品体验",
                    factors: ["界面设计过时", "加载速度慢", "功能复杂难用", "移动端体验差"],
                    color: "#3B82F6"
                  },
                  {
                    category: "内容质量",
                    factors: ["课程内容陈旧", "教学方法单一", "缺乏互动性", "更新频率低"],
                    color: "#10B981"
                  },
                  {
                    category: "用户服务",
                    factors: ["客服响应慢", "问题解决率低", "缺乏个性化指导", "社区氛围冷淡"],
                    color: "#F59E0B"
                  },
                  {
                    category: "市场竞争",
                    factors: ["竞品功能更强", "价格竞争激烈", "营销策略落后", "品牌影响力下降"],
                    color: "#EF4444"
                  }
                ]}
              />
            </div>

            {/* 解决方案权重评估 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">改进策略重要性评估</h4>
              <WeightChart
                title="用户留存率提升策略权重分析"
                items={[
                  { label: "产品体验优化", weight: 35, color: "#3B82F6" },
                  { label: "内容质量提升", weight: 30, color: "#10B981" },
                  { label: "用户服务改善", weight: 20, color: "#F59E0B" },
                  { label: "市场竞争策略", weight: 15, color: "#EF4444" }
                ]}
              />
            </div>

            {/* 解决方案对比分析 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">改进策略综合对比</h4>
              <ComparisonTable
                title="用户留存率提升策略对比分析"
                option1Name="产品体验优化"
                option2Name="内容质量提升"
                items={[
                  {
                    aspect: "实施成本",
                    weight: 25,
                    option1: { value: "较高", score: 2, description: "需要技术团队和设计投入" },
                    option2: { value: "中等", score: 3, description: "主要是内容制作成本" }
                  },
                  {
                    aspect: "见效速度",
                    weight: 20,
                    option1: { value: "较快", score: 4, description: "界面改进用户立即感知" },
                    option2: { value: "中等", score: 3, description: "需要时间积累口碑" }
                  },
                  {
                    aspect: "长期效果",
                    weight: 30,
                    option1: { value: "很好", score: 4, description: "提升整体用户体验" },
                    option2: { value: "很好", score: 5, description: "核心竞争力的根本提升" }
                  },
                  {
                    aspect: "技术难度",
                    weight: 15,
                    option1: { value: "较高", score: 2, description: "需要专业UI/UX团队" },
                    option2: { value: "中等", score: 3, description: "需要教学设计专业知识" }
                  },
                  {
                    aspect: "用户感知",
                    weight: 10,
                    option1: { value: "直接", score: 5, description: "用户直接感受到改善" },
                    option2: { value: "深层", score: 4, description: "影响学习效果和满意度" }
                  }
                ]}
              />
            </div>

            {/* 系统性解决方案思维导图 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">用户留存率提升策略框架</h4>
              <MindMap
                title="在线教育平台用户留存率提升策略"
                centerNode={{
                  id: "center",
                  label: "用户留存率提升",
                  color: "#3B82F6",
                  children: [
                    {
                      id: "product",
                      label: "产品体验优化",
                      color: "#10B981",
                      children: [
                        { id: "ui", label: "界面设计升级", color: "#10B981" },
                        { id: "performance", label: "性能优化", color: "#10B981" },
                        { id: "mobile", label: "移动端体验", color: "#10B981" },
                        { id: "personalization", label: "个性化推荐", color: "#10B981" }
                      ]
                    },
                    {
                      id: "content",
                      label: "内容质量提升",
                      color: "#F59E0B",
                      children: [
                        { id: "curriculum", label: "课程内容更新", color: "#F59E0B" },
                        { id: "interactive", label: "互动式教学", color: "#F59E0B" },
                        { id: "practical", label: "实践项目", color: "#F59E0B" },
                        { id: "assessment", label: "智能评估", color: "#F59E0B" }
                      ]
                    },
                    {
                      id: "service",
                      label: "用户服务改善",
                      color: "#EF4444",
                      children: [
                        { id: "support", label: "24/7客服支持", color: "#EF4444" },
                        { id: "mentoring", label: "个人导师制", color: "#EF4444" },
                        { id: "community", label: "学习社区建设", color: "#EF4444" },
                        { id: "feedback", label: "反馈机制优化", color: "#EF4444" }
                      ]
                    },
                    {
                      id: "retention",
                      label: "留存策略设计",
                      color: "#8B5CF6",
                      children: [
                        { id: "gamification", label: "游戏化学习", color: "#8B5CF6" },
                        { id: "rewards", label: "激励体系", color: "#8B5CF6" },
                        { id: "progress", label: "学习进度可视化", color: "#8B5CF6" },
                        { id: "social", label: "社交学习功能", color: "#8B5CF6" }
                      ]
                    }
                  ]
                }}
              />
             </div>

            {/* 实施策略建议 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h5 className="font-medium text-blue-800 mb-3">推荐实施策略：分阶段综合治理</h5>
              <div className="text-sm text-blue-700 space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <strong>短期（6-12个月）：</strong>智能信号优化 + 公交专用道建设，投资5000万元，预期缓解20%拥堵
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <strong>中期（1-3年）：</strong>BRT系统建设 + 拥堵收费试点，投资20亿元，预期缓解40%拥堵
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <strong>长期（3-5年）：</strong>地铁网络扩展 + 绿色出行体系，投资100亿元，预期缓解70%拥堵
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded border border-blue-300">
                <p className="text-sm text-blue-800">
                  <strong>关键成功因素：</strong>政府统筹协调、市民积极参与、技术持续创新、政策配套完善
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/learn" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回学习中心
          </Link>
          
          <div className={`${typeData.color} rounded-xl p-6 mb-6`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {typeData.name}
                </h1>
                <p className="text-gray-700 text-lg mb-4">
                  {typeData.description}
                </p>
                
                {progress && (
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">
                      平均分 {progress.averageScore.toFixed(1)}
                    </Badge>
                    <Badge className={progressPercentage >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {progressPercentage}% 掌握
                    </Badge>
                    <span className="text-sm text-gray-600">
                      已练习 {progress.questionsCompleted} 题
                    </span>
                  </div>
                )}
              </div>
              
              <div className="ml-6">
                <Link href={`/learn/critical-thinking/${thinkingTypeId}/practice`}>
                  <Button size="lg" className="h-12 px-6">
                    开始练习
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {progress && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">掌握程度</span>
                  <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="theory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="theory">理论学习</TabsTrigger>
            <TabsTrigger value="skills">核心技能</TabsTrigger>
            <TabsTrigger value="examples">实例分析</TabsTrigger>
            <TabsTrigger value="practice">练习策略</TabsTrigger>
          </TabsList>

          <TabsContent value="theory" className="space-y-6">
            {/* 定义与概念 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  定义与概念
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {ALL_LEARNING_CONTENT[thinkingTypeId]?.definition || typeData.learningContent.definition}
                </p>
              </CardContent>
            </Card>

            {/* 核心方法 */}
            {ALL_LEARNING_CONTENT[thinkingTypeId]?.coreMethod && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                    核心方法
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ALL_LEARNING_CONTENT[thinkingTypeId].coreMethod.map((method, i) => (
                      <div
                        key={i}
                        className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4 space-y-3"
                      >
                        <div className="flex items-start space-x-3">
                          <Badge className="bg-blue-600 text-white flex-shrink-0">
                            {i + 1}
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {method.title}
                            </h4>
                            <p className="text-gray-700 mb-3">
                              {method.description}
                            </p>
                            <Alert className="bg-blue-100 border-blue-300">
                              <Lightbulb className="h-4 w-4 text-blue-700" />
                              <AlertDescription className="text-blue-900">
                                <strong>示例：</strong>{method.example}
                              </AlertDescription>
                            </Alert>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 常见陷阱 */}
            {ALL_LEARNING_CONTENT[thinkingTypeId]?.commonPitfalls && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                    常见陷阱
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ALL_LEARNING_CONTENT[thinkingTypeId].commonPitfalls.map((pitfall, i) => (
                      <div
                        key={i}
                        className="border border-orange-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {pitfall.title}
                            </h4>
                            <p className="text-gray-700 mb-3">
                              {pitfall.description}
                            </p>
                            <div className="bg-red-50 border border-red-200 p-3 rounded mb-3">
                              <p className="text-red-900">
                                <strong>❌ 错误示例：</strong>
                                {pitfall.example}
                              </p>
                            </div>
                            <div className="bg-green-50 border border-green-200 p-3 rounded">
                              <p className="text-green-900">
                                <strong>✅ 如何避免：</strong>
                                {pitfall.howToAvoid}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 思考检查清单 */}
            {ALL_LEARNING_CONTENT[thinkingTypeId]?.keyQuestions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    思考检查清单
                  </CardTitle>
                  <CardDescription>
                    使用这些问题检查你的思维过程
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ALL_LEARNING_CONTENT[thinkingTypeId].keyQuestions.map((question, i) => (
                      <div
                        key={i}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-gray-500">{i + 1}</span>
                        </div>
                        <span className="text-gray-700">{question}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 答题示例对比 */}
            {ALL_LEARNING_CONTENT[thinkingTypeId]?.examples && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-indigo-600" />
                    答题示例对比
                  </CardTitle>
                  <CardDescription>
                    通过对比学习优秀回答和欠佳回答的差异
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {ALL_LEARNING_CONTENT[thinkingTypeId].examples.map((ex, i) => (
                      <div key={i} className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {ex.scenario}
                          </h4>
                          <p className="text-gray-700">
                            <strong>问题：</strong>
                            {ex.question}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 优秀回答 */}
                          <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                            <Badge className="bg-green-600 text-white mb-3">
                              优秀回答
                            </Badge>
                            <p className="text-gray-800 leading-relaxed">
                              {ex.goodAnswer}
                            </p>
                          </div>

                          {/* 欠佳回答 */}
                          <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50">
                            <Badge className="bg-red-600 text-white mb-3">
                              欠佳回答
                            </Badge>
                            <p className="text-gray-800 leading-relaxed">
                              {ex.poorAnswer}
                            </p>
                          </div>
                        </div>

                        <Alert className="bg-indigo-50 border-indigo-300">
                          <Info className="h-4 w-4 text-indigo-700" />
                          <AlertDescription className="text-indigo-900">
                            <strong>分析：</strong>
                            {ex.analysis}
                          </AlertDescription>
                        </Alert>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 应用领域 */}
            <Card>
              <CardHeader>
                <CardTitle>应用领域</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {typeData.learningContent.applications.map((application, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{application}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            {/* 技能总览 */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Target className="h-6 w-6 mr-2 text-blue-600" />
                  {typeData.name}的5大核心技能
                </CardTitle>
                <CardDescription className="text-base">
                  系统掌握这些技能，从理解概念到熟练应用，循序渐进提升你的批判性思维能力
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 核心技能详细卡片 */}
            {ALL_LEARNING_CONTENT[thinkingTypeId]?.coreMethod ? (
              // 如果有详细的核心方法数据，使用增强展示
              ALL_LEARNING_CONTENT[thinkingTypeId].coreMethod.map((method, index) => (
                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{method.title}</CardTitle>
                        <p className="text-gray-700 leading-relaxed">{method.description}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 示例 */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">💡 实际应用示例</h4>
                          <p className="text-blue-800 text-sm leading-relaxed">{method.example}</p>
                        </div>
                      </div>
                    </div>

                    {/* 为什么重要 */}
                    {method.whyImportant && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-green-900 mb-2">✅ 为什么这个技能重要？</h4>
                            <p className="text-green-800 text-sm leading-relaxed">
                              {method.whyImportant}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 如何提升 */}
                    {method.howToImprove && method.howToImprove.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <TrendingUp className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-amber-900 mb-2">🚀 提升这项技能的方法</h4>
                            <ul className="space-y-2 text-sm text-amber-800">
                              {method.howToImprove.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start space-x-2">
                                  <span className="text-amber-600 mt-1">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              // 降级方案：使用原有的简化数据
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    核心技能
                  </CardTitle>
                  <CardDescription>
                    掌握这些核心技能，提升你的{typeData.name}能力
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {typeData.learningContent.keySkills.map((skill, index) => (
                      <div key={index} className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 rounded-r-lg">
                        <div className="font-semibold text-gray-900 mb-1">
                          {skill.split('：')[0]}
                        </div>
                        <div className="text-gray-700">
                          {skill.split('：')[1]}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            {/* 显示加载状态 */}
            {hkuLoading && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-gray-600">正在加载香港大学批判性思维案例分析...</span>
                </CardContent>
              </Card>
            )}

            {/* 显示错误状态 */}
            {hkuError && (
              <Card>
                <CardContent className="flex items-center justify-center py-8 text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>加载失败: {hkuError}</span>
                </CardContent>
              </Card>
            )}

            {/* 显示HKU批判性思维案例分析 */}
            {!hkuLoading && !hkuError && hkuQuestions.length > 0 && (
              <>
                {hkuQuestions.map((question, index) => (
                  <div key={question.id} className="space-y-6">
                    {/* 题目信息卡片 */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center">
                              <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                              【{index === 0 ? '基础案例' : '进阶案例'}】{question.topic}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {question.question}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="ml-4">
                            {question.difficulty === 'intermediate' ? '中等难度' :
                             question.difficulty === 'beginner' ? '初级' : '高级'}
                          </Badge>
                        </div>
                        {question.tags && question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {question.tags.map((tag: string, tagIndex: number) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <h4 className="font-medium text-blue-900 mb-2">背景信息</h4>
                          <p className="text-blue-800 leading-relaxed">{question.context}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 案例分析展示 */}
                    {question.caseAnalysis ? (
                      <CaseAnalysisDisplay caseAnalysis={question.caseAnalysis as CaseAnalysisResult} />
                    ) : (
                      <Card>
                        <CardContent className="py-12">
                          <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">案例分析暂未生成</h3>
                            <p className="text-gray-600 mb-4">
                              该题目的专业案例分析正在准备中，请点击"开始练习"查看实时生成的分析
                            </p>
                            <Link href={`/learn/critical-thinking/${thinkingTypeId}/practice`}>
                              <Button>
                                开始练习
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* 如果没有HKU题目，显示提示 */}
            {!hkuLoading && !hkuError && hkuQuestions.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无案例分析</h3>
                    <p className="text-gray-600 mb-4">
                      该思维维度的香港大学批判性思维案例正在准备中
                    </p>
                    <Link href={`/learn/critical-thinking/${thinkingTypeId}/practice`}>
                      <Button>
                        前往练习
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 如果没有真实题目，显示静态示例 */}
            {!topicsLoading && !topicsError && topics.length === 0 && (
              <>
                {typeData.learningContent.examples.map((example, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        {example.title}
                      </CardTitle>
                      <CardDescription>
                        {example.scenario}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* 可视化分析部分 */}
                      {renderVisualizationForExample(example, index)}
                      
                      {/* 详细分析文本（可折叠） */}
                      <div className="mt-6">
                        <details className="group">
                          <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <h4 className="font-medium text-gray-900">详细分析过程</h4>
                            <div className="flex items-center text-gray-500">
                              <span className="text-sm mr-2">点击查看详细分析</span>
                              <div className="transform transition-transform group-open:rotate-180">
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            </div>
                          </summary>
                          <div className="mt-4 p-4 bg-white border rounded-lg">
                            <pre className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                              {example.analysis}
                            </pre>
                          </div>
                        </details>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  练习策略
                </CardTitle>
                <CardDescription>
                  通过这些练习方法，持续提升你的{typeData.name}能力
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {typeData.learningContent.practiceStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{strategy}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>开始练习</CardTitle>
                <CardDescription>
                  准备好了吗？开始你的{typeData.name}练习之旅
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/learn/critical-thinking/${thinkingTypeId}/practice`} className="flex-1">
                    <Button className="w-full h-12">
                      开始练习
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/learn/critical-thinking/progress" className="flex-1">
                    <Button variant="outline" className="w-full h-12">
                      查看进度
                      <BarChart3 className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}