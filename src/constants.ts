import { UVShowcaseItem, FridgeMagnetTemplate } from "./types";

export const UV_SHOWCASE_ITEMS: UVShowcaseItem[] = [
  {
    id: "sc-1",
    title: "手绘奶油猫咪 · 2.0mm超厚叠毛浮雕",
    description: "多重硬质叠墨固化工艺！打造高达2mm的真实猫咪毛发凹凸质感。胡须和呆立微翘的小毛蓬，手感立体，将爱宠肖像化为可观可抚摸的艺术品。",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop",
    effectType: "extreme3D",
    priceRange: "¥25 - ¥39",
    cuteTag: "人气喵汪榜首 🔥"
  },
  {
    id: "sc-2",
    title: "憨笑元气柴犬 · 水晶亮光抛光眼眸",
    description: "高精准定位UV局部光油喷涂。狗狗汪汪的电眼、湿漉漉的小鼻头部分加盖双层高厚水晶亮油（Gloss Varnish），目光灵动，流露搪瓷般剔透折射！",
    imageUrl: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?q=80&w=600&auto=format&fit=crop",
    effectType: "varnish",
    priceRange: "¥18 - ¥28",
    cuteTag: "大眼灵动电眼 ✨"
  },
  {
    id: "sc-3",
    title: "治愈绅士小金毛 · 复合天然原木微雕",
    description: "精选高质欧洲榉木卡牌。将卡通金毛的温暖大脑袋直接重叠印刷于质朴年轮木纹之上。白相叠加、手感温润，富有森林般大自然的气息与温度。",
    imageUrl: "https://images.unsplash.com/photo-1537151608828-ea2b117b6281?q=80&w=600&auto=format&fit=crop",
    effectType: "wood",
    priceRange: "¥32 - ¥48",
    cuteTag: "原木质感 🌲"
  },
  {
    id: "sc-4",
    title: "太空泡泡柯基 · 极光炫彩夹心亚克力",
    description: "双面防指纹高透高分子板。正面为超萌柯基宇航肖像哑光颗粒层，背面套印UV极光金属幻彩偏光。多重折射下，折射出波光粼粼的未来机甲亮光！",
    imageUrl: "https://images.unsplash.com/photo-1612531388330-80111be8470d?q=80&w=600&auto=format&fit=crop",
    effectType: "acrylic",
    priceRange: "¥22 - ¥35",
    cuteTag: "梦幻流光 💫"
  }
];

export const FRIDGE_MAGNET_TEMPLATES: FridgeMagnetTemplate[] = [
  {
    id: "temp-toast",
    name: "芝士萌喵 · 猫耳吐司质感底胚",
    shape: "toast",
    bgUrl: "", 
    width: 260,
    height: 260,
    price: 15.0,
    description: "精心勾勒的猫耳型法式吐司底座。边缘带有可爱微烘焦黄渐变效果，背面内嵌钕铁硼超强磁吸，放上猫猫照片暖心治愈哒！",
    cuteEmoji: "🍞"
  },
  {
    id: "temp-cat",
    name: "喵喵派对 · 双拼肉垫边框模具",
    shape: "cat",
    bgUrl: "",
    width: 250,
    height: 270,
    price: 16.8,
    description: "Q弹饱满的猫咪大脸轮廓，底部附接两只特种UV白墨立体猫爪爪。触摸手感细腻，让家里的猫咪照片可爱度翻倍！",
    cuteEmoji: "🐱"
  },
  {
    id: "temp-cloud",
    name: "冬日蓬松 · 摇尾巴软绵云朵座",
    shape: "cloud",
    bgUrl: "",
    width: 280,
    height: 200,
    price: 13.5,
    description: "厚绒棉花糖般的白云造型。下缘激光雕刻有俏皮摇摆的毛绒尾巴弧线，白色高雅磨砂感最能完美承载猫狗的彩绘！",
    cuteEmoji: "☁️"
  },
  {
    id: "temp-tv",
    name: "汪汪电波 · 复古萌宠电视相框",
    shape: "tv",
    bgUrl: "",
    width: 270,
    height: 240,
    price: 18.0,
    description: "还原80年代饱满凸屏小电视，带有两根萌萌的呆毛天线和像素控制旋钮，最适合将主子的二次元搞怪插画做成超立体、高亮闪烁的复古屏显！",
    cuteEmoji: "📺"
  },
  {
    id: "temp-boba",
    name: "金枪鱼多肉 · 豪华猫咪罐头框",
    shape: "boba",
    bgUrl: "",
    width: 220,
    height: 280,
    price: 15.5,
    description: "满分美味的猫狗零食罐头形状。杯罐身印刷细腻的奶油涂层，底部印制微立体的肉泥颗粒，是主子的专属美食勋章哦！",
    cuteEmoji: "🥫"
  },
  {
    id: "temp-round",
    name: "爪印连连 · 黄油夹心圆饼勋章",
    shape: "round",
    bgUrl: "",
    width: 240,
    height: 240,
    price: 12.0,
    description: "边缘有一圈可口的曲奇咬痕凹槽，奶乎乎的暖黄色粗磨砂底材，朴素却极其百搭哦！外圈饰有小狗梅花爪印。",
    cuteEmoji: "🏅"
  }
];

export interface PresetPattern {
  id: string;
  name: string;
  emoji: string;
  url: string; // fallback
  desc: string;
}

export const PRESET_PATTERNS: PresetPattern[] = [
  {
    id: "pn-shiba",
    name: "蜜蜂背包柴犬 🐕",
    emoji: "🐕",
    desc: "穿着蜜蜂毛衣、翘首以盼的超萌大脸柴犬。斑斓的动漫手绘风，转换成3D堆白后立体感最强！",
    url: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?q=80&w=260&auto=format&fit=crop"
  },
  {
    id: "pn-cat",
    name: "呆萌圆脸大橘 🐈",
    emoji: "🐈",
    desc: "拥有圆溜溜大眼睛和蓬松金黄绒毛的卡通橘猫。眼球及胡须细节层次感极其丰富，抚摸极具起伏感！",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=260&auto=format&fit=crop"
  },
  {
    id: "pn-frenchie",
    name: "蜜桃桃气比熊 🐩",
    emoji: "🐶",
    desc: "吐着粉嫩小舌头、顶着棉花糖爆炸头的可爱萨摩耶/比熊犬。眼睛和鼻头加盖双层亮油如同真漆般清润！",
    url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=260&auto=format&fit=crop"
  },
  {
    id: "pn-persian",
    name: "电眼蓝眸布偶 🐱",
    emoji: "🧸",
    desc: "戴着炫酷眼镜的潮流插画猫咪。其鸳鸯异色瞳和粉嘟嘟的鼻子部分在UV叠筑后自带璀璨珍珠般剔透反光！",
    url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=260&auto=format&fit=crop"
  }
];

export const DECORATION_STAMPS = [
  { id: "dc-star", name: "闪耀星星", emoji: "✨" },
  { id: "dc-heart", name: "软萌爱心", emoji: "💖" },
  { id: "dc-ribbon", name: "甜美蝴蝶结", emoji: "🎀" },
  { id: "dc-cherry", name: "多汁樱桃", emoji: "🍒" },
  { id: "dc-sprout", name: "治愈小绿芽", emoji: "🌱" },
  { id: "dc-paw", name: "肉嘟嘟爪印", emoji: "🐾" }
];
