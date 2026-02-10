import { APIError, type GenerateOptions, type GenerateResult, type ImageGenerationService } from './types'

export class AzureOpenAIImageService implements ImageGenerationService {
    async generate(options: GenerateOptions): Promise<GenerateResult> {
        const { prompt, styleTags, outputSettings, appSettings } = options

        if (!appSettings.azureApiKey) {
            throw new APIError('請先設定 Azure OpenAI API Key', 'MISSING_API_KEY')
        }
        if (!appSettings.azureEndpoint) {
            throw new APIError('請先設定 Azure OpenAI Endpoint', 'MISSING_ENDPOINT')
        }
        if (!appSettings.azureDeployment) {
            throw new APIError('請先設定 Azure Deployment Name', 'MISSING_DEPLOYMENT')
        }

        // 組合最終提示詞
        const fullPrompt = styleTags.length > 0
            ? `${prompt}, style: ${styleTags.join(', ')}`
            : prompt

        // 解析寬高設定 (與 OpenAI 相同)
        let size = '1024x1024'
        if (outputSettings.aspectRatio === '1024x1536') size = '1024x1792'
        if (outputSettings.aspectRatio === '1536x1024') size = '1792x1024'

        // 解析解析度 (Quality)
        const quality = outputSettings.resolution === 'high' ? 'hd' : 'standard'

        // 處理 API Version (預設為 2024-02-01)
        const apiVersion = appSettings.azureApiVersion || '2024-02-01'

        // 處理 Base URL (移除結尾斜線)
        const baseUrl = appSettings.azureEndpoint.replace(/\/$/, '')

        // 完整的 API URL
        const url = `${baseUrl}/openai/deployments/${appSettings.azureDeployment}/images/generations?api-version=${apiVersion}`

        const body = {
            prompt: fullPrompt,
            n: 1,
            size: size,
            quality: quality,
            style: 'vivid', // Azure OpenAI DALL-E 3 預設支援
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': appSettings.azureApiKey,
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const errorMessage = errorData.error?.message || `Azure API Error: ${response.status} ${response.statusText}`
                throw new APIError(errorMessage, errorData.error?.code, response.status)
            }

            const data = await response.json()

            if (!data.data || data.data.length === 0) {
                throw new APIError('API 回傳格式錯誤或無資料', 'INVALID_RESPONSE')
            }

            const result = data.data[0]
            let imageUrl = result.url

            // 如果 Azure 回傳 b64_json，轉換為 Data URL
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
