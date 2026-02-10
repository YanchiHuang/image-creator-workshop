import { useRef, useState, useCallback, useMemo } from 'react'
import { HeroSection } from '@/components/hero-section'
import { PromptSection } from '@/components/prompt-section'
import { OutputSection } from '@/components/output-section'
import { GenerateSection } from '@/components/generate-section'
import { HistorySection } from '@/components/history-section'
import { SettingsModal } from '@/components/settings-modal'
import { Footer } from '@/components/footer'
import { Separator } from '@/components/ui/separator'
import {
  useAppSettings,
  useOutputSettings,
  usePromptState,
  useGenerationState,
  useHistoryState,
  type HistoryItem,
} from '@/lib/store'
import { PROMPT_TEMPLATES } from '@/lib/constants'
import { ImageGenerator } from '@/lib/services/image-generator'
import { APIError } from '@/lib/services/types'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const promptRef = useRef<HTMLDivElement>(null)

  // 初始化 API 服務
  const imageGenerator = useMemo(() => new ImageGenerator(), [])

  // 全域狀態
  const { settings: appSettings, updateSettings: updateAppSettings } = useAppSettings()
  const { settings: outputSettings, updateSettings: updateOutputSettings, resetSettings: resetOutputSettings } = useOutputSettings()
  const {
    prompt, setPrompt,
    selectedStyles, toggleStyle, clearStyles, setSelectedStyles,
    referenceImage, setReferenceImage,
  } = usePromptState()
  const {
    state: generationState,
    startGeneration,
    completeGeneration,
    failGeneration,
    updateElapsedTime,
  } = useGenerationState()

  // 歷史紀錄狀態
  const {
    history,
    addToHistory,
    clearHistory,
    deleteHistoryItem
  } = useHistoryState()

  // 捲動至提示詞區
  const scrollToPrompt = useCallback(() => {
    promptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // 隨機填入範本
  const handleRandomTemplate = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * PROMPT_TEMPLATES.length)
    setPrompt(PROMPT_TEMPLATES[randomIndex].prompt)
    scrollToPrompt()
  }, [setPrompt, scrollToPrompt])

  // 還原歷史紀錄
  const handleRestoreHistory = useCallback((item: HistoryItem) => {
    setPrompt(item.prompt)
    clearStyles() // Clear existing styles
    setSelectedStyles(item.styleTags) // Set new styles

    // 更新 output settings
    updateOutputSettings({
      aspectRatio: item.aspectRatio,
    })

    scrollToPrompt()
  }, [setPrompt, clearStyles, setSelectedStyles, updateOutputSettings, scrollToPrompt])

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
        modelName: appSettings.connectionType, // 或更詳細的模型名
      })

      if (result.revisedPrompt) {
        console.log('API 修飾後的提示詞:', result.revisedPrompt)
      }
    } catch (err) {
      console.error('生成失敗:', err)
      const message = err instanceof APIError
        ? `${err.message} (${err.code || 'UNKNOWN'})`
        : err instanceof Error ? err.message : '未知錯誤'

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
    addToHistory
  ])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 背景紋理 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative">
        <HeroSection
          settings={appSettings}
          onOpenSettings={() => setSettingsOpen(true)}
          onScrollToPrompt={scrollToPrompt}
          onRandomTemplate={handleRandomTemplate}
        />

        <div className="max-w-5xl mx-auto px-4">
          <Separator className="opacity-10" />
        </div>

        <div ref={promptRef}>
          <PromptSection
            prompt={prompt}
            onPromptChange={setPrompt}
            selectedStyles={selectedStyles}
            onToggleStyle={toggleStyle}
            onClearStyles={clearStyles}
            onRandomTemplate={handleRandomTemplate}
            referenceImage={referenceImage}
            onReferenceImageChange={setReferenceImage}
            promptRef={promptRef}
          />
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <Separator className="opacity-10" />
        </div>

        <OutputSection
          settings={outputSettings}
          onUpdateSettings={updateOutputSettings}
          onResetSettings={resetOutputSettings}
        />

        <div className="max-w-5xl mx-auto px-4">
          <Separator className="opacity-10" />
        </div>

        {/* 開始生圖與結果展示 */}
        <GenerateSection
          generationState={generationState}
          prompt={prompt}
          onGenerate={handleGenerate}
          onUpdateElapsedTime={updateElapsedTime}
        />

        {/* 歷史紀錄區塊 */}
        {history.length > 0 && (
          <>
            <div className="max-w-5xl mx-auto px-4">
              <Separator className="opacity-10" />
            </div>
            <HistorySection
              history={history}
              onDelete={deleteHistoryItem}
              onClear={clearHistory}
              onRestore={handleRestoreHistory}
            />
          </>
        )}

        {/* 頁尾 */}
        <Footer />
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
