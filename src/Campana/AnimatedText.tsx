import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT } from "./theme";

type Segment = { text: string; heat?: boolean; accent?: boolean };

/**
 * Frase que revela palabra por palabra, con desenfoque y desplazamiento.
 * `heat` resalta la palabra en el color del "dolor/problema",
 * `accent` en el color tecnológico (IA / data).
 */
export const KineticLine: React.FC<{
  segments: Segment[];
  size?: number;
  delay?: number;
  weight?: number;
  stagger?: number;
}> = ({ segments, size = 96, delay = 0, weight = 800, stagger = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.18em 0.28em",
        maxWidth: "90%",
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        textAlign: "center",
      }}
    >
      {segments.map((seg, i) => {
        const local = frame - delay - i * stagger;
        const p = spring({
          frame: local,
          fps,
          config: { damping: 200, mass: 0.6 },
        });
        const y = interpolate(p, [0, 1], [40, 0]);
        const blur = interpolate(p, [0, 1], [12, 0]);
        const color = seg.heat
          ? COLORS.heatHigh
          : seg.accent
            ? COLORS.accent
            : COLORS.ink;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              opacity: p,
              filter: `blur(${blur}px)`,
              color,
              textShadow:
                seg.heat || seg.accent
                  ? `0 0 32px ${color}66`
                  : "0 4px 24px rgba(0,0,0,0.5)",
            }}
          >
            {seg.text}
          </span>
        );
      })}
    </div>
  );
};

/** Etiqueta pequeña superior (kicker) con línea que crece. */
export const Kicker: React.FC<{ text: string; delay?: number }> = ({
  text,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const width = interpolate(p, [0, 1], [0, 54]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: p,
        fontFamily: FONT,
        marginBottom: 34,
      }}
    >
      <div style={{ height: 3, width, background: COLORS.accent }} />
      <span
        style={{
          color: COLORS.accent,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
        }}
      >
        {text}
      </span>
    </div>
  );
};
