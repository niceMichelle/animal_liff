// 用 Web Audio API 生成遊戲音效，免外部音檔（改自 breathing/js/audio.js 的 BreathAudio）。
// 瀏覽器要求使用者手勢後才能啟動 AudioContext，故由「開始」按鈕呼叫 unlock()。

class HalloweenSfx {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  // 在使用者手勢中呼叫（例如點「開始」），建立並解除暫停 AudioContext。
  async unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return; // 環境不支援則靜默略過
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setEnabled(on) {
    this.enabled = on;
  }

  // 播放一個音。type：波形；slideTo：結束時滑到的音高（Hz，可省略）；delay：延遲秒數。
  tone(freq, duration = 0.15, { type = 'sine', volume = 0.16, slideTo = null, delay = 0 } = {}) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);

    const gain = this.ctx.createGain();
    // 淡入淡出包絡，避免喀噠聲
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  // 打中好角色：Combo 越高音越高
  hit(combo = 1) {
    const base = 520 * Math.pow(2, Math.min(combo - 1, 12) / 12);
    this.tone(base, 0.12, { type: 'triangle', volume: 0.2 });
    this.tone(base * 1.5, 0.14, { type: 'triangle', volume: 0.14, delay: 0.05 });
  }

  // 打到壞角色：低沉下滑
  bad() {
    this.tone(220, 0.35, { type: 'square', volume: 0.08, slideTo: 80 });
  }

  // 好角色逃走（沒打到）
  miss() {
    this.tone(330, 0.12, { type: 'sine', volume: 0.07, slideTo: 260 });
  }

  // 開局倒數 3、2、1
  tick() {
    this.tone(660, 0.12, { type: 'sine', volume: 0.16 });
  }

  // 開始！
  go() {
    this.tone(880, 0.25, { type: 'triangle', volume: 0.2 });
  }

  // 最後 5 秒提醒
  hurry() {
    this.tone(990, 0.07, { type: 'square', volume: 0.05 });
  }

  // 時間到：小小的下行琶音（詭譎的減和弦）
  end() {
    [784, 659, 554, 440].forEach((f, i) => {
      this.tone(f, 0.3, { type: 'triangle', volume: 0.16, delay: i * 0.12 });
    });
  }
}

window.HalloweenSfx = HalloweenSfx;
