import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Robots.txt Route
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    const host = req.headers.host || "duchessot.com";
    res.send(`User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://${host}/sitemap.xml`);
  });

  // Dynamic Sitemap Route
  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    const host = req.headers.host || "duchessot.com";
    const baseUrl = `https://${host}`;
    
    const pages = [
      { path: "", priority: "1.0" },
      { path: "/properties", priority: "0.9" },
      { path: "/about", priority: "0.8" },
      { path: "/contact", priority: "0.8" }
    ];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    pages.forEach(page => {
      xml += `  <url>\n    <loc>${baseUrl}${page.path}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    res.send(xml);
  });

  // API Route for AI Chat Assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      let replyText = "";
      
      const systemPrompt = `You are Duchessot AI, the virtual real estate consultant for DUCHESSOT Real Estate & Apartments in Ghana.
Your job is to assist clients with luxury homes, executive apartments, penthouses, villas, and rentals in East Legon, Airport Hills, Cantonments, and Accra.
Key Information:
- Company Phone / WhatsApp: 0542242404
- Email: duchessot@yahoo.com
- Main Location: East Legon, Accra, Ghana
- Services: Sales, Long-term Rentals, Short Lets / Airbnb, Property Management.
- Pricing: In USD ($) or GHS (Ghana Cedis).
Be professional, warm, concise, and helpful. Encourage clients to browse properties or reach out on WhatsApp at 0542242404 for viewings.`;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const formattedMessages = (messages || []).map((m: any) => ({
             role: m.role === "user" ? "user" : "model",
             parts: [{ text: m.content || "" }]
          }));

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Understood. I am Duchessot AI, ready to assist clients with luxury properties in Ghana." }] },
                ...formattedMessages
            ]
          });

          if (response && response.text) {
            replyText = response.text;
          }
        } catch (geminiError) {
          console.error("Gemini API call warning:", geminiError);
        }
      }

      if (!replyText) {
        const lastMsg = (messages && messages.length > 0) ? messages[messages.length - 1]?.content?.toLowerCase() || "" : "";
        if (lastMsg.includes("rent") || lastMsg.includes("apartment") || lastMsg.includes("short let") || lastMsg.includes("airbnb")) {
          replyText = "We have executive luxury apartments and short-let penthouses available in prime locations including East Legon and Cantonments. Would you like to check availability or schedule a viewing on WhatsApp at 0542242404?";
        } else if (lastMsg.includes("buy") || lastMsg.includes("sale") || lastMsg.includes("price") || lastMsg.includes("villa") || lastMsg.includes("house")) {
          replyText = "Duchessot offers exclusive luxury villas, townhouses, and prime estates for sale in Airport Hills, East Legon, and Cantonments. Call or WhatsApp us at 0542242404 for private viewings and pricing details!";
        } else if (lastMsg.includes("location") || lastMsg.includes("where") || lastMsg.includes("office") || lastMsg.includes("ghana")) {
          replyText = "Our main office is located in East Legon, Accra, Ghana. We offer high-end properties across East Legon, Airport Hills, Cantonments, and surrounding luxury districts.";
        } else if (lastMsg.includes("contact") || lastMsg.includes("phone") || lastMsg.includes("whatsapp") || lastMsg.includes("agent") || lastMsg.includes("email")) {
          replyText = "You can reach Duchessot directly via Phone or WhatsApp at 0542242404, or Email us at duchessot@yahoo.com. Our agents are ready to assist you!";
        } else {
          replyText = "Welcome to Duchessot Real Estate! How can I help you find luxury apartments, villas, or rentals in Ghana today? You can ask about our listings or reach our team at 0542242404.";
        }
      }

      res.json({ text: replyText });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.json({ text: "Welcome to Duchessot Real Estate! How can I assist you with finding luxury properties or rentals in Ghana today? You can also contact us directly on WhatsApp at 0542242404." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express v4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
