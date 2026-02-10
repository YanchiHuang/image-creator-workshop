import { APIError, type GenerateOptions, type GenerateResult, type ImageGenerationService } from './types'

export class OpenAIImageService implements ImageGenerationService {
    async generate(options: GenerateOptions): Promise<GenerateResult> {
        const { prompt, styleTags, outputSettings, appSettings } = options

        if (!appSettings.openaiApiKey) {
            throw new APIError('請先設定 OpenAI API Key', 'MISSING_API_KEY')
        }

        // 組合最終提示詞
        const fullPrompt = styleTags.length > 0
            ? `${prompt}, style: ${styleTags.join(', ')}`
            : prompt

        // 解析寬高設定
        // OpenAI DALL-E 3 支援: 1024x1024, 1024x1792 (直), 1792x1024 (橫)
        // 我們的選項: 1024x1024, 1024x1536 (直), 1536x1024 (橫) -> 對應最接近的
        let size = '1024x1024'
        if (outputSettings.aspectRatio === '1024x1536') size = '1024x1792'
        if (outputSettings.aspectRatio === '1536x1024') size = '1792x1024'

        // 解析解析度 (Quality)
        // OpenAI DALL-E 3 支援: standard, hd
        const quality = outputSettings.resolution === 'high' ? 'hd' : 'standard'

        const model = appSettings.openaiModel || 'dall-e-3'
        const isDalle3 = model.includes('dall-e-3')

        const body: {
            model: string
            prompt: string
            n: number
            size: string
            quality?: string
            style?: string
        } = {
            model,
            prompt: fullPrompt,
            n: 1,
            size: size,
        }

        // DALL-E 3 專用參數
        if (isDalle3) {
            body.quality = quality
            body.style = 'vivid' // vivid 或 natural
        }

        // 注意：不傳送 response_format，預設即為 'url'。避免部分非標準模型報錯 'Unknown parameter: response_format'

        try {
            const response = await fetch(`${appSettings.openaiBaseUrl}/images/generations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${appSettings.openaiApiKey}`,
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const errorMessage = errorData.error?.message || `API Error: ${response.status} ${response.statusText}`
                throw new APIError(errorMessage, errorData.error?.code, response.status)
            }

            const data = await response.json()

            if (!data.data || data.data.length === 0) {
                throw new APIError('API 回傳格式錯誤或無資料', 'INVALID_RESPONSE')
            }

            const result = data.data[0]
            let imageUrl = result.url

            // 如果 API 回傳 b64_json (部分模型或設定預設)，則轉換為 Data URL
            if (result.b64_json) {
                imageUrl = `data:image/png;base64,${result.b64_json}`
            }

            return {
                url: imageUrl,
                revisedPrompt: result.revised_prompt,
            }

        } catch (error) {
            if (error instanceof APIError) throw error
            throw new APIError(error instanceof Error ? error.message : '未知錯誤', 'UNKNOWN_ERROR')
        }
    }
}
