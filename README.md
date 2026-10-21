# 靜息 · LINE LIFF 呼吸引導（MVP）

一個**獨立的 LINE 放鬆/運動頻道**：使用者傳訊息或加好友時，由 **N8N** 回覆一張呼吸練習卡片；點選後開啟 **LIFF** 互動小功能，跟著動畫與柔和音效完成呼吸練習。全部後端邏輯在 N8N 上，**不需要任何後端伺服器（無 Flask）**。

完整願景含三大類（呼吸引導 / 組合有氧 + 手眼協調 / 音樂節律步伐）。目前已完成 **呼吸引導**（`breathing/`）、**音樂節律步伐**（`step/`）與 **認知步行**（`walk/`，結合語言與行走的雙重任務訓練）三支 LIFF App，另有季節限定小遊戲 **Circle 搗蛋夜**（`halloween/`）：`N8N 接收 → LINE 推送 → LIFF App`。

## 內容物

```
Line_Liff/
├── index.html                 # 根首頁：連到「呼吸練習 / 節律步伐 / 認知步行 / Circle 搗蛋夜」
├── breathing/                 # 呼吸引導 App
│   ├── index.html             # LIFF 進入點（選擇 / 介紹 / 呼吸 / 完成）
│   ├── css/style.css          # 「拂曉星空」視覺：極光背景、發光呼吸圈
│   └── js/
│       ├── patterns.js        # 4 種呼吸模式（4-7-8 / 箱式 / 腹式 / 正念）
│       ├── breathing.js       # 呼吸引擎：階段計時、循環、暫停/繼續
│       ├── audio.js           # Web Audio 階段提示音（免音檔）
│       └── liff-init.js       # LIFF 初始化、解析 ?type=、關閉視窗
├── step/                      # 音樂節律步伐 App
│   ├── index.html             # LIFF 進入點（選單 / 引導 / 完成）
│   ├── css/style.css
│   └── js/                    # patterns / rhythm-audio / rhythm-engine / liff-init
├── walk/                      # 認知步行 App（認知導向步行訓練：結合語言與行走）
│   ├── index.html             # LIFF 進入點（選單 / 題目卡 + 原地踏步 / 完成）
│   ├── css/style.css
│   └── js/                    # patterns / rhythm-audio / rhythm-engine / speech（題目朗讀）/ liff-init
├── halloween/                 # Circle 搗蛋夜（季節限定小遊戲）
│   ├── index.html             # LIFF 進入點（開始 / 遊戲 / 結算）
│   ├── css/style.css          # 夜晚墓園視覺：南瓜橘、燭光黃、薄霧
│   └── js/
│       ├── characters.js      # 角色：黑貓巫師、小蝙蝠、貓頭鷹、南瓜兔子（加分）；骷髏、幽靈（扣分）
│       ├── difficulty.js      # 3 種難度與分數稱號
│       ├── game.js            # 遊戲引擎：冒出、計時、計分、連擊、暫停（不碰 DOM）
│       ├── sfx.js             # Web Audio 遊戲音效（免音檔）
│       ├── liff-init.js       # LIFF 初始化、解析 ?type=、ID Token、分享分數卡、關閉視窗
│       └── event.js           # 「最高分送禮物」活動設定與排行榜 API
└── n8n/
    ├── line-relaxation-router.json   # 可匯入 n8n.cloud 的 workflow（呼吸選單）
    └── halloween-leaderboard.json    # Circle 搗蛋夜活動排行榜（Webhook × Data Table × Google Sheets）
```

各 App 的模式由 `?type=` 決定：
- 呼吸（`breathing/`）：`478`（預設）、`box`、`belly`、`mindful`
- 步伐（`step/`）：`march`（預設）、`sidestep`、`box`、`combo`
- 認知步行（`walk/`）：`count`（預設，踏步報數）、`category`（分類說詞）、`stroop`（顏色字反應）
- Circle 搗蛋夜（`halloween/`）：`normal`（預設）、`easy`、`hard`（難度，開始畫面也能切換）

認知步行會用瀏覽器內建的 `speechSynthesis` 朗讀題目（中文語音，可在畫面上關閉），不需要音檔、也不需要麥克風權限；使用者大聲回答；顏色字反應模式在下一題出現時會揭示上一題的答案，方便自我核對。

新增模式只要在該 App 的 `js/patterns.js` 加一筆資料即可，引擎與 UI 會自動套用。

Circle 搗蛋夜一局 30 秒，越後面越快；連續打中 5／10／15 下分數變成 ×2／×3／×4，打到骷髏或幽靈會扣分、連擊歸零。各難度的最佳紀錄存在瀏覽器（`localStorage`）。新增角色在 `halloween/js/characters.js`、新增難度在 `halloween/js/difficulty.js` 加一筆即可。

## 架構

```
LINE 用戶 ──webhook──▶ N8N (n8n.cloud)
                          Webhook → Build Breathing Menu (Code) → LINE Reply (Flex)
                                                                      │
                          回覆 4 種呼吸選項（每顆按鈕 = LIFF 連結）  ◀┘
                                          │ 用戶點按
                                          ▼
                  LIFF 開啟 GitHub Pages 靜態 App → 呼吸動畫 + 音效 → 關閉
```

專屬頻道，所以每則訊息（或加好友）都直接回覆呼吸選單；不需轉發、不需簽章處理。

---

## 一、部署 LIFF 靜態網站（建議 GitHub Pages）

LIFF 需要一個**穩定的 HTTPS 網址**。建議用 **GitHub Pages**：免費、自帶 HTTPS、CDN 快、push 即更新，且與 N8N 完全解耦。
（Vercel / Netlify / Cloudflare Pages 也可，純靜態站 GitHub Pages 已足夠。**不建議**用 N8N 當靜態主機——它是工作流工具，不是 CDN。）

### GitHub Pages 步驟
1. 把本資料夾推到一個 GitHub repo（例：`line-liff`）。
2. repo → **Settings → Pages** → Source 選 `Deploy from a branch` → Branch 選 `main` / 根目錄 → Save。
3. 得到網址，形如 `https://<你的帳號>.github.io/line-liff/`。
   - LIFF Endpoint 用這個網址即可（LIFF 會自帶 `?type=` 等查詢參數）。

### 本機測試（不需 LINE）
```bash
cd Line_Liff
python3 -m http.server 8080
# 根首頁： http://localhost:8080/
# 呼吸：   http://localhost:8080/breathing/?type=478（或 box / belly / mindful）
# 步伐：   http://localhost:8080/step/?type=march（或 sidestep / box / combo）
# 認知步行：http://localhost:8080/walk/?type=count（或 category / stroop）
# 打地鼠： http://localhost:8080/halloween/?type=normal（或 easy / hard）
```
未設定 LIFF ID 時會自動以 standalone 模式運作，方便先看動畫與音效。

### 背景主題（白天 / 夜晚自動切換）
畫面背景會依**裝置當地時間**自動切換白天／夜晚場景：

- **白天（morning）**：06:00–17:59
- **夜晚（night）**：18:00–翌日 05:59

可用網址參數強制指定，方便測試：`?bg=morning`（或 `?bg=day`）、`?bg=night`。
呼吸 App、節律步伐 App（`step/`）與認知步行 App（`walk/`）採用相同切換規則。Circle 搗蛋夜固定為夜晚場景。

---

## 二、建立全新 LINE channel + LIFF App

1. [LINE Developers Console](https://developers.line.biz/) → 建立（或選用）一個 **Provider** → **Create a Messaging API channel**（這是放鬆/運動專用的新頻道）。
2. 在該 channel 的 **Messaging API** 分頁：
   - 取得 **Channel access token**（之後填到 N8N）。
   - 關閉「自動回覆訊息 / 加入好友的歡迎訊息」等預設回覆，避免和 N8N 的回覆衝突。
3. 在該 channel 的 **LIFF** 分頁 → **Add**（每支 App 各建一個 LIFF）：
   - 呼吸 **Endpoint URL**：`https://<帳號>.github.io/line-liff/breathing/`
   - 步伐 **Endpoint URL**：`https://<帳號>.github.io/line-liff/step/`
   - 認知步行 **Endpoint URL**：`https://<帳號>.github.io/line-liff/walk/`
   - Circle 搗蛋夜 **Endpoint URL**：`https://<帳號>.github.io/line-liff/halloween/`，並開啟 **shareTargetPicker**（結算畫面的「傳給好友挑戰」需要它；沒開時按鈕會自動隱藏）
   - **Size**：`Full`；Scope 至少勾 `profile`
4. 取得各 **LIFF ID**（形如 `2006xxxxxx-xxxxxxxx`），填到對應位置：
   - 呼吸：`breathing/js/liff-init.js` 的 `const LIFF_ID = '...'`
   - 步伐：`step/js/liff-init.js` 的 `const LIFF_ID = '...'`
   - 認知步行：`walk/js/liff-init.js` 的 `const LIFF_ID = '...'`
   - Circle 搗蛋夜：`halloween/js/liff-init.js` 的 `const LIFF_ID = '...'`（分享卡的「我也要挑戰」連結也用它）
   - `n8n/line-relaxation-router.json` 內 **Build Breathing Menu** 節點的 `const LIFF_ID = '...'`（或匯入後在 n8n 介面改）

> 部署網址（含 `/breathing/`、`/step/`、`/walk/`、`/halloween/` 子路徑）或 LIFF ID 變更後，記得同步更新這些位置。

---

## 三、匯入並設定 N8N（n8n.cloud）

1. n8n → **Workflows → Import from File** → 選 `n8n/line-relaxation-router.json`。
2. **Build Breathing Menu**（Code 節點）：確認 `LIFF_ID` 已填。
3. **LINE Reply (Flex)**（HTTP 節點）：把 `Authorization` 標頭的 `YOUR_CHANNEL_ACCESS_TOKEN` 換成你的 **Channel access token**（建議改用 n8n Credentials 儲存，勿明文）。
4. **Activate** workflow → 複製 **LINE Webhook** 節點的 *Production URL*。
5. 回 LINE Developers Console → 該 channel → **Messaging API** → **Webhook URL** 填這個 n8n Production URL，開啟 *Use webhook*。

### 節點流程
```
LINE Webhook → Build Breathing Menu (Code) → LINE Reply (Flex)
   收事件          有可回覆對象才產出項目        回覆 4 種呼吸選項
                   （否則回傳空陣列，下游不執行）
```

---

## 三之一、Circle 搗蛋夜：最高分送禮物活動

活動期間（預設 2026/10/25–10/31，台灣時間）玩「標準」或「惡夢」難度，成績會上傳到 n8n。兩個難度**分開排名、各送第一名一份禮物**；結算畫面顯示該難度的前 10 名（名稱遮蔽，例如「林*華」）與自己的名次，活動結束後由你通知得獎者。

**同分規則**：排行榜同分時依達到該分數的先後排名，越早達到者名次越前面（以伺服器收到成績的時間為準）；每個難度只有排行榜第一名，也就是「第一位達到最高分」的玩家得獎。

**每人限領一份**：同一位玩家同時是兩個難度的第一名時，只頒發「惡夢」難度的禮物（不提供選擇），「標準」難度的禮物改由該難度第二名遞補。優先順序設定在 `event.js` 的 `prizeOrder`。

```
開局 ─▶ POST /halloween/session ─▶ 向 LINE 驗證 ID Token ─▶ 簽發場次憑證（記下開始時間）
結束 ─▶ POST /halloween/score   ─▶ 向 LINE 驗證 ─▶ 讀取所有成績 ─▶ 檢查並重算分數
                                   ─▶ 寫入 Data Table（＋Google Sheets 備份）─▶ 回傳排行榜
```

**防作弊**：伺服器會依打擊紀錄重算分數，並拒絕以下成績：憑證偽造或過期（30 分鐘）、同一張憑證重複上傳、開局到上傳不足約 30 秒、難度不是標準或惡夢、連點快於 60 毫秒、分數與紀錄不符。被拒絕的成績照樣寫入（`status=rejected`、`reason` 寫原因）方便稽核，但不列入排行。分數終究是在手機上算的，**頒獎前請人工看一下前幾名的紀錄**（例如分數明顯高於其他人、或在很短時間內刷了很多局）。

### 設定步驟
1. **LIFF 權限**：LINE Developers → Circle 搗蛋夜的 LIFF → Scope 勾選 **`openid`** 與 `profile`（沒有 openid 拿不到 ID Token，成績不會上傳）。
2. **Channel ID**：LIFF 所在的 LINE Login channel → Basic settings → **Channel ID**。之後填到 n8n 兩個「LINE Verify」節點的 `client_id`。
   > 這個 LINE Login channel 必須和官方帳號的 Messaging API channel 在**同一個 Provider** 底下，取得的 userId 才能拿來推播通知得獎者。
3. **建立 Data Table**：n8n → Overview → Data tables → 建立 **`halloween_scores`**，欄位如下（名稱要完全一致）：
   | 欄位 | 型別 | 欄位 | 型別 |
   |---|---|---|---|
   | `playedAt` | String | `hits` | Number |
   | `type` | String（`normal`／`hard`） | `bad` | Number |
   | `userId` | String | `bestCombo` | Number |
   | `name` | String | `status` | String |
   | `score` | Number | `reason` | String |
   | | | `nonce` | String |
4. **匯入 workflow**：Import from File → `n8n/halloween-leaderboard.json`，然後：
   - 兩個 Code 節點（**Sign Session**、**Validate & Rank**）的 `SECRET` 換成**同一串**長隨機字串（可用 `openssl rand -base64 32` 產生）。
   - 兩個 **LINE Verify** 節點的 `client_id` 換成第 2 步的 Channel ID。
   - **Activate** workflow。Code 節點用到 `crypto` 模組：n8n.cloud 可直接使用；自架的 n8n 需設定環境變數 `NODE_FUNCTION_ALLOW_BUILTIN=crypto`。
5. **Google Sheets 備份（選用）**：建立試算表，分頁命名為 `scores`，第一列填上第 3 步的 11 個欄位名稱；在 **Append Score (Google Sheets)** 節點設定 Google 憑證與試算表網址，再**啟用該節點**（匯入時預設停用，沒設定也不影響排行榜）。
6. **遊戲端設定** `halloween/js/event.js`：
   - `api`：n8n Webhook 的 Production URL 去掉最後的 `/session`，例如 `https://你的帳號.app.n8n.cloud/webhook/halloween`
   - `prize`：禮物名稱（會顯示在橫幅與活動辦法）
   - 若要改活動期間，`event.js` 的 `start`／`end`／`label` 與兩個 Code 節點的 `EVENT_START`／`EVENT_END` 要一起改。
   - 若要改計分難度，`event.js` 的 `types` 與 **Validate & Rank** 節點的 `EVENT_TYPES` 要一起改。
7. **活動辦法**寫在 `halloween/index.html` 的 `buildRules()`（通知期限、個資刪除時間等），請依實際做法調整。

### 活動結束後
1. 打開 Google Sheets（或 n8n 的 `halloween_scores`），篩選 `status = ok`，**分別**篩選 `type = normal` 與 `type = hard`，依 `score` 由高到低、`playedAt` 由早到晚排序，各自的第一列就是該難度的第一名（同分時 `playedAt` 較早者得獎）。
   - **先決定「惡夢」得主**：`type = hard` 的第一名。
   - **再決定「標準」得主**：`type = normal` 由上往下，第一位**不是**惡夢得主的玩家（同一人兩邊第一時，就是標準的第二名）。
   - 同一位玩家可能有多筆成績，請以 `userId` 判斷是否為同一人，並以每人的最高分排名。
2. 人工檢查前幾名的紀錄是否合理。
3. 用 Messaging API 推播通知得獎者（需對方已加好友）：
   ```bash
   curl -X POST https://api.line.me/v2/bot/message/push \
     -H 'Authorization: Bearer <Channel access token>' -H 'Content-Type: application/json' \
     -d '{"to":"<得獎者 userId>","messages":[{"type":"text","text":"恭喜你獲得 Circle 搗蛋夜第一名！"}]}'
   ```
4. 依活動辦法的承諾刪除成績資料。

---

## 四、端到端驗證

1. **LIFF App**：瀏覽器逐一開 `?type=478/box/belly/mindful`，確認呼吸圈擴縮秒數與「吸/屏/吐」文字、倒數同步，音效在階段轉換時響起，完成畫面與「再做一次 / 換一種 / 關閉」可用。
2. **N8N**：在 n8n 用 *Execute / Test*，或從 LINE 傳任意訊息 → 收到 4 選項 Flex 卡片（可看 n8n 執行紀錄確認）。
3. **整合**：加好友或傳訊息 → 收到卡片 → 點「4-7-8」→ LIFF 開啟 → 完成一輪 → 關閉。

---

## 後續階段（尚未實作）

- **組合有氧 + 手眼協調遊戲**：比照 `breathing/`、`step/` 的結構新增獨立 LIFF 頁面與 `?type=`，並在選單加按鈕。
  （**音樂節律步伐** 已完成，見 `step/`。）
- **AI 意圖/情緒判斷**：把 Code 節點的規則換成 AI 分類，依情緒給不同引導。
- **健康數據排程主動推送**：另開 n8n Schedule workflow，讀取穿戴/戒指數據達閾值時用 `push_message` 主動發送（需先確認數據來源 API）。
