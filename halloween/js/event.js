// 「最高分送禮物」活動設定與排行榜 API。
// 分數真正的判定（活動期間、身分、防作弊、排名）都在 n8n（n8n/halloween-leaderboard.json），
// 這裡的期間只用來決定畫面要不要顯示活動橫幅、要不要上傳分數。

window.HALLOWEEN_EVENT = {
  start: '2026-10-25T00:00:00+08:00',
  end: '2026-11-01T00:00:00+08:00',   // 不含：10/31 23:59:59 為最後一刻
  label: '10/25（六）～ 10/31（五）',
  types: ['normal', 'hard'],           // 計入活動的難度，各自排名、各送第一名
  prizeOrder: ['hard', 'normal'],      // 每人限領一份：同時是多個難度第一名時，依此順序只頒第一個，其餘由下一名遞補
  prize: '萬聖節神秘禮物',              // ⬅️ 換成實際的禮物名稱

  // ⬇️ n8n Webhook 的網址前綴（不含最後的 /session、/score），
  //    例如 'https://你的帳號.app.n8n.cloud/webhook/halloween'
  api: 'https://circle--n8n--cg72dwtmgvbz.code.run/webhook/halloween',
};

window.HalloweenEvent = {
  // 'upcoming' | 'active' | 'ended'
  phase(now = Date.now()) {
    const e = window.HALLOWEEN_EVENT;
    if (now < Date.parse(e.start)) return 'upcoming';
    if (now < Date.parse(e.end)) return 'active';
    return 'ended';
  },

  configured() {
    const api = window.HALLOWEEN_EVENT.api;
    return !!api && api !== 'YOUR_N8N_WEBHOOK_BASE';
  },

  counts(type) {
    return window.HALLOWEEN_EVENT.types.indexOf(type) >= 0;
  },

  // 這一局會不會計入排行榜：活動中、活動難度、在 LINE 裡登入、拿得到 ID Token
  eligible(type) {
    return this.configured() &&
      this.phase() === 'active' &&
      this.counts(type) &&
      !window.AppLiff.standalone &&
      !!window.AppLiff.idToken();
  },

  async _post(path, body) {
    const res = await fetch(window.HALLOWEEN_EVENT.api + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    let data = null;
    try { data = await res.json(); } catch (_) { /* 非 JSON 回應 */ }
    if (!res.ok || !data || data.error) throw new Error((data && data.error) || ('HTTP ' + res.status));
    return data;
  },

  // 開局時向伺服器領一張場次憑證（記錄開始時間，防止重複上傳與縮短時間）
  startSession() {
    return this._post('/session', { idToken: window.AppLiff.idToken() })
      .then((d) => d.session);
  },

  // 上傳一局成績，回傳 { ok, reason?, me: { rank, best }, top: [{ rank, name, score, me }], total }
  submit(session, type, summary) {
    return this._post('/score', {
      idToken: window.AppLiff.idToken(),
      session,
      type,
      score: summary.score,
      hits: summary.hits,
      bad: summary.bad,
      bestCombo: summary.bestCombo,
      log: summary.log,
    });
  },
};
