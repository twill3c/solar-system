import { defineConfig } from 'vitest/config';
import path from 'node:path';

// ドメイン層（純粋 TS）の単体テストのみを対象とする。
// 描画層・E2E は Playwright が担当するため除外する。
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
