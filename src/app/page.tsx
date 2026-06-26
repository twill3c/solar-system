// src/app/page.tsx
// サーバコンポーネント。クライアントのルート（SolarSystemApp）を描画する。
// Canvas を含む Scene は SolarSystemApp 内で ssr:false 動的読み込みされるため、
// このページ自体はサーバ側でも安全にレンダリングできる。

import SolarSystemApp from '@/components/SolarSystemApp';

export default function Page() {
  return <SolarSystemApp />;
}
