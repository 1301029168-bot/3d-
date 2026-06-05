import React, { useState } from "react";
import { FRIDGE_MAGNET_TEMPLATES, DECORATION_STAMPS } from "../constants";
import { CustomizedProduct, FridgeMagnetTemplate, ReliefParameters } from "../types";
import { ShoppingBag, ZoomIn, ZoomOut, RotateCw, MoveLeft, MoveRight, MoveUp, MoveDown, Sparkles, Heart, Tag, Truck } from "lucide-react";
import { motion } from "motion/react";

interface MagnetCanvasViewProps {
  reliefImgUrl: string;
  reliefParams: ReliefParameters;
  onOrderPlaced: (newOrder: any) => void;
}

export default function MagnetCanvasView({ reliefImgUrl, reliefParams, onOrderPlaced }: MagnetCanvasViewProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("temp-toast");
  const [scale, setScale] = useState<number>(0.85);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  
  // Decals/Stamps placed on top
  const [placedDecals, setPlacedDecals] = useState<Array<{ id: string; emoji: string; x: number; y: number }>>([]);
  const [qty, setQty] = useState<number>(1);

  // Ordering modal flow
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [isOrdered, setIsOrdered] = useState<boolean>(false);

  const selectedTemplate = FRIDGE_MAGNET_TEMPLATES.find(t => t.id === selectedTemplateId) || FRIDGE_MAGNET_TEMPLATES[0];

  // Cost calculation
  const reliefBaseFee = reliefParams.depth * 0.5 + (reliefParams.glossiness > 50 ? 3.5 : 1.5);
  const decalFee = placedDecals.length * 1.5;
  const singlePrice = selectedTemplate.price + reliefBaseFee + decalFee;
  const totalPrice = singlePrice * qty;

  const handleAddDecal = (stamp: { id: string; emoji: string }) => {
    // Put stamp randomly near the center or corners inside staging
    const angle = Math.random() * Math.PI * 2;
    const r = 40 + Math.random() * 50;
    const x = Math.floor(Math.cos(angle) * r);
    const y = Math.floor(Math.sin(angle) * r);
    setPlacedDecals([
      ...placedDecals,
      { id: `${stamp.id}-${Date.now()}`, emoji: stamp.emoji, x, y }
    ]);
  };

  const handleClearDecals = () => {
    setPlacedDecals([]);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !phone || !address) {
      alert("请完整填写配送信息哦！");
      return;
    }

    const orderObj = {
      id: `UV-ORDER-${Math.floor(1000 + Math.random() * 9000)}`,
      product: {
        id: `prod-${Date.now()}`,
        templateId: selectedTemplate.id,
        reliefImgUrl,
        reliefParams,
        scale,
        rotation,
        offsetX,
        offsetY,
        quantity: qty
      } as CustomizedProduct,
      templateName: selectedTemplate.name,
      cuteEmoji: selectedTemplate.cuteEmoji,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      recipientName: recipient,
      phone,
      address,
      status: "pending" as const,
      createdAt: new Date().toLocaleDateString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    onOrderPlaced(orderObj);
    setIsOrdered(true);
    setIsCheckoutOpen(false);
  };

  // Shape container styling generator
  const renderShapeContainer = () => {
    let baseStyle = "relative overflow-hidden w-64 h-64 border-4 transition-all duration-300 flex items-center justify-center shadow-lg ";
    let shapeSpecifics = "";

    switch (selectedTemplate.shape) {
      case "toast":
        // Toast style cut bounds
        baseStyle += "rounded-[2.5rem] bg-[#fdf5e6] border-[#ca8a04]/40";
        shapeSpecifics = "rounded-t-[3.5rem] rounded-b-[2rem]";
        break;
      case "cat":
        // Cat head silhouette base
        baseStyle += "rounded-full bg-[#faf7f2] border-pink-300/60";
        break;
      case "cloud":
        // Cloud waves scalloped
        baseStyle += "rounded-[4rem] bg-[#f0f9ff] border-blue-200/60";
        shapeSpecifics = "skew-x-1";
        break;
      case "tv":
        baseStyle += "rounded-[2rem] bg-[#fafaf9] border-slate-300/70";
        break;
      case "boba":
        baseStyle += "rounded-[1.5rem] bg-[#fbf7f4] border-amber-600/30";
        shapeSpecifics = "skew-y-1";
        break;
      case "round":
        baseStyle += "rounded-full bg-[#fef8e8] border-amber-500/40 border-dashed";
        break;
      default:
        baseStyle += "rounded-3xl bg-white border-slate-200";
    }

    return (
      <div className="relative flex flex-col items-center">
        {/* Render Cat Ears decorations on top if Cat shape selected */}
        {selectedTemplate.shape === "cat" && (
          <div className="absolute -top-3 w-64 flex justify-between px-8 z-0 pointer-events-none">
            <div className="w-12 h-12 bg-pink-100 border-4 border-pink-300/40 rounded-tr-3xl rotate-12 flex items-center justify-center">
              <div className="w-6 h-6 bg-pink-300 rounded-tr-2xl"></div>
            </div>
            <div className="w-12 h-12 bg-pink-100 border-4 border-pink-300/40 rounded-tl-3xl -rotate-12 flex items-center justify-center">
              <div className="w-6 h-6 bg-pink-300 rounded-tl-2xl"></div>
            </div>
          </div>
        )}

        {/* Render Boba Straw if Boba Shape */}
        {selectedTemplate.shape === "boba" && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-10 bg-pink-300 rounded-lg -rotate-12 z-0 border-2 border-pink-400"></div>
        )}

        {/* Render TV Antennas */}
        {selectedTemplate.shape === "tv" && (
          <div className="absolute -top-7 w-20 flex justify-between z-0 pointer-events-none">
            <div className="w-1.5 h-8 bg-slate-400 rounded rotate-12 origin-bottom"></div>
            <div className="w-1.5 h-8 bg-slate-400 rounded -rotate-12 origin-bottom"></div>
          </div>
        )}

        {/* Outer mold casing */}
        <div className={`${baseStyle} ${shapeSpecifics} shrink-0 z-10`}>
          {/* Inner template base board decorative details */}
          {selectedTemplate.shape === "toast" && (
            <div className="absolute inset-2 border-2 border-amber-800/10 border-dashed rounded-3xl pointer-events-none"></div>
          )}
          {selectedTemplate.shape === "tv" && (
            <div className="absolute right-2 top-10 flex flex-col gap-1 z-30">
              <div className="w-4 h-4 bg-slate-200 border border-slate-300 rounded-full"></div>
              <div className="w-4 h-4 bg-slate-200 border border-slate-300 rounded-full"></div>
              <div className="w-3 h-2 bg-rose-400 rounded animate-pulse mt-2"></div>
            </div>
          )}

          {/* User's Customizable Locked Relief Layer Image */}
          <div 
            className="absolute z-20 pointer-events-none transition-all duration-75 select-none"
            style={{
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`,
              width: "220px",
              height: "220px",
              filter: "drop-shadow(3px 8px 12px rgba(100,50,0,0.18))"
            }}
          >
            {reliefImgUrl ? (
              <img 
                referrerPolicy="no-referrer"
                src={reliefImgUrl} 
                alt="Your custom relief stencils" 
                className="w-full h-full object-contain rounded-2xl"
              />
            ) : (
              <div className="w-full h-full border-4 border-dashed border-pink-300 rounded-2xl flex items-center justify-center p-4 bg-white/80">
                <span className="text-pink-500 font-bold text-center text-xs">
                  ⚠️ 尚未生成浮雕照片，请先到上一页【浮雕工坊】中加工您的照片哒！
                </span>
              </div>
            )}
          </div>

          {/* Placed Decal Stamps Layer */}
          {placedDecals.map((decal) => (
            <div
              key={decal.id}
              className="absolute z-30 text-2xl select-none dragging-cursor filter drop-shadow hover:scale-125 transition-transform"
              style={{
                left: `calc(50% - 14px + ${decal.x}px)`,
                top: `calc(50% - 14px + ${decal.y}px)`,
                cursor: "pointer"
              }}
              title="双击或点击重新洗牌"
              onClick={() => {
                setPlacedDecals(placedDecals.filter(d => d.id !== decal.id));
              }}
            >
              {decal.emoji}
            </div>
          ))}

          {/* Bottom mold shade gradient overlays */}
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-900/[0.04] to-transparent pointer-events-none"></div>
        </div>

        {/* Back neodymium solid magnet indicator badge underneath */}
        <div className="bg-slate-700 text-[10px] text-slate-100 font-bold px-3 py-1 rounded-full mt-4 flex items-center gap-1 shadow-sm border border-slate-600 z-10">
          <span>🧲 背部精装:</span>
          <span className="text-yellow-300 font-medium font-mono">20mm 钕铁硼磁吸强片 × 2</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Dynamic cute feedback notification */}
      {isOrdered && (
        <div className="bg-emerald-50 border-4 border-emerald-200 rounded-3xl p-6 text-center space-y-3 animate-fade-in">
          <span className="text-5xl block">🎉</span>
          <h3 className="text-xl font-bold text-emerald-800">啵啵酱已成功接收订单哒！</h3>
          <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto leading-relaxed">
            极速UV固化打版中，您可以点击顶部导航栏中的【📦 我的订单】查看我们工厂的实时打印厚度进度及派送状态哦！
          </p>
          <button
            id="btn-dismiss-success"
            onClick={() => setIsOrdered(false)}
            className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-black text-xs transition-colors"
          >
            继续好物定制
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 📋 Left part: Staging frame representation */}
        <div className="lg:col-span-6 flex flex-col items-center bg-white rounded-3xl border border-rose-100 p-8 space-y-6 sleek-shadow-card">
          <div className="text-center">
            <h3 className="text-base font-extrabold text-slate-800">🧸 3D 冰箱硬拼画布 🧸</h3>
            <p className="text-xs text-slate-400 font-semibold">将自定义浮雕缩放平铺在模架底胚中</p>
          </div>

          {renderShapeContainer()}

          {/* Decal Stamps Bar */}
          <div className="w-full pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-black text-slate-600">
              <span>🎏 搭配超萌印花小贴画 (每个+¥1.5)</span>
              {placedDecals.length > 0 && (
                <button 
                  id="btn-clear-decals"
                  onClick={handleClearDecals} 
                  className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                >
                  清空贴画
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {DECORATION_STAMPS.map((stamp) => (
                <button
                  id={`stamp-${stamp.id}`}
                  key={stamp.id}
                  onClick={() => handleAddDecal(stamp)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>{stamp.emoji}</span>
                  <span className="text-[10px] font-semibold text-slate-500">{stamp.name}</span>
                </button>
              ))}
            </div>
            {placedDecals.length > 0 && (
              <p className="text-[9px] text-slate-400 font-semibold">
                提示: 贴纸会自动放置在冰箱画幅中。点击画布上对应的贴画可以直接移除哦！
              </p>
            )}
          </div>
        </div>

        {/* ⚙️ Right Panel: Selection parameters, cost breakdown & Ordering form */}
        <div className="lg:col-span-6 space-y-6">
          {/* Base shape selector */}
          <div className="bg-white rounded-3xl border border-rose-100 p-5 space-y-4 sleek-shadow-card">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">2️⃣</span>
              选择磁基底胚模版
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {FRIDGE_MAGNET_TEMPLATES.map((t) => (
                <button
                  id={`magnet-temp-${t.id}`}
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`p-3 rounded-xl text-left border-2 flex gap-3 transition-all cursor-pointer ${selectedTemplateId === t.id ? "bg-rose-50 border-rose-400 text-rose-800 animate-scale-up" : "bg-white border-slate-50 text-slate-600 hover:border-rose-200"}`}
                >
                  <span className="text-3xl self-center">{t.cuteEmoji}</span>
                  <div className="space-y-0.5 truncate">
                    <span className="text-xs font-black block truncate">{t.name}</span>
                    <span className="text-[10px] text-rose-600 font-extrabold block">¥{t.price.toFixed(1)}</span>
                    <span className="text-[9px] text-slate-400 line-clamp-1 font-semibold">{t.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Position details */}
          <div className="bg-white rounded-3xl border border-rose-100 p-5 space-y-4 sleek-shadow-card">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">3️⃣</span>
              精细微调位置与缩放
            </h3>

            {/* Scale slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
                <span>照片大小缩放</span>
                <span>{(scale * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
                <input 
                  id="scale-slider"
                  type="range" min="0.3" max="1.5" step="0.01" value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="flex-1 accent-rose-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize"
                />
                <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Rotate slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
                <span>顺时针倾斜旋转</span>
                <span>{rotation}°</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                <input 
                  id="rotate-slider"
                  type="range" min="-180" max="180" value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="flex-1 accent-rose-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize"
                />
              </div>
            </div>

            {/* D-Pad position controls offset */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* X position */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block">左右水平平移</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">-70</span>
                  <input 
                    id="offset-x-slider"
                    type="range" min="-70" max="70" value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value))}
                    className="flex-grow accent-slate-400 h-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize"
                  />
                  <span className="text-[10px] font-bold text-slate-500">70</span>
                </div>
              </div>

              {/* Y position */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block">上下高度垂直位移</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">-70</span>
                  <input 
                    id="offset-y-slider"
                    type="range" min="-70" max="70" value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value))}
                    className="flex-grow accent-slate-400 h-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize"
                  />
                  <span className="text-[10px] font-bold text-slate-500">70</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout & Bill panel */}
          <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-3xl space-y-4 sleek-shadow-card">
            <h4 className="font-extrabold text-rose-800 text-sm flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-rose-600" />
              定制预算细单明细
            </h4>

            <div className="text-xs space-y-1.5 font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>{selectedTemplate.cuteEmoji} {selectedTemplate.name}底材:</span>
                <span>¥{selectedTemplate.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>🌋 物理高叠立体打样费 (层厚 {reliefParams.depth}):</span>
                <span>¥{(reliefParams.depth * 0.5).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>✨ 水晶亮光顶油固化工艺:</span>
                <span>¥{reliefParams.glossiness > 50 ? "3.50" : "1.50"}</span>
              </div>
              {placedDecals.length > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>🎀 萌趣印花贴画 ({placedDecals.length}个):</span>
                  <span>+¥{decalFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-rose-200 text-sm font-black text-rose-600">
                <span>定制单价:</span>
                <span>¥{singlePrice.toFixed(2)} / 件</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-dashed border-rose-200">
              {/* Qty count */}
              <div className="flex items-center border border-rose-200 bg-white rounded-xl py-1 px-2 gap-2">
                <button 
                  id="btn-qty-minus"
                  className="w-5 h-5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center cursor-pointer"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-700 min-w-5 text-center">{qty}</span>
                <button 
                  id="btn-qty-plus"
                  className="w-5 h-5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center cursor-pointer"
                  onClick={() => setQty(qty + 1)}
                >
                  +
                </button>
              </div>

              {/* Action pricing */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block">合计定制费用</span>
                <span className="text-xl font-black text-rose-500">¥{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              id="btn-trigger-checkout"
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              立即模拟下单定制 🐾
            </button>
          </div>
        </div>
      </div>

      {/* 🧾 Cute Checkout Modal Card */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] border border-rose-200 max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-scale-up">
            <button 
              id="btn-close-checkout"
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 text-sm font-black border border-slate-200 cursor-pointer"
            >
              ×
            </button>
            <div className="text-center space-y-1">
              <span className="text-3xl">📦</span>
              <h3 className="text-lg font-black text-slate-800">确认收件及打印规格哒</h3>
              <p className="text-[10px] text-slate-400 font-semibold">此为模拟实验打印下单，请放心填写虚拟收件</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-rose-100 text-[11px] font-semibold text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>基底形态:</span>
                <span className="font-extrabold text-slate-800">{selectedTemplate.name}</span>
              </div>
              <div className="flex justify-between">
                <span>叠加工艺:</span>
                <span className="text-rose-600 font-extrabold">UV {reliefParams.renderMode === "color" ? "标准彩墨" : "特种底色"} + {reliefParams.depth * 150}微米微雕堆填</span>
              </div>
              <div className="flex justify-between">
                <span>水晶亮油:</span>
                <span className="font-extrabold text-slate-800">{reliefParams.glossiness}% 局部涂覆</span>
              </div>
              <div className="flex justify-between">
                <span>总印花贴纸:</span>
                <span className="font-extrabold text-slate-800">{placedDecals.length} 个</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-xs font-black text-rose-500">
                <span>应付总金额:</span>
                <span className="text-sm font-mono">¥{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500">收件人尊称:</label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  placeholder="例如：啵啵酱"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-300 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500">手机号码/联系方式:</label>
                <input
                  id="checkout-phone"
                  type="text"
                  required
                  placeholder="例如：13812345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-300 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500">派送详细地址:</label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  placeholder="例如：面包王国曲奇大道88号 冰箱左半扇"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-300 text-xs font-bold"
                />
              </div>

              <div className="bg-emerald-50 text-emerald-800 text-[9px] font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-emerald-100">
                <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>包邮福利！订单确认后随即进入我们UV数码千叠喷墨打印机排产队列中哒！</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  id="btn-cancel-checkout"
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  我再想想
                </button>
                <button
                  id="btn-submit-order"
                  type="submit"
                  className="py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  确认打印无误! ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
