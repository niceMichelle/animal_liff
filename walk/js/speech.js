// 題目朗讀：瀏覽器內建 speechSynthesis（免音檔、免後端）。
// 優先用 zh-TW 語音，沒有就退回任何 zh 語音；不支援的環境靜默略過。
// iOS 需在使用者手勢內先發聲一次才會解鎖，所以在「開始」按鈕呼叫 unlock()。

window.WalkSpeech = {
  enabled: true,
  _voice: null,

  get supported() {
    return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined';
  },

  _pickVoice() {
    if (!this.supported) return;
    const voices = window.speechSynthesis.getVoices();
    this._voice =
      voices.find((v) => /zh[-_]TW/i.test(v.lang)) ||
      voices.find((v) => /^zh/i.test(v.lang)) ||
      null;
  },

  init() {
    if (!this.supported) return;
    this._pickVoice();
    // 部分瀏覽器的語音清單是非同步載入
    window.speechSynthesis.addEventListener('voiceschanged', () => this._pickVoice());
  },

  unlock() {
    if (!this.supported) return;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
  },

  // rate 依節奏微調：題目要在一小節內唸完，又不能快到聽不清
  speak(text, rate = 1) {
    if (!this.enabled || !this.supported || !text) return;
    window.speechSynthesis.cancel(); // 新題目蓋掉還沒唸完的舊題目
    const u = new SpeechSynthesisUtterance(text);
    u.lang = this._voice ? this._voice.lang : 'zh-TW';
    if (this._voice) u.voice = this._voice;
    u.rate = rate;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  },

  cancel() {
    if (this.supported) window.speechSynthesis.cancel();
  },
};

window.WalkSpeech.init();
