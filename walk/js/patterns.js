// 認知步行模式定義（資料 + 題目產生器）。
// 腳步固定為左右交替原地踏步；認知任務疊加在節拍上（雙重任務：邊走邊說）。
//   sequence   : 每拍一個腳步提示（同節律步伐 march 的 L/R）
//   taskEvery  : 每幾拍換一題（0 / 省略 = 整個階段只有一題）
//   reset()    : 每次開始前重置題目狀態（洗牌）
//   instruction(stage) : 該階段的任務說明（顯示在題目卡上方，預備拍時朗讀）
//   makeTask(serial, stage) : 回傳 { prompt, speak, answer, color }
//       prompt 題目文字；speak 換題時朗讀（空字串 = 不唸）；answer 下一題時揭示；color Stroop 字色
//   beatLabel(beatInStage, stage) : 選用，覆寫中央提示文字（如報數的數字）
// 開始前請在安全空間原地踏步或慢走，眼睛不必一直盯著手機。

const WALK_STEPS = [
  { label: '左', foot: 'L', accent: true },
  { label: '右', foot: 'R' },
  { label: '左', foot: 'L', accent: true },
  { label: '右', foot: 'R' },
];

function _shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

const CATEGORIES = [
  '水果', '動物', '蔬菜', '交通工具', '顏色', '國家',
  '廚房用品', '運動', '花', '台灣小吃', '職業', '家具',
  '樂器', '海裡的生物', '文具', '衣服',
];

// Stroop 四色：在深色題目卡上都清楚可辨
const STROOP_COLORS = [
  { name: '紅', hex: '#ff5a5f' },
  { name: '藍', hex: '#4d8dff' },
  { name: '綠', hex: '#3ccf6e' },
  { name: '黃', hex: '#ffd23f' },
];

window.WALK_PATTERNS = {
  count: {
    id: 'count',
    name: '踏步報數',
    intro: '每踩一步大聲數一個數：先從 1 數到 10，正式時改成 2、4、6 跳著數。',
    situation: '入門暖身、長輩與初學者；請原地踏步或在安全空間慢走',
    difficulty: '入門',
    bpm: 88,
    beatsPerBar: 4,
    bars: 30,
    sequence: WALK_STEPS,
    taskEvery: 0,
    reset() {},
    instruction(stage) {
      return stage.name === '正式' ? '每一步跳著數，數到 20 再從 2 開始' : '每一步數一個數，數到 10 再從 1 開始';
    },
    makeTask(serial, stage) {
      return stage.name === '正式'
        ? { prompt: '2、4、6 … 20', speak: '換成跳著數，二、四、六，數到二十', answer: '' }
        : { prompt: '1 → 10', speak: '跟著腳步，從一數到十', answer: '' };
    },
    beatLabel(b, stage) {
      const n = (b % 10) + 1;
      return String(stage.name === '正式' ? n * 2 : n);
    },
  },

  category: {
    id: 'category',
    name: '分類說詞',
    intro: '每兩小節出一個類別，例如水果、動物；每踩一步說出一個屬於它的詞，盡量不重複。',
    situation: '語詞流暢度、反應與記憶；請原地踏步或在安全空間慢走',
    difficulty: '初級',
    bpm: 84,
    beatsPerBar: 4,
    bars: 24,
    sequence: WALK_STEPS,
    taskEvery: 8,
    _deck: [],
    reset() { this._deck = _shuffle(CATEGORIES.slice()); },
    instruction() { return '每一步說一個，不重複'; },
    makeTask(serial) {
      const c = this._deck[serial % this._deck.length];
      return { prompt: c, speak: '說出' + c, answer: '' };
    },
  },

  stroop: {
    id: 'stroop',
    name: '顏色字反應',
    intro: '畫面出現有顏色的字，例如用藍色寫的「紅」；每小節說出字的「顏色」，而不是字本身。',
    situation: '專注力與抑制控制、進階挑戰；請原地踏步或在安全空間慢走',
    difficulty: '進階',
    bpm: 80,
    beatsPerBar: 4,
    bars: 32,
    sequence: WALK_STEPS,
    taskEvery: 4,
    _last: null,
    reset() { this._last = null; },
    instruction() { return '說出字的「顏色」，不是字'; },
    makeTask() {
      // 字義與字色一定錯配，且不連續出現同一個字
      let word;
      do { word = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)]; }
      while (this._last && word.name === this._last.name);
      const others = STROOP_COLORS.filter((c) => c.name !== word.name);
      const ink = others[Math.floor(Math.random() * others.length)];
      this._last = word;
      return { prompt: word.name, speak: '', answer: ink.name, color: ink.hex };
    },
  },
};

window.DEFAULT_PATTERN = 'count';
