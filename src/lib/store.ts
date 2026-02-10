import { useState, useCallback } from 'react'
import type { ConnectionType } from './constants'

// ===== 應用程式全域狀態 =====
export interface AppSettings {
    // API 連線設定
    connectionType: ConnectionType
    // OpenAI
    openaiBaseUrl: string
    openaiModel: string
    openaiApiKey: string
    // Azure OpenAI
    azureEndpoint: string
    azureAuthMode: 'apikey' | 'aad'
    azureApiKey: string
    // Gemini API
    geminiEndpoint: string
    geminiModel: string
    geminiApiKey: string
    // ChatGPT / Gemini 瀏覽器
    geminiBaseUrl: string
}

export interface OutputSettings {
    aspectRatio: string
    resolution: string
    fileFormat: string
    compressionQuality: number
    safetyLevel: string
}

export interface GenerationState {
    status: 'idle' | 'generating' | 'done' | 'error'
    elapsedTime: number
    resultImageUrl: string | null
    errorMessage: string | null
}

const DEFAULT_APP_SETTINGS: AppSettings = {
    connectionType: 'gemini-api',
    openaiBaseUrl: 'https://api.openai.com/v1',
    openaiModel: 'gpt-image-1.5',
    openaiApiKey: '',
    azureEndpoint: '',
    azureAuthMode: 'apikey',
    azureApiKey: '',
    geminiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    geminiModel: 'gemini-3-pro-image-preview',
    geminiApiKey: '',
    geminiBaseUrl: 'https://gemini.google.com/app',
}

const DEFAULT_OUTPUT_SETTINGS: OutputSettings = {
    aspectRatio: '1024x1024',
    resolution: 'auto',
    fileFormat: 'png',
    compressionQuality: 80,
    safetyLevel: 'medium',
}

// ===== 自訂 Hook =====
export function useAppSettings() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS)

    const updateSettings = useCallback((partial: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...partial }))
    }, [])

    return { settings, updateSettings }
}

export function useOutputSettings() {
    const [settings, setSettings] = useState<OutputSettings>(DEFAULT_OUTPUT_SETTINGS)

    const updateSettings = useCallback((partial: Partial<OutputSettings>) => {
        setSettings(prev => ({ ...prev, ...partial }))
    }, [])

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_OUTPUT_SETTINGS)
    }, [])

    return { settings, updateSettings, resetSettings }
}

export function usePromptState() {
    const [prompt, setPrompt] = useState('')
    const [selectedStyles, setSelectedStyles] = useState<string[]>([])
    const [referenceImage, setReferenceImage] = useState<string | null>(null)

    const toggleStyle = useCallback((styleValue: string) => {
        setSelectedStyles(prev =>
            prev.includes(styleValue)
                ? prev.filter(s => s !== styleValue)
                : [...prev, styleValue]
        )
    }, [])

    const clearStyles = useCallback(() => {
        setSelectedStyles([])
    }, [])

    const clearAll = useCallback(() => {
        setPrompt('')
        setSelectedStyles([])
        setReferenceImage(null)
    }, [])

    return {
        prompt, setPrompt,
        selectedStyles, toggleStyle, clearStyles,
        referenceImage, setReferenceImage,
        clearAll,
    }
}

export function useGenerationState() {
    const [state, setState] = useState<GenerationState>({
        status: 'idle',
        elapsedTime: 0,
        resultImageUrl: null,
        errorMessage: null,
    })

    const startGeneration = useCallback(() => {
        setState({
            status: 'generating',
            elapsedTime: 0,
            resultImageUrl: null,
            errorMessage: null,
        })
    }, [])

    const completeGeneration = useCallback((imageUrl: string) => {
        setState(prev => ({
            ...prev,
            status: 'done',
            resultImageUrl: imageUrl,
        }))
    }, [])

    const failGeneration = useCallback((error: string) => {
        setState(prev => ({
            ...prev,
            status: 'error',
            errorMessage: error,
        }))
    }, [])

    const updateElapsedTime = useCallback((time: number) => {
        setState(prev => ({ ...prev, elapsedTime: time }))
    }, [])

    const reset = useCallback(() => {
        setState({
            status: 'idle',
            elapsedTime: 0,
            resultImageUrl: null,
            errorMessage: null,
        })
    }, [])

    return {
        state,
        startGeneration,
        completeGeneration,
        failGeneration,
        updateElapsedTime,
        reset,
    }
}
