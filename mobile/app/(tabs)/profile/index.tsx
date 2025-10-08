import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { conversationService } from '@/src/services/conversation.service';
import { argumentService } from '@/src/services/argument.service';
import { perspectiveService } from '@/src/services/perspective.service';

interface ActivityItem {
  id: string;
  type: 'conversation' | 'argument' | 'perspective';
  title: string;
  subtitle?: string;
  timestamp: string;
  icon: string;
  color: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // 统计数据
  const [stats, setStats] = useState({
    conversations: 0,
    arguments: 0,
    perspectives: 0,
  });

  // 最近活动
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'conversation' | 'argument' | 'perspective'>('all');

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true);

      // 并行加载所有数据
      const [conversations, argumentAnalyses, perspectives] = await Promise.all([
        conversationService.getConversations().catch(() => []),
        argumentService.getAnalyses().catch(() => []),
        perspectiveService.getSessionList().catch(() => []),
      ]);

      // 更新统计数据
      setStats({
        conversations: conversations.length,
        arguments: argumentAnalyses.length,
        perspectives: perspectives.length,
      });

      // 构建最近活动列表（最近7天）
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activities: ActivityItem[] = [];

      // 添加对话记录
      conversations
        .filter((conv) => new Date(conv.updatedAt || conv.createdAt) > sevenDaysAgo)
        .slice(0, 5)
        .forEach((conv) => {
          activities.push({
            id: conv.id,
            type: 'conversation',
            title: conv.topic || '对话',
            subtitle: conv.summary || undefined,
            timestamp: conv.updatedAt || conv.createdAt,
            icon: '💬',
            color: '#0EA5E9',
          });
        });

      // 添加论点分析
      argumentAnalyses
        .filter((arg) => new Date(arg.createdAt) > sevenDaysAgo)
        .slice(0, 5)
        .forEach((arg) => {
          activities.push({
            id: arg.id,
            type: 'argument',
            title: '论点解构分析',
            subtitle: arg.inputText.length > 50 ? arg.inputText.substring(0, 50) + '...' : arg.inputText,
            timestamp: arg.createdAt,
            icon: '🔍',
            color: '#8B5CF6',
          });
        });

      // 添加视角分析
      perspectives
        .filter((persp) => new Date(persp.createdAt) > sevenDaysAgo)
        .slice(0, 5)
        .forEach((persp) => {
          activities.push({
            id: persp.id,
            type: 'perspective',
            title: '多棱镜视角分析',
            subtitle: persp.topic.length > 50 ? persp.topic.substring(0, 50) + '...' : persp.topic,
            timestamp: persp.createdAt,
            icon: '🎭',
            color: '#10B981',
          });
        });

      // 按时间排序
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setRecentActivities(activities.slice(0, 20));
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗?', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleActivityPress = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'conversation':
        router.push(`/(tabs)/conversations/${activity.id}`);
        break;
      case 'argument':
        router.push(`/(tabs)/arguments/${activity.id}`);
        break;
      case 'perspective':
        router.push(`/(tabs)/perspectives/${activity.id}`);
        break;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const filteredActivities = filter === 'all'
    ? recentActivities
    : recentActivities.filter(activity => activity.type === filter);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#0EA5E9" />
        }
      >
        {/* 用户信息卡片 */}
        <View style={styles.userCard}>
          {/* 头像容器 - 带渐变边框效果 */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>

          {/* 用户名 */}
          <Text style={styles.userName}>{user?.name || '用户'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          {/* 会员标签 */}
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>✨ 标准会员</Text>
          </View>

          {/* 成就徽章 */}
          <View style={styles.achievementsContainer}>
            {stats.conversations >= 10 && (
              <View style={[styles.achievementBadge, { borderColor: '#0EA5E9' }]}>
                <Text style={styles.achievementIcon}>🎯</Text>
                <Text style={styles.achievementText}>对话达人</Text>
              </View>
            )}
            {stats.arguments >= 5 && (
              <View style={[styles.achievementBadge, { borderColor: '#8B5CF6' }]}>
                <Text style={styles.achievementIcon}>🔍</Text>
                <Text style={styles.achievementText}>逻辑大师</Text>
              </View>
            )}
            {stats.perspectives >= 5 && (
              <View style={[styles.achievementBadge, { borderColor: '#10B981' }]}>
                <Text style={styles.achievementIcon}>🎭</Text>
                <Text style={styles.achievementText}>视角专家</Text>
              </View>
            )}
          </View>
        </View>

        {/* 统计数据 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#0EA5E9' }]}>{stats.conversations}</Text>
            <Text style={styles.statLabel}>对话记录</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{stats.arguments}</Text>
            <Text style={styles.statLabel}>论点解构</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.perspectives}</Text>
            <Text style={styles.statLabel}>视角分析</Text>
          </View>
        </View>

        {/* 最近活动 */}
        {recentActivities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 最近活动</Text>
              <Text style={styles.sectionSubtitle}>{recentActivities.length} 条记录</Text>
            </View>

            {/* 筛选标签 */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
                onPress={() => setFilter('all')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
                  全部 {recentActivities.length}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filter === 'conversation' && styles.filterChipActive]}
                onPress={() => setFilter('conversation')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, filter === 'conversation' && styles.filterChipTextActive]}>
                  💬 对话 {recentActivities.filter(a => a.type === 'conversation').length}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filter === 'argument' && styles.filterChipActive]}
                onPress={() => setFilter('argument')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, filter === 'argument' && styles.filterChipTextActive]}>
                  🔍 解构 {recentActivities.filter(a => a.type === 'argument').length}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filter === 'perspective' && styles.filterChipActive]}
                onPress={() => setFilter('perspective')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, filter === 'perspective' && styles.filterChipTextActive]}>
                  🎭 视角 {recentActivities.filter(a => a.type === 'perspective').length}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 活动列表 */}
            <View style={styles.activityList}>
              {filteredActivities.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>暂无此类活动记录</Text>
                </View>
              ) : (
                filteredActivities.slice(0, 10).map((activity, index) => (
                  <TouchableOpacity
                    key={activity.id + index}
                    style={[
                      styles.activityItem,
                      index === Math.min(9, filteredActivities.length - 1) && styles.activityItemLast,
                    ]}
                    onPress={() => handleActivityPress(activity)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.activityIcon, { backgroundColor: activity.color + '15' }]}>
                      <Text style={styles.activityIconText}>{activity.icon}</Text>
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      {activity.subtitle && (
                        <Text style={styles.activitySubtitle} numberOfLines={2}>
                          {activity.subtitle}
                        </Text>
                      )}
                      <Text style={styles.activityTime}>{getRelativeTime(activity.timestamp)}</Text>
                    </View>
                    <Text style={styles.activityArrow}>›</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        )}

        {/* 功能菜单 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ 设置</Text>
          <View style={styles.menuList}>
            {/* 账号设置 */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder]}
              onPress={() => Alert.alert('提示', '功能开发中')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuLabel}>账号设置</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* 通知设置 */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder]}
              onPress={() => Alert.alert('提示', '功能开发中')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>🔔</Text>
              <Text style={styles.menuLabel}>通知设置</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            {/* 关于我们 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  'CotigoAI',
                  '版本 1.0.0\n\n批判性思维训练平台\n帮助你培养独立思考和理性分析能力'
                )
              }
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>ℹ️</Text>
              <Text style={styles.menuLabel}>关于我们</Text>
              <Text style={styles.menuVersion}>v1.0.0</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 退出登录按钮 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>退出登录</Text>
        </TouchableOpacity>

        {/* 底部安全区域 */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
    padding: 4,
    borderRadius: 46,
    background: 'linear-gradient(135deg, #0EA5E9, #06B6D4)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'SF Pro Display',
    fontWeight: '700',
    color: 'white',
  },
  userName: {
    fontSize: 22,
    fontFamily: 'SF Pro Display',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.6,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    color: '#64748B',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  memberBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  memberBadgeText: {
    fontSize: 13,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: 'white',
    letterSpacing: -0.2,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1.5,
    gap: 4,
  },
  achievementIcon: {
    fontSize: 16,
  },
  achievementText: {
    fontSize: 12,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: '#334155',
    letterSpacing: -0.2,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontFamily: 'SF Pro Display',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.8,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'SF Pro Text',
    color: '#64748B',
    letterSpacing: -0.2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: -0.2,
  },
  filterChipTextActive: {
    color: 'white',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'SF Pro Display',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'SF Pro Text',
    color: '#94A3B8',
    letterSpacing: -0.2,
  },
  activityList: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityItemLast: {
    borderBottomWidth: 0,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  activitySubtitle: {
    fontSize: 13,
    fontFamily: 'SF Pro Text',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'SF Pro Text',
    color: '#94A3B8',
    letterSpacing: -0.2,
  },
  activityArrow: {
    fontSize: 24,
    color: '#CBD5E1',
    marginLeft: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    color: '#94A3B8',
    letterSpacing: -0.2,
  },
  menuList: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  menuVersion: {
    fontSize: 13,
    fontFamily: 'SF Pro Text',
    color: '#94A3B8',
    marginRight: 8,
    letterSpacing: -0.2,
  },
  menuArrow: {
    fontSize: 24,
    color: '#CBD5E1',
  },
  logoutButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    color: '#EF4444',
    letterSpacing: -0.4,
  },
});
