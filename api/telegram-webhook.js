import { GoogleGenerativeAI } from "@google/generative-ai";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
    Anda adalah "SafeTana AI", asisten kesehatan dan konseling mental spesialis pasca bencana.
    Karakter: Empatik, Tenang, Medis, dan Mendalam.
    Tugas Utama:
    1. Memberikan dukungan emosional (Pertolongan Pertama Psikologis / PFA) bagi korban bencana.
    2. Melakukan triase medis dasar dan memberikan penjelasan kesehatan yang mudah dipahami.
    3. Memberikan saran pemulihan pasca bencana (manajemen stres, trauma).
    4. Jika ada gejala gawat (sesak napas, nyeri dada, trauma berat), instruksikan segera ke RS atau tekan tombol SOS.
    5. Selalu ingatkan bahwa Anda adalah AI, bukan pengganti dokter profesional.
    6. Gunakan Bahasa Indonesia yang ramah, hangat, dan profesional.
`;

/**
 * Helper to get response from Groq (Backup AI)
 */
async function getGroqResponse(userInput) {
    if (!GROQ_API_KEY) {
        console.error("GROQ_API_KEY is undefined in environment variables!");
        throw new Error("Groq API Key missing");
    }
    
    const url = "https://api.groq.com/openai/v1/chat/completions";
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: SYSTEM_INSTRUCTION },
                    { role: "user", content: userInput }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });
        
        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            console.error("Groq API error response:", JSON.stringify(errorBody));
            throw new Error(`Groq API error: ${res.status}`);
        }
        
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "Maaf, Groq gagal memberikan respon.";
    } catch (e) {
        console.error("Groq Fetch Error:", e);
        throw e;
    }
}

/**
 * Helper to get response from OpenAI (Tier 3 Backup AI)
 */
async function getOpenAIResponse(userInput) {
    if (!OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY is undefined in environment variables!");
        throw new Error("OpenAI API Key missing");
    }
    
    const url = "https://api.openai.com/v1/chat/completions";
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: SYSTEM_INSTRUCTION },
                    { role: "user", content: userInput }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });
        
        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            console.error("OpenAI API error response:", JSON.stringify(errorBody));
            throw new Error(`OpenAI API error: ${res.status}`);
        }
        
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "Maaf, OpenAI gagal memberikan respon.";
    } catch (e) {
        console.error("OpenAI Fetch Error:", e);
        throw e;
    }
}

/**
 * Helper to send a message to Telegram
 */
async function sendTelegramMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: chatId, 
                text: text,
                parse_mode: 'Markdown'
            })
        });
    } catch (error) {
        console.error("Error sending Telegram message:", error);
    }
}

/**
 * Handle Firestore subscription via REST API (avoids service account issues in serverless)
 */
async function manageSubscription(chatId, username, action = 'subscribe') {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/telegram_subscribers/${chatId}`;
    
    try {
        if (action === 'subscribe') {
            const payload = {
                fields: {
                    chat_id: { integerValue: chatId },
                    username: { stringValue: username || 'Unknown' },
                    registered_at: { timestampValue: new Date().toISOString() }
                }
            };
            await fetch(firestoreUrl, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
        } else {
            await fetch(firestoreUrl, { method: 'DELETE' });
        }
    } catch (e) {
        console.error("Firestore Error:", e);
    }
}

/**
 * Fetch latest earthquake from BMKG
 */
async function getLatestQuake() {
    try {
        const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
        const data = await res.json();
        const quake = data.Infogempa.gempa;
        return `*Gempa Bumi Terbaru*\n\n📍 Wilayah: ${quake.Wilayah}\n📏 Magnitudo: ${quake.Magnitude}\n🌊 Kedalaman: ${quake.Kedalaman}\n⏰ Waktu: ${quake.Tanggal} ${quake.Jam}\n⚠️ Potensi: ${quake.Potensi}`;
    } catch (error) {
        return "Gagal mengambil data BMKG saat ini.";
    }
}

export default async function handler(request, response) {
    console.log("--- New Webhook Update ---");
    
    if (request.method !== 'POST') {
        return response.status(200).send('OK');
    }

    const { message } = request.body;
    if (!message || !message.text) {
        return response.status(200).send('OK');
    }

    const chatId = message.chat.id;
    const text = message.text.toLowerCase().trim();
    const username = message.chat.first_name;
    
    console.log(`From: ${username} (${chatId}) | Text: ${text}`);

    try {
        if (text === '/start' || text === '/subscribe') {
            await manageSubscription(chatId, username, 'subscribe');
            await sendTelegramMessage(chatId, `Halo ${username}! 👋 Selamat datang di *SafeTana Bot*. \n\nSaya telah mendaftarkan Anda untuk menerima notifikasi otomatis mengenai:\n- 🔔 Gempa Bumi (Semua Magnitudo)\n- 🔔 Banjir & Bencana Alam Lainnya\n\nKirim pesan apa saja untuk mengobrol dengan asisten AI kami atau gunakan /gempa untuk info terkini.`);
        } 
        else if (text === '/unsubscribe') {
            await manageSubscription(chatId, username, 'unsubscribe');
            await sendTelegramMessage(chatId, "Anda telah berhenti berlangganan notifikasi otomatis. Anda tetap bisa mengobrol dengan saya kapan saja.");
        }
        else if (text === '/gempa') {
            const quakeInfo = await getLatestQuake();
            await sendTelegramMessage(chatId, quakeInfo);
        }
        else {
            try {
                console.log("Checking environment variables...");
                if (!BOT_TOKEN) console.error("BOT_TOKEN is MISSING");
                if (!GEMINI_API_KEY) console.error("GEMINI_API_KEY is MISSING");
                if (!GROQ_API_KEY) console.error("GROQ_API_KEY is MISSING");

                console.log("Attempting Gemini response...");
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-1.5-flash",
                    systemInstruction: SYSTEM_INSTRUCTION
                });
                
                const result = await model.generateContent(message.text);
                const aiResponse = result.response.text().replace(/[#*`]/g, ''); 
                await sendTelegramMessage(chatId, aiResponse);
            } catch (geminiError) {
                console.warn("Gemini failure caught:", geminiError.message);
                console.log("Attempting Groq fallback...");
                try {
                    const groqResponse = await getGroqResponse(message.text);
                    await sendTelegramMessage(chatId, groqResponse.replace(/[#*`]/g, ''));
                } catch (groqError) {
                    console.warn("Groq failure caught:", groqError.message);
                    console.log("Attempting OpenAI fallback...");
                    try {
                        const openAiResponse = await getOpenAIResponse(message.text);
                        await sendTelegramMessage(chatId, openAiResponse.replace(/[#*`]/g, ''));
                    } catch (openAiError) {
                        console.error("CRITICAL FAILURE: All AI services (Gemini, Groq, OpenAI) FAILED.");
                        console.error("Final Error Details:", openAiError.message);
                        await sendTelegramMessage(chatId, "Maaf, seluruh sistem AI kami sedang mencapai batas kuota gratis. Mohon tunggu beberapa menit lagi atau hubungi petugas.");
                    }
                }
            }
        }
    } catch (error) {
        console.error("Webhook Handler General Error:", error);
    }

    return response.status(200).json({ success: true });
}
