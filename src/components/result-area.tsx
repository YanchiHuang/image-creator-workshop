import { useEffect, useRef, useCallback, useState } from 'react'
import {
    Download,
    Maximize2,
    Rocket,
    Loader2,
    ImageIcon,
    AlertCircle,
    RefreshCw,
    Copy,
    History,
    Trash2,
    RotateCcw,
    Link,
    ClipboardPaste,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { GenerationState, HistoryItem } from '@/lib/store'
import type { ConnectionType } from '@/lib/constants'

interface ResultAreaProps {
    // 生成控制
    generationState: GenerationState
    prompt: string
    onGenerate: () => void
    onUpdateElapsedTime: (time: number) => void
    connectionType: ConnectionType
    onManualImageUrl?: (url: string) => void
    onPasteImage?: () => void
    // 歷史紀錄
    history: HistoryItem[]
    onDeleteHistoryItem: (id: string) => void
    onClearHistory: () => void
    onRestoreHistory: (item: HistoryItem) => void
}

export function ResultArea({
    generationState,
    prompt,
    onGenerate,
    onUpdateElapsedTime,
    connectionType,
    onManualImageUrl,
    onPasteImage,
    history,
    onDeleteHistoryItem,
    onClearHistory,
    onRestoreHistory,
}: ResultAreaProps) {
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const startTimeRef = useRef<number>(0)
    const [manualUrl, setManualUrl] = useState('')

    const isBrowserExtension = connectionType === 'chatgpt' || connectionType === 'gemini'

    const handleManualSubmit = useCallback(() => {
        const trimmed = manualUrl.trim()
        if (!trimmed || !onManualImageUrl) return
        onManualImageUrl(trimmed)
        setManualUrl('')
    }, [manualUrl, onManualImageUrl])

    // 計時器
    useEffect(() => {
        if (generationState.status === 'generating') {
            startTimeRef.current = Date.now()
            timerRef.current = setInterval(() => {
                const elapsed = Math.floor(
                    (Date.now() - startTimeRef.current) / 1000
                )
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

    // 狀態文字與顏色
    const statusConfig = {
        idle: { text: '等待輸入', color: 'text-muted-foreground', dot: 'bg-muted-foreground/30' },
        generating: { text: '生成中…', color: 'text-warning', dot: 'bg-warning animate-pulse-dot' },
        done: { text: '生成完成', color: 'text-success', dot: 'bg-success' },
        error: { text: '生成失敗', color: 'text-destructive', dot: 'bg-destructive' },
    }[generationState.status]

    // 下載
    const handleDownload = useCallback(() => {
        if (!generationState.resultImageUrl) return
        const a = document.createElement('a')
        a.href = generationState.resultImageUrl
        a.download = `image-creator-${Date.now()}.png`
        a.click()
    }, [generationState.resultImageUrl])

    // 全螢幕
    const handleFullscreen = useCallback(() => {
        if (!generationState.resultImageUrl) return
        window.open(generationState.resultImageUrl, '_blank')
    }, [generationState.resultImageUrl])

    // 複製提示詞
    const handleCopyPrompt = useCallback(() => {
        if (!prompt) return
        navigator.clipboard.writeText(prompt)
    }, [prompt])

    const isGenerating = generationState.status === 'generating'
    const canGenerate = prompt.trim().length > 0 && !isGenerating

    return (
        <main className="result-area flex flex-col">
            {/* ===== 上方：生成控制列 ===== */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
                <div className="flex items-center gap-3">
                    {/* 狀態圓點 */}
                    <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                    <span className={`text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.text}
                    </span>
                    {generationState.status !== 'idle' && (
                        <>
                            <div className="w-px h-3.5 bg-border/50" />
                            <span className="text-xs font-mono text-muted-foreground tabular-nums">
                                {formatTime(generationState.elapsedTime)}
                            </span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* 複製 Prompt */}
                    {prompt && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                            onClick={handleCopyPrompt}
                            title="複製提示詞"
                        >
                            <Copy className="w-3 h-3" />
                        </Button>
                    )}
                    {/* 剪貼簿貼上圖片按鈕 — 瀏覽器模式或已有結果時顯示 */}
                    {onPasteImage && !isGenerating && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs gap-1.5 rounded-md border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40"
                            onClick={onPasteImage}
                            title="從剪貼簿貼上圖片（在 ChatGPT 複製圖片後點此）"
                        >
                            <ClipboardPaste className="w-3.5 h-3.5" />
                            貼上圖片
                        </Button>
                    )}
                    {/* 生成按鈕（主要 CTA — DESIGN.md button-primary：coral fill、rounded-md、StyreneB 14px/500） */}
                    <Button
                        id="generateButton"
                        size="sm"
                        className="h-10 px-5 text-sm gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary-active font-medium transition-colors duration-150 disabled:opacity-40"
                        disabled={!canGenerate}
                        onClick={onGenerate}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                生成中
                            </>
                        ) : (
                            <>
                                <Rocket className="w-3.5 h-3.5" />
                                開始生成
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* ===== 中間：結果展示區 ===== */}
            <div className="flex-1 overflow-y-auto p-5">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* 圖片展示 — DESIGN.md product-mockup-card-dark：surface-dark 包覆預覽 */}
                    {generationState.resultImageUrl ? (
                        <div className="space-y-3 animate-fade-in-up">
                            {/* 影像預覽：深海軍藍卡片承載產品結果 */}
                            <div className="relative rounded-xl overflow-hidden bg-surface-dark p-3 group">
                                <img
                                    src={generationState.resultImageUrl}
                                    alt="AI 生成影像"
                                    className="w-full max-h-[calc(100vh-280px)] object-contain cursor-pointer rounded-lg"
                                    onClick={handleFullscreen}
                                />
                                {/* 懸停操作列 */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-7 text-xs gap-1 rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-none"
                                            onClick={handleCopyPrompt}
                                        >
                                            <Copy className="w-3 h-3" />
                                            Prompt
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-7 text-xs gap-1 rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-none"
                                            onClick={handleDownload}
                                        >
                                            <Download className="w-3 h-3" />
                                            下載
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-7 text-xs gap-1 rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-none"
                                            onClick={handleFullscreen}
                                        >
                                            <Maximize2 className="w-3 h-3" />
                                            放大
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // 空白狀態：編輯式 hero-band — 襯線標題 + 副標、cream canvas
                        <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center min-h-[360px] text-center px-8 py-12">
                            {isGenerating ? (
                                <div className="space-y-5 w-full max-w-md">
                                    <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
                                    {isBrowserExtension ? (
                                        <>
                                            <p className="font-display text-2xl text-foreground tracking-tight">
                                                已在新分頁開啟
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                圖片生成後，若擴充功能支援自動回傳，結果將自動顯示於此。
                                                <br />否則請從瀏覽器複製圖片網址後貼到下方。
                                            </p>
                                            {/* 手動貼上 URL 備案 */}
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    placeholder="貼上圖片 URL…"
                                                    value={manualUrl}
                                                    onChange={(e) => setManualUrl(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                                                    className="h-8 text-xs rounded-md border-border/50 bg-card/50"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-3 text-xs shrink-0 gap-1"
                                                    disabled={!manualUrl.trim()}
                                                    onClick={handleManualSubmit}
                                                >
                                                    <Link className="w-3 h-3" />
                                                    確認
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-display text-2xl text-foreground tracking-tight">
                                                正在繪製您的想像…
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                模型運算需要一些時間，請稍候片刻
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <ImageIcon className="w-12 h-12 text-muted-foreground/40 mb-5" />
                                    <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight mb-3">
                                        將文字化為畫面
                                    </h2>
                                    <p className="text-sm text-muted-foreground max-w-md">
                                        在左側輸入您的描述，選擇風格與輸出設定，
                                        生成的影像將在這片畫布上呈現。
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* 錯誤訊息 */}
                    {generationState.status === 'error' &&
                        generationState.errorMessage && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2.5 animate-fade-in-up">
                                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                <div className="space-y-2 flex-1 min-w-0">
                                    <p className="text-xs font-medium text-destructive">
                                        {generationState.errorMessage}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onGenerate}
                                        className="h-6 px-2 text-[10px] border-destructive/20 hover:bg-destructive/10 text-destructive hover:text-destructive"
                                    >
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        重試
                                    </Button>
                                </div>
                            </div>
                        )}

                    {/* ===== 歷史紀錄 Grid ===== */}
                    {history.length > 0 && (
                        <>
                            <Separator className="opacity-10" />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <History className="w-4 h-4 text-muted-foreground" />
                                        <h3 className="font-display text-xl text-foreground tracking-tight">
                                            歷史紀錄
                                        </h3>
                                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-card text-muted-foreground font-medium">
                                            {history.length}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClearHistory}
                                        className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        清除
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    {history.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group relative rounded-lg border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-150"
                                        >
                                            {/* 縮圖 */}
                                            <div className="relative aspect-[4/3] bg-muted/20">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.prompt}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full">
                                                        <ImageIcon className="w-6 h-6 text-muted-foreground/20" />
                                                    </div>
                                                )}

                                                {/* 懸停操作 */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => onRestoreHistory(item)}
                                                        className="h-7 text-[10px] bg-white/90 hover:bg-white text-black border-none"
                                                    >
                                                        <RotateCcw className="w-3 h-3 mr-1" />
                                                        再次使用
                                                    </Button>
                                                </div>

                                                {/* 刪除按鈕 */}
                                                <button
                                                    onClick={() =>
                                                        onDeleteHistoryItem(item.id)
                                                    }
                                                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive"
                                                    title="刪除"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* 資訊 */}
                                            <div className="p-2 space-y-1">
                                                <p
                                                    className="text-[11px] text-foreground/80 line-clamp-2 leading-relaxed"
                                                    title={item.prompt}
                                                >
                                                    {item.prompt}
                                                </p>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                                                    <span>{item.aspectRatio}</span>
                                                    <time
                                                        dateTime={new Date(
                                                            item.timestamp
                                                        ).toISOString()}
                                                    >
                                                        {formatDistanceToNow(
                                                            item.timestamp,
                                                            {
                                                                addSuffix: true,
                                                                locale: zhTW,
                                                            }
                                                        )}
                                                    </time>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ===== 底部狀態列 — DESIGN.md footer caption 風格 ===== */}
            <div className="flex items-center justify-between px-6 py-2 border-t border-border bg-background text-[11px] text-muted-foreground shrink-0">
                <span>© 2026 映像製作所 · 由 Claude / Gemini 設計開發</span>
                <span className="font-mono uppercase tracking-[0.12em]">v0.2.0</span>
            </div>
        </main>
    )
}
