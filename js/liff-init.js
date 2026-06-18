// LIFF 整合：初始化、登入、解析 ?type=、關閉視窗。
// 設計成「在 LINE 內」與「一般瀏覽器（開發測試）」都能運作：
// 若沒有 liff SDK 或 LIFF_ID 尚未設定，會自動 fallback 成 standalone 模式，方便本機測試。

// ⬇️ 在 LINE Developers Console 建立 LIFF App 後，把這裡換成你的 LIFF ID。
const LIFF_ID = 'YOUR_LIFF_ID';

window.AppLiff = {
  ready: false,
  standalone: true, // 非 LINE 環境（瀏覽器直開）
  profile: null,

  // 解析 ?type=，回傳合法的模式 id，否則用預設。
  getType() {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('type');
    if (t && window.BREATHING_PATTERNS[t]) return t;
    return window.DEFAULT_PATTERN;
  },

  async init() {
    const hasSdk = typeof window.liff !== 'undefined';
    const idSet = LIFF_ID && LIFF_ID !== 'YOUR_LIFF_ID';

    if (!hasSdk || !idSet) {
      this.standalone = true;
      this.ready = true;
      return;
    }

    try {
      await window.liff.init({ liffId: LIFF_ID });
      this.standalone = false;

      // 在外部瀏覽器開啟且未登入時導向登入；在 LINE App 內通常已登入。
      if (!window.liff.isInClient() && !window.liff.isLoggedIn()) {
        window.liff.login();
        return; // 會跳轉，後續不執行
      }

      try {
        this.profile = await window.liff.getProfile(); // { userId, displayName, ... }
      } catch (_) {
        this.profile = null;
      }

      this.ready = true;
    } catch (err) {
      console.warn('LIFF init 失敗，改用 standalone 模式：', err);
      this.standalone = true;
      this.ready = true;
    }
  },

  close() {
    if (!this.standalone && window.liff && window.liff.closeWindow) {
      window.liff.closeWindow();
    } else {
      // 瀏覽器測試時無法關閉 LIFF，重整回到選擇畫面。
      window.location.href = window.location.pathname;
    }
  },
};
