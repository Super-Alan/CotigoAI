import PracticeSessionV2 from '@/components/learn/thinking-types/PracticeSessionV2'

interface PracticePageProps {
  params: {
    id: string
  }
}

export default function PracticePage({ params }: PracticePageProps) {
  return <PracticeSessionV2 thinkingTypeId={params.id} />
}