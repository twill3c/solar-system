// Next 16 の eslint-config-next はネイティブ flat config を提供する。
// FlatCompat は使わず、サブパスのフラット設定を直接読み込む。
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
