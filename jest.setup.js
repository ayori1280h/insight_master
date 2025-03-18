// このファイルはJestの実行前に自動的に実行されます

// 環境変数の設定
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017';
process.env.MONGODB_DB_NAME = 'insightmaster_test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_EXPIRATION = '1h';
process.env.OPENAI_API_KEY = 'dummy_api_key';
process.env.OPENAI_MODEL = 'gpt-3.5-turbo';

// グローバルなタイムアウト設定
jest.setTimeout(30000); // 30秒

// コンソール出力の抑制（必要に応じてコメントアウト）
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// }; 