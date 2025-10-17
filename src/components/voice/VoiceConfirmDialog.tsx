'use client'

import { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  Edit3,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { VoiceConfirmDialogProps } from '@/types/voice';

/**
 * 语音确认对话框组件
 */
export const VoiceConfirmDialog: React.FC<VoiceConfirmDialogProps> = ({
  isOpen,
  transcribedText,
  audioBlob,
  confidence,
  onConfirm,
  onCancel,
  onRetry,
  onEdit
}) => {
  const [editedText, setEditedText] = useState(transcribedText);
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // 同步转录文本
  useEffect(() => {
    setEditedText(transcribedText);
    setIsEditing(false);
  }, [transcribedText]);

  // 创建音频URL
  useEffect(() => {
    if (audioBlob) {
      // 清理之前的URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      // 创建新的URL
      audioUrlRef.current = URL.createObjectURL(audioBlob);
      
      // 创建音频元素
      if (audioRef.current) {
        audioRef.current.src = audioUrlRef.current;
      }
    }

    // 清理函数
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, [audioBlob]);

  // 清理音频播放状态
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  /**
   * 播放/暂停音频
   */
  const toggleAudioPlayback = async () => {
    if (!audioRef.current || !audioUrlRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  /**
   * 处理音频播放结束
   */
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  /**
   * 开始编辑文本
   */
  const startEditing = () => {
    setIsEditing(true);
    onEdit?.(editedText);
  };

  /**
   * 保存编辑
   */
  const saveEdit = () => {
    setIsEditing(false);
    onEdit?.(editedText);
  };

  /**
   * 取消编辑
   */
  const cancelEdit = () => {
    setEditedText(transcribedText);
    setIsEditing(false);
  };

  /**
   * 确认文本
   */
  const handleConfirm = () => {
    onConfirm(editedText);
  };

  /**
   * 获取置信度颜色
   */
  const getConfidenceColor = (conf?: number) => {
    if (!conf) return 'bg-gray-100 text-gray-600';
    if (conf >= 0.8) return 'bg-green-100 text-green-700';
    if (conf >= 0.6) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  /**
   * 获取置信度文本
   */
  const getConfidenceText = (conf?: number) => {
    if (!conf) return '未知';
    if (conf >= 0.8) return '高';
    if (conf >= 0.6) return '中';
    return '低';
  };

  return (
    <>
      {/* 隐藏的音频元素 */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={() => setIsPlaying(false)}
        preload="metadata"
      />

      <Dialog open={isOpen} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-blue-600" />
              语音识别结果
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 置信度显示 */}
            {confidence !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">识别准确度:</span>
                <Badge className={getConfidenceColor(confidence)}>
                  {getConfidenceText(confidence)} ({Math.round((confidence || 0) * 100)}%)
                </Badge>
              </div>
            )}

            {/* 音频播放控制 */}
            {audioBlob && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAudioPlayback}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      暂停
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      播放录音
                    </>
                  )}
                </Button>
                <span className="text-sm text-gray-500">
                  点击播放以验证录音内容
                </span>
              </div>
            )}

            {/* 文本显示/编辑区域 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  识别文本:
                </label>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEditing}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Edit3 className="h-3 w-3" />
                    编辑
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    placeholder="请输入或修改识别的文本..."
                    className="min-h-[100px] resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveEdit}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      保存
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border min-h-[100px]">
                  {editedText ? (
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {editedText}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      未识别到文本内容
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 低置信度警告 */}
            {confidence !== undefined && confidence < 0.6 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">识别准确度较低</p>
                  <p className="text-yellow-700">
                    建议检查识别结果或重新录音以获得更准确的文本。
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              重新录音
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
            >
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!editedText.trim()}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              确认发送
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceConfirmDialog;