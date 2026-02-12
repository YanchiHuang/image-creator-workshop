import { Settings, Wifi, WifiOff, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModeToggle } from '@/components/mode-toggle'
import { CONNECTION_OPTIONS } from '@/lib/constants'
import type { ConnectionType } from '@/lib/constants'
import type { AppSettings } from '@/lib/store'

interface HeaderBarProps {
    settings: AppSettings
    onOpenSettings: () => void
    onChangeProvider: (provider: ConnectionType) => void
}

export function HeaderBar({
    settings,
    onOpenSettings,
    onChangeProvider,
}: HeaderBarProps) {
    // 取得目前模型名稱
    const getModelName = () => {
        switch (settings.connectionType) {
            case 'openai':
                return settings.openaiModel || 'dall-e-3'
            case 'azure':
                return settings.azureDeployment || 'dall-e-3'
            case 'gemini-api':
                return settings.geminiModel || 'imagen-3.0'
            case 'chatgpt':
                return 'ChatGPT'
            case 'gemini':
                return 'Gemini'
            default:
                return '未設定'
        }
    }

    // 取得連線狀態
    const getConnectionStatus = () => {
        const type = settings.connectionType
        if (type === 'chatgpt') return { connected: true, label: '瀏覽器模式' }
        if (type === 'gemini') return { connected: true, label: '瀏覽器模式' }

        // API 類型需要檢查 key
        const hasKey =
            (type === 'openai' && settings.openaiApiKey) ||
            (type === 'azure' && settings.azureApiKey) ||
            (type === 'gemini-api' && settings.geminiApiKey)

        return hasKey
            ? { connected: true, label: '已連線' }
            : { connected: false, label: 'API Key 缺失' }
    }

    const currentProvider = CONNECTION_OPTIONS.find(
        (o) => o.id === settings.connectionType
    )
    const status = getConnectionStatus()

    return (
        <header className="flex items-center justify-between h-12 px-4 border-b border-panel-border bg-panel select-none shrink-0">
            {/* 左側：Logo / 產品名稱 */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🎨</span>
                    <h1 className="text-sm font-bold tracking-tight text-foreground">
                        生圖工坊
                    </h1>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/60 px-1.5 py-0.5 rounded border border-border/50">
                    v0.2.0
                </span>
            </div>

            {/* 中間：Provider / Model / 狀態 */}
            <div className="flex items-center gap-2">
                {/* Provider 切換 */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            id="providerSelector"
                            className="h-7 px-2.5 text-xs gap-1.5 font-medium text-muted-foreground hover:text-foreground"
                        >
                            {currentProvider?.label || 'Provider'}
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="min-w-[180px]">
                        {CONNECTION_OPTIONS.map((opt) => (
                            <DropdownMenuItem
                                key={opt.id}
                                onClick={() => onChangeProvider(opt.id)}
                                className={
                                    settings.connectionType === opt.id
                                        ? 'bg-accent font-medium'
                                        : ''
                                }
                            >
                                <div>
                                    <div className="text-sm">{opt.label}</div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {opt.description}
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* 分隔線 */}
                <div className="w-px h-4 bg-border/50" />

                {/* Model 名稱 */}
                <span className="text-xs font-mono text-muted-foreground">
                    {getModelName()}
                </span>

                {/* 分隔線 */}
                <div className="w-px h-4 bg-border/50" />

                {/* 連線狀態指示 */}
                <div className="flex items-center gap-1.5 text-xs">
                    {status.connected ? (
                        <>
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
                            <Wifi className="w-3 h-3 text-success/70" />
                        </>
                    ) : (
                        <>
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                            <WifiOff className="w-3 h-3 text-destructive/70" />
                        </>
                    )}
                    <span
                        className={
                            status.connected
                                ? 'text-muted-foreground'
                                : 'text-destructive/80'
                        }
                    >
                        {status.label}
                    </span>
                </div>
            </div>

            {/* 右側：操作按鈕 */}
            <div className="flex items-center gap-1">
                <Button
                    id="openSettings"
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-foreground"
                    onClick={onOpenSettings}
                    title="系統設定"
                >
                    <Settings className="w-4 h-4" />
                </Button>
                <ModeToggle />
            </div>
        </header>
    )
}
