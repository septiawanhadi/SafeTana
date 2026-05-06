import { GoogleGenerativeAI } from "@google/generative-ai";
import { NullClawBridge } from "./NullClawBridge";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_API_KEY = import.meta.env.GROQ_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Helper to call AI with multi-provider fallback
 */
async function callAiWithFallback(prompt, systemInstruction = "", history = null) {
  // 1. Try Gemini
  try {
    const model = genAI.getGenerativeModel({ 
      model: history ? "gemini-1.5-flash" : "gemini-2.0-flash",
      systemInstruction: systemInstruction 
    });

    let result;
    if (history) {
      const chat = model.startChat({
        history: history,
        generationConfig: { maxOutputTokens: 800 },
      });
      result = await chat.sendMessage(prompt);
    } else {
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    return response.text().replace(/[#*`]/g, '');
  } catch (geminiError) {
    console.warn("aiService: Gemini failed, trying Groq...", geminiError);

    const messages = [];
    if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
    if (history) {
      history.forEach(h => {
        messages.push({ role: h.role === "user" ? "user" : "assistant", content: h.parts[0].text });
      });
    }
    messages.push({ role: "user", content: prompt });

    // 2. Try Groq
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
            messages: messages
          })
        });
        const data = await response.json();
        return data.choices[0].message.content.replace(/[#*`]/g, '');
      } catch (groqError) {
        console.warn("aiService: Groq failed, trying OpenAI...", groqError);
      }
    }

    // 3. Try OpenAI
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
            messages: messages
          })
        });
        const data = await response.json();
        return data.choices[0].message.content.replace(/[#*`]/g, '');
      } catch (openaiError) {
        console.error("aiService: All AI providers failed.", openaiError);
      }
    }

    throw new Error("Seluruh layanan AI SafeTana sedang tidak tersedia.");
  }
}

/**
 * Service for handling all SafeTana AI interactions
 */
export const aiService = {
  /**
   * Get a chat response for the Health Clinic
   */
  async getHealthChatResponse(history, userInput, useLocalAgent = false, userContext = {}) {
    if (useLocalAgent) {
      return await NullClawBridge.process(userInput);
    }

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
      
      [INTEGRASI SATUSEHAT FASYANKES]
      Lokasi Pengguna Saat Ini: ${userContext.locationText || 'Tidak diketahui'}.
      Jika pengguna mencari atau menanyakan lokasi fasilitas kesehatan (Rumah Sakit, Klinik, Puskesmas, atau Praktik Mandiri) dan meminta Anda mencarikannya, Anda WAJIB bertindak sebagai Agen Pencari dan membalas HANYA dengan format perintah rahasia berikut (tanpa teks lain):
      [SEARCH_FASYANKES: {"jenis_sarana": "104", "nama": "kata kunci nama faskes"}]
      Kode jenis_sarana: 104=Rumah Sakit, 103=Klinik, 102=Puskesmas, 101=Praktik Mandiri. Jika tidak spesifik, gunakan "104". 
      Aplikasi akan mengeksekusi pencarian berdasarkan perintah tersebut.
    `;

    return await callAiWithFallback(userInput, systemPrompt, history);
  },

  /**
   * Analyze 30-day mood logs and journal entries
   */
  async analyzeMoodLogs(moodLogs) {
    if (!moodLogs || moodLogs.length === 0) return null;

    const logsSummary = moodLogs.slice(0, 30).map(log => {
      const date = log.timestamp ? log.timestamp.toDate().toLocaleDateString() : 'Baru saja';
      return `[${date}] Mood: ${log.moodLabel}. Catatan: ${log.note || 'Tanpa catatan'}`;
    }).join('\n');
    
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

    return await callAiWithFallback(prompt);
  },

  /**
   * Fetch medical information for the Health Dictionary
   */
  async getDictionaryInfo(query, category = 'Medis') {
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

    return await callAiWithFallback(prompt);
  }
};
