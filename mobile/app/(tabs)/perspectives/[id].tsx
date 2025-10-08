import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { perspectiveService } from '@/src/services/perspective.service';
import { MarkdownRenderer } from '@/src/components/MarkdownRenderer';
import type { PerspectiveSession } from '@/src/types/perspective';

export default function PerspectiveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<PerspectiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadSession();
    }
  }, [id]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await perspectiveService.getSession(id);
      setSession(data);
    } catch (err) {
      console.error('[Perspective Detail] Load error:', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: '#64748B',
              fontFamily: 'SF Pro Text',
              letterSpacing: -0.4,
            }}
          >
            加载中...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#E2E8F0',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Text style={{ fontSize: 28, color: '#0EA5E9' }}>←</Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'SF Pro Display',
                fontWeight: '600',
                color: '#0F172A',
                letterSpacing: -0.5,
              }}
            >
              视角详情
            </Text>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
          }}
        >
          <Text style={{ fontSize: 64, marginBottom: 16 }}>⚠️</Text>
          <Text
            style={{
              fontSize: 20,
              fontFamily: 'SF Pro Display',
              fontWeight: '600',
              color: '#0F172A',
              marginBottom: 8,
              textAlign: 'center',
              letterSpacing: -0.6,
            }}
          >
            {error || '未找到视角分析数据'}
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: 'SF Pro Text',
              color: '#64748B',
              marginBottom: 24,
              textAlign: 'center',
              letterSpacing: -0.3,
            }}
          >
            请返回重试或选择其他分析
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/perspectives')}
            style={{
              backgroundColor: '#0EA5E9',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              shadowColor: '#0EA5E9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'SF Pro Text',
                fontWeight: '600',
                color: 'white',
                letterSpacing: -0.4,
              }}
            >
              返回多棱镜页面
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main content
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 28, color: '#0EA5E9' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 18,
                fontFamily: 'SF Pro Display',
                fontWeight: '600',
                color: '#0F172A',
                letterSpacing: -0.5,
              }}
            >
              {session.topic}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'SF Pro Text',
                color: '#64748B',
                marginTop: 2,
                letterSpacing: -0.2,
              }}
            >
              {session.perspectives.length} 个视角 • {new Date(session.createdAt).toLocaleDateString('zh-CN')}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Topic Section */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 28, marginRight: 8 }}>🎯</Text>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'SF Pro Display',
                fontWeight: '600',
                color: '#0F172A',
                letterSpacing: -0.5,
              }}
            >
              分析议题
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'SF Pro Text',
              color: '#334155',
              lineHeight: 26,
              letterSpacing: -0.3,
            }}
          >
            {session.topic}
          </Text>
          <View
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: '#F1F5F9',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'SF Pro Text',
                color: '#94A3B8',
                letterSpacing: -0.2,
              }}
            >
              分析时间：{new Date(session.createdAt).toLocaleString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Perspectives Section */}
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 32, marginRight: 8 }}>🔮</Text>
            <Text
              style={{
                fontSize: 20,
                fontFamily: 'SF Pro Display',
                fontWeight: '700',
                color: '#0F172A',
                letterSpacing: -0.6,
              }}
            >
              多角度视角分析
            </Text>
          </View>

          {session.perspectives.map((perspective, idx) => (
            <View
              key={perspective.id}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#0EA5E9',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* Perspective Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 40, marginRight: 12 }}>
                  {perspective.roleConfig.roleIcon}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: 'SF Pro Display',
                      fontWeight: '600',
                      color: '#0F172A',
                      marginBottom: 4,
                      letterSpacing: -0.6,
                    }}
                  >
                    {perspective.roleName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: 'SF Pro Text',
                      color: '#94A3B8',
                      letterSpacing: -0.2,
                    }}
                  >
                    视角 {idx + 1} / {session.perspectives.length}
                  </Text>
                </View>
              </View>

              {/* Perspective Content with Tech Blue Background */}
              <View
                style={{
                  backgroundColor: '#F0F9FF',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E0F2FE',
                }}
              >
                <MarkdownRenderer content={perspective.viewpoint} />
              </View>

              {/* Timestamp */}
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'SF Pro Text',
                    color: '#94A3B8',
                    letterSpacing: -0.2,
                  }}
                >
                  生成于：{new Date(perspective.createdAt).toLocaleString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Action */}
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 32 }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/perspectives')}
            style={{
              backgroundColor: '#0EA5E9',
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 12,
              shadowColor: '#0EA5E9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'SF Pro Text',
                fontWeight: '600',
                color: 'white',
                letterSpacing: -0.4,
              }}
            >
              返回多棱镜页面
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
