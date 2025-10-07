const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // 获取最新的一条解构记录
    const latestArgument = await prisma.argumentAnalysis.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });

    if (!latestArgument) {
      console.log('没有找到任何解构记录');
      return;
    }

    console.log('\n=== 最新解构记录 ===');
    console.log('ID:', latestArgument.id);
    console.log('用户:', latestArgument.user.email);
    console.log('输入文本:', latestArgument.inputText.substring(0, 100) + '...');
    console.log('创建时间:', latestArgument.createdAt);
    console.log('\n=== Analysis 数据结构 ===');
    console.log('类型:', typeof latestArgument.analysis);
    console.log('是否为对象:', latestArgument.analysis && typeof latestArgument.analysis === 'object');

    if (latestArgument.analysis) {
      console.log('顶层键:', Object.keys(latestArgument.analysis));
      console.log('\n=== 各字段详情 ===');
      console.log('mainClaim:', latestArgument.analysis.mainClaim ? '存在' : '不存在');
      console.log('premises:', Array.isArray(latestArgument.analysis.premises) ? `数组(${latestArgument.analysis.premises.length}项)` : '不存在');
      console.log('evidence:', Array.isArray(latestArgument.analysis.evidence) ? `数组(${latestArgument.analysis.evidence.length}项)` : '不存在');
      console.log('assumptions:', Array.isArray(latestArgument.analysis.assumptions) ? `数组(${latestArgument.analysis.assumptions.length}项)` : '不存在');
      console.log('logicalStructure:', latestArgument.analysis.logicalStructure ? '存在' : '不存在');
      console.log('potentialFallacies:', Array.isArray(latestArgument.analysis.potentialFallacies) ? `数组(${latestArgument.analysis.potentialFallacies.length}项)` : '不存在');
      console.log('strengthAssessment:', latestArgument.analysis.strengthAssessment ? '存在' : '不存在');

      // 显示完整的 analysis 数据
      console.log('\n=== 完整 Analysis JSON ===');
      console.log(JSON.stringify(latestArgument.analysis, null, 2).substring(0, 1000) + '...');
    } else {
      console.log('analysis 字段为空或 null');
    }

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
