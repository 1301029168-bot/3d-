export interface FridgeMagnetTemplate {
  id: string;
  name: string;
  shape: 'toast' | 'pudding' | 'cloud' | 'tv' | 'cat' | 'boba' | 'round' | 'heart';
  bgUrl: string; // fallback shape rendering or layout SVG
  width: number; // in pt/px
  height: number;
  price: number;
  description: string;
  cuteEmoji: string;
}

export interface ReliefParameters {
  depth: number;     // 1 to 20
  brightness: number; // -50 to 50
  contrast: number;   // -50 to 50
  invert: boolean;
  glossiness: number; // 0 to 100 (varnish coverage)
  renderMode: 'color' | 'wood' | 'acrylic' | 'ceramic' | 'monochrome';
}

export interface CustomizedProduct {
  id: string;
  templateId: string;
  reliefImgUrl: string; // the generated heightmap/relief image
  reliefParams: ReliefParameters;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  quantity: number;
}

export interface Order {
  id: string;
  product: CustomizedProduct;
  templateName: string;
  cuteEmoji: string;
  totalPrice: number;
  recipientName: string;
  phone: string;
  address: string;
  status: 'pending' | 'printing' | 'coating' | 'shipped';
  createdAt: string;
}

export interface UVShowcaseItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  effectType: 'varnish' | 'extreme3D' | 'acrylic' | 'wood';
  priceRange: string;
  cuteTag: string;
}
