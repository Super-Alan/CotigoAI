# Cogito AI - 数据库架构设计

## 数据模型关系图

```
User (用户)
  ├─ 1:N → Conversation (对话会话)
  ├─ 1:N → ArgumentAnalysis (论点解构)
  ├─ 1:N → PerspectiveSession (多视角会话)
  └─ 1:1 → UserSettings (用户设置)

Conversation (对话会话)
  └─ 1:N → Message (消息记录)

ArgumentAnalysis (论点解构)
  ├─ mainClaim (核心主张)
  ├─ evidence[] (论据列表)
  ├─ assumptions[] (隐藏假设)
  └─ fallacies[] (逻辑谬误)

PerspectiveSession (多视角会话)
  ├─ topic (议题)
  ├─ 1:N → Perspective (视角观点)
  └─ 1:N → PerspectiveMessage (追问对话)
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ 用户认证 ============
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // bcrypt哈希后的密码
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关系
  accounts           Account[]
  sessions           Session[]
  conversations      Conversation[]
  argumentAnalyses   ArgumentAnalysis[]
  perspectiveSessions PerspectiveSession[]
  settings           UserSettings?

  @@map("users")
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String? @db.Text
  access_token       String? @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String? @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============ 用户设置 ============
model UserSettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  defaultModel    String   @default("deepseek-v3.1") // deepseek-v3.1 | qwen3-max
  theme           String   @default("light")          // light | dark | system
  language        String   @default("zh-CN")          // zh-CN | en-US
  enableAnalytics Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}

// ============ 苏格拉底对话 ============
model Conversation {
  id        String    @id @default(cuid())
  userId    String
  title     String    @default("新对话")
  topic     String?   // 用户输入的初始议题
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]

  @@index([userId, createdAt])
  @@map("conversations")
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  role           String   // user | assistant | system
  content        String   @db.Text
  metadata       Json?    // 存储额外信息如思考类型、引用等
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@map("messages")
}

// ============ 论点解构器 ============
model ArgumentAnalysis {
  id        String   @id @default(cuid())
  userId    String
  inputText String   @db.Text
  analysis  Json     // 存储完整的分析结果 (JSON格式)
  /*
    analysis结构:
    {
      mainClaim: string,
      evidence: Array<{text: string, type: string}>,
      assumptions: Array<{assumption: string, validity: string}>,
      fallacies: Array<{type: string, description: string, location: string}>
    }
  */
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("argument_analyses")
}

// ============ 多棱镜视角 ============
model PerspectiveSession {
  id        String   @id @default(cuid())
  userId    String
  topic     String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user         User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  perspectives Perspective[]
  messages     PerspectiveMessage[]

  @@index([userId, createdAt])
  @@map("perspective_sessions")
}

model Perspective {
  id        String   @id @default(cuid())
  sessionId String
  roleName  String   // 角色名称，如"自由市场经济学家"
  roleConfig Json    // 角色配置信息
  /*
    roleConfig结构:
    {
      name: string,
      background: string,
      values: string[],
      systemPrompt: string
    }
  */
  viewpoint String   @db.Text // 生成的观点陈述
  createdAt DateTime @default(now())

  session  PerspectiveSession   @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  messages PerspectiveMessage[]

  @@index([sessionId])
  @@map("perspectives")
}

model PerspectiveMessage {
  id             String   @id @default(cuid())
  sessionId      String
  perspectiveId  String?  // 如果为null,则为用户问题;否则为角色回答
  role           String   // user | assistant
  content        String   @db.Text
  createdAt      DateTime @default(now())

  session     PerspectiveSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  perspective Perspective?       @relation(fields: [perspectiveId], references: [id], onDelete: Cascade)

  @@index([sessionId, createdAt])
  @@map("perspective_messages")
}

// ============ 系统配置 (管理端) ============
model SystemConfig {
  id        String   @id @default(cuid())
  key       String   @unique // 配置键,如 "active_model", "deepseek_api_key"
  value     String   @db.Text
  category  String   // ai_model | system | feature
  isSecret  Boolean  @default(false) // 是否为敏感信息
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("system_config")
}
```

## 索引策略

```sql
-- 性能优化索引
CREATE INDEX idx_conversations_user_created ON conversations(user_id, created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_argument_user_created ON argument_analyses(user_id, created_at DESC);
CREATE INDEX idx_perspective_session_created ON perspective_sessions(user_id, created_at DESC);
```

## 数据迁移策略

```yaml
版本控制: Prisma Migrate
环境管理:
  - development: 本地PostgreSQL
  - staging: 测试环境
  - production: 生产环境 (需要备份策略)

备份策略:
  - 自动备份: 每日凌晨3点
  - 保留周期: 30天
  - 关键操作: 手动备份
```
