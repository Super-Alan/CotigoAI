# 移动端智能助手升级 - 复刻Web端功能

## 实施概述

本次升级将Web端智能助手的完整功能复刻到移动端，包括轮次追踪、总结生成、对话状态管理等核心特性。

## 新增功能

### 1. 对话轮次追踪 (Round Progress Tracking)

**功能描述**:
- 实时显示当前对话轮次 (1-5轮)
- 可视化进度条展示对话进度
- 自动记录每轮对话的历史

**实现位置**: `mobile/app/(tabs)/conversations/[id].tsx`

**状态管理**:
```typescript
const [currentRound, setCurrentRound] = useState(0);
const [dialogueHistory, setDialogueHistory] = useState<Array<{
  round: number;
  userMessage: string;
  aiQuestion: string;
  timestamp: Date;
}>>([]);
```

**UI展示**:
- 位置: 智能助手抽屉顶部右侧
- 格式: "第 X/5 轮" + 进度条
- 颜色: 蓝色进度条 (#3B82F6)

### 2. 对话总结生成 (Summary Generation)

**功能描述**:
- 支持流式总结生成
- 实时显示总结内容
- 标记对话结束状态

**实现位置**: `handleGenerateSummary` 函数

**API对接**:
```typescript
POST /api/conversations/:id/summary
Body: { rounds: dialogueHistory }
Response: 流式 JSON (type: 'chunk' | 'complete' | 'error')
```

**状态管理**:
```typescript
const [summaryContent, setSummaryContent] = useState('');
const [showSummary, setShowSummary] = useState(false);
const [conversationEnded, setConversationEnded] = useState(false);
```

### 3. 智能按钮文案 (Smart Button Text)

**功能描述**:
- 第1-4轮: "生成思维总结" (次要按钮)
- 第5轮: "结束并生成总结" (主要按钮)
- 已生成总结后: 隐藏按钮

**实现逻辑**:
```typescript
{!conversationEnded && currentRound >= 1 && (
  <Button
    title={currentRound >= 5 ? '结束并生成总结' : '生成思维总结'}
    variant={currentRound >= 5 ? 'primary' : 'secondary'}
  />
)}
```

### 4. 对话结束状态管理 (Conversation End State)

**功能描述**:
- 生成总结后标记对话已结束
- 显示"继续追问"和"关闭"按钮
- 用户可选择继续对话或结束

**UI布局**:
```
┌─────────────────────────────────────┐
│  📊 对话总结                         │
│  [总结内容滚动区域]                  │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │继续追问   │  │  关闭    │       │
│  └──────────┘  └──────────┘       │
└─────────────────────────────────────┘
```

**交互逻辑**:
- "继续追问": 重置 conversationEnded, 关闭总结显示, 关闭助手抽屉
- "关闭": 仅关闭助手抽屉

### 5. 难度标签显示 (Difficulty Badges)

**已有功能增强**:
- 入门 (🌱 Simple): 绿色背景
- 进阶 (🌿 Moderate): 黄色背景
- 深度 (🌳 Deep): 紫色背景

**兼容性处理**:
```typescript
const difficulty = suggestion.difficulty ||
  (index === 0 ? 'simple' : index === 1 ? 'moderate' : 'deep');
```

## 技术实现细节

### 轮次追踪逻辑

**触发时机**: AI回复完成后 (useEffect监听)

**计算方式**:
```typescript
const userMessages = conversation.messages.filter(m => m.role === 'user');
const newRound = Math.ceil(userMessages.length / 1);
```

**历史记录更新**:
```typescript
setDialogueHistory(prev => [...prev, {
  round: newRound,
  userMessage: lastUserMsg.content,
  aiQuestion: lastMessage.content,
  timestamp: new Date()
}]);
```

### 总结生成流程

**步骤1: 初始化**
```typescript
setSummaryContent('📊 正在生成对话总结...\n\n');
setShowSummary(true);
```

**步骤2: 发起请求**
```typescript
const response = await fetch(`${API_CONFIG.BASE_URL}/conversations/${id}/summary`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ rounds: dialogueHistory }),
});
```

**步骤3: 流式处理**
```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    const data = JSON.parse(line);
    if (data.type === 'chunk' && data.content) {
      content += data.content;
      setSummaryContent(content);
    } else if (data.type === 'complete') {
      setConversationEnded(true);
    }
  }
}
```

### 智能助手抽屉UI增强

**布局结构**:
```
┌─────────────────────────────────────┐
│  💡 智能助手     第 3/5 轮 [===  ]  │ <- 标题 + 进度
├─────────────────────────────────────┤
│  📊 对话总结 (如果已生成)            │
│  [总结内容]                          │
│  [继续追问] [关闭]                   │
├─────────────────────────────────────┤
│  🌱 入门                             │
│  建议答案1...                        │
│  💡 提问意图                         │
├─────────────────────────────────────┤
│  🌿 进阶                             │
│  建议答案2...                        │
├─────────────────────────────────────┤
│  [生成思维总结] 或 [结束并生成总结]  │
└─────────────────────────────────────┘
```

**条件渲染逻辑**:
1. 如果 `showSummary`: 显示总结内容 + 按钮
2. 如果 `!showSummary`: 显示建议答案列表
3. 总结按钮: `currentRound >= 1 && !conversationEnded`

## 与Web端对比

| 功能 | Web端 | 移动端 (升级后) | 状态 |
|-----|-------|----------------|------|
| 轮次追踪 | ✅ | ✅ | 已实现 |
| 进度条显示 | ✅ | ✅ | 已实现 |
| 难度标签 | ✅ | ✅ | 已实现 |
| 意图说明 | ✅ | ✅ | 已实现 |
| 流式总结 | ✅ | ✅ | 已实现 |
| 对话结束状态 | ✅ | ✅ | 已实现 |
| 继续追问按钮 | ✅ | ✅ | 已实现 |
| 本地状态持久化 | localStorage | - | 待实现 |

## 待优化项

### 1. 状态持久化

**当前状态**: 仅存在内存中，刷新后丢失

**建议实现**:
```typescript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// 保存对话结束状态
useEffect(() => {
  if (conversationEnded) {
    storage.set(`conversation_${id}_ended`, 'true');
  }
}, [conversationEnded, id]);

// 恢复状态
useEffect(() => {
  const ended = storage.getString(`conversation_${id}_ended`);
  if (ended === 'true') {
    setConversationEnded(true);
  }
}, [id]);
```

### 2. 总结内容持久化

**建议**: 将总结保存到消息列表中 (参考Web端)

```typescript
// 在总结完成后
await conversationService.sendMessage({
  conversationId: id,
  content: summaryContent,
  role: 'assistant'
});
```

### 3. Markdown渲染支持

**当前**: 纯文本显示总结

**建议**: 使用 `MarkdownRenderer` 组件渲染总结内容

```typescript
import { MarkdownRenderer } from '@/src/components/MarkdownRenderer';

<MarkdownRenderer content={summaryContent} />
```

## 测试建议

### 功能测试

1. **轮次追踪**:
   - [ ] 发送第1条消息 → 显示"第 1/5 轮"
   - [ ] 发送第5条消息 → 显示"第 5/5 轮"
   - [ ] 进度条宽度正确 (1/5 = 20%, 5/5 = 100%)

2. **总结生成**:
   - [ ] 第1-4轮显示"生成思维总结"按钮
   - [ ] 第5轮显示"结束并生成总结"按钮
   - [ ] 点击按钮后显示流式总结
   - [ ] 总结完成后显示"继续追问"和"关闭"按钮

3. **对话结束状态**:
   - [ ] 点击"继续追问" → conversationEnded重置为false
   - [ ] 点击"关闭" → 助手抽屉关闭
   - [ ] 再次打开助手 → 显示之前的总结内容

4. **建议答案**:
   - [ ] 显示难度标签 (🌱/🌿/🌳)
   - [ ] 显示意图说明
   - [ ] 点击建议 → 填入输入框并关闭助手

### 边界测试

1. **无消息状态**:
   - [ ] 0条消息 → 不显示轮次
   - [ ] 0条消息 → 不显示总结按钮

2. **网络错误**:
   - [ ] API失败 → 显示"❌ 生成总结失败，请稍后重试"
   - [ ] 网络超时 → 正确处理错误

3. **重复操作**:
   - [ ] 已生成总结 → 再次点击按钮 → 显示之前的总结
   - [ ] 同一条AI消息 → 不重复生成建议

## 文件变更清单

### 修改文件

- `mobile/app/(tabs)/conversations/[id].tsx`:
  - 新增状态: currentRound, dialogueHistory, conversationEnded, summaryContent, showSummary
  - 增强 useEffect: 添加轮次追踪逻辑
  - 重写 handleGenerateSummary: 支持流式总结
  - 增强智能助手UI: 进度条 + 总结显示 + 条件按钮

### 未修改文件

- `mobile/src/services/conversation.service.ts`: API服务保持不变
- `mobile/src/hooks/useConversations.ts`: React Query hooks保持不变
- `mobile/src/types/conversation.ts`: 类型定义保持不变

## API依赖

### POST /api/conversations/:id/summary

**请求体**:
```json
{
  "rounds": [
    {
      "round": 1,
      "userMessage": "用户消息",
      "aiQuestion": "AI问题",
      "timestamp": "2025-10-08T13:00:00.000Z"
    }
  ]
}
```

**响应流**:
```
data: {"type":"chunk","content":"总结内容片段"}
data: {"type":"chunk","content":"..."}
data: {"type":"complete"}
```

**错误响应**:
```
data: {"type":"error","error":"错误信息"}
```

## 部署说明

### 无需额外依赖

本次升级仅使用现有依赖，无需安装新包。

### 环境变量

确保 `.env` 文件包含:
```
EXPO_PUBLIC_DASHSCOPE_API_KEY=your_api_key_here
```

### 构建步骤

```bash
cd mobile
npm install  # 确保依赖已安装
npx expo start --clear  # 清除缓存并启动
```

## 总结

本次升级成功将Web端智能助手的完整功能复刻到移动端，包括:

1. ✅ 轮次进度追踪 (1-5轮可视化)
2. ✅ 对话历史记录 (round + userMessage + aiQuestion)
3. ✅ 流式总结生成 (实时显示总结内容)
4. ✅ 对话结束状态管理 (conversationEnded标记)
5. ✅ 智能按钮文案 (根据轮次动态调整)
6. ✅ 继续追问/关闭选项 (总结后的交互)
7. ✅ 难度标签显示 (🌱/🌿/🌳)
8. ✅ 意图说明显示 (suggestion.intent)

移动端现在与Web端功能对等，为用户提供了完整的对话引导和总结体验。
