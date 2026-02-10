import { useCallback, useRef, useState } from 'react'
import { Eraser, FileImage, Lightbulb, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PROMPT_TEMPLATES, STYLE_CATEGORIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PromptSectionProps {
    prompt: string
    onPromptChange: (value: string) => void
    selectedStyles: string[]
    onToggleStyle: (value: string) => void
    onClearStyles: () => void
    referenceImage: string | null
    onReferenceImageChange: (value: string | null) => void
    promptRef: React.RefObject<HTMLDivElement | null>
}

export function PromptSection({
    prompt,
    onPromptChange,
    selectedStyles,
    onToggleStyle,
    onClearStyles,
    referenceImage,
    onReferenceImageChange,
    promptRef,
}: PromptSectionProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 填入範例提示詞
    const handleFillExample = useCallback(() => {
        const example = '一隻穿著雨衣的柯基在雨中跳舞，水彩繪本風格，暖色調光線，背景是模糊的城市街道和五彩雨傘。'
        onPromptChange(example)
    }, [onPromptChange])

    // 處理拖拽上傳
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

    return (
        <section ref={promptRef} className="max-w-5xl mx-auto px-4 py-8">
            <div className="space-y-8">
                {/* ===== 區塊標題 ===== */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-blue-400" />
                    <h2 className="text-2xl font-bold">提示詞與風格設定</h2>
                </div>

                {/* ===== 提示詞輸入框 ===== */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground" htmlFor="promptInput">
                            畫面描述
                        </label>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs gap-1 text-muted-foreground hover:text-foreground"
                                onClick={handleFillExample}
                            >
                                <Lightbulb className="w-3.5 h-3.5" />
                                範例填入
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs gap-1 text-muted-foreground hover:text-destructive"
                                onClick={() => onPromptChange('')}
                                disabled={!prompt}
                            >
                                <Eraser className="w-3.5 h-3.5" />
                                清空
                            </Button>
                        </div>
                    </div>
                    <Textarea
                        id="promptInput"
                        placeholder="描述你想要的畫面，例如：一隻穿著雨衣的柯基在雨中跳舞"
                        className="min-h-[120px] resize-none rounded-xl border-border/50 bg-card/50 backdrop-blur-sm focus:border-primary/50 transition-colors"
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                    />
                </div>

                {/* ===== 常用提示詞範本 ===== */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground">常用提示詞範本</h3>
                    <div className="flex flex-wrap gap-2">
                        {PROMPT_TEMPLATES.map((template) => (
                            <Badge
                                key={template.name}
                                variant="outline"
                                className={cn(
                                    'cursor-pointer px-3 py-1.5 text-xs rounded-full border-border/50',
                                    'hover:border-primary/50 hover:bg-primary/5 transition-all duration-200',
                                    'select-none'
                                )}
                                onClick={() => onPromptChange(template.prompt)}
                            >
                                {template.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                <Separator className="opacity-30" />

                {/* ===== 參考圖片上傳 ===== */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <FileImage className="w-4 h-4 text-muted-foreground" />
                            參考圖片
                        </h3>
                        {referenceImage && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs gap-1 text-muted-foreground hover:text-destructive"
                                onClick={() => onReferenceImageChange(null)}
                            >
                                <X className="w-3.5 h-3.5" />
                                移除
                            </Button>
                        )}
                    </div>

                    {referenceImage ? (
                        <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-border/50 group">
                            <img
                                src={referenceImage}
                                alt="參考圖片"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onReferenceImageChange(null)}
                                >
                                    移除
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
                                isDragOver
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border/30 hover:border-primary/30 hover:bg-card/30'
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                                拖拽圖片至此處，或點擊上傳
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                部分 API 連線模式可能不支援參考圖片功能
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
                </div>

                <Separator className="opacity-30" />

                {/* ===== 風格標籤系統 ===== */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground">風格標籤</h3>
                        <Button
                            id="clearStyles"
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1 text-muted-foreground hover:text-destructive"
                            onClick={onClearStyles}
                            disabled={selectedStyles.length === 0}
                        >
                            <Eraser className="w-3.5 h-3.5" />
                            清空風格
                        </Button>
                    </div>

                    <div className="space-y-5">
                        {STYLE_CATEGORIES.map((category) => (
                            <div key={category.name} className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <span>{category.icon}</span>
                                    <span>{category.name}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {category.tags.map((tag) => {
                                        const isSelected = selectedStyles.includes(tag.value)
                                        return (
                                            <Badge
                                                key={tag.value}
                                                variant={isSelected ? 'default' : 'outline'}
                                                className={cn(
                                                    'cursor-pointer px-3 py-1.5 text-xs rounded-full transition-all duration-200 select-none',
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                                                        : 'border-border/50 hover:border-primary/40 hover:bg-primary/5'
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
                </div>
            </div>
        </section>
    )
}
