// LIFF 整合：初始化、登入、解析 ?type=、分享分數、關閉視窗。
// 與其他 App 相同，只是讀 HALLOWEEN_DIFFICULTY。非 LINE 環境（瀏覽器直開）會 fallback 成 standalone。

// ⬇️ 在 LINE Developers Console 為「Circle 搗蛋夜」建立 LIFF App 後，把這裡換成該 LIFF ID。
const LIFF_ID = 'YOUR_HALLOWEEN_LIFF_ID';

window.AppLiff = {
  ready: false,
  standalone: true,
  profile: null,

  // 從一段字串取出 type，可吃 "?type=hard"、"type=hard"、"/?type=hard"、"/path?type=hard"。
  _readType(s) {
    if (!s) return null;
    const i = s.indexOf('?');
    const q = i >= 0 ? s.slice(i + 1) : s;
    return new URLSearchParams(q).get('type');
  },

  // 解析出「明確指定」的 type（合法才回傳，否則 null）。
  // 透過 https://liff.line.me/{id}?type=hard 進入時，LINE 會把原始 query 包進 liff.state。
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
    return (t && window.HALLOWEEN_DIFFICULTY[t]) ? t : null;
  },

  hasType() {
    return this._rawType() !== null;
  },

  getType() {
    return this._rawType() || window.DEFAULT_PATTERN;
  },

  async init() {
    const hasSdk = typeof window.liff !== 'undefined';
    const idSet = LIFF_ID && LIFF_ID !== 'YOUR_HALLOWEEN_LIFF_ID';

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

  // 需在 LINE Developers Console 的 LIFF 設定開啟 shareTargetPicker。
  canShare() {
    return !this.standalone && !!window.liff &&
      typeof window.liff.isApiAvailable === 'function' &&
      window.liff.isApiAvailable('shareTargetPicker');
  },

  // 傳一張分數卡給好友。回傳 'sent' | 'cancelled' | 'failed'。
  async shareScore({ score, title, type, diffName }) {
    if (!this.canShare()) return 'failed';
    const who = (this.profile && this.profile.displayName) || '我';
    const url = 'https://liff.line.me/' + LIFF_ID + '?type=' + encodeURIComponent(type);

    const message = {
      type: 'flex',
      altText: who + ' 在Circle 搗蛋夜拿到 ' + score + ' 分！來挑戰吧 🎃',
      contents: {
        type: 'bubble',
        size: 'kilo',
        styles: { body: { backgroundColor: '#1d1233' }, footer: { backgroundColor: '#1d1233' } },
        body: {
          type: 'box', layout: 'vertical', spacing: 'sm', paddingAll: '20px',
          contents: [
            { type: 'text', text: '🎃 Circle 搗蛋夜 · ' + diffName, size: 'xs', color: '#ffb36b' },
            { type: 'text', text: who + ' 的戰績', size: 'sm', color: '#cfc4ea', margin: 'md' },
            { type: 'text', text: String(score), size: '4xl', weight: 'bold', color: '#ffd76a' },
            { type: 'text', text: '稱號：' + title, size: 'sm', color: '#efe8ff' },
          ],
        },
        footer: {
          type: 'box', layout: 'vertical', paddingAll: '12px',
          contents: [{
            type: 'button', style: 'primary', color: '#ff8a3d', height: 'sm',
            action: { type: 'uri', label: '我也要挑戰', uri: url },
          }],
        },
      },
    };

    try {
      const res = await window.liff.shareTargetPicker([message], { isMultiple: true });
      return res ? 'sent' : 'cancelled';
    } catch (err) {
      console.warn('shareTargetPicker 失敗：', err);
      return 'failed';
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
