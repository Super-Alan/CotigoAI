# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cogito AI (批判性思维数智导师)** - A Socratic dialogue-based critical thinking training platform that uses AI to cultivate deep thinking skills through guided questioning rather than providing direct answers.

**Core Philosophy**: Transform from "answer provider" to "thinking scaffold" - the AI never directly provides answers, instead acts as a Socratic digital mentor through continuous questioning, providing multiple perspectives, and deconstructing arguments.

**Tech Stack**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, NextAuth.js, shadcn/ui

## Development Commands

### Essential Commands
```bash
# Development
npm run dev                    # Start dev server at http://localhost:3000

# Database Operations
npm run db:generate            # Generate Prisma Client
npm run db:push               # Push schema to database
npm run db:migrate            # Run database migrations
npm run db:studio             # Open Prisma Studio GUI
npm run db:seed               # Seed database with initial data

# Database Sync (Local ↔ Remote)
npm run db:sync:structure     # Sync schema structure only
npm run db:sync:data          # Sync data only
npm run db:sync:full          # Full sync (structure + data)

# Database Backups
npm run db:backup:local       # Backup local database to backups/
npm run db:backup:remote      # Backup remote database to backups/

# Build & Deployment
npm run build                 # Build for production
npm run start                 # Start production server
npm run lint                  # Run ESLint
```

### Environment Setup
The project requires three environment files:
- `.env` - Local development database and primary AI keys
- `.env.remote` - Remote database connection for sync operations
- `.env.local` - Optional local overrides

Required environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cogito_ai"
NEXTAUTH_SECRET="generated-secret"    # Use: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
DEEPSEEK_API_KEY="your-key"
QWEN_API_KEY="your-key"
ACTIVE_AI_MODEL="deepseek-v3.1"      # Or "qwen3-max"
```

## Architecture & Key Concepts

### 5大核心思维维度系统

**香港大学批判性思维框架** - 项目核心教学体系，基于HKU面试题库设计：

1. **causal_analysis (多维归因与利弊权衡)**
   - 区分相关性与因果性
   - 识别混淆因素
   - 建立可靠的因果推理
   - 难度：中级 (intermediate)

2. **premise_challenge (前提质疑与方法批判)**
   - 识别论证中的隐含前提
   - 质疑其合理性
   - 重新框定问题
   - 难度：中级 (intermediate)

3. **fallacy_detection (谬误检测)**
   - 识别常见逻辑谬误
   - 理解其危害
   - 学会避免思维陷阱
   - 难度：初级 (beginner)

4. **iterative_reflection (迭代反思)**
   - 培养元认知能力
   - 识别思维模式
   - 持续改进思维质量
   - 难度：中级 (intermediate)

5. **connection_transfer (知识迁移)**
   - 识别深层结构相似性
   - 实现跨领域迁移
   - 难度：高级 (advanced)

**实现位置**：
- 学习中心: `/learn` (LearningCenter.tsx)
- 维度详情: `/learn/critical-thinking/[id]`
- 练习系统: `/learn/critical-thinking/[id]/practice` (PracticeSession.tsx)
- 每日练习: `/learn/daily` (DailyPracticeMain.tsx)

### AI Service Layer (`src/lib/ai/`)

**Multi-Model Router Pattern**: The project uses an abstraction layer to support multiple AI providers interchangeably:

- **`AIRouter`** (router.ts): Main entry point that routes requests to appropriate AI service based on `ACTIVE_AI_MODEL` env var
- **`IAIService`** (base.ts): Interface that all AI services must implement (`chat()`, `analyze()` methods)
- **`DeepseekService`** & **`QwenService`**: Concrete implementations for Deepseek V3.1 and Qwen3 Max models

**Usage Pattern**:
```typescript
import { aiRouter } from '@/lib/ai/router';

// Auto-routes to active model
const response = await aiRouter.chat(messages, { stream: true });

// Or specify model explicitly
const response = await aiRouter.chat(messages, { model: 'qwen3-max' });
```

### Prompt Engineering System (`src/lib/prompts/`)

**Core Competitive Advantage**: The platform's value lies in carefully crafted prompt templates, not just raw AI capability.

**Key Prompts**:

1. **`SOCRATIC_SYSTEM_PROMPT`**: 4-stage questioning logic (Clarification → Evidence → Assumptions → Alternative Perspectives)
   - Single question principle - only ask one question at a time
   - Adaptive questioning based on user response depth
   - Never provides direct answers

2. **`ARGUMENT_ANALYSIS_PROMPT`**: Structured JSON output for deconstructing arguments
   - Identifies main claims, premises, evidence, assumptions
   - Detects 11 types of logical fallacies
   - Returns strict JSON schema for frontend parsing

3. **`ROLE_PRESETS`**: Pre-configured personas (economist, ethicist, scientist, environmentalist, educator, policymaker) with distinct value systems and system prompts

4. **`DAILY_PRACTICE_SYSTEM_PROMPT`**: Intelligent quiz generation based on user progress and learning content

5. **HKU Case Analysis Prompts** (`case-analysis-prompts.ts`):
   - 5个思维维度的专业提示词系统
   - 生成高质量的香港大学面试风格案例分析
   - 结构化输出：核心要点、分析框架、多维度思考、反思与启示
   - 配合思维导图可视化

**When modifying prompts**: Changes here directly impact user experience quality - test thoroughly and maintain the Socratic principle of never providing direct answers.

### Database Architecture (Prisma Schema)

**Core Feature Domains**:

1. **Socratic Dialogue** (Conversation, Message)
   - Stores conversation history with metadata
   - Supports streaming responses via SSE

2. **Argument Deconstruction** (ArgumentAnalysis)
   - JSON-structured analysis results
   - Indexed by user and creation date

3. **Multi-Perspective Prism** (PerspectiveSession, Perspective, PerspectiveMessage)
   - Role-playing system for viewing issues from multiple angles
   - Supports follow-up dialogue with each perspective

4. **Learning Center** (LogicalFallacy, ArgumentTemplate, MethodologyLesson, TopicPackage)
   - Curated educational content
   - User progress tracking via UserLessonProgress

5. **Daily Practice** (PracticeSession, PracticeQuestion, UserAnswer, DailyStreak)
   - Gamified daily practice with streak tracking
   - Achievement system for motivation
   - 支持5大思维维度的练习类型

6. **Critical Thinking Training** (ThinkingType, CriticalThinkingQuestion, CriticalThinkingPracticeSession)
   - 5 thinking dimensions: causal_analysis, premise_challenge, fallacy_detection, iterative_reflection, connection_transfer
   - Guided questions at different difficulty levels (beginner/intermediate/advanced)
   - AI-generated case analysis with structured framework
   - Stores caseAnalysis JSON in questions for reusability

7. **Topic Generation** (GeneratedConversationTopic)
   - AI-generated conversation topics based on dimensions
   - Supports nullable userId for graceful degradation when user doesn't exist
   - Includes tags, difficulty levels, thinking frameworks
   - Deduplication logic to avoid generating same topic twice

8. **Suggested Answer Caching** (ConversationSuggestedAnswerSet)
   - Caches AI-generated answer suggestions per question
   - Reduces API calls and improves response time

**Key Relationships**:
- User → Multiple feature sessions (1:N)
- Conversation → Messages → Suggested Answer Sets (1:N:N)
- PerspectiveSession → Perspectives → Messages (1:N:N)
- ThinkingType → CriticalThinkingQuestions (1:N)
- CriticalThinkingQuestion → GuidingQuestions (1:N)
- All user-generated content cascades on user deletion (`onDelete: Cascade`)
- GeneratedConversationTopic supports optional user relationship (nullable userId)

### API Route Structure (`src/app/api/`)

**RESTful API Pattern with Next.js Route Handlers**:

```
api/
├── auth/              # NextAuth.js handlers (signin, signup, session)
├── conversations/     # Socratic dialogue CRUD + streaming
│   └── [id]/
│       ├── messages/  # Message history & SSE streaming
│       └── suggestions/ # AI-generated answer suggestions
├── arguments/         # Argument analysis
├── perspectives/      # Multi-perspective sessions
│   └── [id]/
│       ├── generate/  # Generate role perspectives
│       └── chat/      # Chat with specific role
├── analysis/          # Case analysis generation
│   └── generate-case/ # Generate HKU-style case analysis for questions
├── topics/            # Topic generation and management
│   ├── generate/      # Generate topics based on dimensions
│   └── by-dimension/  # Query topics by thinking dimension
├── learn/             # Learning content (fallacies, templates, methodology, topics)
├── daily-practice/    # Daily practice generation & submission
│   ├── generate/      # Generate practice questions (supports 5 dimensions)
│   ├── status/        # Get user practice status and streaks
│   └── submit/        # Submit practice answers
├── critical-thinking/ # Critical thinking exercises
│   └── evaluate/      # Evaluate user answers with AI feedback
├── thinking-types/    # Thinking type metadata
│   └── [id]/
│       ├── questions/ # Get questions for specific thinking type
│       └── generate/  # Generate new questions with AI
└── user/              # User settings and history
```

**Streaming Response Pattern** (SSE):
- Conversations use Server-Sent Events for real-time AI responses
- Frontend uses `EventSource` or `fetch` with stream handling
- Backend yields chunks via `ReadableStream`

**Authentication**:
- All API routes except `/api/auth/*` require authentication
- Use `getServerSession(authOptions)` for web requests
- Use `requireAuth(req)` helper for unified auth (supports both web and mobile JWT)
- Returns 401 if user not logged in
- Some features gracefully handle missing users (e.g., topic generation with null userId)

### Component Architecture (`src/components/`)

**Organizational Structure**:
```
components/
├── ui/                      # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── alert.tsx
│   ├── progress.tsx
│   ├── tabs.tsx
│   └── ...
├── learn/                   # Learning-related components
│   ├── LearningCenter.tsx   # Main learning hub (5 dimensions + quick actions)
│   ├── daily/               # Daily practice system
│   │   └── DailyPracticeMain.tsx
│   └── thinking-types/      # Critical thinking components
│       ├── PracticeSession.tsx      # Main practice interface (3-tab layout)
│       └── CaseAnalysisDisplay.tsx  # Structured case analysis viewer
├── Header.tsx               # Main navigation with learning dropdown
└── ...
```

**Key UI Patterns**:

1. **Three-Tab Learning Interface** (PracticeSession.tsx):
   - Tab 1: 理论学习 (Theory) - Question content and background
   - Tab 2: 实例分析 (Case Analysis) - AI-generated case studies
   - Tab 3: 核心技能 (Practice) - Interactive practice with guided questions

2. **Progressive Practice Flow**:
   - Step 1: 题目理解 (Question Understanding)
   - Step 2: 引导思考 (Guided Thinking) - Show guiding questions
   - Step 3: 回答问题 (Answer) - User input area
   - Step 4: 获得反馈 (Feedback) - AI evaluation with scores and suggestions

3. **Learning Center Cards**:
   - 5个核心维度卡片 with distinct colors and icons
   - Core/Advanced badges for difficulty indication
   - Quick actions: 每日练习, 学习路径, 进度仪表板, AI导师
   - Legacy modules: 逻辑谬误库, 论证模板, 方法论课程, 话题包

### State Management

**Zustand** for client-side state:
- Lightweight alternative to Redux
- Used for UI state, not for server data

**React Query** (@tanstack/react-query):
- Server state management and caching
- Handles data fetching, caching, and synchronization
- Use for all API calls to backend routes

### TypeScript Path Aliases

Use `@/` prefix for all imports from `src/`:
```typescript
import { aiRouter } from '@/lib/ai/router';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import type { ChatMessage } from '@/types';
```

## Common Development Patterns

### Adding a New Thinking Dimension

1. **Update Prisma Schema** - Add new ThinkingType entry
2. **Create Prompt Template** in `case-analysis-prompts.ts`
3. **Add to LearningCenter** - Define dimension config with icon, colors, difficulty
4. **Seed Questions** - Create seed script with 2 HKU-style questions
5. **Test Practice Flow** - Verify all 4 steps work correctly
6. **Generate Case Analysis** - Ensure AI generates quality case studies

### Adding a New AI Feature

1. **Define Prompt** in `src/lib/prompts/index.ts` or specialized prompt file
2. **Create API Route** in `src/app/api/[feature]/route.ts`
   - Use `aiRouter.chat()` or `aiRouter.analyze()`
   - Handle streaming if needed
   - Implement proper error handling
3. **Define Prisma Model** if storing results
4. **Create Frontend Component** with React Query integration
5. **Test Prompt Engineering** - iterate on prompt quality
   - Test with various user inputs
   - Validate JSON structure if applicable
   - Check token usage and latency

### Working with Database

**After schema changes**:
```bash
npm run db:generate    # Always run after schema.prisma changes
npm run db:push        # Quick dev sync (no migrations)
# OR
npm run db:migrate     # Production-ready with migration files
```

**Seeding Data**:
- Edit `prisma/seed.ts` or create new seed files (e.g., `seed-critical-thinking.ts`)
- Run `npm run db:seed` (tsx automatically compiles TypeScript)
- Seed files support: ThinkingTypes, CriticalThinkingQuestions, GuidingQuestions

**Database Sync**:
- Use sync scripts to copy structure/data between local and remote
- Useful for pulling production data to local dev or vice versa

**Handling Stale Sessions**:
- Some operations gracefully handle missing users (nullable foreign keys)
- Example: Topic generation sets `userId: null` if user doesn't exist in database
- This prevents cascade failures when sessions reference deleted users

### Testing AI Integrations

Use `src/app/api/test-ai/` endpoints for quick AI service testing without full feature implementation.

## Important Notes

### Mobile Directory
The `mobile/` directory contains a React Native app that is **intentionally excluded** from Next.js builds:
- Webpack config ignores `mobile/**`
- Externals exclude Expo/React Native packages
- Git tracking removed to prevent Vercel build errors
- **Do not** import or reference mobile code from Next.js app

### AI Model Switching
To switch between Deepseek and Qwen:
1. Update `ACTIVE_AI_MODEL` in `.env`
2. Ensure corresponding API key is set
3. Restart dev server
4. No code changes needed due to router abstraction

### Prompt Iteration Best Practices
1. Test prompts in isolation using API routes
2. Compare outputs across different user input scenarios
3. Validate JSON output structure if using structured prompts
4. Check token usage and response latency
5. Document changes in prompt comments
6. For HKU case analysis prompts, ensure output maintains:
   - Professional academic tone
   - Structured framework (核心要点, 分析框架, 多维度思考, 反思与启示)
   - Actionable insights and reflection questions

### NextAuth Configuration
- Uses JWT strategy (not database sessions)
- Session max age: 30 days
- Custom pages: `/auth/signin`, `/auth/signout`, `/auth/error`
- User ID injected into JWT token and session
- Credentials provider only (email/password with bcrypt)

### UI Component System (shadcn/ui)
- Base components in `src/components/ui/`
- Created on-demand when needed (e.g., Alert component)
- Follows shadcn/ui conventions:
  - Uses `class-variance-authority` for variants
  - React.forwardRef for proper ref handling
  - `cn()` utility for class merging
  - Display names for better debugging
- When adding new components, follow existing patterns in `ui/` directory

## Project-Specific Conventions

### Code Style
- **Chinese Comments**: Database schema and some core logic uses Chinese comments - this is intentional for the target audience
- **Strict JSON Responses**: AI analysis endpoints must return parseable JSON - validate with try/catch
- **Never Give Answers**: When working on Socratic dialogue features, maintain the core principle - AI guides thinking, never provides direct answers
- **Prompt Templates**: Treat prompts as first-class code artifacts - review changes carefully as they directly impact product quality

### UI/UX Conventions
- **Text Visibility**: Always ensure sufficient contrast (e.g., use `text-gray-700` on light backgrounds)
- **Loading States**: Show skeleton loaders or spinners for async operations
- **Error Handling**: Display user-friendly error messages with actionable recovery options
- **Progressive Disclosure**: Use tabs and step-by-step flows to reduce cognitive load
- **Consistent Navigation**:
  - All "每日练习" links point to `/learn/daily`
  - Back buttons return to appropriate parent pages
  - Header dropdown maintains consistent structure

### Data Handling
- **Nullable Foreign Keys**: Support optional user relationships for graceful degradation
- **Deduplication**: Check for existing records before creating (e.g., topics by content)
- **Cascading Deletes**: All user-generated content should cascade on user deletion
- **Graceful Errors**: Log errors comprehensively but show simple messages to users

### Naming Conventions
- **Thinking Dimensions**: Use snake_case IDs (`causal_analysis`, `premise_challenge`)
- **Display Names**: Use descriptive Chinese names (多维归因与利弊权衡, 前提质疑与方法批判)
- **Difficulty Levels**: `beginner`, `intermediate`, `advanced` (not numeric)
- **File Naming**:
  - Components: PascalCase (`LearningCenter.tsx`)
  - API routes: kebab-case directories (`thinking-types/`)
  - Utilities: camelCase (`case-analysis-prompts.ts`)
