import { APIError, type GenerateOptions, type GenerateResult, type ImageGenerationService } from './types'

export class GeminiImageService implements ImageGenerationService {
    async generate(options: GenerateOptions): Promise<GenerateResult> {
        const { prompt, styleTags, outputSettings, appSettings } = options

        if (!appSettings.geminiApiKey) {
            throw new APIError('請先設定 Gemini API Key', 'MISSING_API_KEY')
        }

        // 組合最終提示詞
        const fullPrompt = styleTags.length > 0
            ? `${prompt}, style: ${styleTags.join(', ')}`
            : prompt

        // 解析寬高比 (Gemini 支援 1:1, 9:16, 16:9, 4:3, 3:4)
        let aspectRatio = '1:1'
        if (outputSettings.aspectRatio === '1024x1536' || outputSettings.aspectRatio === '1024x1792') aspectRatio = '9:16'
        if (outputSettings.aspectRatio === '1536x1024' || outputSettings.aspectRatio === '1792x1024') aspectRatio = '16:9'

        // Gemini API URL
        // 預設模型: imagen-3.0-generate-001
        const model = appSettings.geminiModel || 'imagen-3.0-generate-001'
        const baseUrl = appSettings.geminiEndpoint || 'https://generativelanguage.googleapis.com/v1beta'
        const url = `${baseUrl.replace(/\/$/, '')}/models/${model}:predict?key=${appSettings.geminiApiKey}`

        const body = {
            instances: [
                {
                    prompt: fullPrompt,
                }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: aspectRatio,
                // personGeneration: "allow_adult", // 視需求開啟
                // safetySetting: "block_medium_and_above"
            }
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const errorMessage = errorData.error?.message || `Gemini API Error: ${response.status} ${response.statusText}`
                throw new APIError(errorMessage, errorData.error?.code, response.status)
            }

            const data = await response.json()

            // 檢查回應格式
            // 成功回應範例: { predictions: [ { bytesBase64Encoded: "..." } ] }
            if (!data.predictions || data.predictions.length === 0 || !data.predictions[0].bytesBase64Encoded) {
                throw new APIError('API 回傳格式錯誤或無影像資料', 'INVALID_RESPONSE')
            }

            const base64Image = data.predictions[0].bytesBase64Encoded
            const imageUrl = `data:image/png;base64,${base64Image}`

            return {
                url: imageUrl,
                revisedPrompt: undefined, // Gemini 目前不一定回傳 revised prompt
            }

        } catch (error) {
            if (error instanceof APIError) throw error
            throw new APIError(error instanceof Error ? error.message : '未知錯誤', 'UNKNOWN_ERROR')
        }
    }
}
