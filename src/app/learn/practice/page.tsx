'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Clock, 
  Target, 
  Trophy, 
  Play, 
  Settings,
  ChevronRight,
  Zap,
  BarChart3
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ThinkingType {
  id: string;
  name: string;
  description: string;
  icon: string;
  userProgress?: {
    level: number;
    experience: number;
    accuracy: number;
    nextLevelExp: number;
  };
}

interface PracticeSession {
  id: string;
  type: 'practice' | 'critical_thinking';
  sessionType?: string;
  thinkingTypeId?: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    explanation: string;
    difficulty: string;
  }>;
}

const SmartPracticePage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [thinkingTypes, setThinkingTypes] = useState<ThinkingType[]>([]);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'adaptive' | 'targeted' | 'challenge'>('adaptive');
  const [selectedThinkingType, setSelectedThinkingType] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // 获取思维维度数据
  useEffect(() => {
    fetchThinkingTypes();
  }, []);

  const fetchThinkingTypes = async () => {
    try {
      const response = await fetch('/api/thinking-dimensions');
      const data = await response.json();
      setThinkingTypes(data.dimensions || []);
    } catch (error) {
      console.error('获取思维维度失败:', error);
    }
  };

  // 开始练习
  const startPractice = async (mode: 'adaptive' | 'targeted' | 'challenge', thinkingTypeId?: string) => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    try {
      const requestBody: any = {
        difficulty,
        questionsCount: mode === 'challenge' ? 10 : 5
      };

      if (mode === 'targeted' && thinkingTypeId) {
        requestBody.thinkingTypeId = thinkingTypeId;
      } else if (mode === 'adaptive') {
        requestBody.sessionType = 'adaptive_practice';
      } else if (mode === 'challenge') {
        requestBody.sessionType = 'challenge_mode';
      }

      const response = await fetch('/api/practice-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.success) {
        setCurrentSession(data.session);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
      }
    } catch (error) {
      console.error('开始练习失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 选择答案
  const selectAnswer = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // 下一题
  const nextQuestion = () => {
    if (currentSession && currentQuestionIndex < currentSession.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // 上一题
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // 提交练习
  const submitPractice = async () => {
    if (!currentSession) return;

    setIsLoading(true);
    try {
      const answers = currentSession.questions.map(q => ({
        questionId: q.id,
        selectedOption: selectedAnswers[q.id] ?? -1
      }));

      const response = await fetch(`/api/practice-sessions/${currentSession.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          duration: 0 // 可以添加计时功能
        })
      });

      const data = await response.json();
      if (data.success) {
        // 跳转到结果页面
        router.push(`/learn/practice/results/${currentSession.id}`);
      }
    } catch (error) {
      console.error('提交练习失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取思维类型图标
  const getThinkingTypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'brain': return <Brain className="w-6 h-6" />;
      case 'target': return <Target className="w-6 h-6" />;
      case 'zap': return <Zap className="w-6 h-6" />;
      default: return <Brain className="w-6 h-6" />;
    }
  };

  // 如果正在练习中，显示练习界面
  if (currentSession) {
    const currentQuestion = currentSession.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentSession.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* 练习进度 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">智能练习</h1>
              <Badge variant="outline" className="text-sm">
                {currentQuestionIndex + 1} / {currentSession.questions.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* 题目卡片 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">题目 {currentQuestionIndex + 1}</CardTitle>
                <Badge variant="secondary">
                  {currentQuestion.difficulty === 'easy' ? '简单' : 
                   currentQuestion.difficulty === 'medium' ? '中等' : '困难'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 mb-6 leading-relaxed">
                {currentQuestion.question}
              </p>

              {/* 选项 */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(currentQuestion.id, index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswers[currentQuestion.id] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 导航按钮 */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              上一题
            </Button>

            <div className="flex gap-3">
              {currentQuestionIndex < currentSession.questions.length - 1 ? (
                <Button
                  onClick={nextQuestion}
                  disabled={selectedAnswers[currentQuestion.id] === undefined}
                >
                  下一题
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={submitPractice}
                  disabled={selectedAnswers[currentQuestion.id] === undefined || isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? '提交中...' : '完成练习'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 练习模式选择界面
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">智能练习系统</h1>
          <p className="text-xl text-gray-600">AI驱动的个性化学习体验</p>
        </div>

        {/* 练习模式选择 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* 自适应练习 */}
          <Card className={`cursor-pointer transition-all ${practiceMode === 'adaptive' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setPracticeMode('adaptive')}>
            <CardHeader>
              <div className="flex items-center">
                <Brain className="w-8 h-8 text-blue-600 mr-3" />
                <CardTitle>自适应练习</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                AI根据你的能力水平动态调整题目难度，提供最适合的练习内容。
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>约15-20分钟</span>
              </div>
            </CardContent>
          </Card>

          {/* 针对性练习 */}
          <Card className={`cursor-pointer transition-all ${practiceMode === 'targeted' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setPracticeMode('targeted')}>
            <CardHeader>
              <div className="flex items-center">
                <Target className="w-8 h-8 text-green-600 mr-3" />
                <CardTitle>针对性练习</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                专注于特定的思维维度，深入练习和提升某个方面的能力。
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>约10-15分钟</span>
              </div>
            </CardContent>
          </Card>

          {/* 挑战模式 */}
          <Card className={`cursor-pointer transition-all ${practiceMode === 'challenge' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setPracticeMode('challenge')}>
            <CardHeader>
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-yellow-600 mr-3" />
                <CardTitle>挑战模式</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                高难度综合题目，测试你的批判性思维综合运用能力。
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>约25-30分钟</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 练习设置 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              练习设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* 难度选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  难度等级
                </label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={difficulty === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDifficulty(level)}
                    >
                      {level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 思维维度选择（针对性练习） */}
              {practiceMode === 'targeted' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择思维维度
                  </label>
                  <select
                    value={selectedThinkingType}
                    onChange={(e) => setSelectedThinkingType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">请选择思维维度</option>
                    {thinkingTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 思维维度进度（针对性练习时显示） */}
        {practiceMode === 'targeted' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {thinkingTypes.map((type) => (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all ${
                  selectedThinkingType === type.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedThinkingType(type.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    {getThinkingTypeIcon(type.icon)}
                    <h3 className="font-medium ml-2">{type.name}</h3>
                  </div>
                  
                  {type.userProgress ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>等级 {type.userProgress.level}</span>
                        <span>{type.userProgress.accuracy}% 准确率</span>
                      </div>
                      <Progress 
                        value={(type.userProgress.experience % 100)} 
                        className="h-2" 
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <Badge variant="outline">未开始</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 开始练习按钮 */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => {
              if (practiceMode === 'targeted' && !selectedThinkingType) {
                alert('请选择一个思维维度');
                return;
              }
              startPractice(practiceMode, selectedThinkingType);
            }}
            disabled={isLoading}
            className="px-8 py-3 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            {isLoading ? '准备中...' : '开始练习'}
          </Button>
        </div>

        {/* 练习统计 */}
        {session?.user && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                最近练习记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                查看详细的学习进度和统计数据，请访问 
                <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push('/learn/progress')}>
                  进度仪表板
                </Button>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmartPracticePage;