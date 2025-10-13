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

      {/* Hero Section - Mobile Optimized */}
      <section className="relative overflow-hidden bg-white">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 opacity-70" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge - Mobile Optimized */}
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
              AI 驱动的批判性思维训练平台
            </Badge>

            {/* Main Title - Mobile Optimized */}
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Cogito AI
              </span>
              <br />
              <span className="text-2xl sm:text-4xl md:text-5xl text-gray-700">
                批判性思维数智导师
              </span>
            </h1>

            {/* Subtitle - Mobile Optimized */}
            <p className="text-base sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-2">
              通过苏格拉底式引导和系统化训练，培养深度思考能力
              <br className="hidden sm:block" />
              <span className="block sm:inline text-sm sm:text-lg text-gray-500 mt-2 sm:mt-0">
                基于QS Top 20高校面试要求 · 5大核心思维维度体系
              </span>
            </p>

            {/* CTA Buttons - Mobile Optimized with larger touch targets */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0">
              <Link href="/learn" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto min-h-[52px] sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-base sm:text-lg font-semibold group">
                  <BookOpen className="h-5 w-5 mr-2" />
                  开始学习
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/chat" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[52px] sm:h-14 px-6 sm:px-8 border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 rounded-2xl text-base sm:text-lg font-semibold transition-all">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  体验AI导师
                </Button>
              </Link>
            </div>

            {/* Trust Indicators - Mobile Optimized */}
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600 px-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>系统化思维训练</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>苏格拉底式引导</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>个性化学习路径</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section - Mobile Optimized with 2-column grid */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 px-2">
              核心功能
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              四大核心模块，全方位提升批判性思维能力
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-4xl lg:max-w-7xl mx-auto">
            {/* Learning Center */}
            <FeatureCard
              icon={<BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />}
              title="学习中心"
              description="5大核心思维维度系统训练"
              highlights={["多维归因", "前提质疑", "谬误检测", "迭代反思", "知识迁移"]}
              href="/learn"
              gradient="from-blue-500 to-cyan-500"
            />

            {/* AI Tutor */}
            <FeatureCard
              icon={<Brain className="h-6 w-6 sm:h-7 sm:w-7" />}
              title="AI 导师对话"
              description="苏格拉底式引导深度思考"
              highlights={["智能追问", "引导式学习", "多角度分析"]}
              href="/chat"
              gradient="from-purple-500 to-pink-500"
            />

            {/* Daily Practice */}
            <FeatureCard
              icon={<Target className="h-6 w-6 sm:h-7 sm:w-7" />}
              title="每日练习"
              description="持续练习巩固思维技能"
              highlights={["每日一题", "进度追踪", "成就系统"]}
              href="/learn/daily"
              gradient="from-green-500 to-emerald-500"
            />

            {/* Tools */}
            <FeatureCard
              icon={<Layers className="h-6 w-6 sm:h-7 sm:w-7" />}
              title="分析工具集"
              description="可视化分析思维过程"
              highlights={["论证解构", "多视角分析", "逻辑检验"]}
              href="/arguments"
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              为什么选择 Cogito AI
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              三大核心优势，打造专业的批判性思维训练体系
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
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

      {/* Stats Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto">
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

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
              开始你的批判性思维之旅
            </h2>
            <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
              加入 Cogito AI，让 AI 导师陪伴你成长为独立思考者
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto min-h-[52px] sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-base sm:text-lg font-semibold">
                  立即注册
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/learn" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[52px] sm:h-14 px-6 sm:px-8 border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 rounded-2xl text-base sm:text-lg font-semibold transition-all">
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

// Feature Card Component - Mobile Optimized (Compact Version)
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
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 group cursor-pointer active:scale-95">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start space-x-3 sm:space-x-4">
            {/* Icon - Left Aligned */}
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg flex-shrink-0`}>
              {icon}
            </div>

            {/* Content - Right Side */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-1.5 leading-tight">
                {title}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                {description}
              </CardDescription>

              {/* Compact Tags - Only show on desktop */}
              <div className="hidden sm:flex flex-wrap gap-1.5">
                {highlights.slice(0, 3).map((highlight, index) => (
                  <span key={index} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                    {highlight}
                  </span>
                ))}
                {highlights.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    +{highlights.length - 3}
                  </span>
                )}
              </div>

              {/* Mobile: Show count only */}
              <div className="sm:hidden text-[10px] text-gray-500 flex items-center">
                <CheckCircle2 className="h-3 w-3 text-green-600 mr-1" />
                {highlights.length} 项功能
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Highlight Card Component - Mobile Optimized
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
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95">
      <CardHeader>
        <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl inline-block">
          {icon}
        </div>
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

// Stats Card Component - Mobile Optimized
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
    <div className="text-center text-white py-2 sm:py-0">
      <div className="mb-2 sm:mb-3 flex justify-center">
        {icon}
      </div>
      <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{value}</div>
      <div className="text-xs sm:text-sm opacity-90">{label}</div>
    </div>
  );
}
