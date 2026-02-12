import { useState, useCallback, useMemo } from 'react'
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
  } = useGenerationState()

  // 歷史紀錄
  const { history, addToHistory, clearHistory, deleteHistoryItem } =
    useHistoryState()

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
