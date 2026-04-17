/**
 * NullClawBridge.js
 * 
 * Micro-infrastructure for running Null Claw AI Agents via WebAssembly
 * or a High-Performance Local Fallback.
 */

export const NullClawBridge = {
  _instance: null,
  _isLoaded: false,
  _isWasm: false,

  /**
   * Initialize the Null Claw environment.
   * Attempts to load a .wasm module if provided, otherwise uses the Local Agent core.
   */
  async init(wasmUrl = '/agents/nullclaw_agent.wasm') {
    if (this._isLoaded) return true;

    try {
      // Attempt to load Wasm if available
      if (wasmUrl) {
          const response = await fetch(wasmUrl);
          if (response.ok) {
              const bytes = await response.arrayBuffer();
              const { instance } = await WebAssembly.instantiate(bytes);
              this._instance = instance.exports;
              this._isWasm = true;
              console.log("🚀 Null Claw: Wasm Engine initialized.");
          }
      }
    } catch (e) {
      console.warn("⚠️ Null Claw: Wasm failed to load, falling back to Local Agent Core.", e);
    }

    // High-Performance Local Agent Core (Minimalist Prompt Logic)
    if (!this._isWasm) {
      this._instance = this._createLocalAgentCore();
    }

    this._isLoaded = true;
    return true;
  },

  /**
   * Process a prompt through the Null Claw Agent
   */
  async process(input) {
    if (!this._isLoaded) await this.init();

    // If it's real Wasm, call the export
    if (this._isWasm && this._instance.process_input) {
        return this._instance.process_input(input);
    }

    // Otherwise use Local Agent logic
    return this._instance.generate(input);
  },

  /**
   * Internal: Lightweight Agent Logic (Emulates Null Claw Philosophy)
   * Focuses on Speed, Triage, and Privacy.
   */
  _createLocalAgentCore() {
    // Knowledge Base Terintegrasi (Kamus Ringkas)
    const knowledgeBase = {
      symptom_map: {
        'demam': 'Gunakan kompres hangat dan pantau suhu tubuh. Minum banyak cairan.',
        'pusing': 'Berbaringlah di ruangan yang tenang dan gelap. Hindari layar gadget.',
        'luka': 'Bersihkan dengan air bersih/saline. Gunakan antiseptik jika tersedia.',
        'diare': 'Gunakan oralit untuk mencegah dehidrasi. Hindari makanan pedas.',
        'sesak': 'Posisikan diri dalam keadaan duduk tegak. Segera cari bantuan jika memberat.',
        'cemas': 'Lakukan teknik grounding 5-4-3-2-1: cari 5 benda yang bisa dilihat, 4 yang bisa diraba...',
        'patah': 'Stabilkan bagian yang patah menggunakan bidai darurat. Jangan mencoba meluruskan sendiri.'
      },
      triage_questions: [
        "Sudah berapa lama gejala ini Anda rasakan?",
        "Apakah ada riwayat alergi obat?",
        "Apakah Anda sedang berada di lokasi yang aman dan kering?",
        "Apakah ada keluarga atau petugas di sekitar Anda?"
      ]
    };

    return {
      generate: (input) => {
        const text = input.toLowerCase();
        let identifiedSymptoms = [];
        let response = "";

        // Detect multiple symptoms
        Object.keys(knowledgeBase.symptom_map).forEach(key => {
          if (text.includes(key)) identifiedSymptoms.push(key);
        });

        if (identifiedSymptoms.length > 0) {
          const mainSymptom = identifiedSymptoms[0];
          const advice = knowledgeBase.symptom_map[mainSymptom];
          const question = knowledgeBase.triage_questions[Math.floor(Math.random() * knowledgeBase.triage_questions.length)];
          
          response = `NullClaw Analysis: Saya mendeteksi keluhan "${identifiedSymptoms.join(' & ')}". \n\nInstruksi Darurat: ${advice} \n\nPertanyaan Triage: ${question} \n\n[Local Agent: Active | Privacy: Max]`;
        } else if (text.length < 5) {
          response = "NullClaw: Pesan terlalu pendek. Bisa ceritakan lebih detil kondisi Anda? [Local Agent]";
        } else {
          response = "NullClaw: Saya mencatat pesan Anda. Secara umum, pastikan Anda mendapatkan air minum yang cukup dan beristirahat. Ceritakan jika ada gejala spesifik seperti demam atau nyeri hebat agar saya bisa memberikan panduan lebih detail. [Local Agent]";
        }

        return response;
      }
    };
  },

  getStatus() {
    return {
      isLoaded: this._isLoaded,
      engine: this._isWasm ? 'Zig-Wasm' : 'Local-Core (JS)',
      privacy: 'Maximum (Local Processing)'
    };
  }
};
