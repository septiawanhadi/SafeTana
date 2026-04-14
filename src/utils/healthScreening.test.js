import { describe, it, expect } from 'vitest';
import { calculateRisk } from './healthUtils';

describe('Health Screening Accuracy Tests', () => {
  
  it('should return Rendah risk for a healthy person (Persona Normal)', () => {
    const normalData = {
      bb: '65',
      tb: '170',
      sistolik: '115',
      diastolik: '75',
      denyutJantung: '72',
      polaMakan: 'Sehat',
      begadang: 'Tidak',
      merokok: 'Tidak',
      paparanRokok: 'Tidak Pernah',
      riwayatKeluarga: { hipertensi: false, diabetes: false, jantung: false },
      gejalaFisik: { batukLama: false, bbTurun: false, sesakNapas: false, seringLelah: false, pusing: false },
      gejalaMental: { sakitKepala: false, hilangNafsuMakan: false, tidakNyenyak: false, cemas: false, tidakBahagia: false }
    };

    const result = calculateRisk(normalData);
    
    expect(result.riskLevel).toBe('Rendah');
    expect(result.findings[0].title).toBe('Kondisi Sehat');
    expect(result.imt).toBeCloseTo(22.49, 1);
  });

  it('should detect Hypertension Stage 2 (Persona Hipertensi)', () => {
    const hypertensionData = {
      bb: '70',
      tb: '170',
      sistolik: '150', // High
      diastolik: '95',  // High
      denyutJantung: '80',
      polaMakan: 'Kurang Sehat',
      begadang: 'Tidak',
      merokok: 'Tidak',
      paparanRokok: 'Tidak Pernah',
    };

    const result = calculateRisk(hypertensionData);
    
    expect(result.riskLevel).toBe('Tinggi');
    expect(result.findings.some(f => f.title === 'Indikasi Hipertensi')).toBe(true);
  });

  it('should detect Obesity and high risk (Persona Obesitas)', () => {
    const obeseData = {
      bb: '100', // Obese for 170cm
      tb: '170',
      sistolik: '120',
      diastolik: '80',
      denyutJantung: '70',
    };

    const result = calculateRisk(obeseData);
    
    expect(result.riskLevel).toBe('Tinggi');
    expect(result.findings.some(f => f.title === 'Obesitas')).toBe(true);
    expect(result.imt).toBeGreaterThan(30);
  });

  it('should detect Tachycardia and Cardiovascular Load (Persona Jantung)', () => {
    const cardioData = {
      bb: '70',
      tb: '170',
      sistolik: '145', // High
      diastolik: '92',  // High
      denyutJantung: '110', // Tachycardia
    };

    const result = calculateRisk(cardioData);
    
    expect(result.riskLevel).toBe('Tinggi');
    expect(result.findings.some(f => f.title === 'Takikardia (Detak Jantung Cepat)')).toBe(true);
    expect(result.findings.some(f => f.title === 'Beban Kardiovaskular Tinggi')).toBe(true);
  });

  it('should detect Respiratory Infection Risk (Persona Paru)', () => {
    const lungData = {
      bb: '60',
      tb: '170',
      sistolik: '110',
      diastolik: '70',
      denyutJantung: '70',
      gejalaFisik: { batukLama: true } // Symptom
    };

    const result = calculateRisk(lungData);
    
    expect(result.riskLevel).toBe('Tinggi');
    expect(result.findings.some(f => f.title === 'Risiko Infeksi Pernapasan')).toBe(true);
    expect(result.recommendations.some(r => r.includes('screening paru'))).toBe(true);
  });

  it('should handle Stress detection based on symptoms (Persona Mental)', () => {
    const stressData = {
      bb: '60',
      tb: '170',
      gejalaMental: { sakitKepala: true, hilangNafsuMakan: true, cemas: true } // 3 symptoms
    };

    const result = calculateRisk(stressData);
    
    expect(result.findings.some(f => f.title === 'Indikasi Stres Ringan/Sedang')).toBe(true);
    expect(result.recommendations.some(r => r.includes('Mood Tracker'))).toBe(true);
  });

  it('should detect smoking risk for long-term smokers (Persona Perokok)', () => {
    const smokerData = {
      bb: '70',
      tb: '170',
      merokok: 'Ya',
      durasiRokok: '10', // Long term
    };

    const result = calculateRisk(smokerData);
    
    expect(result.riskLevel).toBe('Tinggi');
    expect(result.findings.some(f => f.title === 'Risiko Kerusakan Paru & Pembuluh Darah')).toBe(true);
  });

});
