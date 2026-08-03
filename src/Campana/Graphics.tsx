import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, rand } from "./theme";

const easeOut = Easing.out(Easing.cubic);

/** Barra de progreso fina en la parte superior del clip (retención). */
export const TopProgress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        background: "rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${p * 100}%`,
          background: `linear-gradient(90deg, ${COLORS.heatLow}, ${COLORS.accent}, ${COLORS.heatHigh})`,
          boxShadow: `0 0 18px ${COLORS.accent}88`,
        }}
      />
    </div>
  );
};

/** Contenedor "glass" reutilizable con entrada suave. */
export const GlassCard: React.FC<{
  delay?: number;
  from?: "left" | "right" | "bottom";
  width?: number | string;
  children: React.ReactNode;
}> = ({ delay = 0, from = "bottom", width = "auto", children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.7 } });
  const off = interpolate(p, [0, 1], [60, 0]);
  const tx = from === "left" ? -off : from === "right" ? off : 0;
  const ty = from === "bottom" ? off : 0;
  return (
    <div
      style={{
        width,
        transform: `translate(${tx}px, ${ty}px)`,
        opacity: p,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(150,170,255,0.22)",
        borderRadius: 28,
        backdropFilter: "blur(6px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        padding: 34,
      }}
    >
      {children}
    </div>
  );
};

// ---------- Iconos SVG (sin dependencias de fuente) ----------

export const IconDrop: React.FC<{ c: string; size?: number }> = ({ c, size = 54 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 2.5C12 2.5 5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.5 12 2.5Z"
      fill={c}
    />
  </svg>
);

export const IconDoc: React.FC<{ c: string; size?: number }> = ({ c, size = 54 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
      fill={c}
    />
    <path d="M14 3v4h4" fill="rgba(0,0,0,0.25)" />
    <g stroke="rgba(0,0,0,0.35)" strokeWidth="1.4" strokeLinecap="round">
      <path d="M8 11h8M8 14h8M8 17h5" />
    </g>
  </svg>
);

// ---------- Contador de edad 25 → 55 con pista deslizante ----------

export const AgeCounter: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const local = interpolate(frame - delay, [0, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const value = Math.round(interpolate(local, [0, 1], [25, 55]));
  const pos = local * 100;

  return (
    <div style={{ width: 620, opacity }}>
      <div
        style={{
          fontFamily: FONT,
          textAlign: "center",
          fontSize: 150,
          fontWeight: 900,
          color: COLORS.ink,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          textShadow: `0 0 40px ${COLORS.accent}55`,
        }}
      >
        {value}
        <span style={{ fontSize: 60, color: COLORS.inkSoft, fontWeight: 700 }}>
          {" "}
          años
        </span>
      </div>
      <div style={{ position: "relative", height: 10, marginTop: 26 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 6,
            background:
              "linear-gradient(90deg, #2b3df0, #41e6c8, #f0a028, #ff3b57)",
            opacity: 0.85,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -9,
            left: `${pos}%`,
            width: 28,
            height: 28,
            marginLeft: -14,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 22px rgba(255,255,255,0.9)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 16,
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 600,
          color: COLORS.inkSoft,
        }}
      >
        <span>25</span>
        <span>55</span>
      </div>
    </div>
  );
};

// ---------- Radar de calor (escaneo sobre puntos del territorio) ----------

export const HeatRadar: React.FC<{ delay?: number; size?: number }> = ({
  delay = 0,
  size = 460,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const angle = (frame - delay) * 3.4;
  const R = size / 2;

  const points = Array.from({ length: 26 }, (_, i) => {
    const a = rand(i) * Math.PI * 2;
    const r = 40 + rand(i + 50) * (R - 70);
    const x = R + Math.cos(a) * r;
    const y = R + Math.sin(a) * r;
    // Se "encienden" cuando el barrido pasa cerca
    const pa = ((Math.atan2(y - R, x - R) * 180) / Math.PI + 360) % 360;
    const sweep = ((angle % 360) + 360) % 360;
    let d = Math.abs(sweep - pa);
    if (d > 180) d = 360 - d;
    const lit = Math.max(0, 1 - d / 40);
    return { x, y, lit, i };
  });

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `scale(${interpolate(appear, [0, 1], [0.8, 1])})`,
        opacity: appear,
      }}
    >
      {[1, 0.66, 0.33].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: R - R * k,
            top: R - R * k,
            width: R * 2 * k,
            height: R * 2 * k,
            borderRadius: "50%",
            border: `1px solid ${COLORS.line}`,
          }}
        />
      ))}
      {/* Barrido */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(from ${angle}deg, ${COLORS.accent}00 0deg, ${COLORS.accent}55 34deg, ${COLORS.accent}00 45deg)`,
        }}
      />
      {points.map((p) => {
        const s = 7 + p.lit * 16;
        const color = p.lit > 0.4 ? COLORS.heatHigh : COLORS.heatLow;
        return (
          <div
            key={p.i}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: s,
              height: s,
              marginLeft: -s / 2,
              marginTop: -s / 2,
              borderRadius: "50%",
              background: color,
              opacity: 0.25 + p.lit * 0.75,
              boxShadow: p.lit > 0.3 ? `0 0 ${s * 1.8}px ${color}` : "none",
            }}
          />
        );
      })}
      {/* Centro */}
      <div
        style={{
          position: "absolute",
          left: R - 8,
          top: R - 8,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 20px #fff",
        }}
      />
    </div>
  );
};

// ---------- Mockup de chat de WhatsApp ----------

const Bubble: React.FC<{
  delay: number;
  side: "in" | "out";
  children: React.ReactNode;
}> = ({ delay, side, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.6 } });
  const y = interpolate(p, [0, 1], [24, 0]);
  const out = side === "out";
  return (
    <div
      style={{
        alignSelf: out ? "flex-end" : "flex-start",
        maxWidth: "82%",
        transform: `translateY(${y}px)`,
        opacity: p,
        background: out ? "#0b7a5b" : "rgba(255,255,255,0.10)",
        color: COLORS.ink,
        fontFamily: FONT,
        fontSize: 34,
        fontWeight: 500,
        lineHeight: 1.25,
        padding: "20px 26px",
        borderRadius: 24,
        borderBottomRightRadius: out ? 6 : 24,
        borderBottomLeftRadius: out ? 24 : 6,
      }}
    >
      {children}
    </div>
  );
};

const TypingDots: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 8, padding: "6px 4px" }}>
      {[0, 1, 2].map((i) => {
        const o = 0.3 + 0.7 * ((Math.sin(frame * 0.3 - i * 0.9) + 1) / 2);
        return (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: COLORS.inkSoft,
              opacity: o,
            }}
          />
        );
      })}
    </div>
  );
};

export const WhatsAppChat: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        width: 640,
        transform: `translateY(${interpolate(appear, [0, 1], [50, 0])}px)`,
        opacity: appear,
        borderRadius: 34,
        overflow: "hidden",
        background: "rgba(8,14,34,0.72)",
        border: "1px solid rgba(150,170,255,0.22)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "22px 28px",
          background: "#0b7a5b",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
          }}
        />
        <div style={{ fontFamily: FONT, color: "#fff" }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>Vecino · Tu zona</div>
          <div style={{ fontSize: 24, opacity: 0.85 }}>en línea</div>
        </div>
      </div>
      {/* Mensajes */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          padding: "30px 26px 36px",
        }}
      >
        <Bubble delay={delay + 20} side="in">
          Aquí falta el agua hace semanas…
        </Bubble>
        <Bubble delay={delay + 55} side="out">
          Te escucho. Ya está en mi plan.
        </Bubble>
        {frame - delay > 90 ? (
          <Bubble delay={delay + 92} side="in">
            Gracias. Cuentas con mi voto.
          </Bubble>
        ) : (
          <div style={{ alignSelf: "flex-start" }}>
            <TypingDots />
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Latido / pulso (línea ECG animada) ----------

export const Heartbeat: React.FC<{ delay?: number; width?: number }> = ({
  delay = 0,
  width = 720,
}) => {
  const frame = useCurrentFrame();
  const h = 180;
  const path =
    "M0 90 L180 90 L210 90 L240 30 L270 150 L300 60 L330 90 L520 90 L560 90 L590 55 L620 120 L650 90 L720 90";
  const len = 1400;
  const draw = interpolate(frame - delay, [0, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const appear = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <svg width={width} height={h} viewBox="0 0 720 180" style={{ opacity: appear }}>
      <path
        d={path}
        fill="none"
        stroke={COLORS.line}
        strokeWidth={3}
      />
      <path
        d={path}
        fill="none"
        stroke={COLORS.heatHigh}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
        style={{ filter: `drop-shadow(0 0 12px ${COLORS.heatHigh})` }}
      />
    </svg>
  );
};

// ---------- Sello de cierre (círculo + check animados) ----------

export const CheckSeal: React.FC<{ delay?: number; size?: number }> = ({
  delay = 0,
  size = 180,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const check = interpolate(frame - delay, [14, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const R = size / 2;
  const C = 2 * Math.PI * (R - 8);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={R}
        cy={R}
        r={R - 8}
        fill="none"
        stroke={COLORS.accent}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - ring)}
        transform={`rotate(-90 ${R} ${R})`}
        style={{ filter: `drop-shadow(0 0 14px ${COLORS.accent})` }}
      />
      <path
        d={`M${R * 0.62} ${R} L${R * 0.9} ${R * 1.28} L${R * 1.42} ${R * 0.72}`}
        fill="none"
        stroke="#fff"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={120}
        strokeDashoffset={120 * (1 - check)}
      />
    </svg>
  );
};
