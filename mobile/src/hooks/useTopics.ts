import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicService } from '@/src/services/topic.service';
import type { TopicGenerationRequest } from '@/src/types/topic';

// Query Keys
export const topicKeys = {
  all: ['topics'] as const,
  lists: () => [...topicKeys.all, 'list'] as const,
  list: (filters: any) => [...topicKeys.lists(), filters] as const,
  random: () => [...topicKeys.all, 'random'] as const,
};

/**
 * 获取话题列表
 */
export function useTopics(params?: {
  limit?: number;
  page?: number;
  dimension?: string;
  difficulty?: string;
}) {
  return useQuery({
    queryKey: topicKeys.list(params || {}),
    queryFn: () => topicService.getTopics(params),
  });
}

/**
 * 生成话题
 */
export function useGenerateTopics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TopicGenerationRequest) => topicService.generateTopics(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });
}

/**
 * 获取随机话题
 */
export function useRandomTopic() {
  return useQuery({
    queryKey: topicKeys.random(),
    queryFn: () => topicService.getRandomTopic(),
    enabled: false, // 手动触发
  });
}
