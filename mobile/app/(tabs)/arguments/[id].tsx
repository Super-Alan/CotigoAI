import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useArgument } from '@/src/hooks/useArguments';

export default function ArgumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: analysis, isLoading } = useArgument(id);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!analysis) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">分析不存在</Text>
      </SafeAreaView>
    );
  }

  // 获取证据强度信息
  const getEvidenceStrengthInfo = (strength: string) => {
    switch (strength) {
      case 'strong':
        return { color: 'bg-green-100 text-green-700', label: '强' };
      case 'moderate':
        return { color: 'bg-blue-100 text-blue-700', label: '中' };
      case 'weak':
        return { color: 'bg-orange-100 text-orange-700', label: '弱' };
      default:
        return { color: 'bg-gray-100 text-gray-700', label: '未知' };
    }
  };

  // 获取谬误严重程度信息
  const getSeverityInfo = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { color: 'bg-red-100 text-red-700', label: '严重' };
      case 'major':
        return { color: 'bg-orange-100 text-orange-700', label: '较重' };
      case 'minor':
        return { color: 'bg-yellow-100 text-yellow-700', label: '轻微' };
      default:
        return { color: 'bg-gray-100 text-gray-700', label: '未知' };
    }
  };

  // 获取整体强度信息
  const getOverallStrengthInfo = (score: number) => {
    if (score >= 8) return { color: 'bg-green-500', label: '强', textColor: 'text-green-700' };
    if (score >= 5) return { color: 'bg-blue-500', label: '中', textColor: 'text-blue-700' };
    return { color: 'bg-orange-500', label: '弱', textColor: 'text-orange-700' };
  };

  const overallStrengthInfo = getOverallStrengthInfo(analysis.overallStrength);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-blue-600 text-2xl">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900">论点分析详情</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {/* 主张 */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-semibold text-gray-500 mb-2">主要主张</Text>
          <Text className="text-base text-gray-900">{analysis.mainClaim}</Text>
        </View>

        {/* 整体强度评分 */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-semibold text-gray-500 mb-3">论证强度</Text>
          <View className="flex-row items-center">
            <View className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <View
                className={`h-full ${overallStrengthInfo.color}`}
                style={{ width: `${analysis.overallStrength * 10}%` }}
              />
            </View>
            <Text className={`ml-3 text-lg font-bold ${overallStrengthInfo.textColor}`}>
              {analysis.overallStrength}/10
            </Text>
          </View>
          <Text className={`text-center mt-2 font-semibold ${overallStrengthInfo.textColor}`}>
            {overallStrengthInfo.label}
          </Text>
        </View>

        {/* 前提 */}
        {analysis.premises && analysis.premises.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-sm font-semibold text-gray-500 mb-3">前提条件</Text>
            {analysis.premises.map((premise, index) => (
              <View key={premise.id} className="mb-3 last:mb-0">
                <View className="flex-row items-start">
                  <View
                    className={`px-2 py-1 rounded mr-2 ${
                      premise.type === 'explicit' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        premise.type === 'explicit' ? 'text-blue-700' : 'text-purple-700'
                      }`}
                    >
                      {premise.type === 'explicit' ? '显性' : '隐性'}
                    </Text>
                  </View>
                  <Text className="flex-1 text-gray-900">{premise.statement}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 证据 */}
        {analysis.evidence && analysis.evidence.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-sm font-semibold text-gray-500 mb-3">支持证据</Text>
            {analysis.evidence.map((evidence, index) => {
              const strengthInfo = getEvidenceStrengthInfo(evidence.strength);
              return (
                <View key={evidence.id} className="mb-4 last:mb-0">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs text-gray-500">证据 {index + 1}</Text>
                    <View className={`px-2 py-1 rounded ${strengthInfo.color.split(' ')[0]}`}>
                      <Text className={`text-xs font-semibold ${strengthInfo.color.split(' ')[1]}`}>
                        {strengthInfo.label}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-900 mb-1">{evidence.description}</Text>
                  <Text className="text-sm text-gray-600">{evidence.source}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* 逻辑谬误 */}
        {analysis.fallacies && analysis.fallacies.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-sm font-semibold text-gray-500 mb-3">逻辑谬误</Text>
            {analysis.fallacies.map((fallacy, index) => {
              const severityInfo = getSeverityInfo(fallacy.severity);
              return (
                <View key={fallacy.id} className="mb-4 last:mb-0 border-l-4 border-red-500 pl-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-semibold text-gray-900">{fallacy.type}</Text>
                    <View className={`px-2 py-1 rounded ${severityInfo.color.split(' ')[0]}`}>
                      <Text className={`text-xs font-semibold ${severityInfo.color.split(' ')[1]}`}>
                        {severityInfo.label}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-900 mb-1">{fallacy.description}</Text>
                  <Text className="text-sm text-gray-600">{fallacy.explanation}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* 反驳论点 */}
        {analysis.counterArguments && analysis.counterArguments.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-sm font-semibold text-gray-500 mb-3">可能的反驳论点</Text>
            {analysis.counterArguments.map((counter, index) => (
              <View key={counter.id} className="mb-4 last:mb-0">
                <Text className="text-xs text-gray-500 mb-1">反驳 {index + 1}</Text>
                <Text className="text-gray-900 mb-1 font-medium">{counter.argument}</Text>
                <Text className="text-sm text-gray-600">{counter.reasoning}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 分析时间 */}
        <View className="items-center mt-2">
          <Text className="text-xs text-gray-400">
            分析时间: {new Date(analysis.createdAt).toLocaleString('zh-CN')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
