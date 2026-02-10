import { Separator } from '@/components/ui/separator'

export function Footer() {
    return (
        <footer className="max-w-5xl mx-auto px-4 py-8 mt-8">
            <Separator className="opacity-20 mb-8" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/60">
                <div className="flex items-center gap-2">
                    <span>© 2026 生圖工坊</span>
                    <span className="hidden md:inline">·</span>
                    <span className="hidden md:inline">由 Claude / Gemini 設計開發</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full border border-border/30 text-[10px] font-mono">
                        v0.0.1
                    </span>
                </div>
            </div>
        </footer>
    )
}
