import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_API_KEY = import.meta.env.GROQ_API_KEY; // Note: Groq usually doesn't have VITE_ prefix in .env but check if it's available
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Service to handle disaster-related AI interactions with multi-provider fallback
 */
export const disasterAiService = {
  /**
   * Get a response from the disaster assistant
   */
  async getAssistantResponse(userInput, userLocation) {
    const prompt = `Anda adalah SafeTana AI, asisten tanggap bencana. 
    Koordinat pengguna: ${userLocation || 'Tidak diketahui'}. 
    Konteks: Protokol darurat dan keselamatan regional. 
    Jawab dengan ringkas menggunakan bahasa Indonesia. 
    Pertanyaan: ${userInput}`;

    // 1. Try Gemini
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().replace(/[#*`]/g, '');
    } catch (geminiError) {
      console.warn("disasterAiService: Gemini failed, trying Groq...", geminiError);
      
      // 2. Try Groq Fallback
      if (GROQ_API_KEY) {
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: prompt }]
            })
          });
          const data = await response.json();
          return data.choices[0].message.content.replace(/[#*`]/g, '');
        } catch (groqError) {
          console.warn("disasterAiService: Groq also failed, trying OpenAI...", groqError);
        }
      }

      // 3. Try OpenAI Fallback
      if (OPENAI_API_KEY) {
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: prompt }]
            })
          });
          const data = await response.json();
          return data.choices[0].message.content.replace(/[#*`]/g, '');
        } catch (openaiError) {
          console.error("disasterAiService: All AI providers failed.", openaiError);
        }
      }

      throw new Error("Seluruh layanan AI SafeTana sedang tidak tersedia.");
    }
  }
};
