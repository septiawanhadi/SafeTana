/**
 * Utilitas untuk menghitung metrik performa model/prediksi kesehatan
 */
export const calculateMetrics = (tp, tn, fp, fn) => {
  const total = tp + tn + fp + fn;
  if (total === 0) return { accuracy: '0%', precision: '0%', recall: '0%', f1Score: '0%' };

  const accuracy = (tp + tn) / total;
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
  const f1Score = (precision + recall) > 0 
    ? 2 * (precision * recall) / (precision + recall) 
    : 0;

  return {
    accuracy: (accuracy * 100).toFixed(2) + '%',
    precision: (precision * 100).toFixed(2) + '%',
    recall: (recall * 100).toFixed(2) + '%',
    f1Score: (f1Score * 100).toFixed(2) + '%'
  };
};
