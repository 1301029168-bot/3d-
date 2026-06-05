import React, { useState, useRef, useEffect } from "react";
import { Upload, Sparkles, Wand2, RefreshCw, Cpu, Check, HelpCircle, Settings } from "lucide-react";
import { PRESET_PATTERNS } from "../constants";
import { ReliefParameters } from "../types";

interface ReliefLabViewProps {
  onReliefGenerated: (imgDataUrl: string, params: ReliefParameters) => void;
}

export default function ReliefLabView({ onReliefGenerated }: ReliefLabViewProps) {
  // Image handling
  const [selectedPreset, setSelectedPreset] = useState<string>("pn-shiba");
  const [uploadedImgUrl, setUploadedImgUrl] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);

  // Gemini & Stencil Generation States
  const [aiApiKeyConfigured, setAiApiKeyConfigured] = useState<boolean>(true);
  const [configMessage, setConfigMessage] = useState<string>("");
  const [suggestPrompt, setSuggestPrompt] = useState<string>("手绘卡通风格，一只大眼睛的治愈金毛狗狗，背景带有小红心和小梅花爪印");
  const [aiSuggestText, setAiSuggestText] = useState<string>("哈喽哒！我是你的宠物立体打版顾问【啵啵酱】🐱~ 很高兴为你定制毛主子的专属浮雕相画！你可以上传猫猫狗狗的真实照片或卡通画，或者输入创意需求（例如：“一只调皮的元气小橘猫”）。点击【AI顾问智能打版】或【AI绘图生成】，我会立刻为你计算并设计出最完美的微立体白色多层堆叠工艺打版哦！");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiDrawPrompt, setAiDrawPrompt] = useState<string>("");
  const [aiDrawLoading, setAiDrawLoading] = useState<boolean>(false);

  // Relief Parameters state
  const [params, setParams] = useState<ReliefParameters>({
    depth: 8,
    brightness: 0,
    contrast: 10,
    invert: false,
    glossiness: 65,
    renderMode: "color"
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Tracking cursor light
  const [lightPos, setLightPos] = useState({ x: 120, y: 100 });
  const [isHovered, setIsHovered] = useState(false);

  // Fetch API configuration on mount
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setAiApiKeyConfigured(data.isApiKeyConfigured);
        setConfigMessage(data.message);
      })
      .catch(() => {
        setAiApiKeyConfigured(false);
      });
  }, []);

  // Load preset or uploaded image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    // Choose active URL
    let activeUrl = PRESET_PATTERNS.find(p => p.id === selectedPreset)?.url || "";
    if (uploadedImgUrl) {
      activeUrl = uploadedImgUrl;
    }

    if (!activeUrl) return;

    img.onload = () => {
      setSourceImage(img);
      setImageLoaded(true);
    };
    img.src = activeUrl;
  }, [selectedPreset, uploadedImgUrl]);

  // Perform 3D lighting relief filter rendering
  useEffect(() => {
    if (!imageLoaded || !sourceImage || !canvasRef.current || !hiddenCanvasRef.current) return;

    const canvas = canvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const hCtx = hiddenCanvas.getContext("2d");
    if (!ctx || !hCtx) return;

    // Set preview dimensions
    const width = 340;
    const height = 340;
    canvas.width = width;
    canvas.height = height;
    hiddenCanvas.width = width;
    hiddenCanvas.height = height;

    // Draw image onto hidden canvas to analyze pixel data
    hCtx.drawImage(sourceImage, 0, 0, width, height);
    const imgData = hCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Create height map array of size (width * height)
    const heights = new Float32Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      // standard grayscale formula
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply brightness & contrast adjustment first
      r = Math.min(255, Math.max(0, r + params.brightness));
      g = Math.min(255, Math.max(0, g + params.brightness));
      b = Math.min(255, Math.max(0, b + params.brightness));

      // Contrast
      const factor = (259 * (params.contrast + 255)) / (255 * (259 - params.contrast));
      r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, factor * (b - 128) + 128));

      let grayscale = (r * 0.299 + g * 0.587 + b * 0.114) / 255; // 0 to 1
      if (params.invert) {
        grayscale = 1.0 - grayscale;
      }
      heights[idx] = grayscale;
    }

    // Prepare Output Image Data buffer
    const outputImgData = ctx.createImageData(width, height);
    const outputData = outputImgData.data;

    // Direct Canvas heightfield ray/lighting simulator (Sobel gradient bump mapping + specular reflection)
    const lVecX = (lightPos.x - width / 2) / (width / 2);
    const lVecY = (lightPos.y - height / 2) / (height / 2);
    // Light is slightly forward
    let lVecZ = 0.95;
    
    // Normalize light vector
    const lLen = Math.sqrt(lVecX * lVecX + lVecY * lVecY + lVecZ * lVecZ);
    const lx = lVecX / lLen;
    const ly = lVecY / lLen;
    const lz = lVecZ / lLen;

    const depthScale = params.depth * 0.04; // scale normal deviation

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currIdx = y * width + x;
        const pixelIdx = currIdx * 4;

        // Neighbor heights for gradient
        const hRight = x < width - 1 ? heights[currIdx + 1] : heights[currIdx];
        const hBottom = y < height - 1 ? heights[currIdx + width] : heights[currIdx];
        const hCurrent = heights[currIdx];

        // Horizontal and vertical height difference (Sobel normal calculation)
        const dx = (hCurrent - hRight) * depthScale;
        const dy = (hCurrent - hBottom) * depthScale;

        // Normal vector N = (dx, dy, 1.0)
        const nLen = Math.sqrt(dx * dx + dy * dy + 1.0);
        const nx = dx / nLen;
        const ny = dy / nLen;
        const nz = 1.0 / nLen;

        // Dot product of N and Light vector L (diffuse lighting)
        const dot = nx * lx + ny * ly + nz * lz;
        const diffuse = Math.max(0, dot);

        // Specular highlight (polished surface gloss shininess)
        // V = (0, 0, 1) - straight pointing eye
        // Halfway vector H = (L + V) / 2. Since V = (0,0,1), H = (lx, ly, lz + 1.0)
        const hX = lx;
        const hY = ly;
        const hZ = lz + 1.0;
        const hLen = Math.sqrt(hX * hX + hY * hY + hZ * hZ);
        const hNx = hX / hLen;
        const hNy = hY / hLen;
        const hNz = hZ / hLen;

        const specDot = nx * hNx + ny * hNy + nz * hNz;
        const specFactor = Math.pow(Math.max(0, specDot), 18);
        const specular = specFactor * (params.glossiness / 100) * 1.5;

        // Base lighting coefficients
        const ambient = 0.42;
        const lit = ambient + diffuse * 0.65;

        // Grab base color of original pixel code
        let baseR = data[pixelIdx];
        let baseG = data[pixelIdx + 1];
        let baseB = data[pixelIdx + 2];

        // Material overlay rendering
        if (params.renderMode === "wood") {
          // Warm cedar-wood tone `#d69956` with slight natural horizontal grain lines
          const grain = 1.0 - 0.08 * Math.sin(y * 4.5 + Math.sin(x * 0.1) * 3);
          baseR = 214 * grain;
          baseG = 153 * grain;
          baseB = 86 * grain;
        } else if (params.renderMode === "acrylic") {
          // Clear bluish transparent with highlights
          baseR = 218;
          baseG = 236;
          baseB = 250;
        } else if (params.renderMode === "ceramic") {
          // Off-white cream smooth ceramic `#faf5ea`
          baseR = 248;
          baseG = 243;
          baseB = 230;
        } else if (params.renderMode === "monochrome") {
          // Gray heights map structure
          const c = Math.floor(hCurrent * 255);
          baseR = c;
          baseG = c;
          baseB = c;
        }

        // Apply dynamic illumination + Specular shiny highlights
        let rOut = baseR * lit + specular * 255;
        let gOut = baseG * lit + specular * 255;
        let bOut = baseB * lit + specular * 255;

        // If acrylic, add a neat frosted translucent edge effect
        let alpha = 255;
        if (params.renderMode === "acrylic") {
          // Alpha depends on height gradient to simulate curved glass refraction
          const slope = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 4);
          alpha = Math.floor(140 + slope * 115);
        }

        outputData[pixelIdx] = Math.min(255, Math.max(0, rOut));
        outputData[pixelIdx + 1] = Math.min(255, Math.max(0, gOut));
        outputData[pixelIdx + 2] = Math.min(255, Math.max(0, bOut));
        outputData[pixelIdx + 3] = alpha;
      }
    }

    ctx.putImageData(outputImgData, 0, 0);

    // Render static light bulblet to indicate source of light
    if (isHovered) {
      ctx.beginPath();
      ctx.arc(lightPos.x, lightPos.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();
    }
  }, [imageLoaded, sourceImage, params, lightPos, isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLightPos({ x, y });
    setIsHovered(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImgUrl(event.target.result as string);
          setSelectedPreset(""); // clear preset select
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Lock and send relief image
  const handleProceedToPaste = () => {
    if (!canvasRef.current) return;
    // Export standard styled png
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onReliefGenerated(dataUrl, params);
  };

  // Call Gemini for 3D stack suggestion advisor
  const handleAiSuggest = async () => {
    setAiLoading(true);
    setAiSuggestText("啵啵酱正在仔细阅读你的画作和工艺设想，稍等一下下哦... 🛸");
    try {
      const res = await fetch("/api/ai/suggest-relief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: suggestPrompt })
      });
      const data = await res.json();
      setAiSuggestText(data.text || "哎呀跑偏了哒，请重试一遍哦！");
    } catch {
      setAiSuggestText("哎呀，网线被猫咪咬断了啦！不过您可以直接右侧调整参数来定制您的浮雕，也非常精细有趣哦！");
    } finally {
      setAiLoading(false);
    }
  };

  // Call Gemini (with imagen model config) to generate stencil
  const handleAiDraw = async () => {
    if (!aiDrawPrompt) return;
    setAiDrawLoading(true);
    try {
      const res = await fetch("/api/ai/draw-stencil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiDrawPrompt })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setUploadedImgUrl(data.imageUrl);
        setSelectedPreset(""); // clear preset
        setAiSuggestText(`哇塞！【${aiDrawPrompt}】设计草图生成完毕哒！快移动鼠标看它被转成的极高堆填3D立体光映射效果吧，是不是超神奇！🎂`);
      } else {
        alert(data.error || "生成失败了，换个词试试哒");
      }
    } catch (e: any) {
      alert("AI画图失败了，检查您的Gemini API密钥或直接使用内置超萌预设和自行上传照片哦！");
    } finally {
      setAiDrawLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Visual notification if API Key is missing */}
      {!aiApiKeyConfigured && (
        <div className="bg-amber-100/50 border border-amber-200 rounded-2xl p-4 text-xs font-semibold text-amber-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <p>{configMessage || "啵啵打版提示：当前处于本地高保真渲染阶段，AI连接通畅"}</p>
          </div>
          <span className="bg-amber-100 text-amber-950 px-2.5 py-1 rounded-full shrink-0 font-extrabold scale-90">
            高保真本地版
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 🎨 Left Panel: Photo Inputs & Selection */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-rose-100 p-5 space-y-5 sleek-shadow-card">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <span className="text-xl">1️⃣</span> 选择您的定制照片
            </h3>

            {/* Upload Area */}
            <label className="border-2 border-dashed border-rose-200 hover:border-rose-300 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50 hover:bg-rose-50/50 relative group">
              <input 
                id="file-upload-input"
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-rose-500 group-hover:scale-110 transition-transform mb-2" />
              <div className="text-center">
                <span className="text-xs font-bold text-slate-705 block">上传我的本地照片</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">支持 PNG, JPG, GIF 等</span>
              </div>
            </label>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-rose-100"></div>
              <span className="flex-shrink mx-4 text-[10px] text-rose-400 font-black">或者，选个超软萌预设素材哒</span>
              <div className="flex-grow border-t border-rose-100"></div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2">
              {PRESET_PATTERNS.map((p) => (
                <button
                  id={`preset-${p.id}`}
                  key={p.id}
                  onClick={() => {
                    setSelectedPreset(p.id);
                    setUploadedImgUrl("");
                  }}
                  className={`p-2 rounded-xl text-left border-2 transition-all flex flex-col justify-between cursor-pointer ${selectedPreset === p.id ? "bg-rose-50 border-rose-400 text-rose-700" : "bg-white border-slate-50 text-slate-600 hover:border-rose-200"}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">{p.emoji}</span>
                    <span className="text-xs font-black truncate">{p.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold line-clamp-1 mt-1 leading-normal">{p.desc}</span>
                </button>
              ))}
            </div>

            {/* AI Generator Box */}
            <div className="pt-2">
              <div className="bg-purple-50/80 border border-purple-200 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Wand2 className="w-3 h-3 text-purple-600 animate-bounce" />
                  Gemini AI 新人制图工具
                </span>
                <p className="text-[10px] text-purple-600 leading-normal font-semibold">
                  输入文字生成超可爱的插画面板，随后立即生成立体浮雕。
                </p>
                <div className="flex gap-1.5 mt-2">
                  <input
                    id="ai-draw-prompt-input"
                    type="text"
                    value={aiDrawPrompt}
                    onChange={(e) => setAiDrawPrompt(e.target.value)}
                    placeholder="例如: 柴犬吃彩虹马卡龙 扁平卡通"
                    className="flex-1 px-3 py-2 bg-white text-xs border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium"
                  />
                  <button
                    id="btn-ai-draw"
                    onClick={handleAiDraw}
                    disabled={aiDrawLoading || !aiDrawPrompt}
                    className="px-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center min-w-16 cursor-pointer"
                  >
                    {aiDrawLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "绘图"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🛸 Middle Panel: 3D Shader Preview */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-6">
          <div className="bg-white rounded-3xl border border-rose-100 p-5 space-y-4 w-full flex flex-col items-center sleek-shadow-card">
            <div className="flex justify-between items-center w-full">
              <h3 className="font-extrabold text-slate-800 text-base">
                ⚡ 3D 浮雕光影触觉演示
              </h3>
              <span className="text-[10px] text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full font-bold">
                晃动鼠标移动光源 💡
              </span>
            </div>

            {/* Shader Canvas frame */}
            <div className="relative border border-rose-100 rounded-[2rem] overflow-hidden bg-slate-900 shadow-inner group aspect-square max-w-[340px] w-full flex items-center justify-center p-1">
              <canvas 
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setIsHovered(false)}
                className="rounded-[1.8rem] w-full h-full object-cover cursor-crosshair shadow-md"
                style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" }}
              />
              <canvas ref={hiddenCanvasRef} className="hidden" />

              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                  <div className="text-center text-slate-400 space-y-2">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-rose-400" />
                    <span className="text-xs font-bold">浮雕生成中，啵啵酱开工哒...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center space-y-1 mt-1">
              <div className="text-xs font-bold text-slate-600 flex justify-center items-center gap-1">
                <span>渲染面料: </span>
                <span className="bg-rose-50/50 border border-rose-100 px-2.5 py-0.5 rounded-md font-black text-rose-600 text-[11px]">
                  {params.renderMode === "color" && "🌈 3D极鲜彩墨堆填"}
                  {params.renderMode === "wood" && "🌳 榉木木纹激光微雕"}
                  {params.renderMode === "acrylic" && "💎 晶亮亚克力拼贴双面印"}
                  {params.renderMode === "ceramic" && "🥛 温和乳白陶瓷面层"}
                  {params.renderMode === "monochrome" && "🔘 纯灰立体高度图"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                由于打印工艺层层喷绘，白灰色阶越深的部分在实物中手感越厚实哦！
              </p>
            </div>

            <button
              id="btn-confirm-relief"
              onClick={handleProceedToPaste}
              disabled={!imageLoaded}
              className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white font-extrabold text-sm rounded-2xl shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transform transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-white" />
              锁定此浮雕 · 带入冰箱贴贴框架
            </button>
          </div>
        </div>

        {/* 🛠️ Right Panel: Crafting Parameters & Gemini Advisor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls box */}
          <div className="bg-white rounded-3xl border border-rose-100 p-5 space-y-5 sleek-shadow-card">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-slate-500" />
              微观层叠高度调节
            </h3>

            {/* Depth Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-600">3D喷涂层叠高度</span>
                <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-bold">{(params.depth * 0.15).toFixed(2)} mm</span>
              </div>
              <input 
                id="depth-slider"
                type="range" 
                min="1" 
                max="24" 
                value={params.depth} 
                onChange={(e) => setParams({ ...params, depth: parseInt(e.target.value) })}
                className="w-full accent-rose-500 h-1 mt-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize"
              />
            </div>

            {/* Glossiness Slider (Varnish) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-600">局部高洁光油浓度</span>
                <span className="text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded font-bold">{params.glossiness}%</span>
              </div>
              <input 
                id="gloss-slider"
                type="range" 
                min="0" 
                max="100" 
                value={params.glossiness} 
                onChange={(e) => setParams({ ...params, glossiness: parseInt(e.target.value) })}
                className="w-full accent-teal-400 h-1 mt-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize"
              />
            </div>

            {/* Brightness & Contrast */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-550 block">白平衡微调</label>
                <input 
                  id="brightness-slider"
                  type="range" 
                  min="-60" 
                  max="60" 
                  value={params.brightness} 
                  onChange={(e) => setParams({ ...params, brightness: parseInt(e.target.value) })}
                  className="w-full accent-slate-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-550 block">黑白对比度</label>
                <input 
                  id="contrast-slider"
                  type="range" 
                  min="-40" 
                  max="50" 
                  value={params.contrast} 
                  onChange={(e) => setParams({ ...params, contrast: parseInt(e.target.value) })}
                  className="w-full accent-slate-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize"
                />
              </div>
            </div>

            {/* Invert contrast */}
            <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all">
              <input 
                id="invert-checkbox"
                type="checkbox" 
                checked={params.invert} 
                onChange={(e) => setParams({ ...params, invert: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-300 w-4 h-4 border-slate-300 accent-rose-500" 
              />
              <span className="text-[11px] font-extrabold text-slate-600">反转凸起色块 (黑白颠倒)</span>
            </label>

            {/* Style material Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-50">
              <label className="text-[11px] font-black text-slate-500 block">选择实物底胚材质质感</label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: "color", name: "3D彩墨堆填 (标准)", color: "bg-gradient-to-r from-red-200 via-green-200 to-rose-200" },
                  { id: "wood", name: "欧洲原木背景 (木质)", color: "bg-amber-100" },
                  { id: "acrylic", name: "冰感高透板材 (板饰)", color: "bg-sky-50" },
                  { id: "ceramic", name: "乳白细陶瓷板 (柔净)", color: "bg-slate-100" },
                  { id: "monochrome", name: "纯灰雕刻测试 (高度)", color: "bg-gray-300" }
                ].map((m) => (
                  <button
                    id={`material-${m.id}`}
                    key={m.id}
                    onClick={() => setParams({ ...params, renderMode: m.id as any })}
                    className={`flex items-center justify-between text-left p-2.5 rounded-xl border-2 text-[11px] font-extrabold transition-all cursor-pointer ${params.renderMode === m.id ? "bg-rose-50 border-rose-400 text-rose-700" : "bg-white border-slate-100 text-slate-600 hover:border-rose-200"}`}
                  >
                    <span>{m.name}</span>
                    <span className={`w-3.5 h-3.5 rounded-full border border-slate-300 ${m.color}`}></span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 💬 Gemini AI 打版顾问 Widget */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-4 space-y-3 relative sleek-shadow-card">
            <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-rose-500 animate-spin" />
              啵啵酱 · AI 浮雕打版顾问
            </span>
            
            {/* Bobo chan response bubble */}
            <div className="bg-white border border-rose-200 p-3 rounded-xl relative">
              <div className="absolute top-3 -left-2.5 w-3 h-3 bg-white border-l border-b border-rose-200 rotate-45"></div>
              <p className="text-[10px] font-semibold text-slate-600 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                {aiSuggestText}
              </p>
            </div>

            {/* AI Advisor prompt box */}
            <div className="space-y-1.5 pt-1">
              <textarea
                id="ai-suggest-prompt"
                value={suggestPrompt}
                onChange={(e) => setSuggestPrompt(e.target.value)}
                placeholder="我的图片里有一只趴着的橘猫，想让它的肚子软软地鼓起来，帮我想想加工细节哒"
                className="w-full p-2.5 bg-white text-[10px] border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-300 font-semibold h-16 resize-none"
              />
              <button
                id="btn-ai-suggest-submit"
                onClick={handleAiSuggest}
                disabled={aiLoading || !suggestPrompt}
                className="w-full py-2 bg-rose-500 text-white rounded-xl font-bold text-xs hover:bg-rose-600 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "问问啵啵酱工艺点子 🍬"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
