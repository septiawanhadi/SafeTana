import { describe, it } from 'vitest';
import { calculateRisk } from './healthUtils';
import { calculateMetrics } from './healthEvaluation';

/**
 * BENCHMARK DATASET (Gold Standard)
 * Data simulasi dengan label "Aktual" dari diagnosis pakar/dokter
 */
const GOLD_STANDARD = [
  { actual: 'Sakit', input: { bb: '95', tb: '170', sistolik: '150', diastolik: '95', denyutJantung: '90' } },
  { actual: 'Sehat', input: { bb: '65', tb: '170', sistolik: '110', diastolik: '70', denyutJantung: '72' } },
  { actual: 'Sakit', input: { bb: '70', tb: '175', sistolik: '120', diastolik: '80', gejalaFisik: { batukLama: true } } },
  { actual: 'Sakit', input: { bb: '110', tb: '165', sistolik: '130', diastolik: '85', denyutJantung: '75' } },
  { actual: 'Sehat', input: { bb: '70', tb: '175', sistolik: '115', diastolik: '75', merokok: 'Tidak' } },
  { actual: 'Sehat', input: { bb: '55', tb: '160', sistolik: '110', diastolik: '70', polaMakan: 'Sehat' } },
  { actual: 'Sakit', input: { bb: '80', tb: '170', sistolik: '145', diastolik: '100', riwayatKeluarga: { jantung: true } } },
  { actual: 'Sehat', input: { bb: '75', tb: '180', sistolik: '120', diastolik: '80', begadang: 'Tidak' } },
  { actual: 'Sakit', input: { bb: '65', tb: '170', sistolik: '115', diastolik: '75', gejalaMental: { cemas: true, tidakNyenyak: true, sakitKepala: true } } },
  { actual: 'Sakit', input: { bb: '70', tb: '165', sistolik: '135', diastolik: '88', merokok: 'Ya', durasiRokok: '10' } },
];

describe('Health Diagnostic Accuracy Benchmark', () => {
  it('should calculate classification metrics (Accuracy, Precision, Recall, F1)', () => {
    let tp = 0, tn = 0, fp = 0, fn = 0;

    console.log('\n--- EVALUASI SKRINING KESEHATAN SAFETANA ---');
    
    GOLD_STANDARD.forEach((test, index) => {
      const assessment = calculateRisk(test.input);
      
      // Map 'Sedang' atau 'Tinggi' menjadi Positif (Risiko), 'Rendah' menjadi Negatif (Sehat)
      const predicted = (assessment.riskLevel === 'Tinggi' || assessment.riskLevel === 'Sedang') ? 'Sakit' : 'Sehat';
      const actual = test.actual;

      if (predicted === 'Sakit' && actual === 'Sakit') tp++;
      if (predicted === 'Sehat' && actual === 'Sehat') tn++;
      if (predicted === 'Sakit' && actual === 'Sehat') fp++;
      if (predicted === 'Sehat' && actual === 'Sakit') fn++;

      console.log(`Kasus #${index + 1}: Aktual=${actual}, Prediksi=${predicted} (${assessment.riskLevel}) -> ${predicted === actual ? '✅' : '❌'}`);
    });

    const metrics = calculateMetrics(tp, tn, fp, fn);

    console.log('\n--- CONFUSION MATRIX ---');
    console.log(`True Positives (TP): ${tp}`);
    console.log(`True Negatives (TN): ${tn}`);
    console.log(`False Positives (FP): ${fp}`);
    console.log(`False Negatives (FN): ${fn}`);

    console.log('\n--- LAPORAN AKURASI AKHIR ---');
    console.table(metrics);
    
    // Minimal target untuk production biasanya > 80%
    // i.e. expect(parseFloat(metrics.accuracy)).toBeGreaterThan(80);
  });
});
