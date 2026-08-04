# 靜息 · LINE LIFF 呼吸引導（MVP）

一個**獨立的 LINE 放鬆/運動頻道**：使用者傳訊息或加好友時，由 **N8N** 回覆一張呼吸練習卡片；點選後開啟 **LIFF** 互動小功能，跟著動畫與柔和音效完成呼吸練習。全部後端邏輯在 N8N 上，**不需要任何後端伺服器（無 Flask）**。

完整願景含三大類（呼吸引導 / 組合有氧 + 手眼協調 / 音樂節律步伐），本版本先完成 **呼吸引導** 的完整垂直切片：`N8N 接收 → LINE 推送 → LIFF 呼吸 App`。

## 內容物

```
Line_Liff/
├── index.html                 # LIFF 進入點（4 個畫面：選擇 / 介紹 / 呼吸 / 完成）
├── css/style.css              # 「拂曉星空」視覺：極光背景、發光呼吸圈、顆粒紋理
├── js/
│   ├── patterns.js            # 4 種呼吸模式資料（4-7-8 / 箱式 / 腹式 / 正念）
│   ├── breathing.js           # 呼吸引擎：階段計時、循環、暫停/繼續
│   ├── audio.js               # Web Audio API 階段提示音（免音檔）
│   └── liff-init.js           # LIFF 初始化、登入、解析 ?type=、關閉視窗
└── n8n/
    └── line-relaxation-router.json   # 可匯入 n8n.cloud 的 workflow
```

呼吸模式由 `?type=` 決定：`478`（預設）、`box`、`belly`、`mindful`。
新增模式只要在 `patterns.js` 加一筆資料即可，引擎與 UI 會自動套用。

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
# 瀏覽器開 http://localhost:8080/?type=478（或 box / belly / mindful）
```
未設定 LIFF ID 時會自動以 standalone 模式運作，方便先看動畫與音效。

---

## 二、建立全新 LINE channel + LIFF App

1. [LINE Developers Console](https://developers.line.biz/) → 建立（或選用）一個 **Provider** → **Create a Messaging API channel**（這是放鬆/運動專用的新頻道）。
2. 在該 channel 的 **Messaging API** 分頁：
   - 取得 **Channel access token**（之後填到 N8N）。
   - 關閉「自動回覆訊息 / 加入好友的歡迎訊息」等預設回覆，避免和 N8N 的回覆衝突。
3. 在該 channel 的 **LIFF** 分頁 → **Add**：
   - **Endpoint URL**：步驟一的 GitHub Pages 網址（例：`https://<帳號>.github.io/line-liff/`）
   - **Size**：`Full`
   - Scope 至少勾 `profile`
4. 取得 **LIFF ID**（形如 `2006xxxxxx-xxxxxxxx`），填到兩個地方：
   - `js/liff-init.js` 的 `const LIFF_ID = '...'`
   - `n8n/line-relaxation-router.json` 內 **Build Breathing Menu** 節點的 `const LIFF_ID = '...'`（或匯入後在 n8n 介面改）

> 部署網址或 LIFF ID 變更後，記得同步更新這兩處。

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

## 四、端到端驗證

1. **LIFF App**：瀏覽器逐一開 `?type=478/box/belly/mindful`，確認呼吸圈擴縮秒數與「吸/屏/吐」文字、倒數同步，音效在階段轉換時響起，完成畫面與「再做一次 / 換一種 / 關閉」可用。
2. **N8N**：在 n8n 用 *Execute / Test*，或從 LINE 傳任意訊息 → 收到 4 選項 Flex 卡片（可看 n8n 執行紀錄確認）。
3. **整合**：加好友或傳訊息 → 收到卡片 → 點「4-7-8」→ LIFF 開啟 → 完成一輪 → 關閉。

---

## 後續階段（尚未實作）

- **組合有氧 + 手眼協調遊戲**、**音樂節律步伐**：比照本結構新增獨立 LIFF 頁面與 `?type=`，並在選單加按鈕。
- **AI 意圖/情緒判斷**：把 Code 節點的規則換成 AI 分類，依情緒給不同引導。
- **健康數據排程主動推送**：另開 n8n Schedule workflow，讀取穿戴/戒指數據達閾值時用 `push_message` 主動發送（需先確認數據來源 API）。
