'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useEffect, useState } from 'react'

// 模拟数据 - 实际项目中应该从API获取
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

interface AnalyticsData {
  userActivity: {
    date: string
    activeUsers: number
    newUsers: number
  }[]
  practiceCompletion: {
    date: string
    completed: number
    started: number
  }[]
  thinkingTypeDistribution: {
    name: string
    value: number
  }[]
  knowledgeMastery: {
    name: string
    average: number
  }[]
}

export function AnalyticsStats() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('user-activity')

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // 实际项目中应该从API获取数据
        // const response = await fetch('/api/admin/analytics')
        // const data = await response.json()
        
        // 模拟数据
        const mockData: AnalyticsData = {
          userActivity: [
            { date: '周一', activeUsers: 120, newUsers: 15 },
            { date: '周二', activeUsers: 132, newUsers: 18 },
            { date: '周三', activeUsers: 145, newUsers: 12 },
            { date: '周四', activeUsers: 155, newUsers: 25 },
            { date: '周五', activeUsers: 170, newUsers: 20 },
            { date: '周六', activeUsers: 160, newUsers: 17 },
            { date: '周日', activeUsers: 140, newUsers: 10 }
          ],
          practiceCompletion: [
            { date: '周一', completed: 65, started: 90 },
            { date: '周二', completed: 72, started: 95 },
            { date: '周三', completed: 80, started: 110 },
            { date: '周四', completed: 78, started: 105 },
            { date: '周五', completed: 85, started: 120 },
            { date: '周六', completed: 70, started: 100 },
            { date: '周日', completed: 60, started: 85 }
          ],
          thinkingTypeDistribution: [
            { name: '因果分析', value: 35 },
            { name: '前提质疑', value: 25 },
            { name: '谬误检测', value: 20 },
            { name: '迭代反思', value: 15 },
            { name: '知识迁移', value: 5 }
          ],
          knowledgeMastery: [
            { name: '因果分析', average: 75 },
            { name: '前提质疑', average: 65 },
            { name: '谬误检测', average: 60 },
            { name: '迭代反思', average: 50 },
            { name: '知识迁移', average: 40 }
          ]
        }
        
        setData(mockData)
      } catch (error) {
        console.error('Failed to fetch analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">数据分析</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">数据分析</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="user-activity">用户活跃度</TabsTrigger>
              <TabsTrigger value="practice-completion">练习完成率</TabsTrigger>
              <TabsTrigger value="thinking-distribution">思维类型分布</TabsTrigger>
              <TabsTrigger value="knowledge-mastery">知识点掌握</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user-activity" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data?.userActivity}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="activeUsers" 
                    name="活跃用户" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="newUsers" 
                    name="新用户" 
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="practice-completion" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.practiceCompletion}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="started" 
                    name="开始练习" 
                    fill="#8884d8" 
                  />
                  <Bar 
                    dataKey="completed" 
                    name="完成练习" 
                    fill="#82ca9d" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="thinking-distribution" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.thinkingTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data?.thinkingTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="knowledge-mastery" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.knowledgeMastery}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar 
                    dataKey="average" 
                    name="平均掌握度" 
                    fill="#0088FE" 
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}