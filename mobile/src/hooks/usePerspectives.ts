import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { perspectiveService } from '@/src/services/perspective.service';
import type {
  CreatePerspectiveSessionRequest,
  GeneratePerspectivesRequest,
  SynthesizePerspectivesRequest,
} from '@/src/types/perspective';

// Query Keys
export const perspectiveKeys = {
  all: ['perspectives'] as const,
  sessions: () => [...perspectiveKeys.all, 'sessions'] as const,
  session: (id: string) => [...perspectiveKeys.sessions(), id] as const,
};

/**
 * 获取会话列表
 */
export function usePerspectiveSessions() {
  return useQuery({
    queryKey: perspectiveKeys.sessions(),
    queryFn: () => perspectiveService.getSessions(),
  });
}

/**
 * 获取会话详情
 */
export function usePerspectiveSession(id: string) {
  return useQuery({
    queryKey: perspectiveKeys.session(id),
    queryFn: () => perspectiveService.getSession(id),
    enabled: !!id,
  });
}

/**
 * 创建新会话
 */
export function useCreatePerspectiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePerspectiveSessionRequest) =>
      perspectiveService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: perspectiveKeys.sessions() });
    },
  });
}

/**
 * 生成多个视角
 */
export function useGeneratePerspectives() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GeneratePerspectivesRequest) =>
      perspectiveService.generatePerspectives(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: perspectiveKeys.session(variables.sessionId),
      });
    },
  });
}

/**
 * 与视角对话
 */
export function useChatWithPerspective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      perspectiveId,
      message,
    }: {
      sessionId: string;
      perspectiveId: string;
      message: string;
    }) => perspectiveService.chatWithPerspective(sessionId, perspectiveId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: perspectiveKeys.session(variables.sessionId),
      });
    },
  });
}

/**
 * 综合视角
 */
export function useSynthesizePerspectives() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SynthesizePerspectivesRequest) =>
      perspectiveService.synthesizePerspectives(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: perspectiveKeys.session(variables.sessionId),
      });
    },
  });
}
