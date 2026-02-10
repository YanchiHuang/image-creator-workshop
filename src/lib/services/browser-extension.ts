
import { APIError, type GenerateOptions, type GenerateResult, type ImageGenerationService } from './types'

export class BrowserExtensionImageService implements ImageGenerationService {
    async generate(options: GenerateOptions): Promise<GenerateResult> {
        const { prompt, styleTags, appSettings } = options
        const { connectionType, geminiBaseUrl } = appSettings

        // 組合最終提示詞
        const fullPrompt = styleTags.length > 0
            ? `${prompt}, style: ${styleTags.join(', ')}`
            : prompt

        let targetUrl = ''
        // 建構 Hash 參數
        // 使用手動拼接與 encodeURIComponent 以確保編碼格式相容性 (例如空白為 %20，符合擴充功能預期)
        let hashString = `autoSubmit=true&prompt=${encodeURIComponent(fullPrompt)}`

        if (connectionType === 'chatgpt') {
            targetUrl = 'https://chatgpt.com/images'
            // ChatGPT 專用參數
            hashString += '&tool=image'
        } else if (connectionType === 'gemini') {
            // 使用者自訂 Base URL 或預設值
            // 預設為 https://gemini.google.com/app
            const baseUrl = geminiBaseUrl || 'https://gemini.google.com/app'
            targetUrl = baseUrl
        } else {
            throw new APIError(`未支援的瀏覽器擴充功能類型: ${connectionType}`, 'INVALID_CONNECTION_TYPE')
        }

        // 建構完整 URL
        // ChatGPT 萬能工具箱使用 hash fragment (#) 來傳遞參數
        const finalUrl = `${targetUrl}#${hashString}`

        // 開啟新視窗
        // 使用 noopener,noreferrer 以確保安全並避免舊視窗被操控
        window.open(finalUrl, '_blank', 'noopener,noreferrer')

        // 回傳結果
        // 由於是在外部視窗生成，我們無法取得即時的圖片 URL
        // 因此回傳一個說明性的 Placeholder 圖片
        return {
            url: this.createPlaceholderImage(connectionType),
            revisedPrompt: undefined
        }
    }

    /**
     * 建立一個 SVG Placeholder 圖片，提示使用者已在新分頁開啟
     */
    private createPlaceholderImage(type: string): string {
        const providerName = type === 'chatgpt' ? 'ChatGPT' : 'Gemini'
        const color = type === 'chatgpt' ? '#10a37f' : '#4b90ff' // ChatGPT Green or Gemini Blue

        const svg = `
        <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#18181b"/>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.1"/>
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="1"/>
                </pattern>
            </defs>
            <circle cx="512" cy="400" r="80" fill="${color}" opacity="0.2"/>
            <circle cx="512" cy="400" r="60" stroke="${color}" stroke-width="4" fill="none"/>
            <path d="M512 360 L512 440 M472 400 L552 400" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
            
            <text x="50%" y="580" font-family="sans-serif" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">
                已在新分頁開啟 ${providerName}
            </text>
            <text x="50%" y="640" font-family="sans-serif" font-size="24" fill="#a1a1aa" text-anchor="middle">
                請在瀏覽器新分頁中查看生成結果
            </text>
            <text x="50%" y="680" font-family="sans-serif" font-size="18" fill="#52525b" text-anchor="middle">
                提示詞已自動填入並送出
            </text>
        </svg>
        `
        // 使用 unescape(encodeURIComponent(svg)) 來處理 UTF-8 字元
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
    }
}
