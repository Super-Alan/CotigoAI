#!/bin/bash

# 数据库备份脚本
# 用于在迁移前备份Supabase远程数据库

# 创建备份目录
mkdir -p backups

# 获取当前时间戳
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# 数据库连接信息（从.env读取）
DB_URL="postgres://postgres.luhuhnlxqpoezqtegnoy:2pqRGnS977Tn7qQA@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

# 执行备份
echo "开始备份数据库..."
pg_dump "$DB_URL" > "backups/backup-$TIMESTAMP.sql"

if [ $? -eq 0 ]; then
  echo "✅ 备份成功: backups/backup-$TIMESTAMP.sql"
else
  echo "❌ 备份失败"
  exit 1
fi
