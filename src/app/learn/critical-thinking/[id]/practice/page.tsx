import PracticeSessionV2 from '@/components/learn/thinking-types/PracticeSessionV2'

interface PracticePageProps {
  params: {
    id: string
  }
}

// 使用客户端组件，避免服务端重新渲染导致状态丢失
// 不使用 force-dynamic，让客户端组件完全控制状态

export default function PracticePage({ params }: PracticePageProps) {
  return <PracticeSessionV2 thinkingTypeId={params.id} />
}