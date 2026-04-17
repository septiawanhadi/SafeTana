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
    return {
      generate: (input) => {
        const text = input.toLowerCase();
        
        if (text.includes('sakit') || text.includes('pusing') || text.includes('demam')) {
           return "NullClaw Analysis: Gejala fisik terdeteksi. Rekomendasi: Istirahat & Hidrasi. Jika memburuk (>38°C), segera hubungi pos kesehatan terdekat. [Local Execution]";
        }
        
        if (text.includes('sedih') || text.includes('trauma') || text.includes('takut')) {
           return "NullClaw Analysis: Kondisi emosional terdeteksi. Teknik Relaksasi: Tarik nafas 4 detik, tahan 4 detik, buang 4 detik. Anda tidak sendirian. [Local Execution]";
        }

        return "NullClaw: Pesan diterima. Saya memproses informasi kesehatan Anda secara lokal untuk keamanan maksimal. Ada keluhan spesifik? [Local Execution]";
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
