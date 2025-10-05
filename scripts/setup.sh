#!/bin/bash

# Cogito AI - 项目初始化脚本
# 自动完成项目配置和数据库初始化

set -e  # 遇到错误立即退出

echo "🚀 Cogito AI - 项目初始化开始..."
echo ""

# 检查Node.js版本
echo "📦 检查Node.js版本..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: 需要Node.js 18或更高版本,当前版本: $(node -v)"
    exit 1
fi
echo "✅ Node.js版本: $(node -v)"
echo ""

# 检查是否存在.env文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
    echo "✅ .env文件已创建,请编辑此文件填写必要的配置"
    echo ""
    echo "⚠️  需要配置以下环境变量:"
    echo "   - DATABASE_URL (PostgreSQL连接字符串)"
    echo "   - NEXTAUTH_SECRET (使用: openssl rand -base64 32 生成)"
    echo "   - DEEPSEEK_API_KEY (Deepseek API密钥)"
    echo "   - QWEN_API_KEY (Qwen API密钥)"
    echo ""

    # 自动生成NEXTAUTH_SECRET
    if command -v openssl &> /dev/null; then
        SECRET=$(openssl rand -base64 32)
        sed -i.bak "s/your-secret-key-here-generate-with-openssl-rand-base64-32/$SECRET/" .env
        rm .env.bak 2>/dev/null || true
        echo "✅ NEXTAUTH_SECRET已自动生成"
        echo ""
    fi

    echo "请编辑.env文件后重新运行此脚本"
    exit 0
else
    echo "✅ 环境变量文件已存在"
fi
echo ""

# 安装依赖
echo "📦 安装项目依赖..."
npm install
echo "✅ 依赖安装完成"
echo ""

# 检查数据库连接
echo "🔍 检查数据库连接..."
if grep -q "postgresql://user:password@localhost:5432/cogito_ai" .env; then
    echo "⚠️  警告: 你还在使用示例数据库URL,请在.env中配置真实的DATABASE_URL"
    echo ""
fi

# 生成Prisma客户端
echo "🔨 生成Prisma客户端..."
npm run db:generate
echo "✅ Prisma客户端生成完成"
echo ""

# 推送数据库模式
echo "🗄️  初始化数据库..."
read -p "是否要推送数据库模式到PostgreSQL? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:push
    echo "✅ 数据库初始化完成"
else
    echo "⏭️  跳过数据库初始化,你可以稍后运行: npm run db:push"
fi
echo ""

# 构建提示
echo "✅ 项目初始化完成!"
echo ""
echo "📚 下一步:"
echo "   1. 确保.env文件中的配置正确"
echo "   2. 运行开发服务器: npm run dev"
echo "   3. 访问 http://localhost:3000"
echo "   4. (可选) 打开Prisma Studio查看数据库: npm run db:studio"
echo ""
echo "📖 更多信息请查看: README.md"
echo ""
echo "🎉 祝你开发愉快!"
