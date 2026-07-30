// 節律步伐模式定義（純資料）。
// sequence：一個循環的「每拍一個提示」，引擎循環播放直到 bars 小節拍滿。
//   foot : 'L' | 'R' | 'both'  哪隻腳動作（高亮 + 抬起）
//   dir  : 'front'|'back'|'left'|'right'|null  方向箭頭
//   x    : 該腳的左右目標位置（單位，約 34px；負左正右）。省略＝維持原位（原地）
//   y    : 該腳的前後目標位置（單位；負前正後）。省略＝回到地面線 0
//   accent: true 為重音拍（較大脈動 + 重音提示）
// 待機位置：左腳 x=-1、右腳 x=+1。腳印會平滑滑到 cue 指定位置並停住，做出位移感。

window.STEP_PATTERNS = {
  march: {
    id: 'march',
    name: '原地踏步',
    intro: '跟著節拍左右交替原地踏步，找回節奏、輕鬆暖身。',
    situation: '熱身、久坐後動一動、初學者與長輩',
    difficulty: '入門',
    bpm: 92,
    beatsPerBar: 4,
    bars: 38,
    sequence: [
      { label: '左', foot: 'L', dir: null, accent: true },
      { label: '右', foot: 'R', dir: null },
      { label: '左', foot: 'L', dir: null, accent: true },
      { label: '右', foot: 'R', dir: null },
    ],
  },

  sidestep: {
    id: 'sidestep',
    name: '左右併步',
    intro: '向右踏一步、左腳併過來，再向左踏、右腳併過來，左右來回。',
    situation: '有氧入門、提升左右協調',
    difficulty: '初級',
    bpm: 112,
    beatsPerBar: 4,
    bars: 47,
    sequence: [
      { label: '右踏', foot: 'R', dir: 'right', x: 2.4, accent: true },
      { label: '左併', foot: 'L', dir: 'right', x: 1.0 }, // 左腳併到右腳旁（留間距不重疊）
      { label: '左踏', foot: 'L', dir: 'left', x: -2.4, accent: true },
      { label: '右併', foot: 'R', dir: 'left', x: -1.0 }, // 右腳併到左腳旁（留間距不重疊）
    ],
  },

  box: {
    id: 'box',
    name: '方塊步',
    intro: '雙腳與肩同寬站好：右腳往左前交叉、左腳往右前交叉，再依序退回原位，走出一個方塊。',
    situation: '節奏感與方向協調、進階暖身',
    difficulty: '中級',
    bpm: 124,
    beatsPerBar: 4,
    bars: 52,
    // 起始：左腳(-1,0)、右腳(1,0)。方塊四角：上排 y=-2（前），下排 y=0（後）。
    sequence: [
      { label: '右前交叉', foot: 'R', dir: 'front', x: -1, y: -2, accent: true }, // 右腳→左前角
      { label: '左前交叉', foot: 'L', dir: 'front', x: 1, y: -2, accent: true },  // 左腳→右前角
      { label: '右腳退回', foot: 'R', dir: 'back', x: 1, y: 0 },                  // 右腳→右後角(原位)
      { label: '左腳退回', foot: 'L', dir: 'back', x: -1, y: 0 },                 // 左腳→左後角(原位)
    ],
  },

  combo: {
    id: 'combo',
    name: '綜合舞步',
    intro: '隨機組合原地踏步、左右併步與方塊步三種舞步；教學階段先帶你逐一複習，再串成一段節奏。',
    situation: '複習並整合三種基本舞步、全身協調',
    difficulty: '進階',
    bpm: 116,
    beatsPerBar: 4,
    bars: 36, // 每段舞步 4 拍(=1 小節)，三段=3 小節/圈；36 小節=12 圈
    sequence: [], // 由 buildComboSequence() 隨機組合三種基本舞步填入
  },
};

// —— 綜合舞步：隨機串接「原地踏步 / 左右併步 / 方塊步」三段 ——
// 三段都會出現、順序隨機；每段開頭標記 reset，讓腳步先回中立站姿再開始，避免銜接時重疊。
function _shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function buildComboSequence() {
  const P = window.STEP_PATTERNS;
  const blocks = _shuffle([P.march, P.sidestep, P.box]);
  const seq = [];
  blocks.forEach((bp, bi) => {
    const nextName = blocks[(bi + 1) % blocks.length].name; // 下一段舞步（循環時回到開頭）
    bp.sequence.forEach((cue, i) => {
      const c = Object.assign({}, cue);
      c.move = bp.name;       // 目前這一段是哪種舞步
      c.nextMove = nextName;  // 接下來要換的舞步（供預告）
      if (i === 0) c.reset = true; // 每段開始回到中立站姿
      seq.push(c);
    });
  });
  return seq;
}
window.STEP_PATTERNS.combo.sequence = buildComboSequence();
window.rebuildCombo = function () {
  window.STEP_PATTERNS.combo.sequence = buildComboSequence();
};

window.DEFAULT_PATTERN = 'march';
