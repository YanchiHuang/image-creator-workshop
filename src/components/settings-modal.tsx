import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CONNECTION_OPTIONS } from '@/lib/constants'
import type { ConnectionType } from '@/lib/constants'
import type { AppSettings } from '@/lib/store'
import { cn } from '@/lib/utils'

interface SettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    settings: AppSettings
    onUpdateSettings: (partial: Partial<AppSettings>) => void
}

export function SettingsModal({
    open,
    onOpenChange,
    settings,
    onUpdateSettings,
}: SettingsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto rounded-2xl border-border/30 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        ⚙️ 系統設定
                    </DialogTitle>
                    <DialogDescription>
                        設定 API 連線方式與模型參數
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* ===== 連線方式分段按鈕 ===== */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">連線方式</Label>
                        <div className="flex flex-wrap gap-2">
                            {CONNECTION_OPTIONS.map((opt) => (
                                <Badge
                                    key={opt.id}
                                    variant={settings.connectionType === opt.id ? 'default' : 'outline'}
                                    className={cn(
                                        'cursor-pointer px-3 py-2 text-xs rounded-lg transition-all duration-200 select-none',
                                        settings.connectionType === opt.id
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'border-border/50 hover:border-primary/40 hover:bg-primary/5'
                                    )}
                                    onClick={() =>
                                        onUpdateSettings({ connectionType: opt.id as ConnectionType })
                                    }
                                >
                                    {opt.label}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {CONNECTION_OPTIONS.find((o) => o.id === settings.connectionType)?.description}
                        </p>
                    </div>

                    <Separator className="opacity-30" />

                    {/* ===== OpenAI 設定 ===== */}
                    {settings.connectionType === 'openai' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">OpenAI 設定</h3>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="openai-base-url" className="text-xs">Base URL</Label>
                                    <Input
                                        id="openai-base-url"
                                        placeholder="https://api.openai.com/v1"
                                        value={settings.openaiBaseUrl}
                                        onChange={(e) => onUpdateSettings({ openaiBaseUrl: e.target.value })}
                                        className="rounded-lg border-border/50 bg-card/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="openai-model" className="text-xs">Model</Label>
                                    <Input
                                        id="openai-model"
                                        placeholder="gpt-image-1.5"
                                        value={settings.openaiModel}
                                        onChange={(e) => onUpdateSettings({ openaiModel: e.target.value })}
                                        className="rounded-lg border-border/50 bg-card/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="openai-api-key" className="text-xs">API Key</Label>
                                    <Input
                                        id="openai-api-key"
                                        type="password"
                                        placeholder="請輸入你的 OpenAI API Key"
                                        value={settings.openaiApiKey}
                                        onChange={(e) => onUpdateSettings({ openaiApiKey: e.target.value })}
                                        className="rounded-lg border-border/50 bg-card/50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== Azure OpenAI 設定 ===== */}
                    {settings.connectionType === 'azure' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Azure OpenAI 設定</h3>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="azure-endpoint" className="text-xs">Endpoint URL</Label>
                                    <Input
                                        id="azure-endpoint"
                                        placeholder="https://{resource}.openai.azure.com/..."
                                        value={settings.azureEndpoint}
                                        onChange={(e) => onUpdateSettings({ azureEndpoint: e.target.value })}
                                        className="rounded-lg border-border/50 bg-card/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">驗證方式</Label>
                                    <Select
                                        value={settings.azureAuthMode}
                                        onValueChange={(v) =>
                                            onUpdateSettings({ azureAuthMode: v as 'apikey' | 'aad' })
                                        }
                                    >
                                        <SelectTrigger className="rounded-lg border-border/50 bg-card/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="apikey">API Key</SelectItem>
                                            <SelectItem value="aad">AAD Token</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="azure-api-key" className="text-xs">
                                        {settings.azureAuthMode === 'apikey' ? 'API Key' : 'AAD Token'}
                                    </Label>
                                    <Input
                                        id="azure-api-key"
                                        type="password"
                                        placeholder={`請輸入你的 ${settings.azureAuthMode === 'apikey' ? 'API Key' : 'AAD Token'}`}
                                        value={settings.azureApiKey}
                                        onChange={(e) => onUpdateSettings({ azureApiKey: e.target.value })}
                                        className="rounded-lg border-border/50 bg-card/50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== Gemini API 設定 ===== */}
                    {settings.connectionType === 'gemini-api' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Gemini API 設定</h3>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="gemini-endpoint" className="text-xs">Endpoint URL</Label>
                                    <Input
                                        id="gemini-endpoint"
                                        placeholder="https://generativelanguage.googleapis.com/v1beta"
                                        value={settings.geminiEndpoint}
                                        onChange={(e) => onUpdateSettings({ geminiEndpoint: e.target.value })}
                                        className="rounded-lg border-border/50 bg-card/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="gemini-model" className="text-xs">Model</Label>
                                    <Input
                                        id="gemini-model"
                                        placeholder="gemini-3-pro-image-preview"
                                        value={settings.geminiModel}
                                        onChange={(e) => onUpdateSettings({ geminiModel: e.target.value })}
                                        className="rounded-lg border-border/50 bg-card/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="gemini-api-key" className="text-xs">Gemini API Key</Label>
                                    <Input
                                        id="gemini-api-key"
                                        type="password"
                                        placeholder="請輸入你的 Gemini API Key"
                                        value={settings.geminiApiKey}
                                        onChange={(e) => onUpdateSettings({ geminiApiKey: e.target.value })}
                                        className="rounded-lg border-border/50 bg-card/50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== ChatGPT 設定 ===== */}
                    {settings.connectionType === 'chatgpt' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">ChatGPT 瀏覽器整合</h3>
                            <div className="rounded-xl border border-info/20 bg-info/5 p-4 space-y-2">
                                <p className="text-sm text-foreground font-medium">
                                    需要安裝「ChatGPT 萬能工具箱」Chrome 擴充功能
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    透過此擴充功能可實現無 API Key 的使用方式。安裝後在 ChatGPT 網頁介面中啟用擴充功能，即可透過本工具直接調用 ChatGPT 的影像生成能力。
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ===== Gemini 瀏覽器設定 ===== */}
                    {settings.connectionType === 'gemini' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Gemini 瀏覽器整合</h3>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="gemini-base-url" className="text-xs">Base URL</Label>
                                    <Input
                                        id="gemini-base-url"
                                        placeholder="https://gemini.google.com/app"
                                        value={settings.geminiBaseUrl}
                                        onChange={(e) => onUpdateSettings({ geminiBaseUrl: e.target.value })}
                                        className="rounded-lg border-border/50 bg-card/50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
