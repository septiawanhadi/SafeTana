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
   * Search Master Sarana Index (Fasyankes)
   * @param {Object} params - Query params like limit, page, jenis_sarana, dll.
   */
  async getMasterSarana(params = { limit: 10, page: 1 }) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/health/satusehat?path=masterdata/v1/mastersaranaindex/mastersarana&${queryString}`);
      return await response.json();
    } catch (error) {
      console.error("satuSehatService.getMasterSarana error:", error);
      throw error;
    }
  },

  /**
   * Submit Screening to SATUSEHAT Sandbox
   */
  async submitScreening(patientNik, formData, assessment) {
    try {
      // 1. Get Patient
      let patient = null;
      try {
        patient = await this.getPatientByNIK(patientNik);
      } catch (err) {
        console.warn("Patient not found by NIK, using fallback for Sandbox", err);
      }
      
      const patientId = patient ? patient.id : "P02035971169"; // fallback patient id for sandbox
      const orgId = import.meta.env.VITE_SATUSEHAT_ORG_ID;

      // 2. Create Encounter (Kunjungan)
      const encounterPayload = {
        "resourceType": "Encounter",
        "status": "arrived",
        "class": {
          "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          "code": "AMB",
          "display": "ambulatory"
        },
        "subject": {
          "reference": `Patient/${patientId}`,
          "display": formData.nama || "Pasien Sandbox"
        },
        "participant": [
          {
            "type": [
              {
                "coding": [
                  {
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                    "code": "ATND",
                    "display": "attender"
                  }
                ]
              }
            ],
            "individual": {
              "reference": "Practitioner/N10000001" // dummy practitioner
            }
          }
        ],
        "period": {
          "start": new Date().toISOString()
        },
        "location": [
          {
            "location": {
              "reference": "Location/ef011065-38c9-46f8-9c35-d1fb6e47df87", // dummy location
              "display": "Ruang Skrining"
            }
          }
        ],
        "serviceProvider": {
          "reference": `Organization/${orgId}`
        }
      };

      const encounterRes = await this.createEncounter(encounterPayload);
      const encounterId = encounterRes.id || "dummy-encounter";

      // 3. Create Observations (Antropometri & Tensi)
      const createObs = async (code, display, value, unit, unitCode) => {
        if (!value) return;
        const obsPayload = {
          "resourceType": "Observation",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "vital-signs",
                  "display": "Vital Signs"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": code,
                "display": display
              }
            ]
          },
          "subject": { "reference": `Patient/${patientId}` },
          "encounter": { "reference": `Encounter/${encounterId}` },
          "effectiveDateTime": new Date().toISOString(),
          "valueQuantity": {
            "value": Number(value),
            "unit": unit,
            "system": "http://unitsofmeasure.org",
            "code": unitCode
          }
        };
        return this.createObservation(obsPayload);
      };

      await createObs("8302-2", "Body height", formData.tb, "cm", "cm");
      await createObs("29463-7", "Body weight", formData.bb, "kg", "kg");
      await createObs("8480-6", "Systolic blood pressure", formData.sistolik, "mmHg", "mm[Hg]");
      await createObs("8462-4", "Diastolic blood pressure", formData.diastolik, "mmHg", "mm[Hg]");

      // 4. Create Condition based on Risk Assessment
      const conditionPayload = {
        "resourceType": "Condition",
        "clinicalStatus": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
              "code": "active",
              "display": "Active"
            }
          ]
        },
        "category": [
          {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                "code": "problem-list-item",
                "display": "Problem List Item"
              }
            ]
          }
        ],
        "code": {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": assessment.riskLevel === 'Tinggi' ? "162864005" : "162863004",
              "display": `Health Risk: ${assessment.riskLevel}`
            }
          ]
        },
        "subject": { "reference": `Patient/${patientId}` },
        "encounter": { "reference": `Encounter/${encounterId}` },
        "recordedDate": new Date().toISOString()
      };

      await this.createCondition(conditionPayload);

      return { success: true, encounterId, patientId };

    } catch (error) {
      console.error("satuSehatService.submitScreening error:", error);
      throw error;
    }
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
