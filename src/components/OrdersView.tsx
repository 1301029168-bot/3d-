import React, { useState } from "react";
import { Order } from "../types";
import { Clock, CheckCircle2, ChevronRight, Truck, Info, Settings, Sparkles, Zap } from "lucide-react";

interface OrdersViewProps {
  orders: Order[];
  onSpeedup: (orderId: string) => void;
}

export default function OrdersView({ orders, onSpeedup }: OrdersViewProps) {
  // Pre-seed mock custom orders if the customer has not created any to make the page populated
  const defaultOrders: Order[] = [
    {
      id: "UV-ORDER-9527",
      product: {
        id: "prod-mock-1",
        templateId: "temp-cat",
        reliefImgUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=150&auto=format&fit=crop",
        reliefParams: { depth: 12, brightness: 0, contrast: 15, invert: false, glossiness: 80, renderMode: "color" },
        scale: 0.9,
        rotation: -4,
        offsetX: 5,
        offsetY: -5,
        quantity: 1
      },
      templateName: "未知订单 要求真多",
      cuteEmoji: "🐱",
      totalPrice: 24.8,
      recipientName: "麦子瑜",
      phone: "2286638",
      address: "未知地址 可能是地球",
      status: "printing",
      createdAt: "2026-06-03 14:24"
    },
    {
      id: "UV-ORDER-7241",
      product: {
        id: "prod-mock-2",
        templateId: "temp-toast",
        reliefImgUrl: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=150&auto=format&fit=crop",
        reliefParams: { depth: 5, brightness: 5, contrast: 5, invert: false, glossiness: 30, renderMode: "wood" },
        scale: 0.8,
        rotation: 12,
        offsetX: 0,
        offsetY: 8,
        quantity: 2
      },
      templateName: "芝士萌喵 · 猫耳吐司质感底胚",
      cuteEmoji: "🍞",
      totalPrice: 42.6,
      recipientName: "博美爱吃肉",
      phone: "188****9876",
      address: "汪汪城骨头巷3号 银色防指纹冰箱正面外贴",
      status: "shipped",
      createdAt: "2026-06-02 09:12"
    }
  ];

  const allOrders = [...orders, ...defaultOrders];

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return { label: "⚙️ 排版数据解析中", color: "bg-blue-50 text-blue-600 border-blue-200", percent: 25 };
      case "printing":
        return { label: "🖨️ 数码白彩千叠立体印刷中", color: "bg-rose-50 text-rose-600 border-rose-200 animate-pulse", percent: 55 };
      case "coating":
        return { label: "✨ 水晶高亮光油烘干固化中", color: "bg-purple-50 text-purple-700 border-purple-200", percent: 80 };
      case "shipped":
        return { label: "🚚 钕铁硼配磁包装 · 顺丰速运已发出", color: "bg-emerald-50 text-emerald-800 border-emerald-200", percent: 100 };
      default:
        return { label: "等待接收", color: "bg-slate-50 text-slate-600 border-slate-200", percent: 10 };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center max-w-md mx-auto space-y-1">
        <h2 className="text-2xl font-black text-slate-800 flex justify-center items-center gap-1.5">
          <span>📦 我的UV打版进度</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          在这里，你可以追溯每一个冰箱贴模具在工厂里的白墨喷叠厚度、固化上光、配重强磁等真实工艺排产细节哦！
        </p>
      </div>

      <div className="space-y-6">
        {allOrders.map((order) => {
          const statusInfo = getStatusLabel(order.status);
          return (
            <div 
              key={order.id}
              className="bg-white rounded-3xl border border-rose-100 p-6 space-y-4 hover:border-rose-200 transition-all sleek-shadow-card"
            >
              {/* Header section card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{order.cuteEmoji}</span>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-slate-800">{order.templateName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold font-mono">{order.id}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">下单时间：{order.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <span className={`text-[11px] font-black border px-3 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  
                  {order.status !== "shipped" && (
                    <button
                      id={`btn-speedup-${order.id}`}
                      onClick={() => onSpeedup(order.id)}
                      className="p-1 px-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-full text-[10px] transition-all flex items-center gap-0.5 shadow-xs transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                      title="催促打版，加速排绘进度"
                    >
                      <Zap className="w-3 h-3 fill-amber-950" />
                      催一催哒
                    </button>
                  )}
                </div>
              </div>

              {/* Manufacturing real-time bar */}
              <div className="space-y-2 bg-slate-50/60 p-4 rounded-2xl border border-rose-50/50">
                <div className="flex justify-between items-center text-xs font-black text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    数码固化排程进度：
                  </span>
                  <span className="text-sm font-mono text-rose-500">{statusInfo.percent}%</span>
                </div>

                {/* Simulated progress slider bar */}
                <div className="w-full bg-slate-200/70 rounded-full h-3.5 p-0.5 overflow-hidden flex shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-rose-400 via-purple-400 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${statusInfo.percent}%` }}
                  ></div>
                </div>

                {/* Progress markers labels */}
                <div className="grid grid-cols-4 gap-1 pt-1 text-[9px] font-black text-slate-400">
                  <div className={`text-left ${statusInfo.percent >= 25 ? "text-blue-500 font-bold" : ""}`}>
                    1. 调阶分层
                  </div>
                  <div className={`text-center ${statusInfo.percent >= 55 ? "text-rose-500 font-bold" : ""}`}>
                    2. 3D微雕白喷
                  </div>
                  <div className={`text-center ${statusInfo.percent >= 80 ? "text-purple-600 font-bold" : ""}`}>
                    3. 光油浇覆
                  </div>
                  <div className={`text-right ${statusInfo.percent >= 100 ? "text-emerald-600 font-bold" : ""}`}>
                    4. 强磁派件
                  </div>
                </div>
              </div>

              {/* Courier packaging details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-black block">📦 实体加工规格：</span>
                  <p className="pl-1 text-slate-700 leading-normal">
                    底胚：{order.templateName} ({order.cuteEmoji})<br />
                    工艺：千层堆垒 (高高突起立体感) + {order.product.reliefParams.glossiness}% 光油涂层<br />
                    材质特性：防水防刮，抗冷凝水凝结
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-black block">🚚 配送接收人及地址：</span>
                  <p className="pl-1 text-slate-700 leading-normal">
                    收件尊称：{order.recipientName} ({order.phone})<br />
                    派送地址：{order.address}<br />
                    定制总额：<span className="text-rose-500 font-black">¥{order.totalPrice.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
