import { APIError, type GenerateOptions, type GenerateResult, type ImageGenerationService } from './types'
import { OpenAIImageService } from './openai'
import { AzureOpenAIImageService } from './azure'
import { GeminiImageService } from './gemini'
import { MockImageService } from './mock'

export class ImageGenerator implements ImageGenerationService {
    private openaiService: OpenAIImageService
    private azureService: AzureOpenAIImageService
    private geminiService: GeminiImageService
    private mockService: MockImageService

    constructor() {
        this.openaiService = new OpenAIImageService()
        this.azureService = new AzureOpenAIImageService()
        this.geminiService = new GeminiImageService()
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
                return this.geminiService.generate(options)

            case 'chatgpt':
            case 'gemini':
                // 瀏覽器擴充功能模式：這通常透過 Content Script 注入，這裡先 Mock
                return this.mockService.generate(options)

            default:
                throw new APIError(`未支援的連線方式: ${connectionType}`, 'INVALID_CONNECTION_TYPE')
        }
    }
}
