import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePerspectiveAnalysis } from '@/lib/ai/perspectiveGenerator';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

interface PerspectiveRequest {
  issue: string;
  roles: string[];
}

interface RoleDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
}

const roleDefinitions: Record<string, RoleDefinition> = {
  economist: {
    id: 'economist',
    name: '经济学家',
    icon: '💰',
    description: '从经济效益和市场角度分析',
    systemPrompt: '你是一位资深经济学家，擅长从市场效率、资源配置、经济影响等角度分析问题。你会关注成本效益、市场机制、经济激励等因素，用数据和经济理论支撑观点。'
  },
  ethicist: {
    id: 'ethicist',
    name: '伦理学家',
    icon: '⚖️',
    description: '从道德和价值观角度审视',
    systemPrompt: '你是一位伦理学家，专注于从道德、公平、正义等价值观角度审视问题。你会思考行为的道德基础、伦理边界、价值冲突，强调人的尊严和权利。'
  },
  scientist: {
    id: 'scientist',
    name: '科学家',
    icon: '🔬',
    description: '基于实证研究和数据分析',
    systemPrompt: '你是一位严谨的科学家，坚持循证思维和实证研究。你会要求数据支持、重视科学方法、关注实验证据，用科学理性分析问题的本质。'
  },
  environmentalist: {
    id: 'environmentalist',
    name: '环保主义者',
    icon: '🌱',
    description: '关注生态和可持续发展',
    systemPrompt: '你是一位环保主义者，关注生态平衡、可持续发展和地球未来。你会从环境影响、资源消耗、代际公平的角度评估问题，倡导与自然和谐共生。'
  },
  educator: {
    id: 'educator',
    name: '教育工作者',
    icon: '📚',
    description: '从教育和人才培养角度看',
    systemPrompt: '你是一位资深教育工作者，关注教育价值、人才培养和知识传承。你会从教育公平、学习效果、能力发展的角度思考问题，强调教育对个人和社会的长远影响。'
  },
  policymaker: {
    id: 'policymaker',
    name: '政策制定者',
    icon: '🏛️',
    description: '考虑政策可行性和社会影响',
    systemPrompt: '你是一位政策制定者，需要平衡各方利益、考虑政策可行性和社会影响。你会从治理效能、法律框架、社会稳定的角度分析问题，寻求可执行的解决方案。'
  }
};

export async function POST(request: NextRequest) {
  try {
    // 支持双重认证：Web 端 session 和移动端 Bearer token
    let userId: string | null = null;

    // 1. 尝试 Web 端 session 认证
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    }

    // 2. 如果 session 认证失败，尝试 Bearer token 认证（移动端）
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
          // 验证用户存在
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true }
          });
          if (user) {
            userId = user.id;
          }
        } catch (err) {
          // Token 无效，继续尝试其他认证方式
        }
      }
    }

    // 3. 如果两种认证都失败，返回 401
    if (!userId) {
      const encoder = new TextEncoder();
      return new Response(
        encoder.encode(JSON.stringify({ error: '未授权访问' })),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const body: PerspectiveRequest = await request.json();
    const { issue, roles } = body;

    if (!issue || !issue.trim()) {
      const encoder = new TextEncoder();
      return new Response(
        encoder.encode(JSON.stringify({ error: '请提供议题描述' })),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!roles || roles.length < 2) {
      const encoder = new TextEncoder();
      return new Response(
        encoder.encode(JSON.stringify({ error: '请至少选择2个角色视角' })),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (roles.length > 6) {
      const encoder = new TextEncoder();
      return new Response(
        encoder.encode(JSON.stringify({ error: '最多选择6个角色视角' })),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send total count first
          const initialData = {
            type: 'init',
            total: roles.length,
            issue
          };
          controller.enqueue(encoder.encode(JSON.stringify(initialData) + '\n'));

          // Generate perspectives sequentially
          for (let i = 0; i < roles.length; i++) {
            const roleId = roles[i];
            const role = roleDefinitions[roleId];

            if (!role) {
              const errorData = {
                type: 'error',
                error: `未知角色: ${roleId}`
              };
              controller.enqueue(encoder.encode(JSON.stringify(errorData) + '\n'));
              continue;
            }

            // Send progress update
            const progressData = {
              type: 'progress',
              current: i + 1,
              total: roles.length,
              roleName: role.name,
              roleIcon: role.icon
            };
            controller.enqueue(encoder.encode(JSON.stringify(progressData) + '\n'));

            // Generate analysis with streaming
            const analysisResult = await generatePerspectiveAnalysis(role, issue, true);

            let analysis = '';

            // Check if result is a stream or string
            if (typeof analysisResult === 'string') {
              // Non-streaming result
              analysis = analysisResult;
            } else {
              // Streaming result - read the stream
              const reader = analysisResult.getReader();
              const decoder = new TextDecoder();

              // Send streaming chunks
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                analysis += chunk;

                // Send streaming chunk to client
                const chunkData = {
                  type: 'chunk',
                  roleId: role.id,
                  chunk,
                  current: i + 1,
                  total: roles.length
                };
                controller.enqueue(encoder.encode(JSON.stringify(chunkData) + '\n'));
              }
            }

            // Send completed perspective
            const perspectiveData = {
              type: 'perspective',
              perspective: {
                roleId: role.id,
                roleName: role.name,
                roleIcon: role.icon,
                analysis,
                timestamp: new Date().toISOString()
              },
              current: i + 1,
              total: roles.length
            };
            controller.enqueue(encoder.encode(JSON.stringify(perspectiveData) + '\n'));
          }

          // Send completion signal
          const completeData = {
            type: 'complete',
            generatedAt: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(JSON.stringify(completeData) + '\n'));

          controller.close();
        } catch (error) {
          console.error('生成视角分析失败:', error);
          const errorData = {
            type: 'error',
            error: '生成分析时发生错误'
          };
          controller.enqueue(encoder.encode(JSON.stringify(errorData) + '\n'));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('生成视角分析失败:', error);
    const encoder = new TextEncoder();
    return new Response(
      encoder.encode(JSON.stringify({ error: '生成分析时发生错误' })),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
