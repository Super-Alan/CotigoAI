# 移动端智能助手功能测试指南

## 测试前准备

1. 确保 Metro bundler 正在运行
2. 在 Expo Go 或模拟器中打开应用
3. 进入或创建一个对话

## 功能测试步骤

### 1. 轮次进度显示测试

**目标**: 验证轮次计数和进度条正确显示

**步骤**:
1. 发送第1条用户消息
2. 等待AI回复
3. 点击右下角的 💡 图标打开智能助手抽屉
4. **预期结果**:
   - 看到 "💡 智能助手" 右侧显示 "第 1/5 轮"
   - 进度条宽度约为 20% (蓝色)

5. 继续发送第2-5条消息
6. 每次AI回复后打开助手
7. **预期结果**:
   - 第2轮: "第 2/5 轮", 进度条 40%
   - 第3轮: "第 3/5 轮", 进度条 60%
   - 第4轮: "第 4/5 轮", 进度条 80%
   - 第5轮: "第 5/5 轮", 进度条 100%

### 2. 总结按钮文案测试

**目标**: 验证按钮文案根据轮次动态变化

**步骤**:
1. 第1轮时打开助手抽屉
2. **预期结果**: 看到 "生成思维总结" 按钮 (灰色次要按钮)

3. 第5轮时打开助手抽屉
4. **预期结果**: 看到 "结束并生成总结" 按钮 (蓝色主要按钮)

### 3. 总结生成测试

**目标**: 验证流式总结生成和显示

**步骤**:
1. 在第5轮或之后，点击 "结束并生成总结" 按钮
2. **预期结果**:
   - 建议答案列表隐藏
   - 显示紫色背景的总结区域
   - 初始显示 "📊 正在生成对话总结..."
   - 总结内容逐步实时显示 (流式)

3. 等待总结完成
4. **预期结果**:
   - 总结内容完整显示
   - 底部出现两个按钮:
     - 左侧: "继续追问" (蓝色按钮)
     - 右侧: "关闭" (灰色按钮)
   - "生成思维总结" 按钮隐藏

### 4. 对话结束状态测试

**目标**: 验证对话结束后的交互逻辑

**步骤A - 继续追问**:
1. 总结完成后，点击 "继续追问" 按钮
2. **预期结果**:
   - 助手抽屉关闭
   - conversationEnded 状态重置为 false
   - 可以继续发送消息
   - 再次打开助手时，不显示总结，显示建议答案
   - "生成思维总结" 按钮再次出现

**步骤B - 关闭**:
1. 总结完成后，点击 "关闭" 按钮
2. **预期结果**:
   - 助手抽屉关闭
   - conversationEnded 状态保持为 true
   - 再次打开助手时，仍然显示之前的总结

### 5. 建议答案显示测试

**目标**: 验证难度标签和意图说明正确显示

**步骤**:
1. AI回复后打开助手抽屉
2. **预期结果**:
   - 看到3条建议答案
   - 每条都有难度标签:
     - 第1条: 🌱 入门 (绿色背景)
     - 第2条: 🌿 进阶 (黄色背景)
     - 第3条: 🌳 深度 (紫色背景)
   - 每条建议下方显示 "💡 提问意图说明"

3. 点击任一建议答案
4. **预期结果**:
   - 建议内容填入输入框
   - 助手抽屉关闭

## 边界情况测试

### 测试1: 无消息状态
- **操作**: 在新对话中（0条消息）打开助手
- **预期**: 不显示轮次进度，不显示总结按钮

### 测试2: 第1-4轮不应显示总结
- **操作**: 在第1-4轮时查看助手
- **预期**: 只显示 "生成思维总结" 按钮，不是 "结束并生成总结"

### 测试3: 总结失败处理
- **操作**: 在网络断开状态下点击生成总结
- **预期**: 显示 "❌ 生成总结失败，请稍后重试"

### 测试4: 重复生成总结
- **操作**: 已生成总结后，点击 "继续追问"，再次到第5轮后再生成总结
- **预期**: 可以正常生成新的总结

## 调试技巧

### 查看控制台日志

在 Metro bundler 终端中查看日志输出：

```bash
# 查看轮次更新
[VoiceInput] Current round: 3

# 查看总结生成
[Summary] Generating summary for conversation: xxx
[Summary] Summary complete

# 查看API错误
[Speech] Failed to generate summary: Error message
```

### 检查状态值

在代码中临时添加调试日志：

```typescript
// 在 useEffect 中查看轮次
useEffect(() => {
  console.log('Current round:', currentRound);
  console.log('Dialogue history:', dialogueHistory);
}, [currentRound, dialogueHistory]);

// 在总结生成时查看状态
useEffect(() => {
  console.log('Summary content:', summaryContent);
  console.log('Conversation ended:', conversationEnded);
  console.log('Show summary:', showSummary);
}, [summaryContent, conversationEnded, showSummary]);
```

## 常见问题排查

### 问题1: 看不到轮次进度

**可能原因**:
- currentRound 状态没有更新
- AI回复未正确触发 useEffect

**排查方法**:
1. 检查控制台是否有轮次更新日志
2. 确认 conversation.messages 包含用户消息
3. 检查 useEffect 依赖项是否正确

**解决方案**:
```typescript
// 检查 useEffect 是否触发
useEffect(() => {
  console.log('Messages updated:', conversation?.messages?.length);
  console.log('Is sending:', isSending);
  console.log('Streaming:', streamingMessage);
}, [conversation?.messages, isSending, streamingMessage, currentRound]);
```

### 问题2: 按钮不显示

**可能原因**:
- currentRound < 1
- conversationEnded 为 true

**排查方法**:
1. 打开 React DevTools 查看状态值
2. 检查条件判断逻辑

**解决方案**:
```typescript
// 临时显示调试信息
<Text>Debug: Round={currentRound}, Ended={conversationEnded ? 'Yes' : 'No'}</Text>
```

### 问题3: 总结不显示

**可能原因**:
- showSummary 或 summaryContent 为空
- API返回格式不正确

**排查方法**:
1. 检查网络请求是否成功
2. 查看API响应格式
3. 检查流式解析逻辑

**解决方案**:
```typescript
// 在 handleGenerateSummary 中添加日志
console.log('Starting summary generation...');
console.log('Summary content:', summaryContent);
console.log('Show summary:', showSummary);
```

### 问题4: "继续追问"不工作

**可能原因**:
- 状态重置逻辑有误
- conversationEnded 未正确更新

**排查方法**:
1. 检查按钮点击事件是否触发
2. 确认状态更新函数被调用

**解决方案**:
```typescript
// 在按钮点击处理中添加日志
onPress={() => {
  console.log('Continue asking clicked');
  setConversationEnded(false);
  setShowSummary(false);
  setShowAssistant(false);
  console.log('State reset complete');
}}
```

## 性能测试

### 流式总结性能
- **预期**: 总结内容实时显示，无明显延迟
- **测试**: 观察总结生成过程是否流畅

### UI响应性
- **预期**: 按钮点击响应时间 < 100ms
- **测试**: 连续点击按钮，检查是否有卡顿

### 内存使用
- **预期**: 总结生成不应导致内存泄漏
- **测试**: 多次生成总结，观察内存使用情况

## 成功标准

所有功能测试通过，且满足以下条件：

- ✅ 轮次进度正确显示和更新
- ✅ 按钮文案根据轮次动态变化
- ✅ 总结流式生成并正确显示
- ✅ "继续追问" 和 "关闭" 按钮功能正常
- ✅ 建议答案难度标签和意图说明显示正确
- ✅ 边界情况处理合理
- ✅ 无JavaScript错误或崩溃
- ✅ UI响应流畅，无性能问题

## 下一步优化

如果所有测试通过，可以考虑以下优化：

1. **状态持久化**: 使用 MMKV 保存 conversationEnded 状态
2. **Markdown渲染**: 使用 MarkdownRenderer 美化总结显示
3. **动画效果**: 添加总结区域展开/收起动画
4. **加载状态**: 优化总结生成时的加载提示
5. **错误重试**: 添加总结失败后的重试按钮
