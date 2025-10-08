import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useArguments } from '@/src/hooks/useArguments';
import { argumentService } from '@/src/services/argument.service';
import type { ArgumentAnalysis, StreamEvent } from '@/src/types/argument';

type InputType = 'text' | 'url';

export default function ArgumentsScreen() {
  const router = useRouter();
  const { data: analyses, isLoading: loadingList, refetch } = useArguments();

  // 输入状态
  const [inputType, setInputType] = useState<InputType>('text');
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');

  // 分析状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ArgumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 流式状态
  const [progressMessage, setProgressMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [streamingContent, setStreamingContent] = useState('');
  const [revealedDimensions, setRevealedDimensions] = useState<string[]>([]);

  const handleAnalyze = async () => {
    const content = inputType === 'text' ? inputText.trim() : inputUrl.trim();

    if (!content) {
      Alert.alert('提示', inputType === 'text' ? '请输入文本内容' : '请输入网页URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setRevealedDimensions([]);
    setProgressMessage('');
    setProgressPercent(0);
    setStreamingContent('');

    try {
      const result = await argumentService.analyzeArgumentStream(
        { type: inputType, content },
        (event: StreamEvent) => {
          switch (event.type) {
            case 'init':
            case 'progress':
              setProgressMessage(event.message || '');
              if (event.progress !== undefined) {
                setProgressPercent(event.progress);
              }
              break;

            case 'stream':
              setStreamingContent(prev => prev + (event.content || ''));
              if (event.progress !== undefined) {
                setProgressPercent(event.progress);
              }
              break;

            case 'dimension':
              if (event.dimension) {
                setRevealedDimensions(prev => [...prev, event.dimension!]);
                setProgressMessage(`${event.icon || '✓'} ${event.name || ''}已完成`);
                if (event.progress !== undefined) {
                  setProgressPercent(event.progress);
                }
              }
              break;

            case 'complete':
              setProgressMessage('✅ 分析完成！');
              setProgressPercent(100);
              if (event.analysis) {
                setAnalysis(event.analysis);

                // 保存到数据库并获取 ID
                (async () => {
                  try {
                    const savedId = await argumentService.saveAnalysis(content, event.analysis!);

                    // 清空输入
                    if (inputType === 'text') {
                      setInputText('');
                    } else {
                      setInputUrl('');
                    }

                    // 刷新列表
                    refetch();

                    // 跳转到详情页
                    setTimeout(() => {
                      router.push(`/(tabs)/arguments/${savedId}`);
                    }, 300);
                  } catch (saveError) {
                    console.error('保存分析结果失败:', saveError);
                    Alert.alert('提示', '分析完成，但保存失败。请稍后在历史记录中查看。');
                  }
                })();
              }
              break;

            case 'error':
              throw new Error(event.error || '分析失败');
          }
        }
      );
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : '分析失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F9FF' }}>
      {/* Header - Tech Blue Style */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 20,
          background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.05) 0%, transparent 100%)',
        }}
      >
        <Text
          style={{
            fontSize: 40,
            fontWeight: '700',
            color: '#0C4A6E',
            letterSpacing: -0.8,
            fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display',
          }}
        >
          论点解构
        </Text>
        <Text
          style={{
            fontSize: 17,
            color: '#0284C7',
            fontWeight: '500',
            marginTop: 2,
            letterSpacing: -0.408,
            fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
          }}
        >
          深度分析论证结构和逻辑谬误
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loadingList} onRefresh={refetch} colors={['#0EA5E9']} />
        }
      >
        {/* 输入区域 - Tech Blue 卡片 */}
        <View
          className="mx-5 mb-5"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 24,
            padding: 20,
            shadowColor: '#0EA5E9',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 6,
            borderWidth: 1,
            borderColor: 'rgba(14, 165, 233, 0.15)',
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              marginBottom: 16,
              color: '#0C4A6E',
              letterSpacing: -0.45,
            }}
          >
            输入待分析内容
          </Text>

          {/* 输入类型选择器 */}
          <View
            className="flex-row mb-4 p-1"
            style={{
              backgroundColor: 'rgba(224, 242, 254, 0.5)',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(14, 165, 233, 0.1)',
            }}
          >
            <TouchableOpacity
              onPress={() => setInputType('text')}
              className="flex-1 py-2.5"
              style={{
                backgroundColor: inputType === 'text' ? '#FFFFFF' : 'transparent',
                borderRadius: 10,
                shadowColor: inputType === 'text' ? '#0EA5E9' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: inputType === 'text' ? 2 : 0,
              }}
            >
              <Text
                className="text-center"
                style={{
                  color: inputType === 'text' ? '#0EA5E9' : '#64748B',
                  fontSize: 13,
                  fontWeight: '600',
                  letterSpacing: -0.24,
                }}
              >
                📝 文本输入
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setInputType('url')}
              className="flex-1 py-2.5"
              style={{
                backgroundColor: inputType === 'url' ? '#FFFFFF' : 'transparent',
                borderRadius: 10,
                shadowColor: inputType === 'url' ? '#0EA5E9' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: inputType === 'url' ? 2 : 0,
              }}
            >
              <Text
                className="text-center"
                style={{
                  color: inputType === 'url' ? '#0EA5E9' : '#64748B',
                  fontSize: 13,
                  fontWeight: '600',
                  letterSpacing: -0.24,
                }}
              >
                🌐 网页链接
              </Text>
            </TouchableOpacity>
          </View>

          {/* 输入区域 */}
          {inputType === 'text' ? (
            <TextInput
              multiline
              numberOfLines={8}
              value={inputText}
              onChangeText={setInputText}
              placeholder="例如: 人工智能最终会取代所有人类工作。因为AI可以24小时不间断工作,不需要休息,效率远高于人类..."
              placeholderTextColor="#94A3B8"
              style={{
                minHeight: 160,
                paddingHorizontal: 16,
                paddingVertical: 12,
                textAlignVertical: 'top',
                borderRadius: 16,
                backgroundColor: '#FFFFFF',
                fontSize: 15,
                fontWeight: '400',
                color: '#0C4A6E',
                lineHeight: 20,
                letterSpacing: -0.24,
                borderWidth: 1,
                borderColor: 'rgba(14, 165, 233, 0.15)',
                marginBottom: 16,
              }}
            />
          ) : (
            <View>
              <TextInput
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="例如: https://mp.weixin.qq.com/s/..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                keyboardType="url"
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 16,
                  backgroundColor: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: '400',
                  color: '#0C4A6E',
                  lineHeight: 20,
                  letterSpacing: -0.24,
                  borderWidth: 1,
                  borderColor: 'rgba(14, 165, 233, 0.15)',
                  marginBottom: 12,
                }}
              />
              <View
                style={{
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                  borderLeftWidth: 3,
                  borderLeftColor: '#0EA5E9',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: '#0284C7',
                    lineHeight: 18,
                  }}
                >
                  💡 支持的网站: 微信公众号文章、知乎专栏、博客文章等各类网页内容
                </Text>
              </View>
            </View>
          )}

          {/* 错误提示 */}
          {error && (
            <View
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
                borderLeftWidth: 3,
                borderLeftColor: '#EF4444',
              }}
            >
              <Text style={{ fontSize: 13, color: '#DC2626' }}>❌ {error}</Text>
            </View>
          )}

          {/* 分析按钮 */}
          <TouchableOpacity
            onPress={handleAnalyze}
            disabled={isAnalyzing || (!inputText.trim() && !inputUrl.trim())}
            activeOpacity={0.8}
            style={{
              backgroundColor:
                isAnalyzing || (!inputText.trim() && !inputUrl.trim()) ? '#CBD5E1' : '#0EA5E9',
              paddingVertical: 14,
              borderRadius: 16,
              shadowColor: isAnalyzing || (!inputText.trim() && !inputUrl.trim()) ? 'transparent' : '#0EA5E9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
                letterSpacing: -0.24,
              }}
            >
              {isAnalyzing ? '分析中...' : '🔍 开始深度解构'}
            </Text>
          </TouchableOpacity>

          {/* 进度指示器 */}
          {isAnalyzing && (
            <View style={{ marginTop: 16 }}>
              {/* 进度条 */}
              <View
                style={{
                  height: 8,
                  backgroundColor: 'rgba(224, 242, 254, 0.5)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: '#0EA5E9',
                    borderRadius: 4,
                  }}
                />
              </View>

              {/* 进度消息 */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#0EA5E9" />
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#0284C7',
                      fontWeight: '500',
                    }}
                  >
                    {progressMessage || '准备中...'}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    color: '#64748B',
                    fontWeight: '600',
                  }}
                >
                  {progressPercent}%
                </Text>
              </View>

              {/* 流式内容显示 */}
              {streamingContent && (
                <View
                  style={{
                    marginTop: 12,
                    padding: 12,
                    backgroundColor: 'rgba(240, 249, 255, 0.5)',
                    borderRadius: 12,
                    maxHeight: 200,
                    borderWidth: 1,
                    borderColor: 'rgba(14, 165, 233, 0.2)',
                  }}
                >
                  <View className="flex-row items-center gap-2 mb-2">
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: '#0EA5E9',
                        borderRadius: 4,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: '#0284C7',
                      }}
                    >
                      AI 实时分析输出
                    </Text>
                  </View>
                  <ScrollView style={{ maxHeight: 150 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#0C4A6E',
                        lineHeight: 18,
                        fontFamily: 'monospace',
                      }}
                    >
                      {streamingContent}
                    </Text>
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>

        {/* 历史分析列表 */}
        <View className="px-5 pb-5">
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              marginBottom: 16,
              color: '#0C4A6E',
              letterSpacing: -0.45,
            }}
          >
            历史分析
          </Text>

          {analyses && analyses.length > 0 ? (
            analyses.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/(tabs)/arguments/${item.id}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 16,
                  shadowColor: '#0EA5E9',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.06,
                  shadowRadius: 16,
                  elevation: 3,
                  borderWidth: 0.5,
                  borderColor: 'rgba(14, 165, 233, 0.1)',
                }}
              >
                {/* 主张 */}
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '600',
                    color: '#0C4A6E',
                    marginBottom: 12,
                    lineHeight: 22,
                    letterSpacing: -0.408,
                  }}
                  numberOfLines={2}
                >
                  {item.mainClaim}
                </Text>

                {/* 统计信息 */}
                <View className="flex-row items-center gap-3 mb-3">
                  <Text style={{ fontSize: 13, color: '#64748B' }}>
                    📋 {item.premises?.length || 0} 个前提
                  </Text>
                  <Text style={{ fontSize: 13, color: '#64748B' }}>
                    📊 {item.evidence?.length || 0} 个证据
                  </Text>
                  {item.potentialFallacies && item.potentialFallacies.length > 0 && (
                    <Text style={{ fontSize: 13, color: '#EF4444' }}>
                      ⚠️ {item.potentialFallacies.length} 个谬误
                    </Text>
                  )}
                </View>

                {/* 时间 */}
                <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                  {new Date(item.createdAt).toLocaleString('zh-CN')}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: 'rgba(14, 165, 233, 0.3)',
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: 8 }}>🔍</Text>
              <Text style={{ fontSize: 15, color: '#64748B', marginBottom: 4 }}>
                还没有分析记录
              </Text>
              <Text style={{ fontSize: 13, color: '#94A3B8' }}>
                输入论点内容开始你的批判性分析
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
