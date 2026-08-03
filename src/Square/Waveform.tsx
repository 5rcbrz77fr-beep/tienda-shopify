import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../Campana/theme";

/**
 * Visualizador de audio (barras simétricas) reactivo a la narración.
 * Se usa como acento inferior en el video cuadrado.
 */
export const Waveform: React.FC<{ src: string; bars?: number }> = ({
  src,
  bars = 48,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(src);

  if (!audioData) {
    return null;
  }

  const spectrum = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 128,
  });

  // Tomar una banda central del espectro (voz)
  const slice = spectrum.slice(4, 4 + bars);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 120,
        width: "100%",
      }}
    >
      {slice.map((v, i) => {
        const h = Math.max(6, Math.min(120, v * 900));
        const t = i / bars;
        const color =
          t < 0.4 ? COLORS.heatLow : t < 0.7 ? COLORS.accent : COLORS.heatHigh;
        return (
          <div
            key={i}
            style={{
              width: 8,
              height: h,
              borderRadius: 4,
              background: color,
              opacity: 0.5 + Math.min(0.5, v * 4),
              boxShadow: v > 0.06 ? `0 0 12px ${color}` : "none",
            }}
          />
        );
      })}
    </div>
  );
};
