# 移动端调试指南

## 当前状态

### ✅ 已完成的修复

1. **自动开始对话功能** - 实现了与Web端一致的自动开始对话逻辑
2. **SSE流式响应** - 实时显示AI回复内容
3. **建议答案自动生成** - AI回复完成后自动生成建议答案
4. **错误处理与重试** - 完善的错误提示和重试机制
5. **内存泄漏修复** - 清理了所有setTimeout以防止内存泄漏
6. **竞态条件修复** - 防止重复生成建议和并发Token刷新
7. **空值安全检查** - 完善的数据验证和兼容性处理
8. **可视化调试界面** - 黄色调试横幅显示实时状态

### 🔧 服务器状态

- **后端服务器**: ✅ 运行在 `http://localhost:3011`
- **Metro Bundler**: ✅ 运行在 `http://localhost:8081`

### 📱 移动端配置

API地址: `http://192.168.31.224:3011/api` (开发环境)

## 🐛 调试方法

### 方法1: 可视化调试横幅（推荐）

我们已经在对话详情页面顶部添加了**黄色调试横幅**，它会实时显示自动开始对话的状态：

**操作步骤**:
1. 在移动端输入话题，点击"开始对话"
2. 观察屏幕顶部的黄色横幅，它会显示：
   - `检查条件: isNew=true, topic=..., msgs=0` - 初始检查
   - `✅ 条件满足，准备自动开始` - 所有条件满足
   - `🚀 正在发送初始消息...` - 开始发送消息
   - `❌ 条件不满足: ...` - 显示具体哪个条件不满足

**可能的状态**:
```
✅ 正常流程:
检查条件 → ✅ 条件满足 → 🚀 正在发送 → (开始接收AI回复)

❌ 异常情况:
条件不满足 → 显示具体原因 (new=false, topic=空, 等)
已执行过自动开始 → 防止重复执行
```

### 方法2: Expo Go 内置调试

**打开调试菜单**:
- iOS: 摇晃手机
- Android: 摇晃手机或按音量键
- 选择 "Debug Remote JS"

**浏览器调试器**:
1. 选择"Debug Remote JS"后会自动打开浏览器
2. 打开浏览器开发者工具 (F12)
3. 查看Console标签页

**日志标记**:
- `[Auto-Start]` - 自动开始对话逻辑
- `[SendMessage]` - 消息发送流程
- `[SSE]` - 服务器推送事件

### 方法3: Metro Bundler 终端日志

在运行 `npm start` 的终端窗口中可以看到所有console.log输出。

### 方法4: React Native Debugger (高级)

安装独立调试工具:
```bash
brew install --cask react-native-debugger
```

## 🔍 诊断问题

### 问题1: 点击"开始对话"后显示空白

**查看调试横幅显示的内容**:

1. **如果显示**: `❌ 条件不满足: new=false, ...`
   - **原因**: URL参数未正确传递
   - **检查**: `conversations/index.tsx:52-55` 是否正确传递参数
   - **临时方案**: 手动输入消息触发对话

2. **如果显示**: `❌ 条件不满足: topic=false, ...`
   - **原因**: topic参数为空或undefined
   - **检查**: 确认输入框中有内容
   - **临时方案**: 刷新后重新输入

3. **如果显示**: `❌ 条件不满足: noMsgs=false, ...`
   - **原因**: 对话已有消息，不应该自动开始
   - **这是正常的**: 已有消息的对话不会自动开始

4. **如果显示**: `❌ 条件不满足: loaded=false`
   - **原因**: 对话数据未加载完成
   - **等待**: 几秒后应该会自动加载
   - **如果一直false**: 网络问题或API错误

5. **如果显示**: `已执行过自动开始`
   - **原因**: 防止重复执行的保护机制
   - **这是正常的**: 第二次进入页面不会重复自动开始

6. **如果显示**: `🚀 正在发送初始消息...` 但没有AI回复
   - **检查网络连接**: 确认手机和电脑在同一WiFi
   - **检查API地址**: `192.168.31.224:3011` 是否可访问
   - **查看错误信息**: 是否显示红色错误横幅

### 问题2: 网络连接问题

**验证API可访问性**:
```bash
# 在电脑上运行
curl http://192.168.31.224:3011/api/conversations

# 应该返回JSON数据或401错误(说明服务器在运行)
```

**常见网络问题**:
- 手机和电脑不在同一WiFi
- 防火墙阻止了3011端口
- IP地址 `192.168.31.224` 不正确

**获取正确IP地址**:
```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# 找到类似 192.168.x.x 的地址
# 更新 mobile/src/constants/api.ts 中的 BASE_URL
```

### 问题3: 显示错误横幅

如果看到红色错误横幅，点击"重试"按钮。

**常见错误**:
- `请求超时`: 网络连接问题或服务器未响应
- `HTTP 401`: 认证失败，需要重新登录
- `HTTP 404`: API端点不存在
- `Stream reader not available`: SSE不支持或网络中断

## 📝 关键日志位置

### 自动开始对话逻辑
文件: `mobile/app/(tabs)/conversations/[id].tsx:98-137`

关键检查点:
```typescript
const isNewConversation = isNew === 'true';  // 必须为'true'
const hasMessages = conversation?.messages && conversation.messages.length > 0; // 必须为false
// 需要满足: isNewConversation && topic && !hasMessages && conversation
```

### SSE消息发送
文件: `mobile/app/(tabs)/conversations/[id].tsx:139-235`

关键流程:
```
1. 获取Token
2. 发送POST请求到 /conversations/{id}/messages
3. 建立SSE连接
4. 逐块接收AI回复
5. 收到done信号后刷新对话
```

### API配置
文件: `mobile/src/constants/api.ts`

当前配置:
```typescript
BASE_URL: __DEV__
  ? 'http://192.168.31.224:3011/api'
  : 'https://your-production-domain.com/api'
```

## 🎯 下一步行动

1. **在移动设备上测试**: 点击"开始对话"并观察黄色调试横幅
2. **截图并报告**: 将黄色横幅显示的内容截图发送
3. **检查完整日志**: 如果横幅显示正常但仍有问题，打开浏览器调试器查看详细日志
4. **验证网络**: 确认手机能访问 `http://192.168.31.224:3011`

## 📞 需要提供的调试信息

如果问题仍然存在，请提供:
1. 黄色调试横幅显示的完整内容（截图）
2. 浏览器Console中的错误日志（如果有）
3. 是否看到红色错误横幅，错误内容是什么
4. 手机和电脑是否在同一WiFi网络

## 🔧 临时解决方案

如果自动开始不工作，可以手动发送消息:
1. 等待页面加载完成
2. 在底部输入框输入你的话题
3. 点击发送按钮
4. 应该能正常接收AI回复

## 📚 相关文件

- 对话列表: `mobile/app/(tabs)/conversations/index.tsx`
- 对话详情: `mobile/app/(tabs)/conversations/[id].tsx`
- API服务: `mobile/src/services/conversation.service.ts`
- API配置: `mobile/src/constants/api.ts`
- 后端路由: `src/app/api/conversations/[id]/messages/route.ts`
