/**
 * Jest配置文件 - 理论系统测试
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 根目录
  rootDir: '../',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.test.js'
  ],
  
  // 忽略的测试文件
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/dist/'
  ],
  
  // TypeScript支持
  preset: 'ts-jest',
  
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // 模块名映射（支持绝对路径导入）
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@prisma/client$': '<rootDir>/node_modules/@prisma/client',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1'
  },
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  
  // 覆盖率配置
  collectCoverage: false, // 默认不收集覆盖率，可通过命令行开启
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'scripts/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // 测试超时
  testTimeout: 30000, // 30秒默认超时
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }
  },
  
  // 转换配置
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  
  // 清理模拟
  clearMocks: true,
  restoreMocks: true,
  
  // 详细输出
  verbose: true,
  
  // 测试结果处理器
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/test-results',
      outputName: 'junit.xml'
    }]
  ],
  
  // 最大并发数
  maxConcurrency: 5,
  
  // 测试序列化
  testSequencer: '<rootDir>/__tests__/sequencer.js'
}