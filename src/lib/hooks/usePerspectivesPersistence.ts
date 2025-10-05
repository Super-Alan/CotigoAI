import { useEffect, useState } from 'react';

interface Perspective {
  roleId: string;
  roleName: string;
  roleIcon: string;
  analysis: string;
  timestamp: string;
}

interface GenerateResponse {
  issue: string;
  perspectives: Perspective[];
  generatedAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  RESULT: 'perspectives_result',
  CHAT_MESSAGES: 'perspectives_chat_messages',
  ISSUE: 'perspectives_issue',
  SELECTED_ROLES: 'perspectives_selected_roles'
};

export function usePerspectivesPersistence() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const saveResult = (result: GenerateResponse | null) => {
    if (!isHydrated) return;
    try {
      if (result) {
        localStorage.setItem(STORAGE_KEYS.RESULT, JSON.stringify(result));
      } else {
        localStorage.removeItem(STORAGE_KEYS.RESULT);
      }
    } catch (error) {
      console.error('Failed to save result:', error);
    }
  };

  const loadResult = (): GenerateResponse | null => {
    if (!isHydrated) return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESULT);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load result:', error);
      return null;
    }
  };

  const saveChatMessages = (messages: Record<string, ChatMessage[]>) => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat messages:', error);
    }
  };

  const loadChatMessages = (): Record<string, ChatMessage[]> => {
    if (!isHydrated) return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      return {};
    }
  };

  const saveIssue = (issue: string) => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ISSUE, issue);
    } catch (error) {
      console.error('Failed to save issue:', error);
    }
  };

  const loadIssue = (): string => {
    if (!isHydrated) return '';
    try {
      return localStorage.getItem(STORAGE_KEYS.ISSUE) || '';
    } catch (error) {
      console.error('Failed to load issue:', error);
      return '';
    }
  };

  const saveSelectedRoles = (roles: string[]) => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_ROLES, JSON.stringify(roles));
    } catch (error) {
      console.error('Failed to save selected roles:', error);
    }
  };

  const loadSelectedRoles = (): string[] => {
    if (!isHydrated) return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_ROLES);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load selected roles:', error);
      return [];
    }
  };

  const clearAll = () => {
    if (!isHydrated) return;
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  return {
    isHydrated,
    saveResult,
    loadResult,
    saveChatMessages,
    loadChatMessages,
    saveIssue,
    loadIssue,
    saveSelectedRoles,
    loadSelectedRoles,
    clearAll
  };
}
