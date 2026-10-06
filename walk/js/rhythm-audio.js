// 用 Web Audio API 生成節拍鼓組與提示音，免外部音檔。
// 全部以 Oscillator / Noise + GainNode 包絡合成；由引擎以「絕對排程時間 when」呼叫，
// when 為 audioContext.currentTime 座標，可精準排在未來某拍。

class RhythmAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseBuf = null;
    this.enabled = true;
  }

  now() {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  // 在使用者手勢中呼叫（點「開始」），建立並解除暫停 AudioContext。
  async unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
      this._makeNoise();
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  setEnabled(on) {
    this.enabled = on;
  }

  _makeNoise() {
    const len = Math.floor(this.ctx.sampleRate * 0.5);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
  }

  _noiseHit(when, hpFreq, peak, dur) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = hpFreq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(peak, when);
    g.gain.exponentialRampToValueAtTime(0.0008, when + dur);
    src.connect(hp).connect(g).connect(this.master);
    src.start(when);
    src.stop(when + dur + 0.02);
  }

  _tone(when, type, f0, f1, peak, dur) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, when);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, when + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0008, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, when + dur);
    o.connect(g).connect(this.master);
    o.start(when);
    o.stop(when + dur + 0.03);
  }

  kick(when) {
    if (!this.enabled || !this.ctx) return;
    this._tone(when, 'sine', 150, 50, 0.95, 0.16);
  }

  snare(when) {
    if (!this.enabled || !this.ctx) return;
    this._noiseHit(when, 1200, 0.5, 0.16);
    this._tone(when, 'triangle', 220, 180, 0.25, 0.12);
  }

  hat(when) {
    if (!this.enabled || !this.ctx) return;
    this._noiseHit(when, 7000, 0.22, 0.045);
  }

  // 每小節的低音（增加音樂性）
  bass(when, freq) {
    if (!this.enabled || !this.ctx) return;
    this._tone(when, 'triangle', freq, freq, 0.3, 0.28);
  }

  // 重音提示（步伐落點）
  accent(when, freq = 880) {
    if (!this.enabled || !this.ctx) return;
    this._tone(when, 'square', freq, freq, 0.12, 0.09);
  }

  // 預備拍的清脆 click
  click(when, high) {
    if (!this.enabled || !this.ctx) return;
    this._tone(when, 'square', high ? 1400 : 900, high ? 1400 : 900, 0.14, 0.06);
  }
}

window.RhythmAudio = RhythmAudio;
