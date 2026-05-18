
import { APIError, type GenerateOptions, type GenerateResult, type ImageGenerationService } from './types'

// 模組層級的 pending 解析器，讓外部可手動 resolve
let pendingResolve: ((url: string) => void) | null = null
let pendingReject: ((err: Error) => void) | null = null
let messageListener: ((event: MessageEvent) => void) | null = null

// 提供手動輸入圖片 URL 的入口（供 App.tsx 呼叫）
export function manualResolve(imageUrl: string): void {
    if (pendingResolve) {
        pendingResolve(imageUrl)
    }
}

export class BrowserExtensionImageService implements ImageGenerationService {
    async generate(options: GenerateOptions): Promise<GenerateResult> {
        const { prompt, styleTags, appSettings } = options
        const { connectionType, geminiBaseUrl } = appSettings

        // 若上一次還在等待中，先強制拒絕
        if (pendingReject) {
            pendingReject(new APIError('已取消上一次的等待', 'CANCELLED'))
            this.cleanup()
        }

        // 組合最終提示詞
        const fullPrompt = styleTags.length > 0
            ? `${prompt}, style: ${styleTags.join(', ')}`
            : prompt

        let targetUrl: string
        // 使用手動拼接與 encodeURIComponent 以確保編碼格式相容性
        let hashString = `autoSubmit=true&prompt=${encodeURIComponent(fullPrompt)}`

        if (connectionType === 'chatgpt') {
            targetUrl = 'https://chatgpt.com/images'
            hashString += '&tool=image'
        } else if (connectionType === 'gemini') {
            const baseUrl = geminiBaseUrl || 'https://gemini.google.com/app'
            targetUrl = baseUrl
        } else {
            throw new APIError(`未支援的瀏覽器擴充功能類型: ${connectionType}`, 'INVALID_CONNECTION_TYPE')
        }

        // 建構完整 URL（不加 noopener，讓子視窗可使用 window.opener.postMessage）
        const finalUrl = `${targetUrl}#${hashString}`
        window.open(finalUrl, '_blank', 'noreferrer')

        // 建立 Promise，等待 postMessage 或手動輸入
        const imageUrl = await new Promise<string>((resolve, reject) => {
            pendingResolve = resolve
            pendingReject = reject

            // 監聽來自子視窗擴充功能的 postMessage
            // 支援多種訊息類型以相容不同擴充功能版本
            messageListener = (event: MessageEvent) => {
                if (!event.data || typeof event.data !== 'object') return
                const { type, imageUrl, imageBase64 } = event.data as {
                    type?: string
                    imageUrl?: string
                    imageBase64?: string
                }
                const acceptedTypes = ['IMAGE_GENERATED', 'IMAGE_RESULT', 'CHATGPT_IMAGE_RESULT']
                if (!type || !acceptedTypes.includes(type)) return
                const finalUrl = imageUrl || imageBase64
                if (finalUrl && typeof finalUrl === 'string') {
                    resolve(finalUrl)
                }
            }
            window.addEventListener('message', messageListener)

            // 10 分鐘逾時
            setTimeout(() => {
                reject(new APIError(
                    '等待逾時（10 分鐘）。請在上方手動貼上圖片 URL，或重新生成。',
                    'TIMEOUT'
                ))
            }, 10 * 60 * 1000)
        })

        this.cleanup()

        return {
            url: imageUrl,
            revisedPrompt: undefined,
        }
    }

    private cleanup(): void {
        if (messageListener) {
            window.removeEventListener('message', messageListener)
            messageListener = null
        }
        pendingResolve = null
        pendingReject = null
    }

    /**
     * 建立一個 SVG Placeholder 圖片，提示使用者已在新分頁開啟
     */
    createPlaceholderImage(type: string): string {
        const providerName = type === 'chatgpt' ? 'ChatGPT' : 'Gemini'
        const color = type === 'chatgpt' ? '#10a37f' : '#4b90ff'

        const svg = `
        <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#18181b"/>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.1"/>
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="1"/>
                </pattern>
            </defs>
            <circle cx="512" cy="360" r="80" fill="${color}" opacity="0.2"/>
            <circle cx="512" cy="360" r="60" stroke="${color}" stroke-width="4" fill="none"/>
            <path d="M512 320 L512 400 M472 360 L552 360" stroke="${color}" stroke-width="4" stroke-linecap="round"/>

            <text x="50%" y="520" font-family="sans-serif" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">
                已在新分頁開啟 ${providerName}
            </text>
            <text x="50%" y="576" font-family="sans-serif" font-size="22" fill="#a1a1aa" text-anchor="middle">
                提示詞已自動填入，請在新分頁完成生成
            </text>

            <rect x="162" y="614" width="700" height="2" fill="#3f3f46" rx="1"/>

            <text x="50%" y="672" font-family="sans-serif" font-size="20" fill="#71717a" text-anchor="middle">
                圖片生成後，有兩種方式回傳至本工具：
            </text>
            <text x="50%" y="712" font-family="sans-serif" font-size="18" fill="#a1a1aa" text-anchor="middle">
                ① 安裝支援 postMessage 的瀏覽器擴充功能（自動回傳）
            </text>
            <text x="50%" y="748" font-family="sans-serif" font-size="18" fill="#a1a1aa" text-anchor="middle">
                ② 在 ${providerName} 複製圖片，回到本頁點「貼上圖片」
            </text>
        </svg>
        `
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
    }
}
