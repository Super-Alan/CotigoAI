import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            metadata: true,
            createdAt: true
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // 计算对话分析数据
    const analysis = {
      messageCount: conversation.messages.length,
      userMessages: conversation.messages.filter(m => m.role === 'user').length,
      assistantMessages: conversation.messages.filter(m => m.role === 'assistant').length,
      duration: conversation.messages.length > 1 
        ? new Date(conversation.messages[conversation.messages.length - 1].createdAt).getTime() - 
          new Date(conversation.messages[0].createdAt).getTime()
        : 0,
      avgResponseTime: 0, // 可以根据实际需求计算
      topics: conversation.topic ? [conversation.topic] : [],
      sentiment: 'neutral' // 可以集成情感分析
    }

    return NextResponse.json({
      ...conversation,
      analysis
    })
  } catch (error) {
    console.error('Conversation fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.conversation.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Conversation deleted successfully' })
  } catch (error) {
    console.error('Conversation deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}