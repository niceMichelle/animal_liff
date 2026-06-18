// 呼吸模式定義（純資料）。新增模式只需在此加一筆，breathing.js 會自動套用。
// 每個 phase：label 顯示文字、sec 秒數、scale 呼吸圈目標縮放比例、tone 音高（Hz，給 audio.js）。
// scale 約定：吸氣放大到 1.0、屏息維持、吐氣縮小到 0.45。

window.BREATHING_PATTERNS = {
  '478': {
    id: '478',
    name: '4-7-8 呼吸法',
    intro: '吸氣 4 秒、屏息 7 秒、吐氣 8 秒。幫助快速放鬆、更好入睡。',
    cycles: 4,
    phases: [
      { label: '吸氣', sec: 4, scale: 1.0, tone: 396 },
      { label: '屏息', sec: 7, scale: 1.0, tone: 528 },
      { label: '吐氣', sec: 8, scale: 0.45, tone: 288 },
    ],
  },

  box: {
    id: 'box',
    name: '箱式呼吸法',
    intro: '吸氣 4 秒、屏息 4 秒、吐氣 4 秒、屏息 4 秒。穩定情緒、提升專注。',
    cycles: 5,
    phases: [
      { label: '吸氣', sec: 4, scale: 1.0, tone: 396 },
      { label: '屏息', sec: 4, scale: 1.0, tone: 528 },
      { label: '吐氣', sec: 4, scale: 0.45, tone: 288 },
      { label: '屏息', sec: 4, scale: 0.45, tone: 528 },
    ],
  },

  belly: {
    id: 'belly',
    name: '腹式呼吸',
    intro: '一手放在腹部，吸氣 4 秒讓腹部鼓起、吐氣 6 秒緩緩收回。拉長吐氣安定神經。',
    cycles: 7,
    phases: [
      { label: '吸氣（腹部鼓起）', sec: 4, scale: 1.0, tone: 396 },
      { label: '吐氣（腹部收回）', sec: 6, scale: 0.45, tone: 288 },
    ],
  },

  mindful: {
    id: 'mindful',
    name: '正念呼吸',
    intro: '自然地吸氣 4 秒、吐氣 4 秒，把注意力溫柔地放回呼吸。',
    cycles: 9,
    phases: [
      { label: '吸氣，感受空氣進入', sec: 4, scale: 1.0, tone: 396 },
      { label: '吐氣，放下念頭', sec: 4, scale: 0.45, tone: 288 },
    ],
  },
};

window.DEFAULT_PATTERN = '478';
