import { type GenerateOptions, type GenerateResult, type ImageGenerationService } from './types'

export class MockImageService implements ImageGenerationService {
    async generate(options: GenerateOptions): Promise<GenerateResult> {
        // 模擬 3 秒延遲
        await new Promise(resolve => setTimeout(resolve, 3000))

        let width = 1024
        let height = 1024

        if (options.outputSettings.aspectRatio === '1024x1536') {
            width = 1024
            height = 1536
        } else if (options.outputSettings.aspectRatio === '1536x1024') {
            width = 1536
            height = 1024
        }

        // 使用 Picsum 提供隨機圖片
        const randomId = Math.floor(Math.random() * 1000)

        return {
            url: `https://picsum.photos/${width}/${height}?random=${randomId}`,
            revisedPrompt: `[模擬模式] 這是使用 "${options.appSettings.connectionType}" 模式生成的模擬影像。若需真實生成，請切換至 OpenAI 並設定 API Key。`
        }
    }
}
