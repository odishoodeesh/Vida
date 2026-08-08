import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to allow larger base64 image uploads
app.use(express.json({ limit: "50mb" }));

// Configure S3 Client
let s3Client: S3Client | null = null;
function getS3Client(): S3Client | null {
  if (!s3Client) {
    const region = process.env.AWS_S3_REGION || "ap-south-1";
    const endpoint = process.env.AWS_S3_ENDPOINT;
    const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      console.warn("S3 Storage environment variables are missing. File uploads will fallback to local base64.");
      return null;
    }

    s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

// Lazy initialize the SDK
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// S3-compatible image upload endpoint
app.post("/api/upload", async (req: express.Request, res: express.Response) => {
  try {
    const { base64Data, fileName, mimeType } = req.body;
    if (!base64Data || !fileName) {
      res.status(400).json({ error: "Missing required fields: base64Data or fileName" });
      return;
    }

    // Clean base64 data (remove header prefix if present)
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Clean, "base64");

    const s3 = getS3Client();
    const bucket = process.env.AWS_S3_BUCKET || "vida";

    if (s3) {
      const uploadPath = fileName.startsWith("images/") ? fileName : `images/${fileName}`;
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: uploadPath,
        Body: buffer,
        ContentType: mimeType || "image/jpeg",
      });

      await s3.send(command);

      // Generate the public URL
      const supabaseUrl = (process.env.VITE_SUPABASE_URL || "https://jyjtixllqqukiquxdpve.supabase.co").replace(/\/$/, "");
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${uploadPath}`;

      res.json({ publicUrl });
    } else {
      console.warn("S3 upload client is not initialized, returning base64 string directly");
      res.json({ publicUrl: base64Data });
    }
  } catch (error: any) {
    console.error("Upload API Error:", error);
    res.status(500).json({ error: error.message || "Failed to upload image to S3" });
  }
});

const SYSTEM_INSTRUCTIONS = `You are the VIDA Alchemist, a highly sophisticated, elegant, and warm skincare authority for "VIDA Botanical".
Your goal is to guide users through custom botanical oil recommendations based on their concerns, skin type (oily, dry, sensitive, mature, combination), hair goals, and scalp status.

VIDA's botanical product list is:
1. Castor Oil ($32) - Specialty Care. Focus: Hair/lashes thickness, scalp strength, deep skin moisture/elasticity.
2. Rosemary Oil ($36) - Specialty Care. Focus: Hair growth excitation, reducing scalp shedding, dandruff, clarifying acne-prone skin.
3. Almond Oil ($34) - Deep Moisture. Focus: Sensitive skin soft nourishment, brightening, extremely gentle daily skin hydrating.
4. Flax Seed Oil ($38) - Gold Collection. Focus: Barrier stabilization, clearing redness, reducing seasonal sensitivity, omega-rich.
5. Jojoba Oil ($40) - Gold Collection. Focus: Sebum regulation, lightweight hydration, mimicking human sebum, restorative balance.
6. Olive Oil ($30) - Deep Moisture. Focus: Intense nourishment, dry skin repair, restoring skin elasticity.
7. Coconut Oil ($28) - Deep Moisture. Focus: Versatile moisture, shine, dry hair ends repair. (Note: heavy, use with caution on face).
8. Argan Oil ($45) - Deep Moisture. Focus: Hair repair, controlling frizz, lightweight premium conditioning.
9. Walnut Oil ($38) - Deep Moisture. Focus: Rich skin softening, scalp health, shine.
10. Clove Oil ($34) - Specialty Care. Focus: Warming stimulation, scalp blood circulation, purifying blemish/scalp (use diluted).
11. Chia Seed Oil ($42) - Gold Collection. Focus: Antioxidant envelope, city pollution protection, glowing skin tone.
12. Akpi Oil ($48) - Specialty Care. Focus: Enhancing firmness, skin elasticity, curves/fullness.
13. Oregano Oil ($36) - Specialty Care. Focus: Purifying properties, soothing dandruff or blemishes (extremely powerful, must be diluted).
14. Blackseed Oil ($40) - Specialty Care. Focus: Anti-inflammatory, calming extreme irritation, soothing acne, eczema-friendly.
15. Fenugreek Oil ($34) - Specialty Care. Focus: Follicle nourishment, reducing thinning hair.
16. Peppermint Oil ($32) - Specialty Care. Focus: Cooling sensation, refreshing scalp, energy boost.
17. Watercress Oil ($38) - Gold Collection. Focus: Revitalizing dull/tired complexions, deep nutrition.
18. Pumpkin Seed Oil ($36) - Deep Moisture. Focus: Hair density, softening mature skin, restorative lipids.
19. Sesame Oil ($32) - Deep Moisture. Focus: Warming oil, antioxidant envelope.

Rules for your tone & recommendations:
- Be highly respectful, luxury-oriented, scientific yet poetic. Mention botanical facts and molecular characteristics (e.g., triglycerides, omega-3s, squalene-like liquid waxes).
- Always recommend exactly 1 to 3 specific products from the above list, with beautiful explanations of why they match the user's specific skin or hair profile.
- Return responses in structured format with explanations and exact product IDs so the user can easily add them to their cart!
- If the language used by the user is Arabic, translate your explanations and poetic feedback into elegant Arabic.
- If the language is Kurdish, translate your feedback into elegant Kurdish (Sorani/Kurmanji as appropriate, or default to a warm elegant Kurmanji/Kurdish).
- Otherwise, speak English.`;

// Fallback responses when GEMINI_API_KEY is not configured or on network issues
function getFallbackChatResponse(message: string = '', language: string = 'en') {
  const msgLower = (message || '').toLowerCase();
  let recommendedProductIds: string[] = [];
  let reply = "";

  if (msgLower.includes("hair") || msgLower.includes("scalp") || msgLower.includes("frizz") || msgLower.includes("growth") || msgLower.includes("rosemary")) {
    recommendedProductIds = ["2", "1", "8"];
    if (language === 'ar') {
      reply = "لتحسين صحة الشعر وفروة الرأس، نوصي بتركيبة الزيوت النباتية المعصورة على البارد: زيت الروزماري (رقم 2) لتحفيز نمو البصيلات، وزيت الخروع (رقم 1) لتقوية الجذور، وزيت الأرجان (رقم 8) للنعومة واللمعان.";
    } else if (language === 'kr') {
      reply = "بۆ باشترکرنا تەندروستیا پرچ و کەپۆلا سەرێ، ئەرکانێ مە چێکرنا زەیتێن سروشتی پێشنيار دکەت: زەیتا روزماری (ژمارە 2) بۆ زێدەکرنا پرچێ، زەیتا خروع (ژمارە 1) بۆ بوهێزکرنا ڕەگان، و زەیتا ئەرگان (ژمارە 8) بۆ نەرماتیێ.";
    } else {
      reply = "For hair vitality and scalp stimulation, our Alchemist recommends a cold-pressed botanical ritual featuring Rosemary Oil (No. 2) for root stimulation, Castor Oil (No. 1) for density, and Argan Oil (No. 8) for silkiness and frizz control.";
    }
  } else if (msgLower.includes("dry") || msgLower.includes("moisture") || msgLower.includes("hydration") || msgLower.includes("dehydrated")) {
    recommendedProductIds = ["3", "5", "6"];
    if (language === 'ar') {
      reply = "للبشرة الجافة والباهتة، خلطتنا النباتية الموصى بها تجمع بين زيت اللوز العضوي (رقم 3) للترطيب العميق، وزيت الجوجوبا (رقم 5) لإعادة التوازن الطبيعي، وزيت الزيتون (رقم 6) للترميم الغني.";
    } else if (language === 'kr') {
      reply = "بۆ پیستێ هشک، تێکەڵا مە یا پێشنيارکری زەیتا بادەما (ژمارە 3) بۆ تەقاندنا ئاڤێ، زەیتا جوجۆبا (ژمارە 5) بۆ هاوسەنگیا چەوریێ، و زەیتا زەیتونێ (ژمارە 6) بۆ نەرمکرنا کوور دگریتە خۆ.";
    } else {
      reply = "For dry or dehydrated skin, the Alchemist suggests our deeply nourishing blend of Organic Almond Oil (No. 3), Jojoba Oil (No. 5) for lipid balance, and Olive Oil (No. 6) for cellular moisture renewal.";
    }
  } else if (msgLower.includes("acne") || msgLower.includes("oily") || msgLower.includes("blemish") || msgLower.includes("purify")) {
    recommendedProductIds = ["5", "2", "14"];
    if (language === 'ar') {
      reply = "للبشرة الدهنية أو المعرضة للشوائب، نوصي بزيت الجوجوبا (رقم 5) لضبط الإفرازات الزهمية، وزيت الروزماري (رقم 2) لتنقية المسام، وزيت الحبة السوداء (رقم 14) لتهدئة التهيج.";
    } else if (language === 'kr') {
      reply = "بۆ پیستێ چەور یان زیپکەدار، زەیتا جوجۆبا (ژمارە 5) بۆ هاوسەنگیا چەوریێ و زەیتا دەنکە ڕەش (ژمارە 14) بۆ هێورکرنا سۆتنگەهێ گەلەک بەرهەمدارن.";
    } else {
      reply = "For oily or blemish-prone complexions, our formula balances sebum production with lightweight Jojoba Oil (No. 5), purifying Rosemary Oil (No. 2), and soothing Blackseed Oil (No. 14).";
    }
  } else {
    recommendedProductIds = ["5", "11", "4"];
    if (language === 'ar') {
      reply = "مرحباً بك في استوديو فيدا النباتي. نوصي بزيوتنا الذهبية المغذية: زيت الجوجوبا (رقم 5) لإعطاء المرونة والنعومة، وزيت بذور الشيا (رقم 11) الغني بمضادات الأكسدة لترميم البشرة وحمايتها اليومية.";
    } else if (language === 'kr') {
      reply = "بخێر بێی بۆ الاستوديو یا ڤیدا. نیشاندانا مە یا ڕووەکی زەیتا جوجۆبا (ژمارە 5) و زەیتا دەنکێن شیا (ژمارە 11) پێشنيار دکەت بۆ نووکرنا تیشکا سروشتی.";
    } else {
      reply = "Welcome to VIDA Botanical Studio. For daily radiance and barrier fortification, our Alchemist suggests balancing your complexion with cold-pressed Jojoba Oil (No. 5) and antioxidant-rich Chia Seed Oil (No. 11).";
    }
  }

  return { reply, recommendedProductIds };
}

function getFallbackDiagnoseResponse(answers: any = {}, language: string = 'en') {
  const skinType = answers.skinType || 'dry';
  const concern = answers.primaryConcern || 'hydration';
  let recommendedProductIds: string[] = ["5", "3"];

  if (skinType === 'dry' || concern === 'hydration') {
    recommendedProductIds = ["3", "5", "6"];
  } else if (concern === 'acne' || skinType === 'oily') {
    recommendedProductIds = ["5", "2", "14"];
  } else if (concern === 'aging' || skinType === 'mature') {
    recommendedProductIds = ["11", "12", "8"];
  } else if (answers.hairGoals && answers.hairGoals !== 'none') {
    recommendedProductIds = ["2", "1", "8"];
  }

  let reply = "";
  if (language === 'ar') {
    reply = `تم إعداد طقوسك النباتية المخصصة بناءً على تشخيص بشرتك (${skinType}) واحتياجاتك الخاصة (${concern}). نوصي باستخدام هذه التركيبة المعصورة على البارد يومياً لترميم وإحياء بشرتك.`;
  } else if (language === 'kr') {
    reply = `ڕیتوالا تە یا تایبەت هاتبە ئامادەکرن بۆ پیستێ تە (${skinType}). ئەڤ تێکەڵە دەستنیشانکریە دا کو ڕەوشا پیستێ تە نوی بکەتەڤە.`;
  } else {
    reply = `Your bespoke botanical ritual has been crafted for your ${skinType} profile focusing on ${concern}. Apply 3-4 drops of these cold-pressed formulations morning and evening to restore elasticity and natural glow.`;
  }

  return { reply, recommendedProductIds };
}

// API routes FIRST
app.post("/api/alchemist/chat", async (req, res) => {
  try {
    const { message, history, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY environment variable is not configured; using botanical fallback response.");
      return res.json(getFallbackChatResponse(message, language));
    }

    const ai = getAIClient();

    const contents = [
      ...(history || []).map((h: any) => ({
        role: h.role,
        parts: (h.parts || []).map((p: any) => ({ text: p }))
      })),
      {
        role: 'user',
        parts: [{ text: `${message}\n\nPlease reply in the user's preferred language (${language || 'en'}).` }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents as any,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "The main therapeutic advice, answers, and reasons for recommending these oils. Styled with conversational beauty (in preferred language)."
            },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of matching product IDs from: '1' to '19' corresponding to the recommended products."
            }
          },
          required: ["reply", "recommendedProductIds"]
        }
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json({
      reply: parsedJson.reply || "I am reflecting on your skin's botanical needs. Please try again.",
      recommendedProductIds: parsedJson.recommendedProductIds || []
    });
  } catch (error: any) {
    console.error("Alchemist API Error:", error);
    res.json(getFallbackChatResponse(req.body.message, req.body.language));
  }
});

app.post("/api/alchemist/diagnose", async (req, res) => {
  try {
    const { answers, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY environment variable is not configured; using botanical fallback response.");
      return res.json(getFallbackDiagnoseResponse(answers, language));
    }

    const diagnosisPrompt = `Provide a full botanical ritual.
Profile:
- Skin Type: ${answers.skinType}
- Main Concern: ${answers.primaryConcern}
- Hair Goals: ${answers.hairGoals || 'None'}
- Sensitivity Level: ${answers.sensitivity}`;

    const ai = getAIClient();
    const contents = [
      {
        role: 'user',
        parts: [{ text: `${diagnosisPrompt}\n\nPlease reply in the user's preferred language (${language || 'en'}).` }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents as any,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "The main therapeutic advice, answers, and reasons for recommending these oils. Styled with conversational beauty (in preferred language)."
            },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of matching product IDs from: '1' to '19' corresponding to the recommended products."
            }
          },
          required: ["reply", "recommendedProductIds"]
        }
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json({
      reply: parsedJson.reply || "I am reflecting on your skin's botanical needs. Please try again.",
      recommendedProductIds: parsedJson.recommendedProductIds || []
    });
  } catch (error: any) {
    console.error("Diagnosis API Error:", error);
    res.json(getFallbackDiagnoseResponse(req.body.answers, req.body.language));
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // SPA fallback route for dev mode (serves index.html for client routes like /collection, /about, etc.)
    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
