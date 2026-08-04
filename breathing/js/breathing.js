// 呼吸引擎：依 pattern 跑「吸 / 屏 / 吐」階段、計時、循環，透過 callbacks 更新 UI 與音效。
// 用 requestAnimationFrame 累計實際經過時間，暫停時不累計，因此暫停/繼續精準。
//
// callbacks:
//   onPhaseStart(phase, cycleIndex, totalCycles)  進入新階段時（更新文字、呼吸圈、音效）
//   onTick(remainingSec, phase)                    每幀更新倒數秒數
//   onComplete()                                   全部循環完成

class BreathingEngine {
  constructor(pattern, callbacks = {}) {
    this.pattern = pattern;
    this.cb = callbacks;

    this.cycleIndex = 0;   // 0-based
    this.phaseIndex = 0;   // 0-based，pattern.phases 內
    this.phaseElapsed = 0; // 當前階段已過毫秒（不含暫停）
    this.lastFrame = 0;
    this.paused = false;
    this.running = false;
    this._raf = null;
  }

  get totalCycles() {
    return this.pattern.cycles;
  }

  get currentPhase() {
    return this.pattern.phases[this.phaseIndex];
  }

  start() {
    this.running = true;
    this.paused = false;
    this.cycleIndex = 0;
    this.phaseIndex = 0;
    this.phaseElapsed = 0;
    this.lastFrame = performance.now();
    this._emitPhaseStart();
    this._loop();
  }

  pause() {
    this.paused = true;
  }

  resume() {
    if (!this.running) return;
    this.paused = false;
    this.lastFrame = performance.now(); // 避免把暫停時間算進來
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

  _emitPhaseStart() {
    const phase = this.currentPhase;
    if (this.cb.onPhaseStart) {
      this.cb.onPhaseStart(phase, this.cycleIndex, this.totalCycles);
    }
  }

  _advance() {
    this.phaseIndex += 1;
    if (this.phaseIndex >= this.pattern.phases.length) {
      this.phaseIndex = 0;
      this.cycleIndex += 1;
    }
    if (this.cycleIndex >= this.totalCycles) {
      this.stop();
      if (this.cb.onComplete) this.cb.onComplete();
      return;
    }
    this.phaseElapsed = 0;
    this._emitPhaseStart();
  }

  _loop() {
    if (!this.running) return;

    const now = performance.now();
    if (!this.paused) {
      this.phaseElapsed += now - this.lastFrame;
    }
    this.lastFrame = now;

    const phase = this.currentPhase;
    const phaseMs = phase.sec * 1000;
    const remainingSec = Math.max(0, Math.ceil((phaseMs - this.phaseElapsed) / 1000));

    if (this.cb.onTick) this.cb.onTick(remainingSec, phase);

    if (this.phaseElapsed >= phaseMs) {
      this._advance();
    }

    if (this.running) {
      this._raf = requestAnimationFrame(() => this._loop());
    }
  }
}

window.BreathingEngine = BreathingEngine;
