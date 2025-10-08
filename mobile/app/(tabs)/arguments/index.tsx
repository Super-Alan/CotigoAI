import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useArguments, useAnalyzeArgument } from '@/src/hooks/useArguments';
import { Button } from '@/src/components/Button';

export default function ArgumentsScreen() {
  const router = useRouter();
  const { data: analyses, isLoading, refetch } = useArguments();
  const { mutate: analyzeArgument, isPending: isAnalyzing } = useAnalyzeArgument();

  const [argumentText, setArgumentText] = useState('');

  const handleAnalyze = () => {
    if (!argumentText.trim()) {
      Alert.alert('提示', '请输入需要分析的论点内容');
      return;
    }

    analyzeArgument(
      { text: argumentText },
      {
        onSuccess: (analysis) => {
          setArgumentText('');
          router.push(`/(tabs)/arguments/${analysis.id}`);
        },
        onError: () => {
          Alert.alert('错误', '分析失败，请稍后重试');
        },
      }
    );
  };

  // 获取论证强度的颜色和标签
  const getStrengthInfo = (score: number) => {
    if (score >= 8) return { color: 'bg-green-100 text-green-700', label: '强' };
    if (score >= 5) return { color: 'bg-blue-100 text-blue-700', label: '中' };
    return { color: 'bg-orange-100 text-orange-700', label: '弱' };
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-2xl font-bold text-gray-900">论点解构</Text>
        <Text className="text-sm text-gray-600 mt-1">
          分析论证结构和逻辑谬误
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* 分析输入区 */}
        <View className="bg-white m-4 rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold mb-3">分析新论点</Text>

          <TextInput
            multiline
            numberOfLines={8}
            value={argumentText}
            onChangeText={setArgumentText}
            placeholder="粘贴或输入需要分析的论点、文章或辩论内容..."
            className="bg-gray-50 rounded-xl p-4 text-base mb-3"
            style={{ minHeight: 160, textAlignVertical: 'top' }}
          />

          <Button
            title={isAnalyzing ? '分析中...' : '开始分析'}
            onPress={handleAnalyze}
            loading={isAnalyzing}
          />
        </View>

        {/* 历史分析列表 */}
        <View className="px-4 pb-4">
          <Text className="text-lg font-semibold mb-3">历史分析</Text>

          {analyses && analyses.length > 0 ? (
            analyses.map((analysis) => {
              const strengthInfo = getStrengthInfo(analysis.overallStrength);
              return (
                <TouchableOpacity
                  key={analysis.id}
                  onPress={() => router.push(`/(tabs)/arguments/${analysis.id}`)}
                  className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                >
                  {/* 主张 */}
                  <Text className="font-semibold text-gray-900 mb-2" numberOfLines={2}>
                    {analysis.mainClaim}
                  </Text>

                  {/* 统计信息 */}
                  <View className="flex-row items-center gap-4 mb-2">
                    <View className="flex-row items-center">
                      <Text className="text-gray-600 text-sm">
                        📝 {analysis.premises?.length || 0} 个前提
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-600 text-sm">
                        🔍 {analysis.evidence?.length || 0} 个证据
                      </Text>
                    </View>
                    {analysis.fallacies && analysis.fallacies.length > 0 && (
                      <View className="flex-row items-center">
                        <Text className="text-red-600 text-sm">
                          ⚠️ {analysis.fallacies.length} 个谬误
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* 强度标签和时间 */}
                  <View className="flex-row items-center justify-between">
                    <View className={`px-3 py-1 rounded-full ${strengthInfo.color.split(' ')[0]}`}>
                      <Text className={`text-xs font-semibold ${strengthInfo.color.split(' ')[1]}`}>
                        论证强度: {strengthInfo.label}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400">
                      {new Date(analysis.createdAt).toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="bg-white rounded-xl p-8 items-center">
              <Text className="text-4xl mb-2">🔍</Text>
              <Text className="text-gray-500">还没有分析记录</Text>
              <Text className="text-gray-400 text-sm mt-1">
                输入论点内容开始你的批判性分析
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
