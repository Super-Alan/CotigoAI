import PracticeSessionV2 from '@/components/learn/thinking-types/PracticeSessionV2'

interface PracticePageProps {
  params: {
    id: string
  }
}

// 禁用静态生成，使用动态渲染
export const dynamic = 'force-dynamic'

// 禁用自动重新验证，防止切换标签页时重新加载
export const revalidate = false

export default function PracticePage({ params }: PracticePageProps) {
  return <PracticeSessionV2 thinkingTypeId={params.id} />
}