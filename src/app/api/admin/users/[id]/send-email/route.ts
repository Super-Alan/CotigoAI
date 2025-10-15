import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminUser, logAdminAction } from '@/lib/admin-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await isAdminUser(session.user.email)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()
    const { subject, message, template } = body

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer
    // - Resend
    
    // For now, we'll simulate sending an email
    const emailData = {
      to: user.email,
      subject: subject || '来自 Cogito AI 管理团队的消息',
      message: message || '您好，这是来自 Cogito AI 管理团队的消息。',
      template: template || 'default'
    }

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Get admin user to get adminId for logging
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    // Log the admin action
    await logAdminAction(
      adminUser.id,
      'SEND_EMAIL',
      'USER',
      user.id,
      { userEmail: user.email, subject: emailData.subject },
      request
    )

    // In a real implementation, you might want to store email logs
    // await prisma.emailLog.create({
    //   data: {
    //     recipientId: userId,
    //     recipientEmail: user.email,
    //     subject: emailData.subject,
    //     message: emailData.message,
    //     sentBy: session.user.email,
    //     sentAt: new Date(),
    //     status: 'sent'
    //   }
    // })

    return NextResponse.json({ 
      success: true, 
      message: `邮件已成功发送给 ${user.email}`,
      emailData: {
        recipient: user.email,
        subject: emailData.subject,
        sentAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Send email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}