#!/usr/bin/env tsx

/**
 * Publish Theory Content Script
 *
 * This script marks all generated theory content as published (isPublished = true)
 * so they can be displayed in the frontend.
 *
 * Usage: npm run publish:theory-content
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🚀 Publishing Theory Content...\n');

  try {
    // Update all theory content to published
    const result = await prisma.theoryContent.updateMany({
      where: {
        isPublished: false,
        validationStatus: { in: ['validated', 'published'] }, // Only publish validated content
      },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    console.log(`✅ Successfully published ${result.count} theory content records\n`);

    // Show summary by dimension
    const summary = await prisma.theoryContent.groupBy({
      by: ['thinkingTypeId'],
      where: {
        isPublished: true,
      },
      _count: {
        id: true,
      },
    });

    console.log('📊 Published Content Summary:\n');
    for (const item of summary) {
      console.log(`  ${item.thinkingTypeId}: ${item._count.id} levels`);
    }

    console.log('\n✨ Theory content is now live!\n');
  } catch (error) {
    console.error('❌ Error publishing theory content:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
