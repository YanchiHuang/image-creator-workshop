import { useEffect, useRef, useCallback } from 'react'
import { Download, Maximize2, Rocket, Loader2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { GenerationState } from '@/lib/store'

interface GenerateSectionProps {
    generationState: GenerationState
    prompt: string
    onGenerate: () => void
    onUpdateElapsedTime: (time: number) => void
}

export function GenerateSection({
    generationState,
    prompt,
    onGenerate,
    onUpdateElapsedTime,
}: GenerateSectionProps) {
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const startTimeRef = useRef<number>(0)

    // 計時器效果
    useEffect(() => {
        if (generationState.status === 'generating') {
            startTimeRef.current = Date.now()
            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
                onUpdateElapsedTime(elapsed)
            }, 1000)
        } else if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [generationState.status, onUpdateElapsedTime])

    // 格式化時間
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    // 取得狀態文字
    const getStatusText = () => {
        switch (generationState.status) {
            case 'idle':
                return '等待輸入'
            case 'generating':
                return '生成中...'
            case 'done':
                return '生成完成'
            case 'error':
                return '生成失敗'
        }
    }

    // 取得狀態顏色
    const getStatusColor = () => {
        switch (generationState.status) {
            case 'idle':
                return 'text-muted-foreground'
            case 'generating':
                return 'text-warning'
            case 'done':
                return 'text-success'
            case 'error':
                return 'text-destructive'
        }
    }

    // 下載生成的影像
    const handleDownload = useCallback(() => {
        if (!generationState.resultImageUrl) return
        const a = document.createElement('a')
        a.href = generationState.resultImageUrl
        a.download = `image-creator-${Date.now()}.png`
        a.click()
    }, [generationState.resultImageUrl])

    // 全螢幕檢視
    const handleFullscreen = useCallback(() => {
        if (!generationState.resultImageUrl) return
        window.open(generationState.resultImageUrl, '_blank')
    }, [generationState.resultImageUrl])

    const isGenerating = generationState.status === 'generating'
    const canGenerate = prompt.trim().length > 0 && !isGenerating

    return (
        <section className="max-w-5xl mx-auto px-4 py-8">
            <div className="space-y-8">
                {/* ===== 區塊標題 ===== */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-emerald-400" />
                    <h2 className="text-2xl font-bold">開始生圖</h2>
                </div>

                {/* ===== 生成控制 ===== */}
                <div className="flex flex-col items-center gap-6">
                    {/* 狀態指示 */}
                    <div className="flex items-center gap-4 text-sm">
                        <span className={getStatusColor()}>{getStatusText()}</span>
                        {generationState.status !== 'idle' && (
                            <>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="font-mono text-muted-foreground tabular-nums">
                                    {formatTime(generationState.elapsedTime)}
                                </span>
                            </>
                        )}
                    </div>

                    {/* 生成按鈕 */}
                    <Button
                        id="generateButton"
                        size="lg"
                        className="gap-2.5 px-10 py-6 text-lg rounded-2xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-xl shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
                        disabled={!canGenerate}
                        onClick={onGenerate}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                生成中...
                            </>
                        ) : (
                            <>
                                <Rocket className="w-5 h-5" />
                                🚀 開始生成
                            </>
                        )}
                    </Button>

                    {!prompt.trim() && generationState.status === 'idle' && (
                        <p className="text-xs text-muted-foreground/60">
                            請先輸入畫面描述，再點擊生成按鈕
                        </p>
                    )}
                </div>

                <Separator className="opacity-30" />

                {/* ===== 結果展示區 ===== */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        生成結果
                    </h3>

                    {generationState.resultImageUrl ? (
                        <div className="space-y-4">
                            {/* 影像預覽 */}
                            <div className="relative rounded-2xl overflow-hidden border border-border/30 bg-card/20 backdrop-blur-sm group">
                                <img
                                    src={generationState.resultImageUrl}
                                    alt="AI 生成影像"
                                    className="w-full max-h-[600px] object-contain cursor-pointer"
                                    onClick={handleFullscreen}
                                />
                                {/* 懸停操作列 */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="gap-1.5 rounded-lg"
                                            onClick={handleDownload}
                                        >
                                            <Download className="w-4 h-4" />
                                            下載
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="gap-1.5 rounded-lg"
                                            onClick={handleFullscreen}
                                        >
                                            <Maximize2 className="w-4 h-4" />
                                            全螢幕
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border-2 border-dashed border-border/20 bg-card/10 p-16 text-center">
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                            <p className="text-sm text-muted-foreground/40">
                                {isGenerating ? '影像生成中，請稍候...' : '生成的影像將顯示在這裡'}
                            </p>
                        </div>
                    )}

                    {generationState.status === 'error' && generationState.errorMessage && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                            {generationState.errorMessage}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
