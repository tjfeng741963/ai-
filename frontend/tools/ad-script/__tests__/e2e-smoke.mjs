import { chromium } from 'playwright-core';

const BASE = 'http://localhost:3002';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('1. 导航到广告剧本页面...');
  await page.goto(`${BASE}/#/tools/ad-script`, { waitUntil: 'networkidle' });

  const title = await page.locator('text=广告剧本 Agent').first();
  console.log(`   ${await title.isVisible() ? '✓' : '✗'} 标题可见`);

  const preview = await page.locator('text=剧本预览区').first();
  console.log(`   ${await preview.isVisible() ? '✓' : '✗'} 预览区可见`);

  const emptyHint = await page.locator('text=开始创作广告剧本').first();
  console.log(`   ${await emptyHint.isVisible() ? '✓' : '✗'} 空状态提示可见`);

  const input = page.locator('textarea');
  console.log(`   ${await input.isVisible() ? '✓' : '✗'} 输入框可见`);

  const step1 = await page.locator('text=产品解析').first();
  console.log(`   ${await step1.isVisible() ? '✓' : '✗'} 流程步骤可见`);

  console.log('\n2. 测试发送消息...');
  await input.fill('我有一款儿童益智积木玩具，适合3-6岁');

  // 用 Enter 键发送
  await input.press('Enter');

  // 等待用户消息出现
  await page.waitForTimeout(1000);
  const userMsg = await page.locator('text=儿童益智积木玩具').first();
  console.log(`   ${await userMsg.isVisible() ? '✓' : '✗'} 用户消息已显示`);

  // 等待 AI 开始流式回复
  console.log('   等待 AI 回复流...');
  try {
    await page.waitForFunction(
      () => {
        const proses = document.querySelectorAll('.prose');
        for (const p of proses) {
          if (p.textContent && p.textContent.length > 10) return true;
        }
        return false;
      },
      { timeout: 30000 }
    );
    console.log('   ✓ AI 回复流已开始');
  } catch {
    console.log('   ✗ AI 回复超时');
  }

  // 等待流完成（textarea 不再 disabled）
  try {
    await page.waitForFunction(
      () => {
        const textarea = document.querySelector('textarea');
        return textarea && !textarea.disabled;
      },
      { timeout: 60000 }
    );
    console.log('   ✓ AI 回复完成');
  } catch {
    console.log('   ✗ AI 回复未能完成');
  }

  // 截图
  await page.screenshot({ path: 'tools/ad-script/__tests__/screenshot-after-chat.png', fullPage: true });
  console.log('   ✓ 截图已保存');

  console.log('\n✅ E2E 冒烟测试完成');
  await browser.close();
}

main().catch((e) => {
  console.error('E2E 测试失败:', e.message);
  process.exit(1);
});
