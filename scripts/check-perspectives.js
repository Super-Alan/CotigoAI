const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // 获取最新的一条视角会话记录
    const latestSession = await prisma.perspectiveSession.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        perspectives: true
      }
    });

    if (!latestSession) {
      console.log('没有找到任何视角会话记录');
      return;
    }

    console.log('\n=== 最新视角会话记录 ===');
    console.log('ID:', latestSession.id);
    console.log('用户:', latestSession.user.email);
    console.log('议题:', latestSession.topic.substring(0, 100) + (latestSession.topic.length > 100 ? '...' : ''));
    console.log('创建时间:', latestSession.createdAt);
    console.log('视角数量:', latestSession.perspectives.length);

    console.log('\n=== 视角详情 ===');
    latestSession.perspectives.forEach((p, idx) => {
      console.log(`\n视角 ${idx + 1}:`);
      console.log('  ID:', p.id);
      console.log('  角色名:', p.roleName);
      console.log('  roleConfig:', p.roleConfig);
      console.log('  观点长度:', p.viewpoint ? p.viewpoint.length : 0, '字符');
      console.log('  观点预览:', p.viewpoint ? p.viewpoint.substring(0, 100) + '...' : '无');
      console.log('  创建时间:', p.createdAt);
    });

    console.log('\n=== 完整 Session JSON ===');
    console.log(JSON.stringify(latestSession, null, 2).substring(0, 1000) + '...');

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
