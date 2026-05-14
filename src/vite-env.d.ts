// Vite client 型別 + 靜態資源宣告
// TS 6 加嚴 side-effect import 檢查，需明確宣告 CSS / 圖像等模組
/// <reference types="vite/client" />

declare module '*.css'
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
