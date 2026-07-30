// 節律引擎：以 Web Audio 時鐘做精準排程（lookahead scheduler）。
// 每個節奏分三階段變速：
//   1) 教學：很慢，走過 4 個循環，搭配文字提醒
//   2) 練習：稍微加快
//   3) 正式：正常速度，跑完整段
// 每階段前有一小節預備拍（畫面 3-2-1）。
//
// callbacks:
//   onStage(stage, index)                           進入新階段（更新階段提示文字）
//   onRest(n, stage, index)                         階段間休息倒數（提醒接下來的階段）
//   onCountIn(n, stage)                              預備拍倒數
//   onBeat(cue, beatInBar, barIndex, stageBars, stage)  每一正式拍
//   onComplete()                                    全部階段跑完

class RhythmEngine {
  constructor(pattern, audio, cb = {}) {
    this.p = pattern;
    this.audio = audio;
    this.cb = cb;
    this.beatsPerBar = pattern.beatsPerBar || 4;

    const seqLen = pattern.sequence.length;
    const base = pattern.bpm;
    // 三階段（速度倍率 + 拍數）
    this.stages = [
      { name: '教學', banner: '教學 · 放慢腳步，看清楚左右腳與方向', bpm: base * 0.5,  beats: seqLen * 4 },
      { name: '練習', banner: '練習 · 稍微加快，抓住節奏', bpm: base * 0.72, beats: seqLen * 4 },
      { name: '正式', banner: '正式開始 · 跟著音樂動起來！', bpm: base, beats: pattern.bars * this.beatsPerBar },
    ];
    this._buildEvents();

    this.running = false;
    this.paused = false;
    this.idx = 0;
    this.nextTime = 0;
    this.endTime = 0;
    this.pending = [];
    this._raf = null;
  }

  _buildEvents() {
    const seq = this.p.sequence;
    const seqLen = seq.length;
    const bpb = this.beatsPerBar;
    this.events = [];

    this.stages.forEach((st, si) => {
      st.beatDur = 60 / st.bpm;
      st.bars = Math.max(1, Math.round(st.beats / bpb));

      // 階段間休息 5 秒（第一階段除外）：靜下來，文字提醒接下來的階段並倒數
      if (si > 0) {
        for (let r = 5; r >= 1; r--) {
          this.events.push({ type: 'rest', n: r, dur: 1, stage: st, stageIndex: si });
        }
      }

      // 預備拍（一小節）
      for (let i = 0; i < bpb; i++) {
        this.events.push({
          type: 'countin', n: bpb - i, dur: st.beatDur,
          stage: st, stageIndex: si, stageStart: i === 0,
        });
      }
      // 正式拍
      for (let b = 0; b < st.beats; b++) {
        this.events.push({
          type: 'beat', dur: st.beatDur, stage: st, stageIndex: si,
          cue: seq[b % seqLen], beatInBar: b % bpb, barIndex: Math.floor(b / bpb), stageBars: st.bars,
        });
      }
    });
  }

  start() {
    this.running = true;
    this.paused = false;
    this.idx = 0;
    this.pending = [];
    this.nextTime = this.audio.now() + 0.2;
    this.endTime = this.nextTime;
    this._loop();
  }

  pause() {
    if (!this.running || this.paused) return;
    this.paused = true;
    if (this.audio.ctx && this.audio.ctx.state === 'running') this.audio.ctx.suspend();
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    if (this.audio.ctx && this.audio.ctx.state === 'suspended') this.audio.ctx.resume();
  }

  togglePause() {
    if (this.paused) this.resume();
    else this.pause();
    return this.paused;
  }

  stop() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  _scheduleAudio(ev, when) {
    if (ev.type === 'rest') {
      if (ev.n === 1) this.audio.hat(when); // 休息最後一秒輕點一下，準備開始
      return;
    }
    if (ev.type === 'countin') {
      this.audio.click(when, ev.n === 1);
      return;
    }
    const bi = ev.beatInBar;
    if (bi % 2 === 0) this.audio.kick(when);
    if (bi % 2 === 1) this.audio.snare(when);
    this.audio.hat(when);
    if (bi === 0) this.audio.bass(when, 98);
    if (ev.cue.accent) this.audio.accent(when, 880);
  }

  _loop() {
    if (!this.running) return;

    if (!this.paused) {
      const now = this.audio.now();

      // 1) 提前排程未來 0.12 秒內的事件（每個事件用自己的拍長 → 支援變速）
      while (this.idx < this.events.length && this.nextTime < now + 0.12) {
        const ev = this.events[this.idx];
        this._scheduleAudio(ev, this.nextTime);
        this.pending.push({ ev, time: this.nextTime });
        this.nextTime += ev.dur;
        this.endTime = this.nextTime;
        this.idx += 1;
      }

      // 2) 到點的畫面事件
      while (this.pending.length && now >= this.pending[0].time) {
        const ev = this.pending.shift().ev;
        if (ev.stageStart && this.cb.onStage) this.cb.onStage(ev.stage, ev.stageIndex);
        if (ev.type === 'rest') {
          if (this.cb.onRest) this.cb.onRest(ev.n, ev.stage, ev.stageIndex);
        } else if (ev.type === 'countin') {
          if (this.cb.onCountIn) this.cb.onCountIn(ev.n, ev.stage);
        } else if (this.cb.onBeat) {
          this.cb.onBeat(ev.cue, ev.beatInBar, ev.barIndex, ev.stageBars, ev.stage);
        }
      }

      // 3) 全部跑完
      if (this.idx >= this.events.length && this.pending.length === 0 && now >= this.endTime) {
        this.stop();
        if (this.cb.onComplete) this.cb.onComplete();
        return;
      }
    }

    this._raf = requestAnimationFrame(() => this._loop());
  }
}

window.RhythmEngine = RhythmEngine;
