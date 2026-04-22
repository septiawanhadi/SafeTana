import { GoogleGenerativeAI } from "@google/generative-ai";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
    
    if (action === 'subscribe') {
        const payload = {
            fields: {
                chat_id: { integerValue: chatId },
                username: { stringValue: username || 'Unknown' },
                registered_at: { timestampValue: new Date().toISOString() }
            }
        };
        await fetch(firestoreUrl, {
            method: 'PATCH', // PATCH with updateMask creates or updates
            body: JSON.stringify(payload)
        });
    } else {
        await fetch(firestoreUrl, { method: 'DELETE' });
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
        console.log("Non-POST request received. Skipping.");
        return response.status(200).send('OK');
    }

    if (!BOT_TOKEN) console.error("ERROR: TELEGRAM_BOT_TOKEN is missing from Environment Variables!");
    if (!GEMINI_API_KEY) console.error("ERROR: VITE_GEMINI_API_KEY is missing from Environment Variables!");

    const { message } = request.body;
    if (!message || !message.text) {
        console.log("No message text found in body:", JSON.stringify(request.body));
        return response.status(200).send('OK');
    }

    const chatId = message.chat.id;
    const text = message.text.toLowerCase().trim();
    const username = message.chat.first_name;
    
    console.log(`From: ${username} (${chatId}) | Text: ${text}`);

    try {
        if (text === '/start' || text === '/subscribe') {
            console.log("Handling /start or /subscribe");
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
                // Using the most stable model name for free tier
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-1.5-flash",
                    systemInstruction: `
                        Anda adalah "SafeTana AI", asisten kesehatan dan konseling mental spesialis pasca bencana.
                        Karakter: Empatik, Tenang, Medis, dan Mendalam.
                        Tugas Utama:
                        1. Memberikan dukungan emosional (Pertolongan Pertama Psikologis / PFA) bagi korban bencana.
                        2. Melakukan triase medis dasar dan memberikan penjelasan kesehatan yang mudah dipahami.
                        3. Memberikan saran pemulihan pasca bencana (manajemen stres, trauma).
                        4. Jika ada gejala gawat (sesak napas, nyeri dada, trauma berat), instruksikan segera ke RS atau tekan tombol SOS.
                        5. Selalu ingatkan bahwa Anda adalah AI, bukan pengganti dokter profesional.
                        6. Gunakan Bahasa Indonesia yang ramah, hangat, dan profesional.
                    `
                });
                
                const result = await model.generateContent(message.text);
                const aiResponse = result.response.text().replace(/[#*`]/g, ''); 
                await sendTelegramMessage(chatId, aiResponse);
            } catch (aiError) {
                console.error("AI Generation Error:", aiError);
                await sendTelegramMessage(chatId, "Maaf, 'otak' AI saya sedang beristirahat sejenak karena batas kuota gratis telah tercapai. Silakan coba lagi dalam beberapa menit atau tanyakan hal lain.");
            }
        }
    } catch (error) {
        console.error("Webhook Handler Error:", error);
        await sendTelegramMessage(chatId, "Maaf, sistem sedang mengalami gangguan teknis. Mohon coba beberapa saat lagi.");
    }

    return response.status(200).json({ success: true });
}
