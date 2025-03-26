module.exports = {
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: -10,
    },
  },
  rootDir: 'src',
  // Atualizando para considerar apenas arquivos de serviço nos testes
  testRegex: '.*\\.service\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  // Coletando cobertura apenas de arquivos de serviço
  collectCoverageFrom: ['**/*.service.(t|j)s'],
  coveragePathIgnorePatterns: [
    '<rootDir>/@types/',
    '<rootDir>/core/',
    '<rootDir>/config/',
    '<rootDir>/modules/health/*.*',
    '<rootDir>/modules/*.*/controllers/',
    '<rootDir>/modules/*.*/repositories/',
    '<rootDir>/modules/*.*/constants/',
    '<rootDir>/modules/*.*/dtos/',
    '<rootDir>/modules/*.*/interfaces/',
    '<rootDir>/modules/*.*/tests/units/mocks/',
    '<rootDir>/modules/*.*/infra/',
    '<rootDir>/modules/*.*/*.module.ts',
    '<rootDir>/modules/shared/*.*/',
    '<rootDir>/swagger/',
    '<rootDir>/app.module.ts',
    '<rootDir>/main.ts',
  ],
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/../src/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
