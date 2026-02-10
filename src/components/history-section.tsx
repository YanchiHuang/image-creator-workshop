
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Trash2, History, RotateCcw, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { HistoryItem } from '@/lib/store'

interface HistorySectionProps {
    history: HistoryItem[]
    onDelete: (id: string) => void
    onClear: () => void
    onRestore: (item: HistoryItem) => void
}

export function HistorySection({ history, onDelete, onClear, onRestore }: HistorySectionProps) {
    if (history.length === 0) return null

    return (
        <section className="max-w-5xl mx-auto px-4 py-8">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">生成歷史紀錄</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                            最近 {history.length} 筆
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="text-muted-foreground hover:text-destructive text-xs h-8"
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        清除全部
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="group relative flex flex-col gap-3 p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all hover:shadow-sm"
                        >
                            {/* 縮圖區域 */}
                            <div className="relative aspect-[16/9] bg-muted/30 rounded-lg overflow-hidden border border-border/20">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.prompt}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground/30">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => onRestore(item)}
                                        className="h-8 text-xs bg-white/90 hover:bg-white text-black border-none"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                        再次使用
                                    </Button>
                                </div>
                            </div>

                            {/* 資訊區域 */}
                            <div className="space-y-2 flex-1 min-w-0">
                                <p className="text-sm text-foreground/90 line-clamp-2 leading-relaxed" title={item.prompt}>
                                    {item.prompt}
                                </p>
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <span>{item.aspectRatio}</span>
                                        {item.styleTags.length > 0 && (
                                            <>
                                                <span>•</span>
                                                <span className="truncate max-w-[100px]">{item.styleTags[0]}</span>
                                            </>
                                        )}
                                    </div>
                                    <time dateTime={new Date(item.timestamp).toISOString()}>
                                        {formatDistanceToNow(item.timestamp, { addSuffix: true, locale: zhTW })}
                                    </time>
                                </div>
                            </div>

                            {/* 刪除按鈕 */}
                            <button
                                onClick={() => onDelete(item.id)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                                title="刪除此紀錄"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>

                <Separator className="opacity-30 mt-8" />
            </div>
        </section>
    )
}
