/**
 * Service untuk memetakan endpoints layer spasial dari ArcGIS REST Services milik BNPB
 * Sumber: https://gis.bnpb.go.id/server/rest/services
 */

export const BNPB_LAYERS = {
  // Peta Bahaya Banjir (inaRISK)
  INARISK_FLOOD: 'https://gis.bnpb.go.id/server/rest/services/inarisk/layer_bahaya_banjir_30/MapServer/tile/{z}/{y}/{x}',
  
  // Peta Bahaya Gempa Bumi (inaRISK)
  INARISK_EQ: 'https://gis.bnpb.go.id/server/rest/services/inarisk/layer_bahaya_gempabumi_30/MapServer/tile/{z}/{y}/{x}',
  
  // Peta Bahaya Tanah Longsor (inaRISK)
  INARISK_LANDSLIDE: 'https://gis.bnpb.go.id/server/rest/services/inarisk/layer_bahaya_tanah_longsor_30/MapServer/tile/{z}/{y}/{x}',

  // Peta Indeks Bahaya Tsunami (inaRISK) - Menggunakan export wms karena mungkin tidak di-cache sebagai tile
  // Namun untuk konsistensi, kita coba endpoint tile default, bila tidak tersedia akan di-fallback atau tidak muncul.
  INARISK_TSUNAMI: 'https://gis.bnpb.go.id/server/rest/services/inarisk/layer_bahaya_tsunami_30/MapServer/tile/{z}/{y}/{x}',

  // Data Survey Risiko Bencana (inaware)
  INAWARE_RISK: 'https://gis.bnpb.go.id/server/rest/services/inaware/central_java_disaster_risk_survey/MapServer/tile/{z}/{y}/{x}'
};
