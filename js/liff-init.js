// LIFF 整合：初始化、登入、解析 ?type=、關閉視窗。
// 與呼吸 App 相同，只是讀 STEP_PATTERNS。非 LINE 環境（瀏覽器直開）會 fallback 成 standalone。

// ⬇️ 在 LINE Developers Console 為「步伐訓練」建立 LIFF App 後，把這裡換成該 LIFF ID。
const LIFF_ID = 'YOUR_STEP_LIFF_ID';

window.AppLiff = {
  ready: false,
  standalone: true,
  profile: null,

  // 從一段字串取出 type，可吃 "?type=box"、"type=box"、"/?type=box"、"/path?type=box"。
  _readType(s) {
    if (!s) return null;
    const i = s.indexOf('?');
    const q = i >= 0 ? s.slice(i + 1) : s;
    return new URLSearchParams(q).get('type');
  },

  // 解析出「明確指定」的 type（合法才回傳，否則 null）。
  // 透過 https://liff.line.me/{id}?type=box 進入時，LINE 會把原始 query 包進 liff.state。
  _rawType() {
    const params = new URLSearchParams(window.location.search);
    let t = params.get('type');

    if (!t) {
      const state = params.get('liff.state');
      if (state) {
        let decoded = state;
        try { decoded = decodeURIComponent(state); } catch (_) { /* 保留原值 */ }
        t = this._readType(decoded);
      }
    }
    if (!t && window.location.hash) {
      t = this._readType(window.location.hash.replace(/^#/, ''));
    }
    return (t && window.STEP_PATTERNS[t]) ? t : null;
  },

  hasType() {
    return this._rawType() !== null;
  },

  getType() {
    return this._rawType() || window.DEFAULT_PATTERN;
  },

  async init() {
    const hasSdk = typeof window.liff !== 'undefined';
    const idSet = LIFF_ID && LIFF_ID !== 'YOUR_STEP_LIFF_ID';

    if (!hasSdk || !idSet) {
      this.standalone = true;
      this.ready = true;
      return;
    }

    try {
      await window.liff.init({ liffId: LIFF_ID });
      this.standalone = false;

      if (!window.liff.isInClient() && !window.liff.isLoggedIn()) {
        window.liff.login();
        return;
      }
      try {
        this.profile = await window.liff.getProfile();
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
      window.location.href = window.location.pathname;
    }
  },
};
