import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { argumentService } from '@/src/services/argument.service';
import type { AnalyzeArgumentRequest } from '@/src/types/argument';

// Query Keys
export const argumentKeys = {
  all: ['arguments'] as const,
  lists: () => [...argumentKeys.all, 'list'] as const,
  details: () => [...argumentKeys.all, 'detail'] as const,
  detail: (id: string) => [...argumentKeys.details(), id] as const,
};

/**
 * 获取分析历史列表
 */
export function useArguments() {
  return useQuery({
    queryKey: argumentKeys.lists(),
    queryFn: () => argumentService.getAnalyses(),
  });
}

/**
 * 获取单个分析详情
 */
export function useArgument(id: string) {
  return useQuery({
    queryKey: argumentKeys.detail(id),
    queryFn: () => argumentService.getAnalysis(id),
    enabled: !!id,
  });
}

/**
 * 分析论点
 */
export function useAnalyzeArgument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AnalyzeArgumentRequest) =>
      argumentService.analyzeArgument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: argumentKeys.lists() });
    },
  });
}
