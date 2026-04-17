import { GoogleGenerativeAI } from "@google/generative-ai";
import { NullClawBridge } from "./NullClawBridge";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Service for handling all SafeTana AI (Gemini) interactions
 */
export const aiService = {
  /**
   * Get a chat response for the Health Clinic
   */
  async getHealthChatResponse(history, userInput, useLocalAgent = false) {
    if (useLocalAgent) {
      return await NullClawBridge.process(userInput);
    }

    try {
      const systemPrompt = `
        Anda adalah "SafeTana AI", asisten kesehatan dan konseling mental spesialis pasca bencana.
        Karakter: Empatik, Tenang, Medis, dan Mendalam.
        Tugas Utama:
        1. Memberikan dukungan emosional (Pertolongan Pertama Psikologis) bagi korban bencana.
        2. Melakukan triase medis dasar dan penjelasan hasil skrining kesehatan.
        3. Memberikan saran pemulihan pasca bencana (manajemen stres, trauma).
        4. INGATKAN: Anda adalah AI. Jika ada gejala gawat, instruksikan segera ke RS atau tekan SOS.
        5. Gunakan bahasa Indonesia yang ramah, hangat, dan profesional.
        6. Hindari format markdown yang rumit, gunakan poin (-) jika perlu.
      `;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt 
      });

      const chat = model.startChat({
        history: history,
        generationConfig: { maxOutputTokens: 800 },
      });

      const result = await chat.sendMessage(userInput);
      const response = await result.response;
      return response.text().replace(/[#*`]/g, '');
    } catch (error) {
      console.error("aiService.getHealthChatResponse error:", error);
      throw error;
    }
  },

  /**
   * Analyze 30-day mood logs and journal entries
   */
  async analyzeMoodLogs(moodLogs) {
    if (!moodLogs || moodLogs.length === 0) return null;

    try {
      const logsSummary = moodLogs.slice(0, 30).map(log => {
        const date = log.timestamp ? log.timestamp.toDate().toLocaleDateString() : 'Baru saja';
        return `[${date}] Mood: ${log.moodLabel}. Catatan: ${log.note || 'Tanpa catatan'}`;
      }).join('\n');

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `
        Sebagai "SafeTana AI" konselor kesehatan mental pasca bencana, analisis 30 hari riwayat jurnal berikut:
        ${logsSummary}
        
        Berikan jawaban dalam Bahasa Indonesia dengan format:
        1. **Ringkasan Kondisi Psikologis**: (Gambarkan tren emosi mereka secara singkat).
        2. **Insight Pemulihan**: (Apa yang sedang mereka hadapi).
        3. **3 Langkah Tindakan (Action Items)**: (Saran praktis dan empatik).
        
        Gunakan gaya bahasa yang sangat hangat, empatik, dan menguatkan. Hindari istilah medis yang terlalu rumit. 
        Maksimal 250 kata.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().replace(/[#*`]/g, '');
    } catch (error) {
      console.error("aiService.analyzeMoodLogs error:", error);
      throw error;
    }
  },

  /**
   * Fetch medical information for the Health Dictionary
   */
  async getDictionaryInfo(query, category = 'Medis') {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `
        Sebagai "SafeTana AI" asisten medis, berikan penjelasan komprehensif namun ringkas tentang topik ${category} berikut: "${query}".
        
        Gunakan bahasa Indonesia yang profesional dan mudah dipahami.
        Format jawaban dalam Markdown (tanpa tag blok kode keseluruhan):
        
        **Deskripsi Singkat:**
        [Penjelasan apa itu ${query}]

        **Gejala / Tanda-tanda Utama:**
        - [Poin 1]
        - [Poin 2]

        **Penanganan Pertama / Rekomendasi Medis:**
        - [Tindakan 1]
        - [Tindakan 2]

        **Peringatan (Red Flag):**
        [Kapan harus segera ke rumah sakit atau menghubungi dokter]
        
        Batas maksimal 250 kata.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("aiService.getDictionaryInfo error:", error);
      throw error;
    }
  }
};
