'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * 语音输入组件错误边界
 * 捕获并处理语音输入相关的错误
 */
export class VoiceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('语音输入组件错误:', error, errorInfo);
    
    // 调用外部错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 显示错误提示
    toast.error('语音输入功能出现错误，请刷新页面重试');
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义降级 UI，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误 UI
      return (
        <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-700 mb-3">
              语音输入功能暂时不可用
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 语音输入错误处理 Hook
 */
export const useVoiceErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`语音输入错误 ${context ? `(${context})` : ''}:`, error);
    
    // 根据错误类型显示不同的提示
    if (error.name === 'NotAllowedError') {
      toast.error('请允许访问麦克风权限');
    } else if (error.name === 'NotFoundError') {
      toast.error('未找到可用的麦克风设备');
    } else if (error.name === 'NotSupportedError') {
      toast.error('浏览器不支持录音功能');
    } else if (error.name === 'AbortError') {
      // 用户取消操作，不显示错误
      return;
    } else if (error.message.includes('网络')) {
      toast.error('网络连接失败，请检查网络');
    } else {
      toast.error('语音输入出现错误，请重试');
    }
  };

  return { handleError };
};

export default VoiceErrorBoundary;