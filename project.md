# Cogito AI 项目文档
### Cotigo AI
一款批判性思考的AI数智导师产品；包括 APP 端和 web 端，是一款现代设计风格，基于 AI Native 内核的产品； 首先我们实现 web 端的功能(要求兼容移动端)，后续再考虑是否扩展到 APP 端。

### **核心设计哲学：从“答案提供者”到“思维脚手架”**

传统AI（如简单的搜索或问答）倾向于直接给出“答案”，这会扼杀用户的独立思考。我们的核心理念是反其道而行之：**Cogito AI 不直接提供答案，而是扮演一个“苏格拉底式”的数字导师，通过不断追问、提供多元视角、解构论证，来激发和锻炼用户自己的思维深度和广度。**


### **最核心的MVP功能清单 (Minimum Viable Product Feature List)**

MVP的目标是，用最少的功能，验证核心价值。以下三个功能足以构成一个强大且令人印象深刻的MVP。

#### **功能一：苏格拉底对话机器人 (Socratic Dialogue Module)**

这是APP的绝对核心，它实现了“苏格拉底式”的对话模式，为用户提供一个互动的、有深度的思考环境；所有对话历史需要进行持久化存储，可参考同类一流 AI 大模型产品的设计如 Open AI chat box。

* **用户流程:**
    1.  用户输入一个议题、观点或一篇文章的链接。例如：“我认为人工智能最终会取代所有人类工作。”
    2.  Cogito AI **不会**直接反驳或赞同，而是开始提问：
        * “你说的‘所有工作’具体指哪些类型？是否包括创造性或情感类的工作？” (澄清概念)
        * “你得出这个结论是基于哪些事实或证据？” (追溯证据)
        * “这个观点背后，可能隐藏着哪些你没有意识到的假设？” (挖掘深层假设)
        * “有没有可能存在一个完全相反的、但同样有道理的观点？它会是什么样的？” (引导换位思考)
    3.  整个对话过程，AI会不断引导用户深化思考，而不是灌输知识。

* **技术实现:**
    * 后端通过精心设计的系统提示词（System Prompt）来设定AI的角色。例如：“你是一名苏格拉底式的哲学导师，你的唯一目标是通过提问来挑战和启发用户，你绝不能直接给出答案或自己的观点。你的提问应该遵循[澄清概念 -> 检验证据 -> 挖掘假设 -> 探索其他视角]的逻辑链条。”

#### **功能二：论点解构器 (Argument Deconstructor)**

这个功能旨在将抽象的思维过程可视化。

* **用户流程:**
    1.  用户粘贴一段文字（例如新闻评论、论文摘要）。
    2.  点击“解构”按钮。
    3.  Cogito AI 将文本进行结构化分析，并以卡片或思维导图的形式呈现：
        * **核心主张 (Main Claim):** 这段话最想表达的观点是什么？
        * **论据 (Evidence):** 作者用了哪些事实、数据或例子来支持主张？
        * **隐藏假设 (Underlying Assumptions):** 要让这个论证成立，作者默认了哪些前提条件是真的？
        * **潜在逻辑谬误 (Potential Fallacies):** AI会尝试识别常见的逻辑谬误，如“稻草人谬误”、“人身攻击”、“滑坡谬误”等，并给出解释。

* **技术实现:**
    * 这需要更复杂的Prompt。后端会将用户文本嵌入一个指令模板中，要求LLM分步进行抽取和识别，并以JSON格式返回结果，方便前端进行可视化展示。

#### **功能三：多棱镜视角 (Perspective Prism)**

这个功能旨在打破信息茧房，培养同理心和全局观。

* **用户流程:**
    1.  用户输入一个具有争议性的话题，例如“是否应该对富人征收更高的税？”
    2.  用户可以选择希望AI扮演的“角色”，例如：一位自由市场经济学家、一位社会主义活动家、一位中产阶级纳税人、一位政府财政部长。
    3.  Cogito AI 会从用户选择的每个角色的立场出发，生成一段逻辑严密、论据充分的观点陈述。
    4.  用户可以“追问”任何一个角色，与其进行深入对话。

* **技术实现:**
    * 通过动态改变Prompt中的角色设定（"You are a..."）来实现。后端管理不同的角色“性格卡”，并生成相应的观点。

---



### 技术栈选型 (Technology Stack)
#### 核心架构
    全栈框架 : Next.js 14 + TypeScript   开发模式 : AI Native + 现代化全栈

#### 前端技术栈
##### 核心框架
- Next.js 14 (App Router + Server Components)
- React 18 (并发特性 + Suspense)
- TypeScript (严格类型检查)
##### UI & 样式
- Tailwind CSS (原子化CSS)
- shadcn/ui (现代组件库)
- Framer Motion (动画库，适合思维导图)
- Lucide React (图标库)
##### 状态管理
- Zustand (轻量状态管理)
- React Query/TanStack Query (服务端状态)
- React Hook Form (表单管理)
##### 数据可视化
- D3.js (论点解构的思维导图)
- Recharts (数据图表)
- React Flow (节点关系图)
#### ⚡ 后端技术栈
##### API 层
- Next.js API Routes (RESTful API)
##### 数据库层
- Prisma ORM (类型安全的数据库操作)
- PostgreSQL (主数据库)
- Redis (缓存)

##### 认证层
- NextAuth.js (OAuth2 + JWT)
- 密码哈希 (bcrypt)
- 会话管理 (NextAuth.js)
  
##### 大模型
**核心技术:** **高级提示工程 (Advanced Prompt Engineering)**
    * 这是项目的“灵魂”。APP的智能程度不只取决于模型本身，更取决于我们如何设计“提示词”（Prompt）来引导模型扮演“批判性思维导师”的角色。需要设计复杂的、多步骤的、包含角色扮演指令的Prompt Chain。
  
  支持接入多款大模型，具体平台生效的大模型在管理端进行配置

- Deepseek API
  - 模型名称: deepseek-v3.1
  - 参考api文档：https://bailian.console.aliyun.com/?spm=5176.12818093_47.console-base_search-panel.dtab-product_sfm.3be92cc9syNiNb&scm=20140722.S_sfm._.ID_sfm-RL_%E7%99%BE%E7%82%BC-LOC_console_console-OR_ser-V_4-P0_0&tab=api#/api/?type=model&url=2868565


- 阿里通义 Qwen3 Max
  - 模型名称 : qwen3-max
  - 参考 API 文档链接： https://bailian.console.aliyun.com/?spm=5176.12818093_47.console-base_search-panel.dtab-product_sfm.3be92cc9syNiNb&scm=20140722.S_sfm._.ID_sfm-RL_%E7%99%BE%E7%82%BC-LOC_console_console-OR_ser-V_4-P0_0&tab=api#/api/?type=model&url=2712576
