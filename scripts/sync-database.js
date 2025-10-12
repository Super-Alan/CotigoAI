#!/usr/bin/env node

/**
 * 数据库同步脚本
 * 将本地 PostgreSQL 数据库同步到 Supabase 远端数据库
 * 
 * 使用方法:
 * npm run db:sync:structure  # 仅同步表结构
 * npm run db:sync:data       # 仅同步数据
 * npm run db:sync:full       # 完整同步（结构+数据）
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[步骤 ${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 检查必要文件
function checkRequiredFiles() {
  const requiredFiles = ['.env', '.env.remote', 'prisma/schema.prisma'];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      logError(`缺少必要文件: ${file}`);
      process.exit(1);
    }
  }
  
  logSuccess('所有必要文件检查通过');
}

// 执行命令并处理错误
function executeCommand(command, options = {}) {
  try {
    logInfo(`执行命令: ${command}`);
    const result = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
    return result;
  } catch (error) {
    logError(`命令执行失败: ${command}`);
    logError(`错误信息: ${error.message}`);
    throw error;
  }
}

// 检查 pg_dump 版本并获取兼容的参数
function getPgDumpCompatibleArgs() {
  try {
    const versionOutput = execSync('pg_dump --version', { encoding: 'utf8' });
    const versionMatch = versionOutput.match(/pg_dump \(PostgreSQL\) (\d+)\.(\d+)/);
    
    if (versionMatch) {
      const majorVersion = parseInt(versionMatch[1]);
      const minorVersion = parseInt(versionMatch[2]);
      
      logInfo(`检测到 pg_dump 版本: ${majorVersion}.${minorVersion}`);
      
      // PostgreSQL 15+ 支持 --no-sync，但没有 --no-sync-version
      if (majorVersion >= 15) {
        return '--no-sync';
      }
      // 较老版本使用基本参数
      return '';
    }
  } catch (error) {
    logWarning('无法检测 pg_dump 版本，使用默认参数');
  }
  
  return '';
}

// 备份远端数据库
async function backupRemoteDatabase() {
  logStep(1, '备份远端数据库');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-remote-${timestamp}.sql`;
  
  try {
    // 读取远端数据库配置
    const remoteEnv = fs.readFileSync('.env.remote', 'utf8');
    const dbUrl = remoteEnv.match(/DATABASE_URL="([^"]+)"/)?.[1];
    
    if (!dbUrl) {
      logError('无法从 .env.remote 读取数据库连接');
      return null;
    }
    
    // 确保备份目录存在
    if (!fs.existsSync('backups')) {
      fs.mkdirSync('backups');
    }
    
    // 获取版本兼容的参数
    const compatArgs = getPgDumpCompatibleArgs();
    
    // 使用 pg_dump 备份，添加版本兼容性参数
    const command = compatArgs 
      ? `pg_dump ${compatArgs} "${dbUrl}" > backups/${backupFile}`
      : `pg_dump "${dbUrl}" > backups/${backupFile}`;
    
    executeCommand(command);
    logSuccess(`远端数据库备份完成: backups/${backupFile}`);
    return `backups/${backupFile}`;
  } catch (error) {
    logWarning('远端数据库备份失败，继续执行同步');
    logInfo(`备份失败原因: ${error.message}`);
    
    // 如果是版本不兼容问题，提供解决建议
    if (error.message.includes('server version mismatch') || error.message.includes('version')) {
      logInfo('💡 解决建议:');
      logInfo('   1. 升级本地 PostgreSQL 客户端: brew upgrade postgresql');
      logInfo('   2. 或者跳过备份步骤，直接进行同步');
      logInfo('   3. 手动备份: 在 Supabase 控制台中创建备份');
    }
    
    return null;
  }
}

// 同步表结构
async function syncDatabaseStructure() {
  logStep(2, '同步数据库表结构');
  
  try {
    // 切换到远端数据库配置
    executeCommand('cp .env .env.local.backup');
    executeCommand('cp .env.remote .env');
    
    // 生成 Prisma 客户端
    executeCommand('npx prisma generate');
    
    // 部署迁移到远端数据库
    executeCommand('npx prisma migrate deploy');
    
    logSuccess('数据库表结构同步完成');
  } catch (error) {
    logError('表结构同步失败');
    throw error;
  } finally {
    // 恢复本地数据库配置
    if (fs.existsSync('.env.local.backup')) {
      executeCommand('cp .env.local.backup .env');
      executeCommand('rm .env.local.backup');
    }
  }
}

// 清理数据库连接字符串中的无效参数
function cleanConnectionString(dbUrl) {
  if (!dbUrl) return null;
  
  try {
    // 移除无效的查询参数
    const cleanUrl = dbUrl.replace(/&supa=[^&]*/, '').replace(/\?supa=[^&]*&?/, '?').replace(/\?$/, '');
    return cleanUrl;
  } catch (error) {
    logWarning(`连接字符串清理失败: ${error.message}`);
    return dbUrl;
  }
}

// 验证数据库连接字符串格式
function validateConnectionString(dbUrl, type = 'database') {
  if (!dbUrl) {
    throw new Error(`${type}连接字符串为空`);
  }
  
  if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
    throw new Error(`${type}连接字符串格式无效，必须以 postgres:// 或 postgresql:// 开头`);
  }
  
  // 检查是否包含无效参数
  if (dbUrl.includes('supa=')) {
    logWarning(`检测到无效参数 'supa='，将自动清理`);
  }
  
  return true;
}

// 导出本地数据
async function exportLocalData() {
  logStep(3, '导出本地数据库数据');
  
  try {
    // 检查是否存在本地数据库配置文件
    let localEnv;
    let envFile;
    
    // 优先使用 .env.local（本地开发配置），然后检查 .env
    if (fs.existsSync('.env.local')) {
      localEnv = fs.readFileSync('.env.local', 'utf8');
      envFile = '.env.local';
      logInfo('使用 .env.local 中的本地数据库配置');
    } else if (fs.existsSync('.env')) {
      // 检查 .env 是否包含本地数据库连接
      const envContent = fs.readFileSync('.env', 'utf8');
      const envDbUrl = envContent.match(/DATABASE_URL="([^"]+)"/)?.[1];
      
      if (envDbUrl && envDbUrl.includes('localhost')) {
        localEnv = envContent;
        envFile = '.env';
        logInfo('使用 .env 中的本地数据库配置');
      } else {
        // .env 包含远端配置，检查 .env.backup
        if (fs.existsSync('.env.backup')) {
          const backupEnv = fs.readFileSync('.env.backup', 'utf8');
          const backupDbUrl = backupEnv.match(/DATABASE_URL="([^"]+)"/)?.[1];
          
          if (backupDbUrl && backupDbUrl.includes('localhost')) {
            localEnv = backupEnv;
            envFile = '.env.backup';
            logInfo('使用 .env.backup 中的本地数据库配置');
          } else {
            throw new Error('所有配置文件都包含远端数据库连接，无法找到本地数据库配置');
          }
        } else {
          throw new Error('找不到包含本地数据库配置的文件');
        }
      }
    } else {
      throw new Error('找不到本地数据库配置文件 (.env.local 或 .env)');
    }
    
    const localDbUrl = localEnv.match(/DATABASE_URL="([^"]+)"/)?.[1];
    
    if (!localDbUrl) {
      logError(`无法从 ${envFile} 读取本地数据库连接`);
      throw new Error('本地数据库连接配置错误');
    }
    
    // 验证和清理连接字符串
    validateConnectionString(localDbUrl, '本地数据库');
    const cleanLocalDbUrl = cleanConnectionString(localDbUrl);
    
    logInfo(`从 ${envFile} 读取本地数据库连接`);
    logInfo(`本地数据库: ${cleanLocalDbUrl.replace(/:[^:@]*@/, ':****@')}`); // 隐藏密码
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dataFile = `data-export-${timestamp}.sql`;
    
    // 确保导出目录存在
    if (!fs.existsSync('exports')) {
      fs.mkdirSync('exports');
    }
    
    // 获取版本兼容的参数
    const compatArgs = getPgDumpCompatibleArgs();
    
    // 导出数据（仅数据，不包含结构）
    const baseArgs = '--data-only --no-owner --no-privileges';
    const command = compatArgs 
      ? `pg_dump ${compatArgs} ${baseArgs} "${cleanLocalDbUrl}" > exports/${dataFile}`
      : `pg_dump ${baseArgs} "${cleanLocalDbUrl}" > exports/${dataFile}`;
    
    executeCommand(command);
    
    logSuccess(`本地数据导出完成: exports/${dataFile}`);
    return `exports/${dataFile}`;
  } catch (error) {
    logError('本地数据导出失败');
    
    // 提供详细的错误信息和解决建议
    if (error.message.includes('invalid URI query parameter')) {
      logInfo('💡 解决建议:');
      logInfo('   1. 检查数据库连接字符串格式');
      logInfo('   2. 移除无效的查询参数');
      logInfo('   3. 确保使用标准的 PostgreSQL 连接格式');
    } else if (error.message.includes('connection') || error.message.includes('connect')) {
      logInfo('💡 解决建议:');
      logInfo('   1. 检查本地数据库是否正在运行');
      logInfo('   2. 验证数据库连接参数是否正确');
      logInfo('   3. 确保网络连接正常');
    }
    
    throw error;
  }
}

// 导入数据到远端
async function importDataToRemote(dataFile) {
  logStep(4, '导入数据到远端数据库');
  
  try {
    const remoteEnv = fs.readFileSync('.env.remote', 'utf8');
    const remoteDbUrl = remoteEnv.match(/DATABASE_URL="([^"]+)"/)?.[1];
    
    if (!remoteDbUrl) {
      logError('无法从 .env.remote 读取远端数据库连接');
      throw new Error('远端数据库连接配置错误');
    }
    
    // 验证和清理远端数据库连接字符串
    validateConnectionString(remoteDbUrl, '远端数据库');
    const cleanRemoteDbUrl = cleanConnectionString(remoteDbUrl);
    
    logInfo(`远端数据库: ${cleanRemoteDbUrl.replace(/:[^:@]*@/, ':****@')}`); // 隐藏密码
    
    // 导入数据
    const command = `psql "${cleanRemoteDbUrl}" < ${dataFile}`;
    executeCommand(command);
    
    logSuccess('数据导入到远端数据库完成');
  } catch (error) {
    logError('数据导入失败');
    
    // 提供详细的错误信息和解决建议
    if (error.message.includes('invalid URI query parameter')) {
      logInfo('💡 解决建议:');
      logInfo('   1. 检查远端数据库连接字符串格式');
      logInfo('   2. 移除无效的查询参数（如 supa=base-pooler.x）');
      logInfo('   3. 使用标准的 PostgreSQL 连接格式');
    } else if (error.message.includes('connection') || error.message.includes('connect')) {
      logInfo('💡 解决建议:');
      logInfo('   1. 检查远端数据库是否可访问');
      logInfo('   2. 验证数据库连接参数是否正确');
      logInfo('   3. 确保网络连接和防火墙设置正常');
    }
    
    throw error;
  }
}

// 验证同步结果
async function validateSync() {
  logStep(5, '验证同步结果');
  
  try {
    // 切换到远端数据库配置
    executeCommand('cp .env .env.local.backup');
    executeCommand('cp .env.remote .env');
    
    // 运行 Prisma 验证
    executeCommand('npx prisma validate');
    
    // 检查数据库连接
    executeCommand('npx prisma db pull --print');
    
    logSuccess('数据库同步验证通过');
  } catch (error) {
    logWarning('同步验证出现问题，请手动检查');
  } finally {
    // 恢复本地数据库配置
    if (fs.existsSync('.env.local.backup')) {
      executeCommand('cp .env.local.backup .env');
      executeCommand('rm .env.local.backup');
    }
  }
}

// 清理临时文件
function cleanup() {
  logStep(6, '清理临时文件');
  
  try {
    // 清理备份文件
    if (fs.existsSync('.env.local.backup')) {
      fs.unlinkSync('.env.local.backup');
    }
    
    logSuccess('临时文件清理完成');
  } catch (error) {
    logWarning('临时文件清理失败，请手动清理');
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'full';
  
  log('🚀 开始数据库同步', 'bright');
  log(`同步模式: ${mode}`, 'blue');
  
  try {
    // 检查必要文件
    checkRequiredFiles();
    
    let backupFile = null;
    let dataFile = null;
    
    if (mode === 'structure' || mode === 'full') {
      // 备份远端数据库
      backupFile = await backupRemoteDatabase();
      
      // 同步表结构
      await syncDatabaseStructure();
    }
    
    if (mode === 'data' || mode === 'full') {
      // 导出本地数据
      dataFile = await exportLocalData();
      
      // 导入数据到远端
      await importDataToRemote(dataFile);
    }
    
    // 验证同步结果
    await validateSync();
    
    // 清理临时文件
    cleanup();
    
    log('\n🎉 数据库同步完成！', 'green');
    
    if (backupFile) {
      logInfo(`远端数据库备份: ${backupFile}`);
    }
    if (dataFile) {
      logInfo(`本地数据导出: ${dataFile}`);
    }
    
  } catch (error) {
    logError('\n💥 数据库同步失败');
    logError(error.message);
    
    // 清理临时文件
    cleanup();
    
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logError('未捕获的异常:');
  logError(error.message);
  cleanup();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError('未处理的 Promise 拒绝:');
  logError(reason);
  cleanup();
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  syncDatabaseStructure,
  exportLocalData,
  importDataToRemote,
  validateSync
};