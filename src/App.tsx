import React, { useState } from "react";
import { Sparkles, Layers, Compass, HelpCircle, Package, ArrowRight, Heart } from "lucide-react";
import ShowcaseView from "./components/ShowcaseView";
import ReliefLabView from "./components/ReliefLabView";
import MagnetCanvasView from "./components/MagnetCanvasView";
import OrdersView from "./components/OrdersView";
import { Order, ReliefParameters } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"showcase" | "lab" | "magnet" | "orders">("showcase");
  
  // Customizer bridge states
  const [reliefImgUrl, setReliefImgUrl] = useState<string>("");
  const [reliefParams, setReliefParams] = useState<ReliefParameters>({
    depth: 8,
    brightness: 0,
    contrast: 10,
    invert: false,
    glossiness: 65,
    renderMode: "color"
  });

  // Master ordered history list
  const [orders, setOrders] = useState<Order[]>([]);

  // Lock relief from Tab 2 and transition to Tab 3
  const handleReliefLocked = (imgDataUrl: string, params: ReliefParameters) => {
    setReliefImgUrl(imgDataUrl);
    setReliefParams(params);
    setActiveTab("magnet");
  };

  // Submit customized order from Tab 3 and forward to Tab 4
  const handleAddNewOrder = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
    setActiveTab("orders");
  };

  // Accelerate order status for immediate testing gratification
  const handleSpeedupOrder = (orderId: string) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        let nextStatus: Order["status"] = "printing";
        if (o.status === "pending") nextStatus = "printing";
        else if (o.status === "printing") nextStatus = "coating";
        else if (o.status === "coating") nextStatus = "shipped";
        else nextStatus = "shipped";
        return { ...o, status: nextStatus };
      }
      return o;
    }));
  };

  return (
    <div className="min-h-screen bg-rose-50 text-slate-700 flex flex-col justify-between selection:bg-rose-200">
      
      {/* 🎀 Primary Application Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 sleek-shadow-card px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("showcase")}>
          <div className="w-10 h-10 bg-rose-400 rounded-full flex items-center justify-center shadow-md shadow-rose-100 border border-white">
            <div className="w-5 h-5 bg-white rounded-sm rotate-45 shadow-xs"></div>
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-rose-600 block">
              PuffyPrint Studio
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">
              Mogu Mogu Relief Lab
            </span>
          </div>
        </div>

        {/* Dynamic cute tab switches */}
        <nav className="flex items-center gap-1.5 bg-rose-50 p-1.5 rounded-2xl border border-rose-100 overflow-x-auto max-w-full">
          <button
            id="tab-showcase"
            onClick={() => setActiveTab("showcase")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 cursor-pointer ${activeTab === "showcase" ? "bg-rose-500 text-white shadow-md shadow-rose-200" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Compass className="w-3.5 h-3.5" />
            创意主页
          </button>

          <button
            id="tab-lab"
            onClick={() => setActiveTab("lab")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 cursor-pointer ${activeTab === "lab" ? "bg-rose-500 text-white shadow-md shadow-rose-200" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            浮雕转化机
          </button>

          <button
            id="tab-magnet"
            onClick={() => setActiveTab("magnet")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 cursor-pointer ${activeTab === "magnet" ? "bg-rose-500 text-white shadow-md shadow-rose-200" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Layers className="w-3.5 h-3.5" />
            冰箱贴拼装
          </button>

          <button
            id="tab-orders"
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 relative cursor-pointer ${activeTab === "orders" ? "bg-rose-500 text-white shadow-md shadow-rose-200" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Package className="w-3.5 h-3.5" />
            我的订单
            {orders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                {orders.length}
              </span>
            )}
          </button>
        </nav>
      </header>

      {/* 🎨 Main Content Window */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-8">
        <div className="relative">
          {activeTab === "showcase" && (
            <ShowcaseView onGoToCustomize={() => setActiveTab("lab")} />
          )}

          {activeTab === "lab" && (
            <ReliefLabView onReliefGenerated={handleReliefLocked} />
          )}

          {activeTab === "magnet" && (
            <MagnetCanvasView 
              reliefImgUrl={reliefImgUrl} 
              reliefParams={reliefParams}
              onOrderPlaced={handleAddNewOrder} 
            />
          )}

          {activeTab === "orders" && (
            <OrdersView orders={orders} onSpeedup={handleSpeedupOrder} />
          )}
        </div>
      </main>

      {/* 🌸 Visual Page Margin Clutter Avoided: Clean footer */}
      <footer className="footer-border bg-white mt-12 border-t border-rose-100 py-6 px-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
          <span>PuffyPrint Studio © 2026</span>
          <span>•</span>
          <span>高耐磨多层喷墨立体白色叠加工学</span>
          <span>•</span>
          <span>物理光栅精工</span>
        </div>
        <p className="text-[10px] text-rose-500 font-semibold flex justify-center items-center gap-1">
          <span>用爱堆叠，摸得到的温暖回忆</span> <Heart className="w-3 h-3 fill-rose-500" />
        </p>
      </footer>
    </div>
  );
}
