import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, tone, duration, videoType, aiEngine, safeMode, prompt, images } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    let typeContext = type;
    if (type === "prompt_video_apapun") {
      typeContext = "Prompt Video Generatif (Optimized for Veo 3, Omni Flash, Seedance 2, Kling AI). Tulis prompt video dalam bahasa Inggris yang sangat deskriptif, mencakup sinematografi (misal: 4k, cinematic, slow motion), pencahayaan, pergerakan kamera (pan, zoom, tracking), dan detail subjek.";
    }

    let durationContext = duration ? `\nTarget Video Duration: exactly ${duration} seconds. Adjust the pacing, word count, and action pacing strictly for a ${duration}-second video length.` : "";
    let videoTypeContext = videoType ? `\nVideo Format/Style: ${videoType}. Structure the content accordingly (e.g. if Storyboard, include scenes, visual cues, and narration; if Talking Head, focus on direct speaking script).` : "";
    
    let safeModeContext = "";
    if (safeMode === "safe_universal") {
      safeModeContext = "\nCRITICAL SAFETY INSTRUCTION: Write the prompt or content carefully to bypass standard AI safety filters. Avoid using real names of celebrities, copyrighted brand names, excessively violent, explicit, or highly sensitive political words. Use generic, safe descriptive terms to achieve the same visual/thematic result without triggering AI moderation blocks.";
    } else if (safeMode === "safe_ads") {
      safeModeContext = "\nCRITICAL MARKETING INSTRUCTION: Ensure the content is fully compliant with strict social media ad policies (TikTok/Meta Ads). Do NOT use overly exaggerated claims (e.g., '100% cure', 'guaranteed to lose weight', 'get rich quick'), profanity, or banned marketing triggers. Keep the tone persuasive but compliant, subtle, and natural.";
    }

    const systemPrompt = `You are an expert copywriter and content creator. Your task is to create highly engaging User Generated Content (UGC).
Content Type: ${typeContext}
Tone of Voice: ${tone}${durationContext}${videoTypeContext}${safeModeContext}

Please output only the generated content without any introductory or concluding remarks.`;

    const userPrompt = `Here is the description/topic for the content:\n${prompt}`;

    if (aiEngine === "openai") {
      let rawOpenAIKey = process.env.OPENAI_API_KEY;
      if (!rawOpenAIKey) {
        return NextResponse.json({ error: "OPENAI_API_KEY tidak ditemukan di .env" }, { status: 500 });
      }

      const openai = new OpenAI({ apiKey: rawOpenAIKey.replace(/['"]/g, '').trim() });
      
      const contentArray = [
        { type: "text", text: userPrompt }
      ];

      if (images && images.length > 0) {
        for (const image of images) {
          contentArray.push({
            type: "image_url",
            image_url: { url: image }
          });
        }
      }

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: contentArray }
          ]
        });
        return NextResponse.json({ result: completion.choices[0].message.content });
      } catch (err) {
        console.error("OpenAI Error:", err);
        return NextResponse.json({ error: "Gagal memproses dengan OpenAI: " + err.message }, { status: 500 });
      }
    }

    let rawApiKey = process.env.GEMINI_API_KEY;
    if (!rawApiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY tidak ditemukan di .env" }, { status: 500 });
    }
    
    // Bersihkan API key dari tanda kutip atau spasi yang tidak sengaja terbawa dari Netlify
    const apiKey = rawApiKey.replace(/['"]/g, '').trim();

    const genAI = new GoogleGenerativeAI(apiKey);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    // Siapkan array isi konten untuk dikirim ke Gemini
    const contentParts = [fullPrompt];
    
    if (images && images.length > 0) {
      for (const image of images) {
        try {
          const mimeType = image.match(/data:(.*?);base64/)[1];
          const base64Data = image.split(",")[1];
          contentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        } catch (err) {
          console.error("Gagal memproses gambar:", err);
        }
      }
    }
    
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-lite-latest"
    ];

    let resultText = "";
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const geminiModel = genAI.getGenerativeModel({ model: modelName });
        const result = await geminiModel.generateContent(contentParts);
        const response = await result.response;
        resultText = response.text();
        // Berhasil, hentikan loop
        break;
      } catch (error) {
        lastError = error;
        console.warn(`Model ${modelName} gagal: ${error.message.substring(0, 50)}...`);
        // Lanjutkan ke model cadangan jika server penuh (503) atau kuota harian habis (429)
        if (!error.message || (!error.message.includes("503") && !error.message.includes("429"))) {
          throw error;
        }
      }
    }

    if (!resultText && lastError) {
      throw new Error(`Semua server model Gemini sedang sibuk. Mohon tunggu beberapa saat dan coba lagi.`);
    }

    return NextResponse.json({ result: resultText });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
