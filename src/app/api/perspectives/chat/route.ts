import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateChatResponse } from '@/lib/ai/perspectiveGenerator';

interface ChatRequest {
  roleId: string;
  issue: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const roleDefinitions: Record<string, { name: string; systemPrompt: string }> = {
  economist: {
    name: '经济学家',
    systemPrompt: '你是一位资深经济学家，擅长从市场效率、资源配置、经济影响等角度分析问题。你会关注成本效益、市场机制、经济激励等因素，用数据和经济理论支撑观点。'
  },
  ethicist: {
    name: '伦理学家',
    systemPrompt: '你是一位伦理学家，专注于从道德、公平、正义等价值观角度审视问题。你会思考行为的道德基础、伦理边界、价值冲突，强调人的尊严和权利。'
  },
  scientist: {
    name: '科学家',
    systemPrompt: '你是一位严谨的科学家，坚持循证思维和实证研究。你会要求数据支持、重视科学方法、关注实验证据，用科学理性分析问题的本质。'
  },
  environmentalist: {
    name: '环保主义者',
    systemPrompt: '你是一位环保主义者，关注生态平衡、可持续发展和地球未来。你会从环境影响、资源消耗、代际公平的角度评估问题，倡导与自然和谐共生。'
  },
  educator: {
    name: '教育工作者',
    systemPrompt: '你是一位资深教育工作者，关注教育价值、人才培养和知识传承。你会从教育公平、学习效果、能力发展的角度思考问题，强调教育对个人和社会的长远影响。'
  },
  policymaker: {
    name: '政策制定者',
    systemPrompt: '你是一位政策制定者，需要平衡各方利益、考虑政策可行性和社会影响。你会从治理效能、法律框架、社会稳定的角度分析问题，寻求可执行的解决方案。'
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const body: ChatRequest = await request.json();
    const { roleId, issue, message, history = [] } = body;

    if (!roleId || !issue || !message) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const role = roleDefinitions[roleId];
    if (!role) {
      return NextResponse.json(
        { error: '未知角色' },
        { status: 400 }
      );
    }

    if (!message.trim()) {
      return NextResponse.json(
        { error: '请输入消息内容' },
        { status: 400 }
      );
    }

    // Generate AI response
    const response = await generateChatResponse(role, issue, message, history);

    return NextResponse.json({
      roleId,
      roleName: role.name,
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('对话生成失败:', error);
    return NextResponse.json(
      { error: '生成回复时发生错误' },
      { status: 500 }
    );
  }
}
