import PracticeSession from '@/components/learn/thinking-types/PracticeSession'

interface PracticePageProps {
  params: {
    id: string
  }
}

export default function PracticePage({ params }: PracticePageProps) {
  return <PracticeSession thinkingTypeId={params.id} />
}