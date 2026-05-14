import { useState } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsiblePanelProps {
    title: string
    icon?: React.ReactNode
    defaultOpen?: boolean
    badge?: string | number
    children: React.ReactNode
    className?: string
}

/**
 * 可折疊面板卡片
 * 用於 Control Panel 中的各區塊（Prompt、Style、Output、Reference）
 */
export function CollapsiblePanel({
    title,
    icon,
    defaultOpen = true,
    badge,
    children,
    className,
}: CollapsiblePanelProps) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <Collapsible.Root open={open} onOpenChange={setOpen} className={cn('border-b border-panel-border', className)}>
            <Collapsible.Trigger asChild>
                <button
                    className={cn(
                        'flex items-center justify-between w-full px-5 py-3.5',
                        // DESIGN.md caption-uppercase：12px / 500 / tracking 1.5px — 編輯式分節標
                        'text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80',
                        'hover:bg-accent/60 transition-colors duration-150',
                        'cursor-pointer select-none'
                    )}
                >
                    <div className="flex items-center gap-2.5">
                        {icon && (
                            <span className="text-muted-foreground w-4 h-4 flex items-center justify-center">
                                {icon}
                            </span>
                        )}
                        <span>{title}</span>
                        {badge !== undefined && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-primary/15 text-primary normal-case tracking-normal">
                                {badge}
                            </span>
                        )}
                    </div>
                    <ChevronRight
                        className={cn(
                            'w-3.5 h-3.5 text-muted-foreground transition-transform duration-200',
                            open && 'rotate-90'
                        )}
                    />
                </button>
            </Collapsible.Trigger>

            <Collapsible.Content className="overflow-hidden data-[state=open]:animate-[collapsible-open_200ms_ease-out] data-[state=closed]:animate-[collapsible-close_200ms_ease-out]">
                <div className="px-5 pb-5 pt-1 space-y-3">
                    {children}
                </div>
            </Collapsible.Content>
        </Collapsible.Root>
    )
}
