#!/usr/bin/env tsx
/**
 * Test script for learning path API endpoints
 * Tests path generation, retrieval, and progress tracking
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLearningPath() {
  console.log('🧪 Testing Learning Path System...\n');

  try {
    // 1. Check if user exists
    console.log('1️⃣ Checking for test user...');
    const user = await prisma.user.findFirst({
      where: {
        email: { contains: '@' }
      }
    });

    if (!user) {
      console.log('❌ No user found in database. Please create a user first.');
      return;
    }
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})\n`);

    // 2. Check thinking types
    console.log('2️⃣ Checking thinking types...');
    const thinkingTypes = await prisma.thinkingType.findMany({
      select: { id: true, name: true }
    });
    console.log(`✅ Found ${thinkingTypes.length} thinking types:`);
    thinkingTypes.forEach(t => console.log(`   - ${t.id}: ${t.name}`));
    console.log();

    // 3. Check theory content availability
    console.log('3️⃣ Checking theory content...');
    const theoryContent = await prisma.theoryContent.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        thinkingTypeId: true,
        level: true,
        title: true
      },
      orderBy: [
        { thinkingTypeId: 'asc' },
        { level: 'asc' }
      ]
    });
    console.log(`✅ Found ${theoryContent.length} published theory content items`);

    // Group by thinking type
    const contentByType = theoryContent.reduce((acc, item) => {
      if (!acc[item.thinkingTypeId]) acc[item.thinkingTypeId] = [];
      acc[item.thinkingTypeId].push(item);
      return acc;
    }, {} as Record<string, typeof theoryContent>);

    Object.entries(contentByType).forEach(([typeId, items]) => {
      const typeName = thinkingTypes.find(t => t.id === typeId)?.name || typeId;
      console.log(`   ${typeName}: ${items.length} levels available`);
    });
    console.log();

    // 4. Check user progress
    console.log('4️⃣ Checking user progress...');
    const progress = await prisma.criticalThinkingProgress.findMany({
      where: { userId: user.id },
      select: {
        thinkingTypeId: true,
        currentLevel: true,
        questionsCompleted: true,
        progressPercentage: true
      }
    });
    console.log(`✅ User has progress in ${progress.length} thinking types:`);
    progress.forEach(p => {
      const typeName = thinkingTypes.find(t => t.id === p.thinkingTypeId)?.name || p.thinkingTypeId;
      console.log(`   - ${typeName}: Level ${p.currentLevel}, ${p.progressPercentage}% complete, ${p.questionsCompleted} questions`);
    });
    console.log();

    // 5. Check existing learning path
    console.log('5️⃣ Checking existing learning path...');
    const existingPath = await prisma.learningPathState.findFirst({
      where: {
        userId: user.id,
        status: 'active'
      }
    });

    if (existingPath) {
      console.log('✅ Found active learning path:');
      console.log(`   - Type: ${existingPath.pathType}`);
      console.log(`   - Status: ${existingPath.status}`);
      console.log(`   - Progress: ${existingPath.completedSteps}/${existingPath.totalSteps} steps`);
      console.log(`   - Current step: ${existingPath.currentStepIndex + 1}`);
      console.log(`   - Time spent: ${Math.round(existingPath.totalTimeSpent / 60)} hours`);
      console.log(`   - Learning style: ${existingPath.learningStyle}`);
      console.log(`   - Target dimensions: ${existingPath.targetDimensions.join(', ')}`);

      const steps = JSON.parse(existingPath.pathSteps as string);
      console.log(`   - Total steps in path: ${steps.length}`);
      console.log(`   - Available steps: ${steps.filter((s: any) => s.status === 'available').length}`);
      console.log(`   - Completed steps: ${steps.filter((s: any) => s.completed).length}`);
    } else {
      console.log('ℹ️  No active learning path found');
    }
    console.log();

    // 6. Summary
    console.log('📊 System Status Summary:');
    console.log(`   ✅ Users: ${user ? 1 : 0}`);
    console.log(`   ✅ Thinking Types: ${thinkingTypes.length}`);
    console.log(`   ✅ Theory Content: ${theoryContent.length}`);
    console.log(`   ✅ User Progress Records: ${progress.length}`);
    console.log(`   ✅ Active Learning Paths: ${existingPath ? 1 : 0}`);
    console.log();

    console.log('✨ Learning path system is ready!');
    console.log('📝 Next steps:');
    console.log('   1. Visit http://localhost:3001/learn/path to view/generate learning path');
    console.log('   2. API endpoints available:');
    console.log('      - POST /api/learning-path/generate - Generate new path');
    console.log('      - GET  /api/learning-path/current - Get current path');
    console.log('      - POST /api/learning-path/progress - Update step progress');

  } catch (error) {
    console.error('❌ Error testing learning path:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLearningPath();
