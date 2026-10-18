// Circle 搗蛋夜的角色資料。新增角色只要在這裡加一筆，引擎與圖鑑會自動套用。
// good：打到加分（加入 Combo 倍率）；bad：打到扣分、Combo 歸零。
// weight：同一陣營內被抽中的機率權重；stayMul：停留時間倍率（越小越快縮回去）。
// svg：viewBox 0 0 100 100，角色下半部會被洞口土堆擋住，臉放在上半部。

window.HALLOWEEN_CHARACTERS = {
  cat: {
    name: '黑貓巫師',
    good: true,
    points: 10,
    weight: 3,
    stayMul: 1,
    svg: `
      <svg viewBox="0 0 100 100">
        <path d="M22 100 C20 72 30 58 50 58 C70 58 80 72 78 100 Z" fill="#241b3a" stroke="#8a74c9" stroke-width="2"/>
        <path d="M27 54 L25 27 L44 41 Z M73 54 L75 27 L56 41 Z" fill="#241b3a" stroke="#8a74c9" stroke-width="2" stroke-linejoin="round"/>
        <path d="M30 45 L29 33 L39 40 Z M70 45 L71 33 L61 40 Z" fill="#ff9bb3"/>
        <ellipse cx="50" cy="60" rx="27" ry="22" fill="#241b3a" stroke="#8a74c9" stroke-width="2"/>
        <path d="M50 4 C46 14 42 24 36 36 L64 36 C60 26 58 18 62 8 C58 10 54 8 50 4 Z" fill="#6b3fa0" stroke="#b48ae8" stroke-width="1.5" stroke-linejoin="round"/>
        <ellipse cx="50" cy="37" rx="22" ry="4.5" fill="#6b3fa0" stroke="#b48ae8" stroke-width="1.5"/>
        <rect x="38" y="30" width="24" height="4" fill="#ff8a3d"/>
        <ellipse cx="40" cy="60" rx="5.5" ry="6.5" fill="#ffd76a"/>
        <ellipse cx="60" cy="60" rx="5.5" ry="6.5" fill="#ffd76a"/>
        <ellipse cx="40" cy="61" rx="1.8" ry="5" fill="#120c22"/>
        <ellipse cx="60" cy="61" rx="1.8" ry="5" fill="#120c22"/>
        <path d="M47.5 68 h5 l-2.5 3 z" fill="#ff9bb3"/>
        <path d="M50 71 q-3 3 -6 1 M50 71 q3 3 6 1" fill="none" stroke="#8a74c9" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M34 68 h-12 M34 71 l-11 3 M66 68 h12 M66 71 l11 3" stroke="#8a74c9" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`,
  },

  bat: {
    name: '小蝙蝠',
    good: true,
    points: 10,
    weight: 3,
    stayMul: 1,
    svg: `
      <svg viewBox="0 0 100 100">
        <path d="M40 66 C30 52 16 52 3 42 C8 54 3 62 6 74 C12 69 18 72 21 80 C27 73 33 75 37 82 Z" fill="#3b2a55" stroke="#9c86d6" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M60 66 C70 52 84 52 97 42 C92 54 97 62 94 74 C88 69 82 72 79 80 C73 73 67 75 63 82 Z" fill="#3b2a55" stroke="#9c86d6" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M35 56 L32 34 L47 48 Z M65 56 L68 34 L53 48 Z" fill="#5b4280" stroke="#9c86d6" stroke-width="1.5" stroke-linejoin="round"/>
        <ellipse cx="50" cy="70" rx="21" ry="24" fill="#5b4280" stroke="#9c86d6" stroke-width="1.5"/>
        <ellipse cx="50" cy="80" rx="11" ry="10" fill="#7a5ea8"/>
        <circle cx="42" cy="63" r="6.5" fill="#fff"/>
        <circle cx="58" cy="63" r="6.5" fill="#fff"/>
        <circle cx="43" cy="64" r="3.2" fill="#1a1028"/>
        <circle cx="57" cy="64" r="3.2" fill="#1a1028"/>
        <circle cx="44" cy="62.5" r="1" fill="#fff"/>
        <circle cx="58" cy="62.5" r="1" fill="#fff"/>
        <path d="M44 72 q6 4 12 0" fill="none" stroke="#1a1028" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M45.5 73 l1.5 4 l1.5 -3.5 Z M51.5 73.5 l1.5 3.5 l1.5 -4 Z" fill="#fff"/>
        <ellipse cx="36" cy="71" rx="3.5" ry="2" fill="#ff9bb3" opacity="0.6"/>
        <ellipse cx="64" cy="71" rx="3.5" ry="2" fill="#ff9bb3" opacity="0.6"/>
      </svg>`,
  },

  owl: {
    name: '貓頭鷹',
    good: true,
    points: 15,
    weight: 2,
    stayMul: 0.9,
    svg: `
      <svg viewBox="0 0 100 100">
        <path d="M30 46 L26 28 L42 40 Z M70 46 L74 28 L58 40 Z" fill="#7a5a3e"/>
        <ellipse cx="50" cy="70" rx="27" ry="31" fill="#7a5a3e" stroke="#c49a6c" stroke-width="1.5"/>
        <path d="M24 74 C26 90 34 98 40 100 L30 100 C24 94 22 84 24 74 Z M76 74 C74 90 66 98 60 100 L70 100 C76 94 78 84 76 74 Z" fill="#5e4430"/>
        <circle cx="39" cy="58" r="12.5" fill="#e9d6b0"/>
        <circle cx="61" cy="58" r="12.5" fill="#e9d6b0"/>
        <circle cx="39" cy="58" r="7.5" fill="#ffd76a"/>
        <circle cx="61" cy="58" r="7.5" fill="#ffd76a"/>
        <circle cx="39" cy="58" r="3.8" fill="#1a1020"/>
        <circle cx="61" cy="58" r="3.8" fill="#1a1020"/>
        <circle cx="40.5" cy="56.5" r="1.3" fill="#fff"/>
        <circle cx="62.5" cy="56.5" r="1.3" fill="#fff"/>
        <path d="M46.5 66 h7 l-3.5 7 z" fill="#f19a3e"/>
        <path d="M42 82 q2 3 4 0 M48 86 q2 3 4 0 M54 82 q2 3 4 0" fill="none" stroke="#c49a6c" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`,
  },

  rabbit: {
    name: '南瓜兔子',
    good: true,
    points: 20,
    weight: 1,
    stayMul: 0.7,
    svg: `
      <svg viewBox="0 0 100 100">
        <path d="M39 52 C30 36 29 12 36 5 C44 9 47 32 45 52 Z" fill="#f4eee6" stroke="#cbbfd8" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M61 52 C70 38 74 16 68 8 C60 11 56 32 55 52 Z" fill="#f4eee6" stroke="#cbbfd8" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M40 47 C35 35 34 19 37 12 C41 18 42.5 33 42 47 Z" fill="#ffb3c4"/>
        <path d="M60 47 C65 36 68 22 66 15 C61 20 58.5 33 58 47 Z" fill="#ffb3c4"/>
        <ellipse cx="50" cy="64" rx="22" ry="19" fill="#f4eee6" stroke="#cbbfd8" stroke-width="1.5"/>
        <path d="M37 61 q4 -4 8 0 M55 61 q4 -4 8 0" fill="none" stroke="#2a1a2a" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="35" cy="68" rx="3.5" ry="2" fill="#ff9bb3" opacity="0.8"/>
        <ellipse cx="65" cy="68" rx="3.5" ry="2" fill="#ff9bb3" opacity="0.8"/>
        <path d="M47.5 67 h5 l-2.5 3 z" fill="#ff8fa8"/>
        <path d="M50 70 q-2.5 3 -5 1.5 M50 70 q2.5 3 5 1.5" fill="none" stroke="#2a1a2a" stroke-width="1.4" stroke-linecap="round"/>
        <rect x="48" y="71.5" width="4" height="3.5" rx="0.8" fill="#fff" stroke="#cbbfd8" stroke-width="0.8"/>
        <ellipse cx="50" cy="94" rx="38" ry="18" fill="#ff9a2e" stroke="#ffc27a" stroke-width="1.5"/>
        <path d="M36 78 C30 86 30 100 34 108 M50 76 V110 M64 78 C70 86 70 100 66 108" fill="none" stroke="#e07a14" stroke-width="2"/>
        <path d="M60 79 q5 -5 11 -4 q-3 6 -11 4 Z" fill="#5d9b3a"/>
      </svg>`,
  },

  skull: {
    name: '骷髏頭',
    good: false,
    points: 15,
    weight: 1,
    stayMul: 1.1,
    svg: `
      <svg viewBox="0 0 100 100">
        <path d="M50 30 C30 30 22 44 24 60 C25 68 30 72 34 74 L34 86 L66 86 L66 74 C70 72 75 68 76 60 C78 44 70 30 50 30 Z" fill="#f3eee0" stroke="#bfb6a0" stroke-width="1.5" stroke-linejoin="round"/>
        <ellipse cx="40" cy="58" rx="7.5" ry="8.5" fill="#1d1426"/>
        <ellipse cx="60" cy="58" rx="7.5" ry="8.5" fill="#1d1426"/>
        <circle cx="40" cy="59" r="2.6" fill="#ff4d5e"/>
        <circle cx="60" cy="59" r="2.6" fill="#ff4d5e"/>
        <path d="M50 66 l-3.5 6 h7 z" fill="#1d1426"/>
        <path d="M40 78 V86 M46 78 V86 M50 78 V86 M54 78 V86 M60 78 V86" stroke="#bfb6a0" stroke-width="1.5"/>
        <path d="M36 78 H64" stroke="#bfb6a0" stroke-width="1.5"/>
        <path d="M30 40 l6 5 M62 36 l4 6 l4 -2" fill="none" stroke="#bfb6a0" stroke-width="1.2" stroke-linecap="round"/>
        <rect x="30" y="86" width="40" height="16" rx="4" fill="#e6dfcb"/>
      </svg>`,
  },

  ghost: {
    name: '搗蛋幽靈',
    good: false,
    points: 10,
    weight: 1,
    stayMul: 1.1,
    svg: `
      <svg viewBox="0 0 100 100">
        <path d="M24 104 L24 60 C24 38 36 28 50 28 C64 28 76 38 76 60 L76 104 Z" fill="#eef1ff" stroke="#a9b2e6" stroke-width="1.5"/>
        <path d="M24 64 C16 62 12 56 12 50 C18 54 22 54 25 52 Z M76 64 C84 62 88 56 88 50 C82 54 78 54 75 52 Z" fill="#eef1ff" stroke="#a9b2e6" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M34 46 l10 4 M66 46 l-10 4" stroke="#1d1830" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="41" cy="56" rx="4" ry="5.5" fill="#1d1830"/>
        <ellipse cx="59" cy="56" rx="4" ry="5.5" fill="#1d1830"/>
        <path d="M42 68 q8 7 16 0 q-8 3 -16 0 Z" fill="#1d1830"/>
        <path d="M50 70.5 q0 7 4 7 q4 0 3 -6.5 Z" fill="#ff7a93"/>
      </svg>`,
  },
};
