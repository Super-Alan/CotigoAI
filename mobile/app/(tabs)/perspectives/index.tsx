import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { perspectiveService } from '@/src/services/perspective.service';
import { MarkdownRenderer } from '@/src/components/MarkdownRenderer';
import type { PerspectiveRole, StreamEvent, Perspective } from '@/src/types/perspective';

export default function PerspectivesScreen() {
  const router = useRouter();

  // 输入状态
  const [issue, setIssue] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ issue: string; perspectives: Perspective[] } | null>(null);

  // 流式状态
  const [generatingRole, setGeneratingRole] = useState<{ name: string; icon: string; id: string } | null>(null);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const [streamingContent, setStreamingContent] = useState<Record<string, string>>({});

  // 历史列表
  const [recentSessions, setRecentSessions] = useState<Array<{
    id: string;
    topic: string;
    perspectiveCount: number;
    createdAt: string;
  }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 角色选择器 Modal
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // 可选角色
  const availableRoles: PerspectiveRole[] = [
    { id: 'economist', name: '经济学家', icon: '💰', description: '从经济效益和市场角度分析' },
    { id: 'ethicist', name: '伦理学家', icon: '⚖️', description: '从道德和价值观角度审视' },
    { id: 'scientist', name: '科学家', icon: '🔬', description: '基于实证研究和数据分析' },
    { id: 'environmentalist', name: '环保主义者', icon: '🌱', description: '关注生态和可持续发展' },
    { id: 'educator', name: '教育工作者', icon: '📚', description: '从教育和人才培养角度看' },
    { id: 'policymaker', name: '政策制定者', icon: '🏛️', description: '考虑政策可行性和社会影响' },
  ];

  // 加载历史列表
  const loadRecentSessions = async () => {
    try {
      setLoadingHistory(true);
      const sessions = await perspectiveService.getSessionList();
      // 只取最近5条
      setRecentSessions(
        sessions.slice(0, 5).map((session) => ({
          id: session.id,
          topic: session.topic,
          perspectiveCount: session.perspectives.length,
          createdAt: session.createdAt,
        }))
      );
    } catch (err) {
      console.error('加载历史失败:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadRecentSessions();
  }, []);

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleGenerate = async () => {
    if (!issue.trim() || selectedRoles.length < 2) {
      Alert.alert('提示', '请输入议题并至少选择2个角色');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setGeneratingRole(null);
    setGenerationProgress({ current: 0, total: 0 });
    setStreamingContent({});

    try {
      const perspectives: Perspective[] = [];

      await perspectiveService.generatePerspectivesStream(
        { issue, roles: selectedRoles },
        (event: StreamEvent) => {
          switch (event.type) {
            case 'init':
              setGenerationProgress({ current: 0, total: event.total || 0 });
              break;

            case 'progress':
              setGeneratingRole({
                name: event.roleName || '',
                icon: event.roleIcon || '',
                id: event.roleId || '',
              });
              setGenerationProgress({ current: event.current || 0, total: event.total || 0 });
              // 不清空内容，保持流畅过渡
              break;

            case 'chunk':
              // 累积流式内容
              if (event.roleId && event.chunk) {
                setStreamingContent((prev) => ({
                  ...prev,
                  [event.roleId!]: (prev[event.roleId!] || '') + event.chunk,
                }));
              }
              break;

            case 'perspective':
              if (event.perspective) {
                perspectives.push(event.perspective);
                // 更新结果以显示已完成的视角
                setResult({
                  issue,
                  perspectives: [...perspectives],
                });
              }
              break;

            case 'complete':
              setGeneratingRole(null);
              setStreamingContent({});
              setResult({
                issue,
                perspectives,
              });

              // 保存到数据库
              (async () => {
                try {
                  const savedId = await perspectiveService.save({
                    topic: issue,
                    perspectives,
                  });

                  // 刷新历史列表
                  loadRecentSessions();

                  // 跳转到详情页
                  setTimeout(() => {
                    router.push(`/(tabs)/perspectives/${savedId}`);
                  }, 500);
                } catch (saveError) {
                  console.error('保存失败:', saveError);
                  Alert.alert('提示', '分析完成，但保存失败。');
                }
              })();
              break;

            case 'error':
              throw new Error(event.error || '生成失败');
          }
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成分析时发生错误');
    } finally {
      setIsGenerating(false);
      setGeneratingRole(null);
    }
  };

  const handleReset = () => {
    setIssue('');
    setSelectedRoles([]);
    setResult(null);
    setError(null);
    setStreamingContent({});
  };

  return (
    <SafeAreaView className="flex-1" style={styles.background}>
      {/* Header - Tech Blue Style */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎭 多棱镜视角</Text>
        <Text style={styles.headerSubtitle}>从多个角色立场审视同一问题</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loadingHistory} onRefresh={loadRecentSessions} />
        }
      >
        {!result ? (
          <>
            {/* Issue Input */}
            <View style={styles.card} className="mb-6">
              <TextInput
                multiline
                numberOfLines={4}
                value={issue}
                onChangeText={setIssue}
                placeholder="输入议题 例如: 人工智能是否应该被允许参与司法判决？"
                placeholderTextColor="#94A3B8"
                style={styles.textArea}
                editable={!isGenerating}
              />
            </View>

            {/* Role Selection - Compact Design */}
            <View style={styles.card} className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text style={styles.cardTitle}>选择角色视角</Text>
                <TouchableOpacity
                  onPress={() => setShowRoleSelector(true)}
                  disabled={isGenerating}
                  style={styles.addRoleButton}
                >
                  <Text style={styles.addRoleButtonText}>+ 添加角色</Text>
                </TouchableOpacity>
              </View>

              {/* Selected Roles Tags */}
              {selectedRoles.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {selectedRoles.map((roleId) => {
                    const role = availableRoles.find((r) => r.id === roleId);
                    if (!role) return null;
                    return (
                      <TouchableOpacity
                        key={roleId}
                        onPress={() => toggleRole(roleId)}
                        disabled={isGenerating}
                        style={styles.selectedRoleTag}
                      >
                        <Text style={styles.selectedRoleIcon}>{role.icon}</Text>
                        <Text style={styles.selectedRoleName}>{role.name}</Text>
                        {!isGenerating && (
                          <Text style={styles.removeRoleIcon}>×</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowRoleSelector(true)}
                  disabled={isGenerating}
                  style={styles.emptyRoleHint}
                >
                  <Text style={styles.emptyRoleHintText}>
                    点击添加至少 2 个角色视角
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Role Selector Modal */}
            <Modal
              visible={showRoleSelector}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowRoleSelector(false)}
            >
              <View style={styles.modalOverlay}>
                <TouchableOpacity
                  style={styles.modalBackdrop}
                  activeOpacity={1}
                  onPress={() => setShowRoleSelector(false)}
                />
                <View style={styles.modalContent}>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>选择角色视角</Text>
                    <TouchableOpacity
                      onPress={() => setShowRoleSelector(false)}
                      style={styles.modalCloseButton}
                    >
                      <Text style={styles.modalCloseText}>完成</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Role List */}
                  <ScrollView
                    style={styles.modalRoleList}
                    showsVerticalScrollIndicator={false}
                  >
                    {availableRoles.map((role) => {
                      const isSelected = selectedRoles.includes(role.id);
                      return (
                        <TouchableOpacity
                          key={role.id}
                          onPress={() => toggleRole(role.id)}
                          style={[
                            styles.modalRoleItem,
                            isSelected && styles.modalRoleItemSelected,
                          ]}
                        >
                          <View className="flex-row items-center flex-1">
                            <Text style={styles.modalRoleIcon}>{role.icon}</Text>
                            <View className="flex-1 ml-3">
                              <Text style={styles.modalRoleName}>{role.name}</Text>
                              <Text style={styles.modalRoleDesc}>{role.description}</Text>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.modalCheckbox,
                              isSelected && styles.modalCheckboxChecked,
                            ]}
                          >
                            {isSelected && (
                              <Text style={styles.modalCheckboxCheck}>✓</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Selected Count */}
                  <View style={styles.modalFooter}>
                    <Text style={styles.modalSelectedCount}>
                      已选择 {selectedRoles.length} 个角色
                      {selectedRoles.length < 2 && (
                        <Text style={styles.modalSelectedHint}> (至少需要 2 个)</Text>
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Error Display */}
            {error && (
              <View style={styles.errorCard} className="mb-6">
                <Text style={styles.errorTitle}>❌ 错误</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Generate Button */}
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={!issue.trim() || selectedRoles.length < 2 || isGenerating}
              style={[
                styles.generateButton,
                (!issue.trim() || selectedRoles.length < 2 || isGenerating) && styles.generateButtonDisabled,
              ]}
            >
              {isGenerating ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  {generatingRole ? (
                    <Text style={styles.generateButtonText} className="ml-2">
                      正在分析：{generatingRole.icon} {generatingRole.name} ({generationProgress.current}/{generationProgress.total})
                    </Text>
                  ) : (
                    <Text style={styles.generateButtonText} className="ml-2">正在准备分析...</Text>
                  )}
                </View>
              ) : (
                <Text style={styles.generateButtonText}>生成多视角分析 →</Text>
              )}
            </TouchableOpacity>

            {/* Streaming Content Display - 优化的流式生成展示 */}
            {isGenerating && (
              <View style={styles.generationContainer} className="mt-6">
                {/* Overall Progress Header */}
                <View style={styles.progressHeader}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text style={styles.progressHeaderTitle}>
                      🎭 多视角分析生成中
                    </Text>
                    <Text style={styles.progressHeaderCount}>
                      {generationProgress.current}/{generationProgress.total}
                    </Text>
                  </View>

                  {/* Animated Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFillAnimated,
                        {
                          width: generationProgress.total > 0
                            ? `${(generationProgress.current / generationProgress.total) * 100}%`
                            : '0%',
                        },
                      ]}
                    />
                  </View>

                  {/* Completed Badges */}
                  {result && result.perspectives && result.perspectives.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mt-3">
                      {result.perspectives.map((p: Perspective) => (
                        <View key={p.roleId} style={styles.completedMicroBadge}>
                          <Text style={styles.completedMicroText}>{p.roleIcon} {p.roleName}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Current Streaming Content */}
                {generatingRole && (
                  <View style={styles.streamingCard} className="mt-4">
                    {/* Streaming Header with Pulse Animation */}
                    <View style={styles.streamingHeader}>
                      <View className="flex-row items-center flex-1">
                        <View style={styles.roleIconContainer}>
                          <Text style={styles.roleIconLarge}>{generatingRole.icon}</Text>
                        </View>
                        <View className="flex-1 ml-3">
                          <Text style={styles.streamingRoleName}>{generatingRole.name}</Text>
                          <View className="flex-row items-center mt-1">
                            <View style={styles.pulseIndicator} />
                            <Text style={styles.streamingStatus}>实时生成中...</Text>
                          </View>
                        </View>
                      </View>
                      <ActivityIndicator size="small" color="#0EA5E9" />
                    </View>

                    {/* Streaming Content Area */}
                    {streamingContent[generatingRole.id] ? (
                      <ScrollView
                        style={styles.streamingScrollView}
                        contentContainerStyle={styles.streamingScrollContent}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                      >
                        <MarkdownRenderer content={streamingContent[generatingRole.id]} />

                        {/* Typing Indicator */}
                        <View style={styles.typingIndicator} className="mt-2">
                          <View style={styles.typingDot} />
                          <View style={[styles.typingDot, { marginLeft: 4 }]} />
                          <View style={[styles.typingDot, { marginLeft: 4 }]} />
                        </View>
                      </ScrollView>
                    ) : (
                      <View style={styles.waitingContent}>
                        <ActivityIndicator size="large" color="#0EA5E9" />
                        <Text style={styles.waitingContentText} className="mt-3">
                          正在准备生成内容...
                        </Text>
                      </View>
                    )}

                    {/* Word Count Footer */}
                    <View style={styles.streamingFooter}>
                      <Text style={styles.wordCount}>
                        已生成 {streamingContent[generatingRole.id]?.length || 0} 字
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Info Box */}
            <View style={styles.infoCard} className="mt-6">
              <Text style={styles.infoTitle}>💡 提示</Text>
              <Text style={styles.infoText}>
                选择背景差异较大的角色，能获得更丰富的视角碰撞。生成过程中可实时查看每个角色的分析内容。
              </Text>
            </View>

            {/* Recent Sessions - 最近视角分析列表 */}
            {recentSessions.length > 0 && (
              <View style={styles.card} className="mt-6 mb-6">
                <Text style={styles.cardTitle}>📋 最近的视角分析</Text>
                <View className="space-y-3 mt-3">
                  {recentSessions.map((session) => (
                    <TouchableOpacity
                      key={session.id}
                      onPress={() => router.push(`/(tabs)/perspectives/${session.id}`)}
                      style={styles.historyCard}
                    >
                      <Text style={styles.historyTopic} numberOfLines={2}>
                        {session.topic}
                      </Text>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text style={styles.historyMeta}>
                          {session.perspectiveCount} 个视角
                        </Text>
                        <Text style={styles.historyDate}>
                          {new Date(session.createdAt).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Streaming Content Display - 优化的流式生成展示 (结果页面) */}
            {isGenerating && (
              <View style={styles.generationContainer} className="mb-6">
                {/* Overall Progress Header */}
                <View style={styles.progressHeader}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text style={styles.progressHeaderTitle}>
                      🎭 多视角分析生成中
                    </Text>
                    <Text style={styles.progressHeaderCount}>
                      {generationProgress.current}/{generationProgress.total}
                    </Text>
                  </View>

                  {/* Animated Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFillAnimated,
                        {
                          width: generationProgress.total > 0
                            ? `${(generationProgress.current / generationProgress.total) * 100}%`
                            : '0%',
                        },
                      ]}
                    />
                  </View>

                  {/* Completed Badges */}
                  {result && result.perspectives && result.perspectives.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mt-3">
                      {result.perspectives.map((p: Perspective) => (
                        <View key={p.roleId} style={styles.completedMicroBadge}>
                          <Text style={styles.completedMicroText}>{p.roleIcon} {p.roleName}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Current Streaming Content */}
                {generatingRole && (
                  <View style={styles.streamingCard} className="mt-4">
                    {/* Streaming Header with Pulse Animation */}
                    <View style={styles.streamingHeader}>
                      <View className="flex-row items-center flex-1">
                        <View style={styles.roleIconContainer}>
                          <Text style={styles.roleIconLarge}>{generatingRole.icon}</Text>
                        </View>
                        <View className="flex-1 ml-3">
                          <Text style={styles.streamingRoleName}>{generatingRole.name}</Text>
                          <View className="flex-row items-center mt-1">
                            <View style={styles.pulseIndicator} />
                            <Text style={styles.streamingStatus}>实时生成中...</Text>
                          </View>
                        </View>
                      </View>
                      <ActivityIndicator size="small" color="#0EA5E9" />
                    </View>

                    {/* Streaming Content Area */}
                    {streamingContent[generatingRole.id] ? (
                      <ScrollView
                        style={styles.streamingScrollView}
                        contentContainerStyle={styles.streamingScrollContent}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                      >
                        <MarkdownRenderer content={streamingContent[generatingRole.id]} />

                        {/* Typing Indicator */}
                        <View style={styles.typingIndicator} className="mt-2">
                          <View style={styles.typingDot} />
                          <View style={[styles.typingDot, { marginLeft: 4 }]} />
                          <View style={[styles.typingDot, { marginLeft: 4 }]} />
                        </View>
                      </ScrollView>
                    ) : (
                      <View style={styles.waitingContent}>
                        <ActivityIndicator size="large" color="#0EA5E9" />
                        <Text style={styles.waitingContentText} className="mt-3">
                          正在准备生成内容...
                        </Text>
                      </View>
                    )}

                    {/* Word Count Footer */}
                    <View style={styles.streamingFooter}>
                      <Text style={styles.wordCount}>
                        已生成 {streamingContent[generatingRole.id]?.length || 0} 字
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Results Display */}
            <View style={styles.card} className="mb-6">
              <Text style={styles.cardTitle}>议题</Text>
              <Text style={styles.issueText}>{result.issue}</Text>
            </View>

            {/* Perspectives Cards */}
            <View className="space-y-4 mb-6">
              {result.perspectives.map((perspective, index) => (
                <View key={perspective.roleId} style={styles.perspectiveCard}>
                  <View className="flex-row items-center mb-3">
                    <Text style={styles.perspectiveIcon}>{perspective.roleIcon}</Text>
                    <View className="flex-1 ml-3">
                      <Text style={styles.perspectiveName}>{perspective.roleName}</Text>
                      <Text style={styles.perspectiveIndex}>
                        视角 {index + 1} / {result.perspectives.length}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.perspectiveContent}>
                    <MarkdownRenderer content={perspective.analysis} />
                  </View>
                </View>
              ))}
            </View>

            {/* Reset Button */}
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>← 重新开始</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'SF Pro Display',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    color: '#64748B',
    marginTop: 4,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    color: '#475569',
    lineHeight: 22,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  textArea: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    fontFamily: 'SF Pro Text',
    color: '#0F172A',
    minHeight: 120,
    textAlignVertical: 'top',
    letterSpacing: -0.3,
  },
  addRoleButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addRoleButtonText: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: 'white',
    letterSpacing: -0.3,
  },
  selectedRoleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#0EA5E9',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  selectedRoleIcon: {
    fontSize: 18,
  },
  selectedRoleName: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    color: '#0369A1',
    letterSpacing: -0.3,
  },
  removeRoleIcon: {
    fontSize: 20,
    color: '#0EA5E9',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyRoleHint: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyRoleHintText: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    color: '#94A3B8',
    letterSpacing: -0.3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalCloseText: {
    fontSize: 16,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: '#0EA5E9',
    letterSpacing: -0.4,
  },
  modalRoleList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalRoleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  modalRoleItemSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0EA5E9',
  },
  modalRoleIcon: {
    fontSize: 32,
  },
  modalRoleName: {
    fontSize: 16,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  modalRoleDesc: {
    fontSize: 13,
    fontFamily: 'SF Pro Text',
    color: '#64748B',
    letterSpacing: -0.2,
  },
  modalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  modalCheckboxChecked: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  modalCheckboxCheck: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalSelectedCount: {
    fontSize: 15,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modalSelectedHint: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    color: '#F59E0B',
    letterSpacing: -0.3,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorTitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    color: '#991B1B',
    letterSpacing: -0.2,
  },
  generateButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: 'white',
    letterSpacing: -0.4,
  },
  generationContainer: {
    backgroundColor: 'transparent',
  },
  progressHeader: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeaderTitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  progressHeaderCount: {
    fontSize: 16,
    fontFamily: 'SF Pro Text',
    fontWeight: '700',
    color: '#0EA5E9',
    letterSpacing: -0.4,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFillAnimated: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 5,
  },
  completedMicroBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  completedMicroText: {
    fontSize: 12,
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    color: '#166534',
    letterSpacing: -0.2,
  },
  streamingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  streamingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  roleIconLarge: {
    fontSize: 28,
  },
  streamingRoleName: {
    fontSize: 16,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
    marginRight: 6,
  },
  streamingStatus: {
    fontSize: 13,
    fontFamily: 'SF Pro Text',
    color: '#0EA5E9',
    letterSpacing: -0.2,
  },
  streamingScrollView: {
    maxHeight: 400,
    backgroundColor: 'white',
  },
  streamingScrollContent: {
    padding: 16,
    paddingBottom: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    backgroundColor: '#94A3B8',
    borderRadius: 3,
  },
  streamingFooter: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'flex-end',
  },
  wordCount: {
    fontSize: 12,
    fontFamily: 'SF Pro Text',
    color: '#64748B',
    letterSpacing: -0.2,
  },
  waitingContent: {
    backgroundColor: 'white',
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingContentText: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    color: '#64748B',
    letterSpacing: -0.3,
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoTitle: {
    fontSize: 15,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    color: '#0C4A6E',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  historyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyTopic: {
    fontSize: 15,
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    color: '#0F172A',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  historyMeta: {
    fontSize: 13,
    fontFamily: 'SF Pro Text',
    color: '#64748B',
    letterSpacing: -0.2,
  },
  historyDate: {
    fontSize: 12,
    fontFamily: 'SF Pro Text',
    color: '#94A3B8',
    letterSpacing: -0.2,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  progressCount: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: '#0EA5E9',
    letterSpacing: -0.3,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 4,
  },
  generatingText: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    color: '#64748B',
    letterSpacing: -0.3,
  },
  completedBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  completedBadgeText: {
    fontSize: 13,
    fontFamily: 'SF Pro Text',
    color: '#166534',
    letterSpacing: -0.2,
  },
  issueText: {
    fontSize: 15,
    fontFamily: 'SF Pro Text',
    color: '#334155',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  perspectiveCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  perspectiveIcon: {
    fontSize: 36,
  },
  perspectiveName: {
    fontSize: 18,
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  perspectiveIndex: {
    fontSize: 12,
    fontFamily: 'SF Pro Text',
    color: '#94A3B8',
    letterSpacing: -0.2,
  },
  perspectiveContent: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
  },
  resetButton: {
    backgroundColor: '#64748B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: 'white',
    letterSpacing: -0.4,
  },
});
