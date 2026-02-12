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
                        'flex items-center justify-between w-full px-4 py-2.5',
                        'text-sm font-medium text-foreground/90',
                        'hover:bg-accent/50 transition-colors duration-150',
                        'cursor-pointer select-none'
                    )}
                >
                    <div className="flex items-center gap-2">
                        {icon && (
                            <span className="text-muted-foreground/70 w-4 h-4 flex items-center justify-center">
                                {icon}
                            </span>
                        )}
                        <span>{title}</span>
                        {badge !== undefined && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                {badge}
                            </span>
                        )}
                    </div>
                    <ChevronRight
                        className={cn(
                            'w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200',
                            open && 'rotate-90'
                        )}
                    />
                </button>
            </Collapsible.Trigger>

            <Collapsible.Content className="overflow-hidden data-[state=open]:animate-[collapsible-open_200ms_ease-out] data-[state=closed]:animate-[collapsible-close_200ms_ease-out]">
                <div className="px-4 pb-4 pt-1 space-y-3">
                    {children}
                </div>
            </Collapsible.Content>
        </Collapsible.Root>
    )
}
