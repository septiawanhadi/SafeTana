/**
 * Service to interact with BPJS VClaim via backend proxy
 */
export const bpjsService = {
  /**
   * Check membership status by NIK
   * @param {string} nik - National Identity Number
   */
  async getStatusByNIK(nik) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/health/bpjs?path=Peserta/nik/${nik}/tglRencanaKontrol/${today}`);
      
      if (!response.ok) {
        throw new Error('Gagal terhubung ke layanan BPJS');
      }

      const data = await response.json();
      
      if (data.metaData && data.metaData.code === "200") {
        const peserta = data.response.peserta;
        return {
          status: 'success',
          active: peserta.statusPeserta.keterangan === 'AKTIF',
          label: peserta.statusPeserta.keterangan,
          data: peserta
        };
      } else {
        return {
          status: 'error',
          message: data.metaData ? data.metaData.message : 'Data tidak ditemukan'
        };
      }
    } catch (error) {
      console.error("bpjsService.getStatusByNIK error:", error);
      throw error;
    }
  },

  /**
   * Check connection status
   */
  async checkConnection() {
    try {
      // We don't have a specific "ping" endpoint, so we just check if config exists
      const response = await fetch(`/api/health/bpjs?path=referensi/poli/ANA`);
      const data = await response.json();
      
      if (data.error === 'BPJS Configuration missing') {
        return { status: 'unconfigured' };
      }
      
      return { status: 'ready' };
    } catch {
      return { status: 'error' };
    }
  }
};
