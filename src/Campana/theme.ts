// Paleta y tipografía compartida para el video de campaña (formato 9:16)

export const COLORS = {
  bg0: "#05060f", // fondo profundo
  bg1: "#0a1030", // azul noche
  bg2: "#111a4a", // azul territorio
  ink: "#f5f7ff", // texto principal
  inkSoft: "#aab3d6", // texto secundario
  // Gradiente "mapa de calor"
  heatLow: "#2b3df0", // frío (poca señal)
  heatMid: "#f0a028", // medio
  heatHigh: "#ff3b57", // caliente (dolor / problema)
  accent: "#41e6c8", // acento tecnológico (IA / data)
  line: "rgba(120,140,255,0.16)",
};

export const FONT =
  '"Inter","Helvetica Neue",Arial,system-ui,-apple-system,sans-serif';

// Semilla determinista para posiciones (Remotion debe ser reproducible)
export const rand = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
