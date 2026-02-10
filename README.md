# 生圖工坊 (Image Creator Workshop)

![Version](https://img.shields.io/badge/version-0.1.5-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![React](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6) ![Vite](https://img.shields.io/badge/Vite-7.0-646cff) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8)

**生圖工坊**是一個專業、穩定且可控的 Web AI 影像生成工作台。透過整合 OpenAI、Azure OpenAI 與 Google Gemini 等多種最強大的 AI 模型，讓使用者能透過自然語言描述與豐富的風格標籤，輕鬆創作出高品質的影像作品。

![Project Preview](./public/preview.png)
_(若有專案截圖可放置於此)_

## 🌟 核心特色

- **🎨 多模型支援**：整合 OpenAI (gpt-image-1.5)、Azure OpenAI、Google Gemini (gemini-3-pro-image-preview) 等主流生成模型。
- **🔌 彈性連線模式**：支援直接 API 連線，亦可透過瀏覽器擴充功能整合 ChatGPT/Gemini 網頁版。
- **✍️ 智慧提示詞輔助**：內建 12 組精選情境範本與靈感推薦功能，降低創作門檻。
- **🏷️ 風格標籤系統**：提供構圖、主題、材質、鏡頭、光線等 8 大類風格標籤，一鍵套用專業參數。
- **🖼️ 全面輸出控制**：可自訂畫面比例、解析度、檔案格式 (PNG/JPEG/WEBP) 與壓縮品質。
- **📷 參考圖輔助**：支援拖曳上傳參考圖片，讓 AI 更精準理解您的構圖需求。
- **🔒 安全與隱私**：API Key 僅儲存於本地瀏覽器 (LocalStorage)，不經過任何中介伺服器，保障您的資安。

## 🛠️ 技術棧

本專案採用現代化前端技術構建，確保高效能與最佳開發體驗：

- **核心框架**：React 19 + TypeScript
- **建置工具**：Vite 7
- **樣式系統**：Tailwind CSS v4 + shadcn/ui
- **圖示庫**：Lucide React
- **狀態管理**：React Hooks (useState / useCallback) + Context API
- **部署架構**：純靜態網站 (Static Web App)

## 🚀 快速開始

### 前置需求

請確保您的環境已安裝 [Node.js](https://nodejs.org/) (建議 v18 以上)。

### 安裝步驟

1. **複製專案**

   ```bash
   git clone https://github.com/your-username/image-creator-workshop.git
   cd image-creator-workshop
   ```

2. **安裝依賴**

   ```bash
   npm install
   ```

3. **啟動開發伺服器**

   ```bash
   npm run dev
   ```

   瀏覽器將自動開啟 `http://localhost:5173`。

4. **建置生產版本**

   ```bash
   npm run build
   ```

   建置後的檔案將位於 `dist` 目錄。

## 📖 使用指南

### 1. 系統設定 (Settings)

首次使用請點擊右上角的「⚙️ 系統設定」：

- 選擇您偏好的 **連線方式** (OpenAI, Azure, Gemini 等)。
- 輸入對應的 **API Key** 與 **Endpoint**。
- 設定完成後，系統會自動儲存您的偏好至瀏覽器。

### 2. 輸入提示詞 (Prompt)

- 在文字框輸入您想要生成的畫面描述。
- 或點擊「💡 靈感推薦」隨機生成一個有趣的場景。
- 亦可直接選用下方的「常用範本」快速填入。

### 3. 風格與輸出調整

- 透過下方的風格標籤區，點選「賽博朋克」、「廣角」、「柔和光」等標籤來強化視覺效果。
- 在輸出設定區調整圖片的 **長寬比** 與 **解析度**。

### 4. 生成影像

- 點擊深藍色的「🚀 開始生成」按鈕。
- 稍待片刻，生成的影像將顯示於結果區，您可以點擊放大預覽或下載保存。

## 📂 專案結構

```
src/
├── components/          # UI 元件
│   ├── ui/              # shadcn/ui 基礎元件
│   ├── hero-section.tsx # 頁頭區塊
│   ├── prompt-section.tsx # 提示詞輸入與風格區
│   ├── output-section.tsx # 輸出參數設定
│   ├── generate-section.tsx # 生成按鈕與結果展示
│   └── settings-modal.tsx # 系統設定彈窗
├── lib/
│   ├── services/        # API 整合服務 (OpenAI, Gemini, etc.)
│   ├── constants.ts     # 常數定義 (範本、標籤資料)
│   ├── store.ts         # 狀態管理
│   └── utils.ts         # 工具函式
├── App.tsx              # 主應用程式入口
└── index.css            # 全域樣式與 Tailwind 設定
```

## 🤝 貢獻指南

歡迎提交 Pull Request 或 Issue 來協助改進本專案！

1. Fork 本專案
2. 建立您的 Feature Branch (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到 Branch (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 版權聲明

© 2026 生圖工坊 (Image Creator Workshop). Built by Claude & Gemini.
