import { APIError, type GenerateOptions, type GenerateResult, type ImageGenerationService } from './types'
import { OpenAIImageService } from './openai'
import { AzureOpenAIImageService } from './azure'
import { GeminiImageService } from './gemini'
import { BrowserExtensionImageService } from './browser-extension'

export class ImageGenerator implements ImageGenerationService {
    private openaiService: OpenAIImageService
    private azureService: AzureOpenAIImageService
    private geminiService: GeminiImageService
    private browserExtensionService: BrowserExtensionImageService

    constructor() {
        this.openaiService = new OpenAIImageService()
        this.azureService = new AzureOpenAIImageService()
        this.geminiService = new GeminiImageService()
        this.browserExtensionService = new BrowserExtensionImageService()
    }

    async generate(options: GenerateOptions): Promise<GenerateResult> {
        const { connectionType } = options.appSettings

        switch (connectionType) {
            case 'openai':
                return this.openaiService.generate(options)

            case 'azure':
                return this.azureService.generate(options)

            case 'gemini-api':
                return this.geminiService.generate(options)

            case 'chatgpt':
            case 'gemini':
                // 瀏覽器擴充功能整合
                return this.browserExtensionService.generate(options)

            default:
                throw new APIError(`未支援的連線方式: ${connectionType}`, 'INVALID_CONNECTION_TYPE')
        }
    }
}
