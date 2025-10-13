import Link from 'next/link';
import Header from '@/components/Header';
import {
  BookOpen,
  MessageSquare,
  Target,
  Sparkles,
  Brain,
  TrendingUp,
  Users,
  Award,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 opacity-70" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI 驱动的批判性思维训练平台
            </Badge>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Cogito AI
              </span>
              <br />
              <span className="text-4xl md:text-5xl text-gray-700">
                批判性思维数智导师
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              通过苏格拉底式引导和系统化训练，培养深度思考能力
              <br />
              <span className="text-lg text-gray-500">基于QS Top 20高校面试要求 · 5大核心思维维度体系</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/learn">
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold group">
                  <BookOpen className="h-5 w-5 mr-2" />
                  开始学习
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/chat">
                <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 rounded-2xl text-lg font-semibold transition-all">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  体验AI导师
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>系统化思维训练</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>苏格拉底式引导</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>个性化学习路径</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              核心功能
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              四大核心模块，全方位提升批判性思维能力
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Learning Center */}
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="学习中心"
              description="5大核心思维维度系统训练"
              highlights={["多维归因", "前提质疑", "谬误检测", "迭代反思", "知识迁移"]}
              href="/learn"
              gradient="from-blue-500 to-cyan-500"
            />

            {/* AI Tutor */}
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="AI 导师对话"
              description="苏格拉底式引导深度思考"
              highlights={["智能追问", "引导式学习", "多角度分析"]}
              href="/chat"
              gradient="from-purple-500 to-pink-500"
            />

            {/* Daily Practice */}
            <FeatureCard
              icon={<Target className="h-8 w-8" />}
              title="每日练习"
              description="持续练习巩固思维技能"
              highlights={["每日一题", "进度追踪", "成就系统"]}
              href="/learn/daily"
              gradient="from-green-500 to-emerald-500"
            />

            {/* Tools */}
            <FeatureCard
              icon={<Layers className="h-8 w-8" />}
              title="分析工具集"
              description="可视化分析思维过程"
              highlights={["论证解构", "多视角分析", "逻辑检验"]}
              href="/arguments"
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择 Cogito AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              三大核心优势，打造专业的批判性思维训练体系
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <HighlightCard
              icon={<Shield className="h-10 w-10 text-blue-600" />}
              title="权威题库支持"
              description="基于 QS Top 20 高校面试要求，涵盖批判性思维核心考点，提供真实场景训练。"
            />
            <HighlightCard
              icon={<Zap className="h-10 w-10 text-purple-600" />}
              title="AI 个性化引导"
              description="采用苏格拉底式提问法，AI导师根据你的思考深度动态调整引导策略。"
            />
            <HighlightCard
              icon={<TrendingUp className="h-10 w-10 text-green-600" />}
              title="系统化成长路径"
              description="5大思维维度体系化训练，从初级到高级循序渐进，可视化学习进度。"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <StatCard
              icon={<Users className="h-8 w-8" />}
              value="10,000+"
              label="学习用户"
            />
            <StatCard
              icon={<Brain className="h-8 w-8" />}
              value="50,000+"
              label="思维训练次数"
            />
            <StatCard
              icon={<Target className="h-8 w-8" />}
              value="5"
              label="核心思维维度"
            />
            <StatCard
              icon={<Award className="h-8 w-8" />}
              value="95%"
              label="用户满意度"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              开始你的批判性思维之旅
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              加入 Cogito AI，让 AI 导师陪伴你成长为独立思考者
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold">
                  立即注册
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/learn">
                <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 rounded-2xl text-lg font-semibold transition-all">
                  浏览学习内容
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p className="mb-2">© 2024 Cogito AI. All rights reserved.</p>
            <p className="text-sm">批判性思维数智导师 · 让思考更深入</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  highlights,
  href,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: string[];
  href: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 group cursor-pointer">
        <CardHeader className="pb-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
            {icon}
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {highlights.map((highlight, index) => (
              <li key={index} className="flex items-start text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Link>
  );
}

// Highlight Card Component
function HighlightCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl inline-block">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 mb-3">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

// Stats Card Component
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center text-white">
      <div className="mb-3 flex justify-center">
        {icon}
      </div>
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}
