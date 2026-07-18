import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, any>;
}) => Response | Promise<Response>;

interface Env {
  GEMINI_API_KEY?: string;
  AWS_S3_REGION?: string;
  AWS_S3_ENDPOINT?: string;
  AWS_S3_ACCESS_KEY_ID?: string;
  AWS_S3_SECRET_ACCESS_KEY?: string;
  AWS_S3_BUCKET?: string;
  VITE_SUPABASE_URL?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Route: /api/health
  if (url.pathname === "/api/health") {
    return new Response(JSON.stringify({ status: "ok", runtime: "cloudflare-edge" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Route: /api/upload
  if (url.pathname === "/api/upload") {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const { base64Data, fileName, mimeType } = await request.json() as any;
      if (!base64Data || !fileName) {
        return new Response(JSON.stringify({ error: "Missing required fields: base64Data or fileName" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const s3Region = env.AWS_S3_REGION || "ap-south-1";
      const s3Endpoint = env.AWS_S3_ENDPOINT;
      const s3AccessKeyId = env.AWS_S3_ACCESS_KEY_ID;
      const s3SecretAccessKey = env.AWS_S3_SECRET_ACCESS_KEY;
      const s3Bucket = env.AWS_S3_BUCKET || "vida";

      if (!s3Endpoint || !s3AccessKeyId || !s3SecretAccessKey) {
        // Fallback: return base64 back on the client if S3 is not configured
        return new Response(JSON.stringify({ publicUrl: base64Data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Convert base64 string to Buffer / ArrayBuffer for S3 upload
      const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, "");
      const binaryString = atob(base64Clean);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const s3Client = new S3Client({
        region: s3Region,
        endpoint: s3Endpoint,
        credentials: {
          accessKeyId: s3AccessKeyId,
          secretAccessKey: s3SecretAccessKey,
        },
        forcePathStyle: true,
      });

      const uploadPath = fileName.startsWith("images/") ? fileName : `images/${fileName}`;
      const command = new PutObjectCommand({
        Bucket: s3Bucket,
        Key: uploadPath,
        Body: bytes,
        ContentType: mimeType || "image/jpeg",
      });

      await s3Client.send(command);

      const supabaseUrl = (env.VITE_SUPABASE_URL || "https://jyjtixllqqukiquxdpve.supabase.co").replace(/\/$/, "");
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${s3Bucket}/${uploadPath}`;

      return new Response(JSON.stringify({ publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || "Failed to upload image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Route: /api/alchemist/chat
  if (url.pathname === "/api/alchemist/chat") {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const { message, history, language } = await request.json() as any;
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY environment variable is required" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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

      // Direct REST API Call to Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "aistudio-build-cloudflare"
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTIONS }]
          },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                reply: {
                  type: "STRING",
                  description: "The main therapeutic advice, answers, and reasons for recommending these oils. Styled with conversational beauty (in preferred language)."
                },
                recommendedProductIds: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Array of matching product IDs from: '1' to '19' corresponding to the recommended products."
                }
              },
              required: ["reply", "recommendedProductIds"]
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
      }

      const rawData = await response.json() as any;
      const responseText = rawData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsedJson = JSON.parse(responseText);

      return new Response(JSON.stringify({
        reply: parsedJson.reply || "I am reflecting on your skin's botanical needs. Please try again.",
        recommendedProductIds: parsedJson.recommendedProductIds || []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({
        reply: "The Alchemist is currently preparing botanical tinctures. Please try again in a moment.",
        recommendedProductIds: [],
        error: err.message
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Route: /api/alchemist/diagnose
  if (url.pathname === "/api/alchemist/diagnose") {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const { answers, language } = await request.json() as any;
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY environment variable is required" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const diagnosisPrompt = `Provide a full botanical ritual.
Profile:
- Skin Type: ${answers.skinType}
- Main Concern: ${answers.primaryConcern}
- Hair Goals: ${answers.hairGoals || 'None'}
- Sensitivity Level: ${answers.sensitivity}`;

      const contents = [
        {
          role: 'user',
          parts: [{ text: `${diagnosisPrompt}\n\nPlease reply in the user's preferred language (${language || 'en'}).` }]
        }
      ];

      // Direct REST API Call to Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "aistudio-build-cloudflare"
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTIONS }]
          },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                reply: {
                  type: "STRING",
                  description: "The main therapeutic advice, answers, and reasons for recommending these oils. Styled with conversational beauty (in preferred language)."
                },
                recommendedProductIds: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Array of matching product IDs from: '1' to '19' corresponding to the recommended products."
                }
              },
              required: ["reply", "recommendedProductIds"]
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
      }

      const rawData = await response.json() as any;
      const responseText = rawData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsedJson = JSON.parse(responseText);

      return new Response(JSON.stringify({
        reply: parsedJson.reply || "I am reflecting on your skin's botanical needs. Please try again.",
        recommendedProductIds: parsedJson.recommendedProductIds || []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({
        reply: "The Alchemist is currently preparing botanical tinctures. Please try again in a moment.",
        recommendedProductIds: [],
        error: err.message
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};
