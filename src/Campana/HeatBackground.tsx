import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, rand } from "./theme";

/**
 * Fondo animado tipo "mapa de calor territorial":
 * una malla de puntos que laten con intensidad variable,
 * evocando la data que aterriza sobre el territorio.
 */
export const HeatBackground: React.FC<{ intensity?: number }> = ({
  intensity = 1,
}) => {
  const frame = useCurrentFrame();

  const cols = 11;
  const rows = 20;
  const dots: React.ReactNode[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const x = (c + 0.5) / cols;
      const y = (r + 0.5) / rows;

      // Cada punto pulsa con su propia fase
      const phase = rand(i) * Math.PI * 2;
      const speed = 0.04 + rand(i + 99) * 0.05;
      const pulse = (Math.sin(frame * speed + phase) + 1) / 2;

      // "Foco de calor" que se desplaza por el territorio
      const focusX = 0.5 + 0.32 * Math.sin(frame * 0.012);
      const focusY = 0.5 + 0.3 * Math.cos(frame * 0.009);
      const dist = Math.hypot(x - focusX, y - focusY);
      const heat = Math.max(0, 1 - dist * 2.1);

      const energy = Math.min(1, (pulse * 0.5 + heat) * intensity);

      const color =
        energy > 0.66
          ? COLORS.heatHigh
          : energy > 0.38
            ? COLORS.heatMid
            : COLORS.heatLow;

      const size = 3 + energy * 9;
      const opacity = 0.12 + energy * 0.7;

      dots.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            borderRadius: "50%",
            background: color,
            opacity,
            boxShadow: energy > 0.5 ? `0 0 ${size * 2}px ${color}` : "none",
          }}
        />,
      );
    }
  }

  const gradShift = interpolate(
    Math.sin(frame * 0.01),
    [-1, 1],
    [0, 100],
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at ${gradShift}% 10%, ${COLORS.bg2} 0%, ${COLORS.bg1} 45%, ${COLORS.bg0} 100%)`,
        }}
      />
      <AbsoluteFill>{dots}</AbsoluteFill>
      {/* Viñeta para foco central */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(70% 55% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
