#!/usr/bin/env tsx
/**
 * 测试脚本 - 生成1个问题验证功能
 */

import { PrismaClient } from '@prisma/client'
import { aiRouter } from '../src/lib/ai/router'

const prisma = new PrismaClient()

async function testGeneration() {
  console.log('🧪 测试问题生成功能...\n')

  try {
    // 测试 AI 调用
    console.log('1️⃣ 测试 AI 模型调用...')
    const response = await aiRouter.chat([
      {
        role: 'system',
        content: '你是一位专业的教育内容设计专家。请严格按照JSON格式输出。'
      },
      {
        role: 'user',
        content: `请生成一个批判性思维问题，JSON格式：
{
  "question": "问题文本",
  "subcategory": "子类别",
  "tags": ["标签1", "标签2"],
  "context": "背景说明"
}`
      }
    ], {
      temperature: 0.8,
      maxTokens: 500
    })

    const responseText = typeof response === 'string' ? response : '(stream response)'
    console.log('✅ AI 模型响应成功')
    console.log('响应:', responseText.substring(0, 200) + '...\n')

    // 测试数据库写入
    console.log('2️⃣ 测试数据库写入...')
    const testQuestion = await prisma.dailyCriticalQuestion.create({
      data: {
        question: '测试问题：如果一项政策能够带来经济增长，但同时会加剧社会不平等，你会如何评估这项政策的价值？',
        category: 'critical_thinking',
        subcategory: '价值权衡',
        difficulty: 'intermediate',
        tags: ['经济政策', '社会公平', '价值判断'],
        thinkingTypes: ['causal_analysis'],
        context: '这是一个测试问题',
        isActive: true
      }
    })

    console.log('✅ 数据库写入成功')
    console.log('问题ID:', testQuestion.id, '\n')

    // 清理测试数据
    console.log('3️⃣ 清理测试数据...')
    await prisma.dailyCriticalQuestion.delete({
      where: { id: testQuestion.id }
    })
    console.log('✅ 测试数据已清理\n')

    console.log('🎉 所有测试通过！脚本可以正常运行。')
  } catch (error) {
    console.error('❌ 测试失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testGeneration()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
