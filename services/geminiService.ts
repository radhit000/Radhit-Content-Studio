import { GoogleGenAI } from "@google/genai";
import { settingsService } from "./settingsService";
import { AppSettings } from "../types";

const getApiKey = (customApiKey?: string, settings?: AppSettings) => {
  // Use centralized logic to resolve key (User -> Settings -> Env)
  let apiKey = settingsService.getEffectiveApiKey(customApiKey, settings);
  
  if (!apiKey || apiKey.length < 10) {
    throw new Error(
      "API Key belum diatur. Silakan masukkan API Key di menu Pengaturan."
    );
  }
  
  return apiKey.trim();
};

// Helper: Check if using OpenRouter
const isOpenRouterKey = (key: string) => key.startsWith('sk-or-');

/**
 * Handle OpenRouter API Call (Standard OpenAI Format)
 */
const callOpenRouter = async (
  apiKey: string,
  messages: any[],
  isGeneration: boolean
): Promise<string> => {
  
  const model = "google/gemini-3.1-flash-image-preview";
  const cleanKey = apiKey.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cleanKey}`,
        "HTTP-Referer": "https://studio-ai-pro.vercel.app", // Optional
        "X-Title": "Studio AI Pro", // Optional
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1000,
        ...(isGeneration ? { modalities: ["image", "text"] } : {})
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const providerMsg = err.error?.message || "";
        
        if (providerMsg.toLowerCase().includes("credit") || response.status === 402) {
            throw new Error("Saldo OpenRouter tidak mencukupi. Fitur gambar memerlukan saldo berbayar. Solusi: Isi saldo di openrouter.ai/settings/credits ATAU hapus API Key OpenRouter di menu Pengaturan untuk menggunakan AI bawaan aplikasi secara gratis.");
        }

        if (response.status === 401 || response.status === 403) {
             console.error("OpenRouter Auth Error. Key used (masked):", cleanKey.substring(0, 10) + "...");
             throw new Error(`Akses OpenRouter Ditolak: ${providerMsg || "User invalid"}. Periksa API Key Anda.`);
        }
        
        throw new Error(providerMsg || `OpenRouter Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const content = message?.content || "";

    console.log("OpenRouter Response Content:", content);

    // 0. Check for official OpenRouter image response format
    if (message?.images && message.images.length > 0) {
        const img = message.images[0];
        if (img.image_url && img.image_url.url) {
            const url = img.image_url.url;
            if (url.startsWith('data:image')) {
                return url; // Return base64 directly
            }
            return await downloadAndConvert(url);
        }
    }

    // 0. Try to parse as JSON first (some models return JSON with url or b64_json)
    try {
        const parsed = JSON.parse(content);
        if (parsed.url) return await downloadAndConvert(parsed.url);
        if (parsed.b64_json) return parsed.b64_json;
        if (parsed.data && parsed.data[0]) {
            if (parsed.data[0].url) return await downloadAndConvert(parsed.data[0].url);
            if (parsed.data[0].b64_json) return parsed.data[0].b64_json;
        }
    } catch (e) {
        // Not JSON, continue
    }

    // 0.5 Try to find data URI (base64)
    const dataUriMatch = content.match(/data:image\/[a-zA-Z]*;base64,([^"'\s]+)/);
    if (dataUriMatch && dataUriMatch[1]) {
        return dataUriMatch[1];
    }

    // 1. Try to find Markdown Image: ![alt](url)
    const markdownMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    if (markdownMatch && markdownMatch[1]) {
        return await downloadAndConvert(markdownMatch[1]);
    }

    // 2. Try to find Markdown Link: [text](url)
    const linkMatch = content.match(/\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    if (linkMatch && linkMatch[1]) {
        return await downloadAndConvert(linkMatch[1]);
    }

    // 3. Try to find any URL (http...)
    const urlMatch = content.match(/(https?:\/\/[^\s)]+)/i);
    if (urlMatch && urlMatch[1]) {
        return await downloadAndConvert(urlMatch[1]);
    }

    // 4. Fallback: Maybe it's a raw base64 string
    if ((content.startsWith("iVBORw0KGgo") || content.startsWith("/9j/")) && !content.includes(" ")) {
        return content.trim();
    }

    throw new Error(`OpenRouter merespon tapi tidak ada gambar. Output: ${content.substring(0, 150)}...`);

  } catch (error: any) {
    console.error("OpenRouter Error:", error);
    if (error.name === 'AbortError') {
        throw new Error("Waktu permintaan habis (Timeout 60s). Silakan coba lagi.");
    }
    throw new Error(error.message || "Gagal menghubungi OpenRouter.");
  }
};

const downloadAndConvert = async (url: string): Promise<string> => {
    try {
        const imgRes = await fetch(url);
        const blob = await imgRes.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                // Remove data:image/...;base64, prefix
                resolve(res.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        throw new Error("Gagal mengunduh gambar dari OpenRouter.");
    }
}

/**
 * Helper function to map aspect ratios
 */
const getValidApiAspectRatio = (ratio: string): string | undefined => {
  const validRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  if (validRatios.includes(ratio)) return ratio;
  switch (ratio) {
    case '2x3': case '3x4': case '4x6': case '4R': case '5R': case '10R': return '3:4';
    default: return undefined;
  }
};

/**
 * Main Edit Function (Router)
 */
export const editImageWithGemini = async (
  base64Image: string | null,
  mimeType: string,
  prompt: string,
  systemInstruction?: string,
  aspectRatio: string = '1:1',
  userApiKey?: string,
  settings?: AppSettings
): Promise<string> => {
  const apiKey = getApiKey(userApiKey, settings);
  
  // --- ROUTE 1: OPENROUTER ---
  if (isOpenRouterKey(apiKey)) {
    const isGeneration = !base64Image; // Text-to-Image
    
    const messages = [];
    
    // System instruction often ignored by Flux, but we add it to user prompt for context
    const enhancedPrompt = systemInstruction 
        ? `${systemInstruction}\n\nTask: ${prompt} \n\nAspectRatio: ${aspectRatio}` 
        : `${prompt} \n\nAspectRatio: ${aspectRatio}`;

    // User content
    const userContent: any[] = [{ type: "text", text: enhancedPrompt }];
    
    if (base64Image) {
        userContent.push({
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64Image}` }
        });
    }

    messages.push({ role: "user", content: userContent });

    try {
      return await callOpenRouter(apiKey, messages, isGeneration);
    } catch (error: any) {
      console.warn("[GeminiService] OpenRouter failed:", error.message);
      
      // Attempt fallback to Google Gemini SDK
      const googleKey = settingsService.getGoogleApiKey(userApiKey, settings);
      
      if (googleKey && googleKey.length > 10) {
         console.log("[GeminiService] Fallback to Google Gemini SDK triggered.");
         // We don't return here, so it falls through to the Google SDK logic below
      } else {
         // No fallback possible, throw a more helpful error
         const isAuthError = error.message.includes("User not found") || 
                            error.message.includes("Ditolak") || 
                            error.message.includes("401") || 
                            error.message.includes("403");
                            
         if (isAuthError) {
            throw new Error(`Koneksi AI Gagal: API Key OpenRouter Anda tidak valid atau akun tidak ditemukan. Silakan periksa saldo OpenRouter atau hapus API Key di menu Pengaturan untuk menggunakan AI bawaan secara gratis.`);
         }
         throw error;
      }
    }
  }

  // --- ROUTE 2: GOOGLE GENAI SDK (Default or Fallback) ---
  const googleApiKey = settingsService.getGoogleApiKey(userApiKey, settings);
  
  // Final safety check: if no key at all, try to use whatever is in env
  const envGeminiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
  const finalKey = googleApiKey || envGeminiKey || '';
  
  if (!finalKey || finalKey.length < 10) {
    throw new Error("API Key tidak ditemukan. Silakan masukkan API Key di menu Pengaturan.");
  }

  const ai = new GoogleGenAI({ apiKey: finalKey });
  const model = 'gemini-2.5-flash-image';
  const apiAspectRatio = getValidApiAspectRatio(aspectRatio);

  try {
    const fullPrompt = `
      [STRICT SYSTEM INSTRUCTION: FACE DNA PRESERVATION]
      You are a World-Class High-Accuracy Photo Editor and Studio Artist. 
      CRITICAL: You MUST preserve the subject's original facial features, bone structure, and unique identity 100% accurately. 
      DO NOT alter the face in any way. 
      Focus exclusively on modifying the background, clothing, and surrounding elements as requested.
      Ensure the final output looks like a real, high-end studio photograph with perfect 3-point lighting, cinematic depth of field, and ultra-sharp 8K-level detail.
      Maintain natural skin textures and realistic shadows.

      [CONTEXT]
      ${systemInstruction || "Professional Studio Analysis."}
      
      [USER REQUEST]
      "${prompt}"
      
      [OUTPUT CONFIGURATION]
      - Return ONLY the processed image.
      - Resolution: 1K (High Detail).
      - User Requested Dimensions/Ratio: ${aspectRatio}.
      - STRICTLY FOLLOW THIS RATIO.
    `.trim();

    const parts: any[] = [{ text: fullPrompt }];
    if (base64Image) {
      parts.unshift({
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: { 
        imageConfig: { 
          aspectRatio: apiAspectRatio,
          imageSize: "1K"
        } 
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    throw new Error("No image data returned from Gemini.");
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429) {
       throw new Error("Kuota Google API Habis (Limit Tercapai). Silakan coba lagi nanti atau gunakan API Key pribadi.");
    }
    throw new Error(error.message || "Failed to process image with Google SDK.");
  }
};

/**
 * Main Composite Function (Router)
 */
export const generateCompositeImage = async (
  images: { base64: string; mimeType: string }[],
  prompt: string,
  aspectRatio: string = '1:1',
  systemInstruction?: string,
  userApiKey?: string,
  settings?: AppSettings
): Promise<string> => {
  const apiKey = getApiKey(userApiKey, settings);

  // --- ROUTE 1: OPENROUTER ---
  if (isOpenRouterKey(apiKey)) {
     const messages = [];
     
     const enhancedPrompt = systemInstruction 
        ? `${systemInstruction}\n\nTask: ${prompt} \n\nAspectRatio: ${aspectRatio}` 
        : `${prompt} \n\nAspectRatio: ${aspectRatio}`;

     const userContent: any[] = [{ type: "text", text: enhancedPrompt }];
     images.forEach(img => {
        userContent.push({
            type: "image_url",
            image_url: { url: `data:${img.mimeType};base64,${img.base64}` }
        });
     });
     messages.push({ role: "user", content: userContent });

     try {
       return await callOpenRouter(apiKey, messages, false); 
     } catch (error: any) {
       console.warn("[GeminiService] OpenRouter Composite failed:", error.message);
       
       // Attempt fallback to Google Gemini SDK
       const googleKey = settingsService.getGoogleApiKey(userApiKey, settings);
       
       if (googleKey && googleKey.length > 10) {
          console.log("[GeminiService] Fallback to Google Gemini SDK triggered.");
          // Falls through to Google SDK logic below
       } else {
          // No fallback possible, throw a more helpful error
          const isAuthError = error.message.includes("User not found") || 
                             error.message.includes("Ditolak") || 
                             error.message.includes("401") || 
                             error.message.includes("403");

          if (isAuthError) {
             throw new Error(`Koneksi AI Gagal: API Key OpenRouter Anda tidak valid atau akun tidak ditemukan. Silakan periksa saldo OpenRouter atau hapus API Key di menu Pengaturan untuk menggunakan AI bawaan secara gratis.`);
          }
          throw error;
       }
     }
  }

  // --- ROUTE 2: GOOGLE GENAI SDK (Default or Fallback) ---
  const googleApiKey = settingsService.getGoogleApiKey(userApiKey, settings);
  
  // Final safety check
  const envGeminiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
  const finalKey = googleApiKey || envGeminiKey || '';
  
  if (!finalKey || finalKey.length < 10) {
    throw new Error("API Key tidak ditemukan. Silakan masukkan API Key di menu Pengaturan.");
  }

  const ai = new GoogleGenAI({ apiKey: finalKey });
  const model = 'gemini-2.5-flash-image';
  const apiAspectRatio = getValidApiAspectRatio(aspectRatio);

  try {
    const imageParts = images.map(img => ({
      inlineData: { mimeType: img.mimeType, data: img.base64 }
    }));

    const fullPrompt = `
      [STRICT SYSTEM INSTRUCTION: FACE DNA PRESERVATION]
      You are a World-Class High-Accuracy Photo Editor and Studio Artist. 
      CRITICAL: You MUST preserve the subject's original facial features, bone structure, and unique identity 100% accurately. 
      DO NOT alter the face in any way. 
      Focus exclusively on modifying the background, clothing, and surrounding elements as requested.
      Ensure the final output looks like a real, high-end studio photograph with perfect 3-point lighting, cinematic depth of field, and ultra-sharp 8K-level detail.
      Maintain natural skin textures and realistic shadows.

      [CONTEXT]
      ${systemInstruction || "Create composite."}
      
      [USER REQUEST] 
      "${prompt}"
      
      [REQUIREMENTS] 
      Combine images accurately. 
      Resolution: 1K.
      Ratio: ${aspectRatio}.
    `.trim();

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [...imageParts, { text: fullPrompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: apiAspectRatio === 'auto' ? undefined : apiAspectRatio,
          imageSize: "1K"
        } 
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    throw new Error("No composite image returned.");
  } catch (error: any) {
    console.error("Gemini Composite Error:", error);
    if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429) {
       throw new Error("Kuota Google API Habis (Limit Tercapai). Silakan coba lagi nanti atau gunakan API Key pribadi.");
    }
    throw new Error(error.message || "Failed to create composite.");
  }
};
