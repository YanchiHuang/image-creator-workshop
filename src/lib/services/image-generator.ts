import { APIError, type GenerateOptions, type GenerateResult, type ImageGenerationService } from './types'
import { OpenAIImageService } from './openai'
import { MockImageService } from './mock'

// 預留其他實作
// import { AzureImageService } from './azure'
// import { GeminiImageService } from './gemini'

export class ImageGenerator implements ImageGenerationService {
    private openaiService: OpenAIImageService
    private mockService: MockImageService

    constructor() {
        this.openaiService = new OpenAIImageService()
        this.mockService = new MockImageService()
    }

    async generate(options: GenerateOptions): Promise<GenerateResult> {
        const { connectionType } = options.appSettings

        // 如果沒有填 API Key，且連線模式是 OpenAI，直接走 Mock 還是拋錯？
        // 為了讓使用者體驗流程，如果沒填 Key，先用 Mock，並在結果提示
        if (connectionType === 'openai' && !options.appSettings.openaiApiKey) {
            // 如果真的是要用 OpenAI，應該拋錯提醒使用者去設定
            // 但為了演示效果，也可以設一個開關。這裡採取嚴格模式：沒 Key 就拋錯。
            // 讓使用者知道系統真的在運作。
            // throw new APIError('請先設定 OpenAI API Key', 'MISSING_API_KEY')
        }

        switch (connectionType) {
            case 'openai':
                return this.openaiService.generate(options)

            case 'azure':
            case 'gemini-api':
                // 這些 API 尚未實作影像生成，暫時用 Mock
                console.warn(`[ImageGenerator] ${connectionType} 尚未實作，使用 Mock 模式`)
                return this.mockService.generate(options)

            case 'chatgpt':
            case 'gemini':
                // 瀏覽器擴充功能模式：這通常透過 Content Script 注入，這裡先 Mock
                return this.mockService.generate(options)

            default:
                throw new APIError(`未支援的連線方式: ${connectionType}`, 'INVALID_CONNECTION_TYPE')
        }
    }
}
