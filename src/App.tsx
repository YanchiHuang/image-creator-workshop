import { useState, useCallback, useMemo, useEffect } from 'react'
import { HeaderBar } from '@/components/header-bar'
import { ControlPanel } from '@/components/control-panel'
import { ResultArea } from '@/components/result-area'
import { SettingsModal } from '@/components/settings-modal'
import {
  useAppSettings,
  useOutputSettings,
  usePromptState,
  useGenerationState,
  useHistoryState,
  type HistoryItem,
} from '@/lib/store'
import { PROMPT_TEMPLATES } from '@/lib/constants'
import type { ConnectionType } from '@/lib/constants'
import { ImageGenerator } from '@/lib/services/image-generator'
import { APIError } from '@/lib/services/types'
import { manualResolve } from '@/lib/services/browser-extension'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  // 初始化 API 服務
  const imageGenerator = useMemo(() => new ImageGenerator(), [])

  // 全域狀態
  const { settings: appSettings, updateSettings: updateAppSettings } =
    useAppSettings()
  const {
    settings: outputSettings,
    updateSettings: updateOutputSettings,
    resetSettings: resetOutputSettings,
  } = useOutputSettings()
  const {
    prompt,
    setPrompt,
    selectedStyles,
    toggleStyle,
    clearStyles,
    setSelectedStyles,
    referenceImage,
    setReferenceImage,
  } = usePromptState()
  const {
    state: generationState,
    startGeneration,
    completeGeneration,
    failGeneration,
    updateElapsedTime,
    setResultImage,
  } = useGenerationState()

  // 歷史紀錄
  const { history, addToHistory, clearHistory, deleteHistoryItem } =
    useHistoryState()

  // ===== postMessage 監聽器：接收瀏覽器擴充功能回傳的圖片 =====
  useEffect(() => {
    const allowedOrigins = ['https://chatgpt.com', 'https://gemini.google.com']

    const handleExtensionMessage = (event: MessageEvent) => {
      // 安全性驗證：只接受允許來源
      if (!allowedOrigins.includes(event.origin)) return

      const data = event.data
      if (!data || typeof data !== 'object') return

      const { type, imageUrl, imageBase64 } = data as {
        type?: string
        imageUrl?: string
        imageBase64?: string
      }

      // 支援多種訊息格式以相容不同版本的擴充功能
      if (type !== 'IMAGE_RESULT' && type !== 'CHATGPT_IMAGE_RESULT') return

      const finalUrl = imageUrl || imageBase64
      if (!finalUrl || typeof finalUrl !== 'string') return

      // 更新顯示圖片（不重設計時器 / 歷史紀錄）
      setResultImage(finalUrl)
    }

    window.addEventListener('message', handleExtensionMessage)
    return () => window.removeEventListener('message', handleExtensionMessage)
  }, [setResultImage])

  // ===== 剪貼簿貼上圖片 =====
  const handlePasteImage = useCallback(async () => {
    try {
      if (!navigator.clipboard?.read) {
        alert('您的瀏覽器不支援剪貼簿讀取，請改用「貼上圖片 URL」欄位。')
        return
      }
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'))
        if (imageType) {
          const blob = await item.getType(imageType)
          const url = URL.createObjectURL(blob)
          setResultImage(url)
          return
        }
      }
      alert('剪貼簿中沒有找到圖片，請先在 ChatGPT / Gemini 右鍵「複製圖片」。')
    } catch (err) {
      console.error('讀取剪貼簿失敗:', err)
      alert('無法讀取剪貼簿，請確認已授予「剪貼簿讀取」權限。')
    }
  }, [setResultImage])

  // 隨機範本
  const handleRandomTemplate = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * PROMPT_TEMPLATES.length)
    setPrompt(PROMPT_TEMPLATES[randomIndex].prompt)
  }, [setPrompt])

  // 切換 Provider
  const handleChangeProvider = useCallback(
    (provider: ConnectionType) => {
      updateAppSettings({ connectionType: provider })
    },
    [updateAppSettings]
  )

  // 還原歷史紀錄
  const handleRestoreHistory = useCallback(
    (item: HistoryItem) => {
      setPrompt(item.prompt)
      clearStyles()
      setSelectedStyles(item.styleTags)
      updateOutputSettings({ aspectRatio: item.aspectRatio })
    },
    [setPrompt, clearStyles, setSelectedStyles, updateOutputSettings]
  )

  // 開始生成影像
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return

    startGeneration()

    try {
      const result = await imageGenerator.generate({
        prompt,
        styleTags: selectedStyles,
        referenceImage,
        appSettings,
        outputSettings,
      })

      completeGeneration(result.url)

      // 新增至歷史紀錄
      addToHistory({
        prompt,
        imageUrl: result.url,
        styleTags: selectedStyles,
        aspectRatio: outputSettings.aspectRatio,
        modelName: appSettings.connectionType,
      })

      if (result.revisedPrompt) {
        console.log('API 修飾後的提示詞:', result.revisedPrompt)
      }
    } catch (err) {
      console.error('生成失敗:', err)
      const message =
        err instanceof APIError
          ? `${err.message} (${err.code || 'UNKNOWN'})`
          : err instanceof Error
            ? err.message
            : '未知錯誤'

      failGeneration(message)
    }
  }, [
    prompt,
    selectedStyles,
    referenceImage,
    outputSettings,
    appSettings,
    startGeneration,
    completeGeneration,
    failGeneration,
    imageGenerator,
    addToHistory,
  ])

  return (
    <div className="workstation-layout bg-background text-foreground">
      {/* ===== Header（系統環境層） ===== */}
      <HeaderBar
        settings={appSettings}
        onOpenSettings={() => setSettingsOpen(true)}
        onChangeProvider={handleChangeProvider}
      />

      {/* ===== 雙欄主體 ===== */}
      <div className="workstation-main">
        {/* 左側：Control Panel（30%） */}
        <ControlPanel
          prompt={prompt}
          onPromptChange={setPrompt}
          onRandomTemplate={handleRandomTemplate}
          selectedStyles={selectedStyles}
          onToggleStyle={toggleStyle}
          onClearStyles={clearStyles}
          referenceImage={referenceImage}
          onReferenceImageChange={setReferenceImage}
          outputSettings={outputSettings}
          onUpdateOutputSettings={updateOutputSettings}
          onResetOutputSettings={resetOutputSettings}
        />

        {/* 右側：Result / Preview Area（70%） */}
        <ResultArea
          generationState={generationState}
          prompt={prompt}
          onGenerate={handleGenerate}
          onUpdateElapsedTime={updateElapsedTime}
          connectionType={appSettings.connectionType}
          onManualImageUrl={manualResolve}
          onPasteImage={handlePasteImage}
          history={history}
          onDeleteHistoryItem={deleteHistoryItem}
          onClearHistory={clearHistory}
          onRestoreHistory={handleRestoreHistory}
        />
      </div>

      {/* 系統設定彈窗 */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={appSettings}
        onUpdateSettings={updateAppSettings}
      />
    </div>
  )
}

export default App
