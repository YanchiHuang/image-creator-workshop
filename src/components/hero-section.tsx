import { Settings, Sparkles, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { AppSettings } from '@/lib/store'

interface HeroSectionProps {
    settings: AppSettings
    onOpenSettings: () => void
    onScrollToPrompt: () => void
    onRandomTemplate: () => void
}

export function HeroSection({
    settings,
    onOpenSettings,
    onScrollToPrompt,
    onRandomTemplate,
}: HeroSectionProps) {
    // 根據目前連線類型顯示狀態文字
    const getStatusText = () => {
        switch (settings.connectionType) {
            case 'openai':
                return `${settings.openaiModel} · OpenAI`
            case 'azure':
                return `GPT-Image · Azure OpenAI`
            case 'gemini-api':
                return `${settings.geminiModel} · Gemini API`
            case 'chatgpt':
                return `ChatGPT · 瀏覽器整合`
            case 'gemini':
                return `Gemini · 瀏覽器整合`
            default:
                return '未設定'
        }
    }

    return (
        <header className="relative overflow-hidden">
            {/* 背景漸層裝飾 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

            <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-8">
                {/* 主標題區 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
                        <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            🎨 生圖工坊
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                        專業、穩定、可控的影像生成工作台，讓創作更有效率。
                    </p>
                </div>

                {/* 狀態列 */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm text-sm text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span>{getStatusText()}</span>
                    </div>
                </div>

                {/* 快速操作按鈕 */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    <Button
                        id="openSettings"
                        variant="outline"
                        className="gap-2 rounded-full border-border/50 hover:border-primary/50 transition-all duration-300"
                        onClick={onOpenSettings}
                    >
                        <Settings className="w-4 h-4" />
                        系統設定
                    </Button>
                    <Button
                        id="scrollToPrompt"
                        className="gap-2 rounded-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg shadow-primary/25 transition-all duration-300"
                        onClick={onScrollToPrompt}
                    >
                        <Wand2 className="w-4 h-4" />
                        開始創作
                    </Button>
                    <Button
                        id="randomTemplate"
                        variant="outline"
                        className="gap-2 rounded-full border-border/50 hover:border-primary/50 transition-all duration-300"
                        onClick={onRandomTemplate}
                    >
                        <Sparkles className="w-4 h-4" />
                        靈感推薦
                    </Button>
                </div>

                {/* 三步驟引導卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {[
                        {
                            step: '01',
                            title: '系統設定',
                            desc: '設定 API 連線與模型',
                            icon: '⚙️',
                        },
                        {
                            step: '02',
                            title: '選擇提示詞',
                            desc: '輸入描述或選擇範本',
                            icon: '✍️',
                        },
                        {
                            step: '03',
                            title: '開始生圖',
                            desc: '點擊按鈕開始生成影像',
                            icon: '🚀',
                        },
                    ].map((item) => (
                        <Card
                            key={item.step}
                            className="group border-border/30 bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-card/50 transition-all duration-300 cursor-default"
                        >
                            <CardHeader className="pb-3 pt-5 px-5">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{item.icon}</div>
                                    <div>
                                        <div className="text-xs text-muted-foreground font-medium tracking-wider uppercase mb-0.5">
                                            Step {item.step}
                                        </div>
                                        <CardTitle className="text-base font-semibold">
                                            {item.title}
                                        </CardTitle>
                                    </div>
                                </div>
                                <CardDescription className="text-sm mt-1">
                                    {item.desc}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </header>
    )
}
