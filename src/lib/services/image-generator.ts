import { APIError, type GenerateOptions, type GenerateResult, type ImageGenerationService } from './types'
import { OpenAIImageService } from './openai'
import { AzureOpenAIImageService } from './azure'
import { MockImageService } from './mock'

// 預留其他實作
// import { GeminiImageService } from './gemini'

export class ImageGenerator implements ImageGenerationService {
    private openaiService: OpenAIImageService
    private azureService: AzureOpenAIImageService
    private mockService: MockImageService

    constructor() {
        this.openaiService = new OpenAIImageService()
        this.azureService = new AzureOpenAIImageService()
        this.mockService = new MockImageService()
    }

    async generate(options: GenerateOptions): Promise<GenerateResult> {
        const { connectionType } = options.appSettings

        // ... (skip apiKey check logic)

        switch (connectionType) {
            case 'openai':
                return this.openaiService.generate(options)

            case 'azure':
                return this.azureService.generate(options)

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
