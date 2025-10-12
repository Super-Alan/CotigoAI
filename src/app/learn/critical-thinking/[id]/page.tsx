import ThinkingTypeDetail from '@/components/learn/thinking-types/ThinkingTypeDetail'

interface ThinkingTypePageProps {
  params: {
    id: string
  }
}

export default function ThinkingTypePage({ params }: ThinkingTypePageProps) {
  return <ThinkingTypeDetail thinkingTypeId={params.id} />
}