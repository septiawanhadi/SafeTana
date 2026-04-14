import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Service to handle disaster-related AI (Gemini) interactions
 */
export const disasterAiService = {
  /**
   * Get a response from the disaster assistant
   * @param {string} userInput 
   * @param {Array|null} userLocation 
   * @returns {Promise<string>}
   */
  async getAssistantResponse(userInput, userLocation) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Anda adalah SafeTana AI, asisten tanggap bencana. 
      Koordinat pengguna: ${userLocation || 'Tidak diketahui'}. 
      Konteks: Protokol darurat dan keselamatan regional. 
      Jawab dengan ringkas menggunakan bahasa Indonesia. 
      Pertanyaan: ${userInput}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().replace(/[#*`]/g, '');
    } catch (error) {
      console.error("disasterAiService error:", error);
      throw error; // Let the component handle the fallback
    }
  }
};
