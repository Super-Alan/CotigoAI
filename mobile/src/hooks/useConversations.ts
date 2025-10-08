import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '@/src/services/conversation.service';
import type { CreateConversationRequest, SendMessageRequest } from '@/src/types/conversation';

// Query Keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: any) => [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  suggestions: (id: string) => [...conversationKeys.detail(id), 'suggestions'] as const,
};

/**
 * 获取对话列表
 */
export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.lists(),
    queryFn: () => conversationService.getConversations(),
  });
}

/**
 * 获取对话详情
 */
export function useConversation(id: string) {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () => conversationService.getConversation(id),
    enabled: !!id,
  });
}

/**
 * 创建新对话
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationRequest) =>
      conversationService.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

/**
 * 发送消息
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => conversationService.sendMessage(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(variables.conversationId),
      });
    },
  });
}

/**
 * 获取建议答案
 */
export function useGetSuggestions() {
  return useMutation({
    mutationFn: (data: { conversationId: string; question: string; conversationHistory: any[] }) =>
      conversationService.getSuggestions(data),
  });
}

/**
 * 生成对话总结
 */
export function useGenerateSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.generateSummary(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(conversationId),
      });
    },
  });
}

/**
 * 删除对话
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conversationService.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}
