import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize GoogleGenAI lazily to prevent crash if key is undefined
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Check if Gemini API is available
app.get("/api/config", (req, res) => {
  const isApiKeyConfigured = !!process.env.GEMINI_API_KEY;
  res.json({
    isApiKeyConfigured,
    message: isApiKeyConfigured
      ? "AI 拓展卡就绪！已连接至 Google Gemini 服务。"
      : "Gemini API 密钥未配置，系统将采用高保真本地算法转换，并支持内置精选模板，可前去 Secrets 中配置以解锁智能生成！",
  });
});

// API endpoint to suggest physical features for 3D printing from user prompts
app.post("/api/ai/suggest-relief", async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: "请输入定制创意描述！" });
  }

  try {
    const ai = getAi();
    const systemPrompt = `你是一个专业的UV 3D浮雕喷墨打印定制顾问，说话风格要极其软萌、可爱（多用“~”、“哒”、“哦”，比如“好的哒”、“为您推荐哦~”）。
用户会提供一些关于他想打印的图片内容或创意设计描述。
请结合UV打印技术，为他分析如何实现高品质的“3D立体浮雕效果（Relief）”与“局部亮油（Gloss Varnish）”。
你的建议应包含以下部分：
1. 立体感分析：建议将图片里的哪些动物、植物或背景元素制作成凹凸浮雕（例如：猫咪的毛发、云朵、面包框架）。
2. 光油（亮闪闪效果）：哪些细节需要刷上亮晶晶的UV光油（例如：猫咪的眼睛、露珠、奶茶波霸）。
3. 推荐浮雕厚度和质感（例如：微浮雕、中度凹凸、极硬浮雕）。
4. 句尾给出一句超可爱的鼓励并送上贴合的Emoji（如 🐱, 🍞, 🥤 等）。

请以易读的、可爱的排版输出，并精简字数（大约200字以内），不要输出长篇大论。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `这是我的创意说明: "${prompt}"。请为我做立体浮雕设计分析！`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini suggestion failed:", error);
    res.json({
      text: `哎呀~ 啵啵酱和AI天线失去了连接（${error.message || "未知错误"}），不过没关系！啵啵酱已经帮您准备好了超高级的智能浮雕算法，您可以直接在左侧调节【浮雕高度】和【光油亮度】，马上就能生成超逼真的3D效果啦！✨`
    });
  }
});

// API endpoint to create standard cute images suitable for 3D relief
app.post("/api/ai/draw-stencil", async (req, res) => {
  const { prompt, aspectRatio = "1:1" } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "请输入你想生成的浮雕图案创意！" });
  }

  try {
    const ai = getAi();
    
    // Using gemini-2.5-flash-image for standard image generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a stylized, extremely cute chubby illustration suitable for a 3D relief printing stencil. 
Subject: ${prompt}.
Style: adorable cartoon doodle, clean bold solid round vectors, high local contrast, minimalist pastel soft color block background, perfect for wood/acrylic carving or UV stacked sticker. Cute stickers theme. Beautiful aesthetic, high detail. No photo realism. Bold simple outlines.`
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any
        }
      }
    });

    let imageUrl: string | null = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64 = part.inlineData.data;
          imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${base64}`;
          break;
        }
      }
    }

    if (imageUrl) {
      res.json({ imageUrl });
    } else {
      res.status(500).json({ error: "未能提取到生成的图片，请换个描述词试试哦！" });
    }
  } catch (error: any) {
    console.error("Gemini Image generation failed:", error);
    res.status(500).json({ 
      error: `生成图案失败了啦 (${error.message || "接口异常"})。如果没有配置付费Gemini API密钥或额度不足，可以使用我们提供的内置预设萌宠图案（背包柴犬、圆脸大橘、桃气比熊、电眼布偶猫咪等），也非常可爱哒！`
    });
  }
});

async function startServer() {
  // Set up Vite or Static file serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      app.get("*", (req, res) => {
        res.status(404).send("Production build not found. Run npm run build first.");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[UV Customizer Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
