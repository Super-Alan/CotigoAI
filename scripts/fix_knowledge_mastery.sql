-- 检查并修复 knowledge_point_mastery 表结构
DO $$
BEGIN
    -- 如果表不存在，创建它
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'knowledge_point_mastery') THEN
        CREATE TABLE "knowledge_point_mastery" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "thinkingTypeId" TEXT NOT NULL,
            "conceptKey" TEXT NOT NULL,
            "masteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
            "lastPracticed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "practiceCount" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "knowledge_point_mastery_pkey" PRIMARY KEY ("id")
        );

        -- 创建唯一约束
        CREATE UNIQUE INDEX "knowledge_point_mastery_userId_thinkingTypeId_conceptKey_key"
            ON "knowledge_point_mastery"("userId", "thinkingTypeId", "conceptKey");

        -- 创建索引
        CREATE INDEX "knowledge_point_mastery_userId_lastPracticed_idx"
            ON "knowledge_point_mastery"("userId", "lastPracticed");
        CREATE INDEX "knowledge_point_mastery_userId_masteryLevel_idx"
            ON "knowledge_point_mastery"("userId", "masteryLevel");
        CREATE INDEX "knowledge_point_mastery_thinkingTypeId_conceptKey_idx"
            ON "knowledge_point_mastery"("thinkingTypeId", "conceptKey");

        -- 添加外键约束
        ALTER TABLE "knowledge_point_mastery"
            ADD CONSTRAINT "knowledge_point_mastery_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        RAISE NOTICE 'Table knowledge_point_mastery created successfully';
    ELSE
        -- 表存在，检查并添加缺失的列

        -- 检查并添加 userId 列
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'knowledge_point_mastery'
            AND column_name = 'userId'
        ) THEN
            ALTER TABLE "knowledge_point_mastery" ADD COLUMN "userId" TEXT NOT NULL;

            -- 添加外键约束
            ALTER TABLE "knowledge_point_mastery"
                ADD CONSTRAINT "knowledge_point_mastery_userId_fkey"
                FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

            RAISE NOTICE 'Column userId added to knowledge_point_mastery';
        END IF;

        -- 检查并添加 thinkingTypeId 列
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'knowledge_point_mastery'
            AND column_name = 'thinkingTypeId'
        ) THEN
            -- 添加列，允许为NULL（暂时）
            ALTER TABLE "knowledge_point_mastery" ADD COLUMN "thinkingTypeId" TEXT;

            -- 如果有数据，可以设置一个默认值，例如 'causal_analysis'
            UPDATE "knowledge_point_mastery" SET "thinkingTypeId" = 'causal_analysis' WHERE "thinkingTypeId" IS NULL;

            -- 设置为 NOT NULL
            ALTER TABLE "knowledge_point_mastery" ALTER COLUMN "thinkingTypeId" SET NOT NULL;

            RAISE NOTICE 'Column thinkingTypeId added to knowledge_point_mastery';
        END IF;

        -- 检查并创建唯一约束（如果不存在）
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'knowledge_point_mastery'
            AND indexname = 'knowledge_point_mastery_userId_thinkingTypeId_conceptKey_key'
        ) THEN
            CREATE UNIQUE INDEX "knowledge_point_mastery_userId_thinkingTypeId_conceptKey_key"
                ON "knowledge_point_mastery"("userId", "thinkingTypeId", "conceptKey");
            RAISE NOTICE 'Unique index created on userId, thinkingTypeId, conceptKey';
        END IF;

        -- 检查并创建其他索引
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'knowledge_point_mastery'
            AND indexname = 'knowledge_point_mastery_thinkingTypeId_conceptKey_idx'
        ) THEN
            CREATE INDEX "knowledge_point_mastery_thinkingTypeId_conceptKey_idx"
                ON "knowledge_point_mastery"("thinkingTypeId", "conceptKey");
            RAISE NOTICE 'Index created on thinkingTypeId, conceptKey';
        END IF;

        RAISE NOTICE 'Table knowledge_point_mastery structure verified and updated';
    END IF;
END $$;
