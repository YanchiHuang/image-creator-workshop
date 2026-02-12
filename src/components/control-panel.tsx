import { useCallback, useRef, useState } from 'react'
import {
    PenLine,
    Palette,
    SlidersHorizontal,
    FileImage,
    Lightbulb,
    Eraser,
    Upload,
    X,
    RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { CollapsiblePanel } from '@/components/collapsible-panel'
import {
    PROMPT_TEMPLATES,
    STYLE_CATEGORIES,
    ASPECT_RATIOS,
    RESOLUTIONS,
    FILE_FORMATS,
    SAFETY_LEVELS,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { OutputSettings } from '@/lib/store'

interface ControlPanelProps {
    // Prompt
    prompt: string
    onPromptChange: (value: string) => void
    onRandomTemplate: () => void
    // Styles
    selectedStyles: string[]
    onToggleStyle: (value: string) => void
    onClearStyles: () => void
    // Reference
    referenceImage: string | null
    onReferenceImageChange: (value: string | null) => void
    // Output
    outputSettings: OutputSettings
    onUpdateOutputSettings: (partial: Partial<OutputSettings>) => void
    onResetOutputSettings: () => void
}

export function ControlPanel({
    prompt,
    onPromptChange,
    onRandomTemplate,
    selectedStyles,
    onToggleStyle,
    onClearStyles,
    referenceImage,
    onReferenceImageChange,
    outputSettings,
    onUpdateOutputSettings,
    onResetOutputSettings,
}: ControlPanelProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 拖曳上傳處理
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = () => {
                    onReferenceImageChange(reader.result as string)
                }
                reader.readAsDataURL(file)
            }
        },
        [onReferenceImageChange]
    )

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = () => {
                    onReferenceImageChange(reader.result as string)
                }
                reader.readAsDataURL(file)
            }
        },
        [onReferenceImageChange]
    )

    const showQualitySlider =
        outputSettings.fileFormat === 'jpeg' || outputSettings.fileFormat === 'webp'

    return (
        <aside className="control-panel flex flex-col">
            {/* ===== 1. Prompt 區 ===== */}
            <CollapsiblePanel
                title="提示詞"
                icon={<PenLine className="w-4 h-4" />}
                defaultOpen={true}
            >
                {/* 提示詞輸入框 */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label
                            className="text-xs font-medium text-muted-foreground"
                            htmlFor="promptInput"
                        >
                            畫面描述
                        </label>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                                onClick={onRandomTemplate}
                            >
                                <Lightbulb className="w-3 h-3" />
                                範本
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-destructive"
                                onClick={() => onPromptChange('')}
                                disabled={!prompt}
                            >
                                <Eraser className="w-3 h-3" />
                                清空
                            </Button>
                        </div>
                    </div>
                    <Textarea
                        id="promptInput"
                        placeholder="描述你想要的畫面…"
                        className="min-h-[100px] max-h-[200px] resize-none text-sm rounded-lg border-panel-border bg-background/50 focus:border-primary/50 transition-colors"
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                    />
                </div>

                {/* 常用提示詞範本 */}
                <div className="space-y-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        快速範本
                    </span>
                    <div className="flex flex-wrap gap-1">
                        {PROMPT_TEMPLATES.map((template) => (
                            <Badge
                                key={template.name}
                                variant="outline"
                                className={cn(
                                    'cursor-pointer px-2 py-1 text-[10px] rounded-md border-border/40',
                                    'hover:border-primary/40 hover:bg-primary/5 transition-all duration-150',
                                    'select-none'
                                )}
                                onClick={() => onPromptChange(template.prompt)}
                            >
                                {template.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CollapsiblePanel>

            {/* ===== 2. Style 區 ===== */}
            <CollapsiblePanel
                title="風格標籤"
                icon={<Palette className="w-4 h-4" />}
                defaultOpen={false}
                badge={selectedStyles.length > 0 ? selectedStyles.length : undefined}
            >
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">
                        已選 {selectedStyles.length} 個
                    </span>
                    <Button
                        id="clearStyles"
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-destructive"
                        onClick={onClearStyles}
                        disabled={selectedStyles.length === 0}
                    >
                        <Eraser className="w-2.5 h-2.5" />
                        清空
                    </Button>
                </div>

                <div className="space-y-3">
                    {STYLE_CATEGORIES.map((category) => (
                        <div key={category.name} className="space-y-1.5">
                            <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {category.tags.map((tag) => {
                                    const isSelected = selectedStyles.includes(tag.value)
                                    return (
                                        <Badge
                                            key={tag.value}
                                            variant={isSelected ? 'default' : 'outline'}
                                            className={cn(
                                                'cursor-pointer px-2 py-0.5 text-[10px] rounded-md transition-all duration-150 select-none',
                                                isSelected
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'border-border/40 hover:border-primary/40 hover:bg-primary/5'
                                            )}
                                            onClick={() => onToggleStyle(tag.value)}
                                        >
                                            {tag.label}
                                        </Badge>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsiblePanel>

            {/* ===== 3. Output 區 ===== */}
            <CollapsiblePanel
                title="輸出設定"
                icon={<SlidersHorizontal className="w-4 h-4" />}
                defaultOpen={false}
            >
                <div className="flex justify-end mb-1">
                    <Button
                        id="resetOptions"
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                        onClick={onResetOutputSettings}
                    >
                        <RotateCcw className="w-2.5 h-2.5" />
                        重置
                    </Button>
                </div>

                <div className="space-y-3">
                    {/* 畫面比例 */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground" htmlFor="panelAspectRatio">
                            畫面比例
                        </label>
                        <Select
                            value={outputSettings.aspectRatio}
                            onValueChange={(v) => onUpdateOutputSettings({ aspectRatio: v })}
                        >
                            <SelectTrigger
                                id="panelAspectRatio"
                                className="h-8 text-xs rounded-lg border-panel-border bg-background/50"
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

                    {/* 解析度 */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground" htmlFor="panelResolution">
                            解析度
                        </label>
                        <Select
                            value={outputSettings.resolution}
                            onValueChange={(v) => onUpdateOutputSettings({ resolution: v })}
                        >
                            <SelectTrigger
                                id="panelResolution"
                                className="h-8 text-xs rounded-lg border-panel-border bg-background/50"
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

                    {/* 檔案格式 */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            檔案格式
                        </label>
                        <div className="flex gap-1.5">
                            {FILE_FORMATS.map((fmt) => (
                                <Badge
                                    key={fmt.value}
                                    variant={
                                        outputSettings.fileFormat === fmt.value
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={cn(
                                        'cursor-pointer px-3 py-1 text-xs rounded-lg transition-all duration-150 select-none',
                                        outputSettings.fileFormat === fmt.value
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'border-border/40 hover:border-primary/40 hover:bg-primary/5'
                                    )}
                                    onClick={() =>
                                        onUpdateOutputSettings({ fileFormat: fmt.value })
                                    }
                                >
                                    {fmt.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* 安全性過濾 */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            安全性過濾
                        </label>
                        <Select
                            value={outputSettings.safetyLevel}
                            onValueChange={(v) =>
                                onUpdateOutputSettings({ safetyLevel: v })
                            }
                        >
                            <SelectTrigger className="h-8 text-xs rounded-lg border-panel-border bg-background/50">
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

                    {/* 壓縮品質 */}
                    {showQualitySlider && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-muted-foreground">
                                    壓縮品質
                                </label>
                                <span className="text-xs font-mono text-muted-foreground tabular-nums">
                                    {outputSettings.compressionQuality}
                                </span>
                            </div>
                            <Slider
                                value={[outputSettings.compressionQuality]}
                                min={1}
                                max={100}
                                step={1}
                                onValueChange={([v]) =>
                                    onUpdateOutputSettings({ compressionQuality: v })
                                }
                                className="py-1"
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground/50">
                                <span>較小檔案</span>
                                <span>最高品質</span>
                            </div>
                        </div>
                    )}
                </div>
            </CollapsiblePanel>

            {/* ===== 4. Reference 區 ===== */}
            <CollapsiblePanel
                title="參考圖片"
                icon={<FileImage className="w-4 h-4" />}
                defaultOpen={false}
                badge={referenceImage ? '1' : undefined}
            >
                {referenceImage ? (
                    <div className="space-y-2">
                        <div className="relative rounded-lg overflow-hidden border border-panel-border group">
                            <img
                                src={referenceImage}
                                alt="參考圖片"
                                className="w-full h-36 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => onReferenceImageChange(null)}
                                >
                                    <X className="w-3 h-3 mr-1" />
                                    移除
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className={cn(
                            'border border-dashed rounded-lg p-6 text-center transition-all duration-150 cursor-pointer',
                            isDragOver
                                ? 'border-primary bg-primary/5'
                                : 'border-border/30 hover:border-primary/30 hover:bg-accent/30'
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground">
                            拖曳或點擊上傳
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                            部分模式可能不支援
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>
                )}
            </CollapsiblePanel>

            {/* 底部留白（美觀用途） */}
            <div className="flex-1" />
        </aside>
    )
}
