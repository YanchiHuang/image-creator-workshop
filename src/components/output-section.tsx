import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    ASPECT_RATIOS,
    RESOLUTIONS,
    FILE_FORMATS,
    SAFETY_LEVELS,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { OutputSettings } from '@/lib/store'

interface OutputSectionProps {
    settings: OutputSettings
    onUpdateSettings: (partial: Partial<OutputSettings>) => void
    onResetSettings: () => void
}

export function OutputSection({
    settings,
    onUpdateSettings,
    onResetSettings,
}: OutputSectionProps) {
    const showQualitySlider = settings.fileFormat === 'jpeg' || settings.fileFormat === 'webp'

    return (
        <section className="max-w-5xl mx-auto px-4 py-8">
            <div className="space-y-8">
                {/* ===== 區塊標題 ===== */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                        <h2 className="text-2xl font-bold">輸出設定</h2>
                    </div>
                    <Button
                        id="resetOptions"
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                        onClick={onResetSettings}
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        重置設定
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ===== 畫面比例 ===== */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="geminiAspectRatio">
                            畫面比例
                        </label>
                        <Select
                            value={settings.aspectRatio}
                            onValueChange={(v) => onUpdateSettings({ aspectRatio: v })}
                        >
                            <SelectTrigger
                                id="geminiAspectRatio"
                                className="rounded-xl border-border/50 bg-card/50 backdrop-blur-sm"
                            >
                                <SelectValue placeholder="選擇比例" />
                            </SelectTrigger>
                            <SelectContent>
                                {ASPECT_RATIOS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ===== 解析度 ===== */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="geminiResolution">
                            解析度 (Quality)
                        </label>
                        <Select
                            value={settings.resolution}
                            onValueChange={(v) => onUpdateSettings({ resolution: v })}
                        >
                            <SelectTrigger
                                id="geminiResolution"
                                className="rounded-xl border-border/50 bg-card/50 backdrop-blur-sm"
                            >
                                <SelectValue placeholder="選擇解析度" />
                            </SelectTrigger>
                            <SelectContent>
                                {RESOLUTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ===== 檔案格式 ===== */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">檔案格式</label>
                        <div className="flex gap-2">
                            {FILE_FORMATS.map((fmt) => (
                                <Badge
                                    key={fmt.value}
                                    variant={settings.fileFormat === fmt.value ? 'default' : 'outline'}
                                    className={cn(
                                        'cursor-pointer px-4 py-2 text-sm rounded-lg transition-all duration-200 select-none',
                                        settings.fileFormat === fmt.value
                                            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                                            : 'border-border/50 hover:border-primary/40 hover:bg-primary/5'
                                    )}
                                    onClick={() => onUpdateSettings({ fileFormat: fmt.value })}
                                >
                                    {fmt.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* ===== 安全性過濾 ===== */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">安全性過濾</label>
                        <Select
                            value={settings.safetyLevel}
                            onValueChange={(v) => onUpdateSettings({ safetyLevel: v })}
                        >
                            <SelectTrigger className="rounded-xl border-border/50 bg-card/50 backdrop-blur-sm">
                                <SelectValue placeholder="選擇安全等級" />
                            </SelectTrigger>
                            <SelectContent>
                                {SAFETY_LEVELS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* ===== 壓縮品質（僅 JPEG/WEBP） ===== */}
                {showQualitySlider && (
                    <>
                        <Separator className="opacity-30" />
                        <div className="space-y-3 max-w-md">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">壓縮品質</label>
                                <span className="text-sm font-mono text-muted-foreground tabular-nums">
                                    {settings.compressionQuality}
                                </span>
                            </div>
                            <Slider
                                value={[settings.compressionQuality]}
                                min={1}
                                max={100}
                                step={1}
                                onValueChange={([v]) => onUpdateSettings({ compressionQuality: v })}
                                className="py-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground/60">
                                <span>較小檔案</span>
                                <span>最高品質</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
