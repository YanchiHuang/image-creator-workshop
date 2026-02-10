import { useRef, useState, useCallback } from 'react'
import { HeroSection } from '@/components/hero-section'
import { PromptSection } from '@/components/prompt-section'
import { OutputSection } from '@/components/output-section'
import { GenerateSection } from '@/components/generate-section'
import { SettingsModal } from '@/components/settings-modal'
import { Footer } from '@/components/footer'
import { Separator } from '@/components/ui/separator'
import {
  useAppSettings,
  useOutputSettings,
  usePromptState,
  useGenerationState,
} from '@/lib/store'
import { PROMPT_TEMPLATES } from '@/lib/constants'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const promptRef = useRef<HTMLDivElement>(null)

  // 全域狀態
  const { settings: appSettings, updateSettings: updateAppSettings } = useAppSettings()
  const { settings: outputSettings, updateSettings: updateOutputSettings, resetSettings: resetOutputSettings } = useOutputSettings()
  const {
    prompt, setPrompt,
    selectedStyles, toggleStyle, clearStyles,
    referenceImage, setReferenceImage,
  } = usePromptState()
  const {
    state: generationState,
    startGeneration,
    completeGeneration,
    failGeneration,
    updateElapsedTime,
  } = useGenerationState()

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

  // 模擬生成影像（示範用）
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return

    startGeneration()

    // 組合完整提示詞（加上風格標籤）
    const fullPrompt = selectedStyles.length > 0
      ? `${prompt}\n\nStyle: ${selectedStyles.join(', ')}`
      : prompt

    console.log('生成提示詞:', fullPrompt)
    console.log('輸出設定:', outputSettings)
    console.log('API 設定:', appSettings)

    try {
      // 模擬 API 呼叫延遲
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 模擬成功 — 使用 placeholder 圖片
      const width = outputSettings.aspectRatio === '1024x1536' ? 1024 : 1536
      const height = outputSettings.aspectRatio === '1024x1536' ? 1536 : 1024
      const placeholderUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`

      completeGeneration(placeholderUrl)
    } catch (err) {
      failGeneration(err instanceof Error ? err.message : '未知錯誤')
    }
  }, [prompt, selectedStyles, outputSettings, appSettings, startGeneration, completeGeneration, failGeneration])

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
        {/* 頁頭區 */}
        <HeroSection
          settings={appSettings}
          onOpenSettings={() => setSettingsOpen(true)}
          onScrollToPrompt={scrollToPrompt}
          onRandomTemplate={handleRandomTemplate}
        />

        <div className="max-w-5xl mx-auto px-4">
          <Separator className="opacity-10" />
        </div>

        {/* 提示詞與風格設定 */}
        <PromptSection
          prompt={prompt}
          onPromptChange={setPrompt}
          selectedStyles={selectedStyles}
          onToggleStyle={toggleStyle}
          onClearStyles={clearStyles}
          referenceImage={referenceImage}
          onReferenceImageChange={setReferenceImage}
          promptRef={promptRef}
        />

        <div className="max-w-5xl mx-auto px-4">
          <Separator className="opacity-10" />
        </div>

        {/* 輸出設定 */}
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
