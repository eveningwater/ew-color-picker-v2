// 测试配置文件
module.exports = {
  // 测试环境设置
  testEnvironment: 'jsdom',
  
  // 测试文件匹配模式
  testMatch: [
    '**/packages/*/test/**/*.test.ts',
    '**/packages/*/test/**/*.test.js'
  ],
  
  // 覆盖率收集
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    'packages/*/src/**/*.js',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/*.test.ts',
    '!packages/*/src/**/*.test.js'
  ],
  
  // 覆盖率报告格式
  coverageReporters: ['text', 'lcov', 'html'],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  
  // 模块名称映射
  moduleNameMapping: {
    '^@ew-color-picker/(.*)$': '<rootDir>/packages/$1/src'
  },
  
  // 转换器
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // 测试超时
  testTimeout: 10000,
  
  // 详细输出
  verbose: true
}; 