import Link from 'next/link';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />

      {/* Main Content */}
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
          <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cogito AI
          </h1>
          <p className="text-xl text-center text-muted-foreground">
            批判性思维数智导师
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
            <FeatureCard
              title="苏格拉底对话"
              description="通过不断追问和引导,激发你的独立思考能力"
              icon="💭"
              href="/conversations"
            />
            <FeatureCard
              title="论点解构器"
              description="可视化分析论证结构,识别逻辑谬误"
              icon="🔍"
              href="/arguments"
            />
            <FeatureCard
              title="多棱镜视角"
              description="从多个角色立场审视同一问题,打破信息茧房"
              icon="🎭"
              href="/perspectives"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 cursor-pointer"
    >
      <h2 className="mb-3 text-2xl font-semibold flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      <p className="m-0 max-w-[30ch] text-sm opacity-50">{description}</p>
    </Link>
  );
}
