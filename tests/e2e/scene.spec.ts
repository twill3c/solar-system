// tests/e2e/scene.spec.ts — TEST_SPEC E 対応（描画スモーク）
// Canvas のマウントと致命的エラーの不在、操作 UI の存在のみを確認する。
// ピクセル単位の検証はしない（フレーキー回避）。
import { test, expect } from '@playwright/test';

// WebGL 環境差で出やすい警告は除外する
const IGNORED = [
  /WebGL/i,
  /GPU stall/i,
  /THREE\.WebGLRenderer/i,
  /Multiple instances of Three\.js/i,
];

function isIgnored(text: string): boolean {
  return IGNORED.some((re) => re.test(text));
}

test.describe('E. 描画スモーク', () => {
  test('E-1/E-2. Canvas がマウントされ、致命的エラーが出ない', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isIgnored(msg.text())) errors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      if (!isIgnored(err.message)) errors.push(err.message);
    });

    await page.goto('/');

    // E-1: canvas が DOM に存在
    const canvas = page.locator('canvas');
    await expect(canvas.first()).toBeVisible({ timeout: 15_000 });

    // E-2: 数秒間 console.error / 未捕捉例外が出ない
    await page.waitForTimeout(3_000);
    expect(errors, `unexpected errors:\n${errors.join('\n')}`).toHaveLength(0);
  });

  test('E-3. 時間スライダーと再生/一時停止が操作可能', async ({ page }) => {
    await page.goto('/');

    const slider = page.locator('#time-slider');
    await expect(slider).toBeVisible();
    await expect(slider).toBeEnabled();

    const playBtn = page.getByRole('button', { name: /再生|一時停止/ });
    await expect(playBtn).toBeVisible();
    // 押下でラベルがトグルする
    const before = await playBtn.textContent();
    await playBtn.click();
    await expect(playBtn).not.toHaveText(before ?? '');
  });

  test('E-4. 再生でキャンバス内容が初期フレームから変化する', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15_000 });
    // レンダラ初期化を待つ
    await page.waitForTimeout(1_000);

    const first = await canvas.screenshot();
    await page.waitForTimeout(2_000); // 公転が進む
    const later = await canvas.screenshot();

    expect(Buffer.compare(first, later)).not.toBe(0);
  });
});
