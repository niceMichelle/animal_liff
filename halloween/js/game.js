// 打地鼠引擎：冒出角色、計時、計分、Combo、暫停/繼續。
// 不碰 DOM，只透過 on.* 回呼通知介面：
//   up(i, key, stayMs)       角色從第 i 個洞冒出
//   down(i, reason)          角色縮回：'hit' 被打到、'escape' 逃走、'clear' 暫停或結束時收回
//   score(info)              打中（含扣分）：{ i, key, good, delta, combo, mult, score }
//   escape(i, key)           好角色沒被打到就逃走（Combo 歸零）
//   tick(secondsLeft)        剩餘秒數變動時
//   end(summary)             時間到：{ score, hits, bad, escaped, bestCombo, log }
//
// log 是本局的打擊紀錄 [{ t: 遊戲內毫秒, k: 角色, x?: 1 表示逃走 }]，
// 活動排行榜的伺服器端會用它重算分數，確認與上傳的分數一致。

class WhackGame {
  constructor({ holes, config, characters, on = {} }) {
    this.n = holes;
    this.cfg = config;
    this.chars = characters;
    this.on = on;

    const keys = Object.keys(characters);
    this.goodKeys = keys.filter((k) => characters[k].good);
    this.badKeys = keys.filter((k) => !characters[k].good);

    this.running = false;
    this.paused = false;
    this._reset();
  }

  _reset() {
    this.slots = new Array(this.n).fill(null); // { key, timer }
    this.freedAt = new Array(this.n).fill(0);  // 剛縮回的洞短暫不再使用，讓打中動畫播完
    this.lastHole = -1;
    this.score = 0;
    this.combo = 0;
    this.stats = { hits: 0, bad: 0, escaped: 0, bestCombo: 0 };
    this.log = [];
    this.startAt = 0;
    this.pausedAt = 0;
    this.pausedTotal = 0;
    this.lastSec = null;
    this.spawnTimer = null;
    this.tickTimer = null;
  }

  // —— 生命週期 ——
  start() {
    this.stop();
    this._reset();
    this.running = true;
    this.paused = false;
    this.startAt = performance.now();
    this._tick();
    this.tickTimer = setInterval(() => this._tick(), 100);
    this._scheduleSpawn(350);
  }

  pause() {
    if (!this.running || this.paused) return;
    this.paused = true;
    this.pausedAt = performance.now();
    clearTimeout(this.spawnTimer);
    clearInterval(this.tickTimer);
    this._clearAll();
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.pausedTotal += performance.now() - this.pausedAt;
    this.paused = false;
    this.tickTimer = setInterval(() => this._tick(), 100);
    this._scheduleSpawn(500);
  }

  // 中途離開（不觸發 end）
  stop() {
    this.running = false;
    this.paused = false;
    clearTimeout(this.spawnTimer);
    clearInterval(this.tickTimer);
    this._clearAll();
  }

  // —— 時間 ——
  _elapsed() {
    const now = this.paused ? this.pausedAt : performance.now();
    return now - this.startAt - this.pausedTotal;
  }

  // 0 → 1 的遊戲進度，用來讓節奏越來越快
  _progress() {
    return Math.min(1, Math.max(0, this._elapsed() / (this.cfg.duration * 1000)));
  }

  _lerp(a, b) {
    return a + (b - a) * this._progress();
  }

  _tick() {
    const remain = this.cfg.duration * 1000 - this._elapsed();
    const sec = Math.max(0, Math.ceil(remain / 1000));
    if (sec !== this.lastSec) {
      this.lastSec = sec;
      this.on.tick && this.on.tick(sec);
    }
    if (remain <= 0) this._finish();
  }

  _finish() {
    if (!this.running) return;
    this.stop();
    this.on.end && this.on.end({ score: this.score, ...this.stats, log: this.log });
  }

  // —— 冒出 ——
  _scheduleSpawn(delay) {
    clearTimeout(this.spawnTimer);
    this.spawnTimer = setTimeout(() => this._spawn(), delay);
  }

  _pickKey() {
    const pool = (Math.random() < this.cfg.badRate && this.badKeys.length) ? this.badKeys : this.goodKeys;
    const total = pool.reduce((s, k) => s + this.chars[k].weight, 0);
    let r = Math.random() * total;
    for (const k of pool) {
      r -= this.chars[k].weight;
      if (r < 0) return k;
    }
    return pool[pool.length - 1];
  }

  _spawn() {
    if (!this.running || this.paused) return;

    const now = performance.now();
    const upCount = this.slots.filter(Boolean).length;
    let free = [];
    for (let i = 0; i < this.n; i++) {
      if (!this.slots[i] && now - this.freedAt[i] > 280) free.push(i);
    }
    // 盡量不要連續兩次從同一個洞冒出
    if (free.length > 1) free = free.filter((i) => i !== this.lastHole);

    if (upCount < this.cfg.maxUp && free.length) {
      const i = free[Math.floor(Math.random() * free.length)];
      const key = this._pickKey();
      const stay = Math.round(this._lerp(this.cfg.stayStart, this.cfg.stayEnd) * this.chars[key].stayMul);
      this.slots[i] = { key, timer: setTimeout(() => this._escape(i), stay) };
      this.lastHole = i;
      this.on.up && this.on.up(i, key, stay);
    }

    const gap = this._lerp(this.cfg.gapStart, this.cfg.gapEnd) * (0.8 + Math.random() * 0.4);
    this._scheduleSpawn(gap);
  }

  _free(i) {
    const slot = this.slots[i];
    if (!slot) return null;
    clearTimeout(slot.timer);
    this.slots[i] = null;
    this.freedAt[i] = performance.now();
    return slot;
  }

  _escape(i) {
    const slot = this._free(i);
    if (!slot) return;
    if (this.chars[slot.key].good) {
      this.combo = 0;
      this.stats.escaped++;
      this.log.push({ t: Math.round(this._elapsed()), k: slot.key, x: 1 });
      this.on.escape && this.on.escape(i, slot.key);
    }
    this.on.down && this.on.down(i, 'escape');
  }

  _clearAll() {
    for (let i = 0; i < this.n; i++) {
      if (this._free(i)) this.on.down && this.on.down(i, 'clear');
    }
  }

  // —— 玩家點擊 ——
  // 回傳是否有打到角色（空洞回傳 false）
  hit(i) {
    if (!this.running || this.paused) return false;
    const slot = this._free(i);
    if (!slot) return false;

    const ch = this.chars[slot.key];
    this.log.push({ t: Math.round(this._elapsed()), k: slot.key });
    let delta, mult = 1;
    if (ch.good) {
      this.combo++;
      this.stats.hits++;
      this.stats.bestCombo = Math.max(this.stats.bestCombo, this.combo);
      mult = WhackGame.multiplier(this.combo);
      delta = ch.points * mult;
      this.score += delta;
    } else {
      this.combo = 0;
      this.stats.bad++;
      const before = this.score;
      this.score = Math.max(0, this.score - ch.points);
      delta = this.score - before;
    }

    this.on.score && this.on.score({
      i, key: slot.key, good: ch.good, delta, combo: this.combo, mult, score: this.score,
    });
    this.on.down && this.on.down(i, 'hit');
    return true;
  }

  // 連擊 5 下 ×2、10 下 ×3、15 下以上 ×4
  static multiplier(combo) {
    return 1 + Math.min(3, Math.floor(combo / 5));
  }
}

window.WhackGame = WhackGame;
