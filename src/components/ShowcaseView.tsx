import React, { useState } from "react";
import { Sparkles, Layers, Flame, Compass, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { UV_SHOWCASE_ITEMS } from "../constants";
import { motion } from "motion/react";

interface ShowcaseViewProps {
  onGoToCustomize: () => void;
}

export default function ShowcaseView({ onGoToCustomize }: ShowcaseViewProps) {
  const [selectedEffect, setSelectedEffect] = useState<string>("all");

  // Tilt Card State for Simulating real 3D UV Varnish sheen
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
    transition: "transform 0.5s ease"
  });
  const [glarePosition, setGlarePosition] = useState<string>("rgba(255,255,255,0) 0%");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt angles (-15deg to 15deg)
    const rotateY = ((x / rect.width) - 0.5) * 24; 
    const rotateX = (0.5 - (y / rect.height)) * 24;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: "transform 0.1s ease"
    });

    // Simulating moving gloss reflection highlights (Varnish layer sheen)
    const deg = Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI);
    setGlarePosition(`linear-gradient(${deg}deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 80%)`);
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
      transition: "transform 0.6s ease"
    });
    setGlarePosition("rgba(255,255,255,0) 0%");
  };

  const filteredItems = selectedEffect === "all" 
    ? UV_SHOWCASE_ITEMS 
    : UV_SHOWCASE_ITEMS.filter(it => it.effectType === selectedEffect);

  return (
    <div className="space-y-12">
      {/* 🚀 Hero Cute Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-rose-50 border border-rose-100 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 sleek-shadow-card">
        <div className="absolute top-0 right-0 -m-8 w-48 h-48 rounded-full bg-rose-200/40 opacity-60 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -m-8 w-48 h-48 rounded-full bg-rose-300/30 opacity-60 blur-2xl pointer-events-none"></div>

        <div className="max-w-xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-xs font-bold border border-rose-200 shadow-xs animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            让照片在冰箱上“站”起来哒！
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight">
            PuffyPet 3D <span className="text-rose-600">爱宠定制工坊</span>
          </h1>
          <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed">
            把家里心爱的猫猫狗狗卡通相画、日常照片交给啵啵酱，通过千层白墨固化立体堆叠技术（手感厚度最高可达2.0毫米）和局部水晶高亮抛光，定制出手感超级立体厚实、大眼睛光泽灵动的宠物纪念冰箱贴！
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
            <button 
              id="btn-hero-customize"
              onClick={onGoToCustomize}
              className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              一键为爱宠打版
              <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#interactive-demo"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-rose-100 shadow-xs transition-all text-center"
            >
              查看立体效果
            </a>
          </div>
        </div>

        {/* Dynamic cute floating sticker badge */}
        <div className="relative z-10 w-48 h-48 md:w-56 md:h-56 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-50 rounded-3xl rotate-6 border-2 border-dashed border-amber-200"></div>
          <div className="absolute inset-0 bg-white rounded-3xl -rotate-3 border border-rose-100 flex flex-col items-center justify-center p-4 sleek-shadow-card">
            <span className="text-5xl">🐶</span>
            <span className="text-sm font-black text-rose-600 mt-2">PuffyPet 3D!</span>
            <div className="flex gap-1 mt-1 text-xs items-center text-slate-500 font-bold">
              <span>立体堆填</span>
              <span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded text-[10px]">2.0mm+</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📦 Highlight Varnish Simulated Demo */}
      <section id="interactive-demo" className="bg-white rounded-3xl border border-rose-100 p-8 space-y-6 sleek-shadow-card">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-800 flex justify-center items-center gap-2">
            ✨ 【极光光油】实物效果模拟 ✨
          </h2>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            鼠标指针在卡片上流动，即刻实时渲染高精度微雕、硬面磨砂外圈、以及水晶抛光面光泽反射！
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 pt-4">
          {/* Tilt container */}
          <div 
            className="w-72 h-96 relative cursor-pointer select-none rounded-[2.5rem] p-4 bg-rose-50/40 border border-rose-100 shadow-[0_20px_40px_rgba(244,63,94,0.06)] flex flex-col items-center justify-between"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
          >
            {/* The Varnish shimmer layer */}
            <div 
              className="absolute inset-0 rounded-[2.3rem] pointer-events-none mix-blend-color-dodge z-30"
              style={{ background: glarePosition }}
            ></div>

            {/* Back magnet label inside standard preview */}
            <div className="text-xs font-black bg-rose-500 text-white px-3 py-1 rounded-full absolute -top-3 z-10 shadow-sm border border-rose-600">
              🐈 手绘奶油橘猫工艺样板 (实物模拟)
            </div>

            {/* Simulated 3D Acrylic layer stack shadow */}
            <div className="w-full h-4/5 relative bg-white border border-rose-100 rounded-3xl overflow-hidden mt-2 p-2 shadow-inner group">
              {/* Textured bg */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffe0cc_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              
              {/* Real layers illusion using layered shadows */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                {/* Layer 3: Cat face layer */}
                <div className="w-40 h-40 bg-[url('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=300&auto=format&fit=crop')] bg-cover rounded-3xl relative shadow-[0_5px_15px_rgba(139,94,60,0.4)] border-4 border-rose-200/50 transform scale-100 flex items-center justify-center">
                  
                  {/* Layer 2: Embossed custom gold collar tag */}
                  <div className="absolute w-24 h-24 bg-amber-400 rounded-full border-4 border-amber-100 shadow-[0_4px_10px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center transform -rotate-12 translate-y-6">
                    <span className="text-3xl">🏅</span>
                    <span className="text-[9px] font-black text-amber-950">100% ROYAL PET</span>
                    
                    {/* Simulated Varnish gloss contour */}
                    <div className="absolute inset-1 rounded-full border-2 border-amber-200/50 opacity-60"></div>
                  </div>

                  {/* Layer 1: Shiny Paw (High Gloss Varnish highlight) */}
                  <div className="absolute top-2 right-4 w-9 h-9 bg-rose-100 rounded-full border-2 border-white shadow-md flex items-center justify-center transform scale-110">
                    <span className="text-md">🐾</span>
                    <div className="absolute top-1 left-1.5 w-2 h-1 bg-white rounded-full opacity-80"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pb-2 w-full">
              <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">猫咪定制底胚 × 强力钕铁硼</span>
              <div className="flex justify-between items-center px-4 mt-2">
                <span className="text-rose-600 font-extrabold text-xs font-mono">15 ¥ 起</span>
                <span className="text-slate-500 text-[10px] flex items-center gap-0.5 font-bold">
                  <span className="text-rose-400">●</span> 真实凹凸纹路
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6 max-w-md">
            <h3 className="text-xl font-bold text-slate-800">🤔 为什么UV 3D浮雕这么好物？</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">1. 千叠白墨微米级固化</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 font-semibold">
                    系统根据你上传的图片灰度算出“高度度图”。打印机白墨喷嘴在同一位置数十次往复层叠，打造最高 2mm 的极致高阻隔手感。
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">2. 局部硬面UV光油（Gloss Varnish）</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 font-semibold">
                    在亮油烘干处加盖特殊层。眼睛、液体、金属构件等高对比部分，在日光反射下带有搪瓷一样的清润抛光亮面。
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">3. 耐刮防潮，永不褪色</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 font-semibold">
                    UV特种墨水经紫外物理固化，即便附着在冰箱冷凝凝结水滴旁，也绝对不会化开、掉色，可用湿布擦拭哒！
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔮 Traditional Grid Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800">🎨 工艺样板展示馆</h2>
            <p className="text-xs text-slate-500 font-semibold">体验不同材质与UV浮雕结合的惊艳视觉效果哒！</p>
          </div>

          <div className="flex p-1 bg-white rounded-xl border border-rose-100 sleek-shadow-card self-start sm:self-auto overflow-x-auto max-w-full">
            <button 
              id="filter-all"
              onClick={() => setSelectedEffect("all")} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${selectedEffect === "all" ? "bg-rose-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
            >
              全部样板
            </button>
            <button 
              id="filter-extreme3D"
              onClick={() => setSelectedEffect("extreme3D")} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${selectedEffect === "extreme3D" ? "bg-rose-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
            >
              3D强浮雕
            </button>
            <button 
              id="filter-varnish"
              onClick={() => setSelectedEffect("varnish")} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${selectedEffect === "varnish" ? "bg-rose-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
            >
              水晶亮光油
            </button>
            <button 
              id="filter-wood"
              onClick={() => setSelectedEffect("wood")} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${selectedEffect === "wood" ? "bg-rose-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
            >
              原木微浮雕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-3xl border border-rose-100 overflow-hidden hover:border-rose-300 transition-all sleek-shadow-card flex flex-col sm:flex-row"
            >
              <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden shrink-0">
                <img 
                  referrerPolicy="no-referrer"
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" 
                />
                <span className="absolute top-2 left-2 bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm">
                  {item.cuteTag}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80 sm:hidden"></div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                    {item.effectType === "extreme3D" ? "🌋 High Density layer print" : 
                     item.effectType === "varnish" ? "💎 High gloss spots Coating" : 
                     item.effectType === "acrylic" ? "🔮 Transparent Sandwich acrylic" : "🌳 Organic Beech Wood structure"}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold">参考加工单价</span>
                    <span className="text-rose-500 font-extrabold text-sm font-mono">{item.priceRange}</span>
                  </div>
                  <button 
                    id={`btn-customize-sc-${item.id}`}
                    onClick={onGoToCustomize}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    去试制我的
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 💡 Cute Steps Guide */}
      <section className="bg-rose-50/50 rounded-3xl border border-rose-100 p-8 sleek-shadow-card">
        <h3 className="text-lg font-black text-rose-700 text-center mb-6">🧸 定制冰箱贴只要简单 3 步哦 🧸</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="text-center p-5 bg-white rounded-2xl border border-rose-100 relative shadow-xs">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center mx-auto absolute -top-4 left-1/2 transform -translate-x-1/2 border border-rose-200 shadow-sm">1</div>
            <span className="text-4xl block my-2">🖼️</span>
            <h4 className="text-sm font-bold text-slate-800">上传照片及灰度匹配</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              上传猫狗、人物或风景图。啵啵酱系统自动把照片转成黑白灰度图来测算出物理打印厚度。
            </p>
          </div>

          <div className="text-center p-5 bg-white rounded-2xl border border-rose-100 relative shadow-xs">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center mx-auto absolute -top-4 left-1/2 transform -translate-x-1/2 border border-rose-200 shadow-sm">2</div>
            <span className="text-4xl block my-2">🛠️</span>
            <h4 className="text-sm font-bold text-slate-800">调节立体触感与光油</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              可调节最高微米高度和哪部分叠加晶灿光油。可在我们的 interactive 3D 棋盘上移动光源查看实机光影！
            </p>
          </div>

          <div className="text-center p-5 bg-white rounded-2xl border border-rose-100 relative shadow-xs">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center mx-auto absolute -top-4 left-1/2 transform -translate-x-1/2 border border-rose-200 shadow-sm">3</div>
            <span className="text-4xl block my-2">🐾</span>
            <h4 className="text-sm font-bold text-slate-800">搭配底胚并预览下单</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              把刚刚合成的宠物浮雕图片放到可爱的猫耳边框、小狗电视机或肉泥罐头底胚中，微调角度即可下单定制！
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
