'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { voiceConfig } from '@/config/voice';
import { AudioVisualizerProps, AudioAnalysisData } from '@/types/voice';

/**
 * 音频可视化组件 - 实时显示录音波形
 */
export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording,
  audioStream,
  className = '',
  barCount = voiceConfig.visualizerBars,
  barColor = '#3b82f6',
  backgroundColor = 'transparent'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * 初始化音频分析器
   */
  const initializeAudioAnalyzer = useCallback(async () => {
    if (!audioStream || isInitialized) return;

    try {
      // 创建音频上下文
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      // 创建分析器节点
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      // 连接音频流
      const source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyser);
      
      // 创建数据数组
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error);
    }
  }, [audioStream, isInitialized]);

  /**
   * 清理音频分析器
   */
  const cleanupAudioAnalyzer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    audioContextRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
    setIsInitialized(false);
  }, []);

  /**
   * 获取音频分析数据
   */
  const getAudioAnalysisData = useCallback((): AudioAnalysisData | null => {
    if (!analyserRef.current || !dataArrayRef.current) return null;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    // 获取频域数据
    const frequencyData = new Uint8Array(dataArray.length);
    analyser.getByteFrequencyData(frequencyData);
    
    // 获取时域数据
    const timeData = new Uint8Array(dataArray.length);
    analyser.getByteTimeDomainData(timeData);
    
    // 计算音量和峰值
    let sum = 0;
    let peak = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i];
      peak = Math.max(peak, frequencyData[i]);
    }
    const volume = sum / frequencyData.length;
    
    return {
      frequencyData,
      timeData,
      volume,
      peak
    };
  }, []);

  /**
   * 绘制可视化效果
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // 清空画布
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    if (!isRecording) {
      // 不录音时显示静态条形
      const barWidth = width / barCount;
      const baseHeight = height * 0.1;
      
      ctx.fillStyle = `${barColor}40`; // 40% 透明度
      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth;
        const barHeight = baseHeight;
        const y = (height - barHeight) / 2;
        
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }
      return;
    }

    // 录音时显示动态波形
    const analysisData = getAudioAnalysisData();
    if (!analysisData) {
      // 如果没有分析数据，显示模拟动画
      const barWidth = width / barCount;
      const time = Date.now() * 0.005;
      
      ctx.fillStyle = barColor;
      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth;
        const normalizedHeight = (Math.sin(time + i * 0.5) + 1) * 0.3 + 0.1;
        const barHeight = height * normalizedHeight;
        const y = (height - barHeight) / 2;
        
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }
    } else {
      // 使用真实音频数据
      const { frequencyData } = analysisData;
      const barWidth = width / barCount;
      const dataStep = Math.floor(frequencyData.length / barCount);
      
      ctx.fillStyle = barColor;
      for (let i = 0; i < barCount; i++) {
        const dataIndex = i * dataStep;
        const amplitude = frequencyData[dataIndex] / 255;
        const barHeight = Math.max(height * amplitude * 0.8, height * 0.05);
        const x = i * barWidth;
        const y = (height - barHeight) / 2;
        
        // 添加渐变效果
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, barColor);
        gradient.addColorStop(1, `${barColor}80`);
        ctx.fillStyle = gradient;
        
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }
    }
  }, [isRecording, barCount, barColor, backgroundColor, getAudioAnalysisData]);

  /**
   * 动画循环
   */
  const animate = useCallback(() => {
    draw();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [draw]);

  /**
   * 开始动画
   */
  const startAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animate();
  }, [animate]);

  /**
   * 停止动画
   */
  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, []);

  // 初始化和清理
  useEffect(() => {
    if (isRecording && audioStream) {
      initializeAudioAnalyzer();
    } else if (!isRecording) {
      cleanupAudioAnalyzer();
    }
  }, [isRecording, audioStream, initializeAudioAnalyzer, cleanupAudioAnalyzer]);

  // 动画控制
  useEffect(() => {
    startAnimation();
    return stopAnimation;
  }, [startAnimation, stopAnimation]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopAnimation();
      cleanupAudioAnalyzer();
    };
  }, [stopAnimation, cleanupAudioAnalyzer]);

  // 处理画布大小变化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    });

    resizeObserver.observe(canvas);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
    />
  );
};

/**
 * 简化版音频可视化组件 - 用于小尺寸显示
 */
export const MiniAudioVisualizer: React.FC<{
  isRecording: boolean;
  className?: string;
}> = ({ isRecording, className = '' }) => {
  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-current rounded-full transition-all duration-150 ${
            isRecording 
              ? 'animate-pulse h-4' 
              : 'h-2 opacity-50'
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

/**
 * 圆形音频可视化组件
 */
export const CircularAudioVisualizer: React.FC<{
  isRecording: boolean;
  size?: number;
  className?: string;
}> = ({ isRecording, size = 40, className = '' }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 外圈动画 */}
      <div 
        className={`absolute inset-0 rounded-full border-2 border-current transition-all duration-300 ${
          isRecording 
            ? 'animate-ping opacity-75' 
            : 'opacity-30'
        }`}
      />
      
      {/* 内圈 */}
      <div 
        className={`rounded-full bg-current transition-all duration-200 ${
          isRecording 
            ? 'scale-75 opacity-90' 
            : 'scale-50 opacity-60'
        }`}
        style={{ 
          width: size * 0.4, 
          height: size * 0.4 
        }}
      />
    </div>
  );
};

export default AudioVisualizer;