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
    azureDeployment: string
    azureApiVersion: string
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
    openaiModel: 'dall-e-3',
    openaiApiKey: '',
    azureEndpoint: '',
    azureDeployment: 'dall-e-3',
    azureApiVersion: '2024-02-01',
    azureApiKey: '',
    geminiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    geminiModel: 'imagen-3.0-generate-001',
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

const STORAGE_KEYS = {
    APP_SETTINGS: 'GPT_IMAGE_APP_SETTINGS_V1',
    OUTPUT_SETTINGS: 'GPT_IMAGE_OUTPUT_SETTINGS_V1',
    HISTORY: 'GPT_IMAGE_HISTORY_V1',
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const stored = localStorage.getItem(key)
        if (!stored) return defaultValue
        const parsed = JSON.parse(stored)
        // 若 defaultValue 是陣列，直接回傳解析結果（需確認也是陣列）
        if (Array.isArray(defaultValue)) {
            return (Array.isArray(parsed) ? parsed : defaultValue) as T
        }
        return { ...defaultValue, ...parsed }
    } catch (e) {
        console.warn(`Failed to load ${key} from storage`, e)
        return defaultValue
    }
}

function saveToStorage<T>(key: string, value: T) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
        console.warn(`Failed to save ${key} to storage`, e)
    }
}

// ===== 歷史紀錄介面 =====
export interface HistoryItem {
    id: string
    timestamp: number
    prompt: string
    imageUrl: string | null
    styleTags: string[]
    aspectRatio: string
    modelName: string
}

const MAX_HISTORY_ITEMS = 10

// ===== 自訂 Hook =====

export function useHistoryState() {
    const [history, setHistory] = useState<HistoryItem[]>(() =>
        loadFromStorage(STORAGE_KEYS.HISTORY, [])
    )

    const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        setHistory(prev => {
            const newItem: HistoryItem = {
                ...item,
                id: crypto.randomUUID(),
                timestamp: Date.now(),
            }
            const next = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS)
            saveToStorage(STORAGE_KEYS.HISTORY, next)
            return next
        })
    }, [])

    const clearHistory = useCallback(() => {
        setHistory([])
        saveToStorage(STORAGE_KEYS.HISTORY, [])
    }, [])

    const deleteHistoryItem = useCallback((id: string) => {
        setHistory(prev => {
            const next = prev.filter(item => item.id !== id)
            saveToStorage(STORAGE_KEYS.HISTORY, next)
            return next
        })
    }, [])

    return { history, addToHistory, clearHistory, deleteHistoryItem }
}

// ===== 自訂 Hook =====
export function useAppSettings() {
    const [settings, setSettings] = useState<AppSettings>(() =>
        loadFromStorage(STORAGE_KEYS.APP_SETTINGS, DEFAULT_APP_SETTINGS)
    )

    const updateSettings = useCallback((partial: Partial<AppSettings>) => {
        setSettings(prev => {
            const next = { ...prev, ...partial }
            saveToStorage(STORAGE_KEYS.APP_SETTINGS, next)
            return next
        })
    }, [])

    return { settings, updateSettings }
}

export function useOutputSettings() {
    const [settings, setSettings] = useState<OutputSettings>(() =>
        loadFromStorage(STORAGE_KEYS.OUTPUT_SETTINGS, DEFAULT_OUTPUT_SETTINGS)
    )

    const updateSettings = useCallback((partial: Partial<OutputSettings>) => {
        setSettings(prev => {
            const next = { ...prev, ...partial }
            saveToStorage(STORAGE_KEYS.OUTPUT_SETTINGS, next)
            return next
        })
    }, [])

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_OUTPUT_SETTINGS)
        saveToStorage(STORAGE_KEYS.OUTPUT_SETTINGS, DEFAULT_OUTPUT_SETTINGS)
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
        selectedStyles, toggleStyle, clearStyles, setSelectedStyles,
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
