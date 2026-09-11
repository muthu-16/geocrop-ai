import annData from './ann_weights.json';
import cropData from './crop_ann_weights.json';
import foundationData from './foundation_ann_weights.json';

// Math Utilities for ANN Forward Pass
function matVecAdd(x, W, b) {
  const nOut = b.length;
  const out = new Array(nOut).fill(0);
  for (let j = 0; j < nOut; j++) {
    let sum = b[j];
    for (let i = 0; i < x.length; i++) {
      sum += x[i] * W[i][j];
    }
    out[j] = sum;
  }
  return out;
}

function tanhVec(v) { 
  return v.map(Math.tanh); 
}

function softmax(v) {
  const m = Math.max(...v);
  const exps = v.map(x => Math.exp(x - m));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sum);
}

// ============ Model 1: soil strength (regression) ============
// Input: moisture (%), density (g/cc)
// Output: [CBR, SBC (kN/m²)]
export function predictSoil(moisture, density) {
  const d = annData;
  const x = [
    (moisture - d.x_mean[0]) / d.x_scale[0],
    (density - d.x_mean[1]) / d.x_scale[1],
  ];
  let a = x;
  for (let layer = 0; layer < d.weights.length; layer++) {
    a = matVecAdd(a, d.weights[layer], d.biases[layer]);
    if (layer < d.weights.length - 1) a = tanhVec(a);
  }
  return {
    cbr: a[0] * d.y_scale[0] + d.y_mean[0],
    sbc: a[1] * d.y_scale[1] + d.y_mean[1],
  };
}

// ============ Model 2: crop suitability (classification) ============
export function predictCrop(rainfall, temp, humidity, moisture, density, ph, n, p, k) {
  const d = cropData;
  const raw = [rainfall, temp, humidity, moisture, density, ph, n, p, k];
  let a = raw.map((v, i) => (v - d.x_mean[i]) / d.x_scale[i]);
  for (let layer = 0; layer < d.weights.length; layer++) {
    a = matVecAdd(a, d.weights[layer], d.biases[layer]);
    if (layer < d.weights.length - 1) a = tanhVec(a);
  }
  const probs = softmax(a);
  return d.class_names.map((name, i) => ({ name, prob: probs[i] })).sort((x, y) => y.prob - x.prob);
}

// ============ Model 3: foundation type recommendation (classification) ============
export function predictFoundation(cbr, sbc, soilTextureNum, storeys) {
  const d = foundationData;
  const raw = [cbr, sbc, soilTextureNum, storeys];
  let a = raw.map((v, i) => (v - d.x_mean[i]) / d.x_scale[i]);
  for (let layer = 0; layer < d.weights.length; layer++) {
    a = matVecAdd(a, d.weights[layer], d.biases[layer]);
    if (layer < d.weights.length - 1) a = tanhVec(a);
  }
  const probs = softmax(a);
  return d.class_names.map((name, i) => ({ name, prob: probs[i] })).sort((x, y) => y.prob - x.prob);
}

// Helper: Density to Soil Texture Code (for Foundation ANN)
export function soilTextureCodeFromDensity(density) {
  if (density < 1.55) return 0; // Sandy
  if (density < 1.75) return 1; // Loamy
  return 2; // Clayey
}
