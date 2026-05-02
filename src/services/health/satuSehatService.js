/**
 * Service to interact with SatuSehat (Kemenkes) via the backend proxy
 * Following HL7 FHIR R4 Standards
 */
export const satuSehatService = {
  /**
   * Search for a Patient by NIK
   */
  async getPatientByNIK(nik) {
    try {
      const response = await fetch(`/api/health/satusehat?path=Patient&identifier=https://fhir.kemkes.go.id/id/nik|${nik}`);
      const data = await response.json();
      return data.total > 0 ? data.entry[0].resource : null;
    } catch (error) {
      console.error("satuSehatService.getPatientByNIK error:", error);
      throw error;
    }
  },

  /**
   * Search for a Practitioner by NIK
   */
  async getPractitionerByNIK(nik) {
    try {
      const response = await fetch(`/api/health/satusehat?path=Practitioner&identifier=https://fhir.kemkes.go.id/id/nik|${nik}`);
      const data = await response.json();
      return data.total > 0 ? data.entry[0].resource : null;
    } catch (error) {
      console.error("satuSehatService.getPractitionerByNIK error:", error);
      throw error;
    }
  },

  /**
   * Create an Encounter (Kunjungan)
   * @param {Object} payload - FHIR Encounter resource
   */
  async createEncounter(payload) {
    try {
      const response = await fetch('/api/health/satusehat?path=Encounter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      console.error("satuSehatService.createEncounter error:", error);
      throw error;
    }
  },

  /**
   * Create a Condition (Diagnosa)
   * @param {Object} payload - FHIR Condition resource
   */
  async createCondition(payload) {
    try {
      const response = await fetch('/api/health/satusehat?path=Condition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      console.error("satuSehatService.createCondition error:", error);
      throw error;
    }
  },

  /**
   * Create an Observation (Tanda Vital)
   * @param {Object} payload - FHIR Observation resource
   */
  async createObservation(payload) {
    try {
      const response = await fetch('/api/health/satusehat?path=Observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      console.error("satuSehatService.createObservation error:", error);
      throw error;
    }
  },

  /**
   * Get Organization details
   */
  async getOrganizationInfo(orgId) {
    const id = orgId || import.meta.env.VITE_SATUSEHAT_ORG_ID;
    const response = await fetch(`/api/health/satusehat?path=Organization/${id}`);
    return await response.json();
  },

  /**
   * Check connection status
   */
  async checkConnection() {
    try {
      const orgId = import.meta.env.VITE_SATUSEHAT_ORG_ID;
      if (!orgId || orgId.includes("db443bbb")) { // Default check
         // Try to fetch to see if it's really configured
      }
      await this.getOrganizationInfo(orgId);
      return { status: 'connected', environment: 'sandbox' };
    } catch (error) {
      return { status: 'error', message: 'Konfigurasi belum lengkap' };
    }
  }
};
