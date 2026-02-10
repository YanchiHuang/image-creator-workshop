import type { AppSettings, OutputSettings } from '@/lib/store'

export interface GenerateOptions {
    prompt: string
    negativePrompt?: string
    styleTags: string[]
    referenceImage?: string | null
    appSettings: AppSettings
    outputSettings: OutputSettings
}

export interface GenerateResult {
    url: string
    revisedPrompt?: string // DALL-E 3 會回傳修飾過的提示詞
}

export interface ImageGenerationService {
    generate(options: GenerateOptions): Promise<GenerateResult>
}

export class APIError extends Error {
    constructor(message: string, public code?: string, public status?: number) {
        super(message)
        this.name = 'APIError'
    }
}
