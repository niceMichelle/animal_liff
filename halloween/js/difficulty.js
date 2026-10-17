// 三種難度（由 ?type= 指定，預設 normal）。新增難度只要在這裡加一筆。
// stay*：角色停留毫秒（開局 → 結束線性縮短）；gap*：兩次冒出的間隔毫秒；
// badRate：冒出壞角色的機率；maxUp：同時最多幾隻在洞外。

window.HALLOWEEN_DIFFICULTY = {
  easy: {
    name: '輕鬆',
    desc: '慢慢來，適合第一次玩',
    duration: 30,
    stayStart: 1300, stayEnd: 850,
    gapStart: 900,   gapEnd: 600,
    badRate: 0.15,
    maxUp: 2,
  },
  normal: {
    name: '標準',
    desc: '越後面越快，考驗眼明手快',
    duration: 30,
    stayStart: 1100, stayEnd: 650,
    gapStart: 750,   gapEnd: 450,
    badRate: 0.22,
    maxUp: 2,
  },
  hard: {
    name: '惡夢',
    desc: '三隻同時冒出，骷髏也更多',
    duration: 30,
    stayStart: 950, stayEnd: 520,
    gapStart: 600,  gapEnd: 330,
    badRate: 0.3,
    maxUp: 3,
  },
};

window.DEFAULT_PATTERN = 'normal';

// 依分數給稱號（由低到高，取第一個 score < max 的）。
window.HALLOWEEN_TITLES = [
  { max: 150,      title: '小小搗蛋鬼' },
  { max: 350,      title: '南瓜守護者' },
  { max: 600,      title: '墓園獵人' },
  { max: Infinity, title: '萬聖夜之王' },
];
