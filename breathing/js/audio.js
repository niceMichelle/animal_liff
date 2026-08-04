// 用 Web Audio API 生成柔和的階段提示音，免外部音檔。
// 設計：每次階段轉換時，播放一個帶淡入淡出的正弦音（避免爆音）。
// 瀏覽器要求使用者手勢後才能啟動 AudioContext，故由「開始」按鈕呼叫 resume()。

class BreathAudio {
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

  // 播放一個柔和提示音。freq：音高 Hz；duration：秒。
  cue(freq, duration = 0.6) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = this.ctx.createGain();
    // 淡入淡出包絡，避免喀噠聲
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }
}

window.BreathAudio = BreathAudio;
