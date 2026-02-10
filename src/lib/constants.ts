// ===== 常用提示詞範本 =====
export const PROMPT_TEMPLATES = [
    {
        name: '晨光咖啡館',
        prompt: '清晨的陽光透過大片落地窗灑入溫馨的咖啡廳，木質吧台上擺著剛沖好的手沖咖啡，蒸氣裊裊升起，背景是模糊的書架和綠色植物，暖色調的光線營造出寧靜愜意的氛圍。',
    },
    {
        name: '雲端浮島',
        prompt: '天空中漂浮著一座綠意盎然的小島，島上有一棟小木屋和一棵巨大的櫻花樹，瀑布從島嶼邊緣傾瀉而下，化為細密的水霧消散在雲層中，夕陽的金光照耀整片奇幻景色。',
    },
    {
        name: '童話氣球遊行',
        prompt: '色彩繽紛的巨型動物造型氣球在歐式小鎮的街道上遊行，孩子們在兩旁歡呼雀躍，街道兩側裝飾著旗幟和花環，藍天白雲下充滿歡樂的節慶氣氛。',
    },
    {
        name: '水彩山嵐湖',
        prompt: '以水彩畫風格描繪的山水風景，遠處群山在薄霧中若隱若現，平靜的湖面倒映著青山與天空的色彩，前景是幾株垂柳和岸邊的野花，色調清新淡雅。',
    },
    {
        name: '像素霓虹街機',
        prompt: '復古像素藝術風格的霓虹燈街機遊戲廳，牆壁上掛滿了閃爍的霓虹招牌，幾台經典街機發出彩色光芒，地板的格子花紋反射著五彩繽紛的燈光，帶有80年代復古科幻感。',
    },
    {
        name: '3D 爆炸結構',
        prompt: '一個精美的機械手錶進行爆炸式拆解的3D渲染圖，每個零件懸浮在空中清楚可見，包括齒輪、發條、錶殼和錶面，金屬質感的零件在柔和的攝影棚燈光下閃閃發光。',
    },
    {
        name: '電影感追逐',
        prompt: '電影級質感的雨夜追逐場景，一個穿著風衣的神秘人物在霓虹燈映照的潮濕街道上奔跑，身後投射出長長的影子，鏡頭帶有輕微的動態模糊，整體色調偏藍綠。',
    },
    {
        name: '復古旅行海報',
        prompt: '1950年代風格的復古旅行海報設計，描繪台北101大樓和周圍的城市天際線，使用大膽的平面色彩和幾何化的構圖，底部有帶裝飾性字體的標題「TAIPEI」。',
    },
    {
        name: '玻璃未來展廳',
        prompt: '一座未來主義建築的室內展廳，大量使用透明玻璃和白色金屬結構，自然光從天頂灑入，展示台上擺放著流線型的科技產品原型，整體空間感極度通透明亮。',
    },
    {
        name: '陶瓷茶具特寫',
        prompt: '精緻的手作陶瓷茶具特寫照，展現細膩的釉面紋理和溫潤的質感，茶壺微微傾斜正在倒出淡琥珀色的茶湯，背景是模糊的日式木質桌面，柔和的側光勾勒出器型輪廓。',
    },
    {
        name: '布料質感時裝',
        prompt: '高端時尚攝影風格的布料特寫，展現絲綢面料的光澤垂墜感，模特兒穿著一件優雅的深藍色禮服，布料上的細微皺褶在攝影棚聚光燈下產生豐富的明暗層次。',
    },
    {
        name: '紙雕城市模型',
        prompt: '用白色卡紙手工剪裁和堆疊構成的微縮城市模型，包含高樓大廈、橋樑和公園，從高角度俯瞰，紙張的層次感和陰影創造出精巧的立體效果，背景是淡藍色的漸層。',
    },
] as const

// ===== 風格標籤系統 =====
export interface StyleTag {
    label: string
    value: string
}

export interface StyleCategory {
    name: string
    icon: string
    tags: StyleTag[]
}

export const STYLE_CATEGORIES: StyleCategory[] = [
    {
        name: '構圖',
        icon: '🎬',
        tags: [
            { label: '廣角', value: 'wide-angle composition' },
            { label: '特寫', value: 'close-up shot' },
            { label: '極簡', value: 'minimalist composition' },
            { label: '平面', value: 'flat design' },
            { label: '史詩', value: 'epic wide shot' },
            { label: '概念藝術', value: 'concept art' },
        ],
    },
    {
        name: '主題',
        icon: '🎭',
        tags: [
            { label: '賽博朋克', value: 'cyberpunk style' },
            { label: '奇幻', value: 'fantasy style' },
            { label: '自然', value: 'nature theme' },
            { label: '未來感', value: 'futuristic style' },
            { label: '復古', value: 'retro vintage style' },
        ],
    },
    {
        name: '材質',
        icon: '🧱',
        tags: [
            { label: '玻璃感', value: 'glass material rendering' },
            { label: '金屬感', value: 'metallic material' },
            { label: '紙質感', value: 'paper texture effect' },
            { label: '布料感', value: 'fabric textile texture' },
            { label: '陶瓷感', value: 'ceramic smooth texture' },
        ],
    },
    {
        name: '鏡頭',
        icon: '📸',
        tags: [
            { label: '微距', value: 'macro photography' },
            { label: '移軸', value: 'tilt-shift effect' },
            { label: '散景', value: 'bokeh background' },
            { label: '長焦', value: 'telephoto compression' },
            { label: '魚眼', value: 'fisheye lens distortion' },
        ],
    },
    {
        name: '畫風',
        icon: '🎨',
        tags: [
            { label: '寫實', value: 'photorealistic' },
            { label: '插畫', value: 'illustration style' },
            { label: '繪本', value: 'storybook illustration' },
            { label: '水彩', value: 'watercolor painting' },
            { label: '像素風', value: 'pixel art' },
            { label: '3D', value: '3D rendering' },
            { label: '電影感', value: 'cinematic look' },
        ],
    },
    {
        name: '情緒',
        icon: '😊',
        tags: [
            { label: '溫暖', value: 'warm cozy atmosphere' },
            { label: '夢幻', value: 'dreamy soft focus' },
            { label: '活力', value: 'vibrant energetic' },
            { label: '安靜', value: 'calm serene mood' },
            { label: '可愛', value: 'cute kawaii style' },
        ],
    },
    {
        name: '光線',
        icon: '💡',
        tags: [
            { label: '柔和光', value: 'soft diffused lighting' },
            { label: '棚拍', value: 'studio lighting' },
            { label: '黃金時刻', value: 'golden hour lighting' },
            { label: '霓虹', value: 'neon lighting' },
            { label: '高對比', value: 'high contrast dramatic lighting' },
        ],
    },
    {
        name: '色彩',
        icon: '🎨',
        tags: [
            { label: '粉彩', value: 'pastel color palette' },
            { label: '繽紛', value: 'vibrant colorful' },
            { label: '低彩度', value: 'low saturation muted colors' },
            { label: '單色', value: 'monochrome' },
            { label: '乾淨', value: 'clean bright colors' },
        ],
    },
]

// ===== API 連線方式 =====
export type ConnectionType = 'openai' | 'azure' | 'gemini-api' | 'chatgpt' | 'gemini'

export interface ConnectionOption {
    id: ConnectionType
    label: string
    description: string
}

export const CONNECTION_OPTIONS: ConnectionOption[] = [
    { id: 'openai', label: 'OpenAI', description: '直接連線 OpenAI API' },
    { id: 'azure', label: 'Azure OpenAI', description: '透過 Azure 部署的 OpenAI 服務' },
    { id: 'gemini-api', label: 'Gemini API', description: 'Google Gemini API' },
    { id: 'chatgpt', label: 'ChatGPT', description: '透過 ChatGPT 介面（需搭配瀏覽器擴充功能）' },
    { id: 'gemini', label: 'Gemini', description: 'Google Gemini 介面連線' },
]

// ===== 輸出設定選項 =====
export const ASPECT_RATIOS = [
    { value: '1024x1024', label: '1024 × 1024 (方形)' },
    { value: '1024x1536', label: '1024 × 1536 (直式)' },
    { value: '1536x1024', label: '1536 × 1024 (橫式)' },
    { value: 'auto', label: '自動 (Auto)' },
]

export const RESOLUTIONS = [
    { value: 'low', label: '低 (更快、更省)' },
    { value: 'medium', label: '中 (平衡)' },
    { value: 'high', label: '高 (最佳畫質)' },
    { value: 'auto', label: '自動 (Auto)' },
]

export const FILE_FORMATS = [
    { value: 'png', label: 'PNG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'webp', label: 'WEBP' },
]

export const SAFETY_LEVELS = [
    { value: 'low', label: '較寬鬆' },
    { value: 'medium', label: '標準' },
    { value: 'high', label: '較嚴格' },
]
