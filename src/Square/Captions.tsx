import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../Campana/theme";
import { LINES, type CapLine } from "./captions";

/** Búsqueda de la línea activa según el tiempo actual. */
const activeIndex = (t: number): number => {
  // último índice cuyo start <= t
  let lo = 0;
  let hi = LINES.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (LINES[mid].start <= t) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
};

const Line: React.FC<{ line: CapLine; t: number }> = ({ line, t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Entrada suave al aparecer la línea
  const appearFrame = line.start * fps;
  const appear = interpolate(
    frame,
    [appearFrame - 4, appearFrame + 6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.14em 0.28em",
        maxWidth: 900,
        transform: `translateY(${(1 - appear) * 26}px)`,
        opacity: appear,
      }}
    >
      {line.words.map((w, i) => {
        const spoken = t >= w.s;
        const active = t >= w.s && t < w.e + 0.05;
        const color = active
          ? COLORS.accent
          : spoken
            ? COLORS.ink
            : "rgba(200,210,240,0.38)";
        return (
          <span
            key={i}
            style={{
              color,
              transform: active ? "scale(1.06)" : "scale(1)",
              textShadow: active ? `0 0 26px ${COLORS.accent}88` : "none",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/** Bloque de subtítulos estilo karaoke sincronizados a la narración. */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const idx = activeIndex(t);
  const line = LINES[idx];

  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 72,
        lineHeight: 1.16,
        letterSpacing: "-0.015em",
        textAlign: "center",
        minHeight: 260,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 60px",
      }}
    >
      <Line key={idx} line={line} t={t} />
    </div>
  );
};
