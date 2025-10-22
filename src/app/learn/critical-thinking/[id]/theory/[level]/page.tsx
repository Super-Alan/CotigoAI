import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import TheorySystemLayout from '@/components/learn/thinking-types/TheorySystemLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
    level: string;
  };
}

export default async function TheoryLevelPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin?callbackUrl=/learn');
  }

  const { id: thinkingTypeId, level } = params;
  const levelNum = parseInt(level, 10);

  if (isNaN(levelNum) || levelNum < 1 || levelNum > 5) {
    redirect(`/learn/critical-thinking/${thinkingTypeId}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/learn">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回学习中心
          </Button>
        </Link>
      </div>

      {/* Theory System Layout */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <TheorySystemLayout thinkingTypeId={thinkingTypeId} level={levelNum} />
      </Suspense>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { id, level } = params;
  return {
    title: `批判性思维理论 - Level ${level} | Cogito AI`,
    description: `学习${id}的Level ${level}理论内容，包括核心概念、思维模型和实例演示`,
  };
}
