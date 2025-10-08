import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useArgument } from '@/src/hooks/useArguments';
import { MarkdownRenderer } from '@/src/components/MarkdownRenderer';

export default function ArgumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: analysis, isLoading } = useArgument(id);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={styles.background}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!analysis) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={styles.background}>
        <Text style={styles.errorText}>分析不存在</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={styles.background}>
      {/* Header - Tech Blue 导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={styles.headerTitle}>论点分析详情</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {/* Input Text Section - Tech Blue 卡片 */}
        <View style={styles.card} className="mb-6">
          <View className="flex-row items-center mb-3">
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>输入文本</Text>
          </View>
          <Text style={styles.inputText}>{analysis.inputText}</Text>
          <Text style={styles.timestamp}>
            分析时间：{new Date(analysis.createdAt).toLocaleString('zh-CN')}
          </Text>
        </View>

        {/* Main Claim - 核心论点 */}
        <View style={styles.card} className="mb-6">
          <View className="flex-row items-center mb-3">
            <Text style={styles.sectionIcon}>🎯</Text>
            <Text style={styles.sectionTitle}>核心论点</Text>
          </View>
          <View style={[styles.dimensionCard, styles.mainClaimCard]}>
            <MarkdownRenderer content={analysis.mainClaim || '无法识别核心论点'} />
          </View>
        </View>

        {/* Premises - 支撑前提 */}
        {analysis.premises && analysis.premises.length > 0 && (
          <View style={styles.card} className="mb-6">
            <View className="flex-row items-center mb-3">
              <Text style={styles.sectionIcon}>📋</Text>
              <Text style={styles.sectionTitle}>支撑前提</Text>
            </View>
            <View className="space-y-3">
              {analysis.premises.map((premise, idx) => (
                <View key={idx} style={styles.listItemCard} className="mb-3">
                  <View className="flex-row">
                    <Text style={styles.listNumber}>{idx + 1}.</Text>
                    <View className="flex-1">
                      <MarkdownRenderer content={premise} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Evidence - 证据支撑 */}
        {analysis.evidence && analysis.evidence.length > 0 && (
          <View style={styles.card} className="mb-6">
            <View className="flex-row items-center mb-3">
              <Text style={styles.sectionIcon}>📊</Text>
              <Text style={styles.sectionTitle}>证据支撑</Text>
            </View>
            <View className="space-y-3">
              {analysis.evidence.map((ev, idx) => (
                <View key={idx} style={[styles.dimensionCard, styles.evidenceCard]} className="mb-3">
                  <View className="flex-row">
                    <Text style={styles.evidenceNumber}>{idx + 1}.</Text>
                    <View className="flex-1">
                      <MarkdownRenderer content={ev} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Assumptions - 隐含假设 */}
        {analysis.assumptions && analysis.assumptions.length > 0 && (
          <View style={styles.card} className="mb-6">
            <View className="flex-row items-center mb-3">
              <Text style={styles.sectionIcon}>🔍</Text>
              <Text style={styles.sectionTitle}>隐含假设</Text>
            </View>
            <View className="space-y-3">
              {analysis.assumptions.map((assumption, idx) => (
                <View key={idx} style={[styles.dimensionCard, styles.assumptionCard]} className="mb-3">
                  <View className="flex-row">
                    <Text style={styles.assumptionNumber}>{idx + 1}.</Text>
                    <View className="flex-1">
                      <MarkdownRenderer content={assumption} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Logical Structure - 逻辑结构 */}
        {analysis.logicalStructure && (
          <View style={styles.card} className="mb-6">
            <View className="flex-row items-center mb-3">
              <Text style={styles.sectionIcon}>🧩</Text>
              <Text style={styles.sectionTitle}>逻辑结构</Text>
            </View>
            <View style={[styles.dimensionCard, styles.logicalCard]}>
              <MarkdownRenderer content={analysis.logicalStructure} />
            </View>
          </View>
        )}

        {/* Potential Fallacies - 潜在谬误 */}
        {analysis.potentialFallacies && analysis.potentialFallacies.length > 0 && (
          <View style={styles.card} className="mb-6">
            <View className="flex-row items-center mb-3">
              <Text style={styles.sectionIcon}>⚠️</Text>
              <Text style={styles.sectionTitle}>潜在谬误</Text>
            </View>
            <View className="space-y-3">
              {analysis.potentialFallacies.map((fallacy, idx) => (
                <View key={idx} style={[styles.dimensionCard, styles.fallacyCard]} className="mb-3">
                  <View className="flex-row">
                    <Text style={styles.fallacyNumber}>{idx + 1}.</Text>
                    <View className="flex-1">
                      <MarkdownRenderer content={fallacy} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Strength Assessment - 综合评估 */}
        {analysis.strengthAssessment && (
          <View style={styles.card} className="mb-6">
            <View className="flex-row items-center mb-3">
              <Text style={styles.sectionIcon}>✨</Text>
              <Text style={styles.sectionTitle}>综合评估</Text>
            </View>
            <View style={[styles.dimensionCard, styles.assessmentCard]}>
              <MarkdownRenderer content={analysis.strengthAssessment} />
            </View>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.push('/arguments')}
          style={styles.backToListButton}
          className="mt-4 mb-8"
        >
          <Text style={styles.backToListText}>返回解构页面</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#F0F9FF', // Light blue background - tech blue theme
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    fontSize: 24,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0C4A6E',
    letterSpacing: -0.408,
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  errorText: {
    fontSize: 15,
    color: '#64748B',
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.1)',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C4A6E',
    letterSpacing: -0.408,
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  inputText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
    marginBottom: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  dimensionCard: {
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  mainClaimCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)', // Blue gradient
    borderLeftColor: '#3B82F6',
  },
  listItemCard: {
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    padding: 12,
    borderRadius: 10,
  },
  listNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B5CF6',
    marginRight: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  evidenceCard: {
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    borderLeftColor: '#0EA5E9',
  },
  evidenceNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0EA5E9',
    marginRight: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  assumptionCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderLeftColor: '#F59E0B',
  },
  assumptionNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F59E0B',
    marginRight: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  logicalCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderLeftColor: '#6366F1',
  },
  fallacyCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderLeftColor: '#EF4444',
  },
  fallacyNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
    marginRight: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  assessmentCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderLeftColor: '#8B5CF6',
  },
  backToListButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  backToListText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.408,
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
});
