import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "../Campana/theme";
import { C, CleanBg, Frame, easeInOut, lerp, loop } from "./Clean";

// Envoltorio estándar del sistema Limpio (fade + fondo + marco balanceado).
const wrap = (
  Hero: React.FC,
  eyebrow: string,
  word: string,
  wordColor = C.ink,
  wordSize = 78,
): React.FC => {
  const Comp: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const fade = interpolate(
      frame,
      [0, 18, durationInFrames - 18, durationInFrames],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return (
      <AbsoluteFill>
        <CleanBg />
        <AbsoluteFill style={{ opacity: fade }}>
          <Frame eyebrow={eyebrow} word={word} wordColor={wordColor} wordSize={wordSize}>
            <Hero />
          </Frame>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  };
  return Comp;
};

// Glifo de canal (círculo con símbolo) reutilizable.
const Node: React.FC<{ sym: string; color: string; size?: number; glow?: number }> = ({
  sym,
  color,
  size = 92,
  glow = 0.5,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `${color}18`,
      border: `2px solid ${color}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size * 0.46,
      color,
      boxShadow: `0 0 ${16 + glow * 24}px ${color}55`,
    }}
  >
    {sym}
  </div>
);

const CH = [
  { sym: "✆", color: "#25D366", name: "WhatsApp" },
  { sym: "◉", color: "#e1306c", name: "Instagram" },
  { sym: "✉", color: "#f2b64d", name: "Correo" },
  { sym: "⌂", color: C.accent, name: "Sitio web" },
];

// ===== 1 — Visión: mirar la meta y edificar con IA =====
const HeroVision: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [12, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const pulse = (1 + Math.sin(frame * 0.08)) / 2;
  const cx = 300;
  const baseY = 470;
  const topY = lerp(baseY, 90, grow);
  return (
    <div style={{ position: "relative", width: 600, height: 560 }}>
      <svg width={600} height={560} viewBox="0 0 600 560" style={{ overflow: "visible" }}>
        {/* barras de escalón que suben hacia la meta */}
        {[0, 1, 2, 3].map((i) => {
          const t = interpolate(frame, [20 + i * 12, 50 + i * 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easeInOut,
          });
          const h = (60 + i * 70) * t;
          const x = 120 + i * 100;
          return (
            <rect
              key={i}
              x={x}
              y={baseY - h}
              width={66}
              height={h}
              rx={12}
              fill={`${C.accent}22`}
              stroke={C.accent}
              strokeWidth={2}
            />
          );
        })}
        {/* flecha ascendente hacia la meta */}
        <line
          x1={120}
          y1={baseY}
          x2={cx + 150}
          y2={topY}
          stroke={C.accent}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={700}
          strokeDashoffset={700 * (1 - grow)}
          style={{ filter: `drop-shadow(0 0 8px ${C.accent})` }}
        />
      </svg>
      {/* meta / estrella */}
      <div
        style={{
          position: "absolute",
          left: cx + 150,
          top: topY,
          transform: "translate(-50%,-50%)",
          opacity: grow,
        }}
      >
        <Node sym="★" color="#f2b64d" size={110} glow={pulse} />
      </div>
    </div>
  );
};

// ===== 2 — Ecosistema: núcleo IA con canales en órbita =====
const HeroEcosystem: React.FC = () => {
  const frame = useCurrentFrame();
  const R = 210;
  const cx = 300;
  const cy = 300;
  const ring = frame * 0.5;
  const corePulse = (1 + Math.sin(frame * 0.08)) / 2;
  const appear = interpolate(frame, [10, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  return (
    <div style={{ position: "relative", width: 600, height: 600 }}>
      <svg width={600} height={600} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.line} strokeWidth={2} />
        {CH.map((_, i) => {
          const a = (i / CH.length) * Math.PI * 2 - Math.PI / 2 + (ring * Math.PI) / 180;
          const x = cx + R * Math.cos(a);
          const y = cy + R * Math.sin(a);
          const p = (1 + Math.sin(frame * 0.12 + i)) / 2;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={CH[i].color}
              strokeWidth={2}
              opacity={0.2 + p * 0.5}
            />
          );
        })}
      </svg>
      {/* núcleo IA */}
      <div style={{ position: "absolute", left: cx, top: cy, transform: "translate(-50%,-50%)" }}>
        <div
          style={{
            width: 128,
            height: 128,
            marginLeft: -64,
            marginTop: -64,
            position: "absolute",
            borderRadius: "50%",
            background: `radial-gradient(circle at 42% 38%, ${C.accent}, ${C.accentDeep})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 46,
            color: "#04141a",
            boxShadow: `0 0 ${30 + corePulse * 30}px ${C.accent}aa`,
          }}
        >
          IA
        </div>
      </div>
      {/* canales en órbita */}
      {CH.map((c, i) => {
        const a = (i / CH.length) * Math.PI * 2 - Math.PI / 2 + (ring * Math.PI) / 180;
        const x = cx + R * Math.cos(a);
        const y = cy + R * Math.sin(a);
        const p = (1 + Math.sin(frame * 0.1 + i * 1.4)) / 2;
        return (
          <div
            key={c.name}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%,-50%) scale(${appear})`,
              opacity: appear,
            }}
          >
            <Node sym={c.sym} color={c.color} size={86} glow={p} />
          </div>
        );
      })}
    </div>
  );
};

// ===== 3 — Bandeja única: 4 canales -> una sola bandeja =====
const HeroInbox: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 300;
  const srcY = 70;
  const inboxY = 470;
  const srcX = [70, 210, 390, 530];
  const trayPulse = (1 + Math.sin(frame * 0.09)) / 2;

  const N = 8;
  const period = 140;
  const packets = Array.from({ length: N }, (_, i) => {
    const lane = i % 4;
    const t = loop(frame + (i / N) * period, period);
    const k = easeInOut(t);
    const x = lerp(srcX[lane], cx, k);
    const y = lerp(srcY + 60, inboxY - 40, k);
    const op = t < 0.85 ? 1 : interpolate(t, [0.85, 1], [1, 0]);
    return { x, y, op, c: CH[lane].color, key: i };
  });

  const appear = interpolate(frame, [8, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });

  return (
    <div style={{ position: "relative", width: 600, height: 600 }}>
      <svg width={600} height={600} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {srcX.map((sx, i) => (
          <line
            key={i}
            x1={sx}
            y1={srcY + 60}
            x2={cx}
            y2={inboxY - 40}
            stroke={CH[i].color}
            strokeWidth={2}
            opacity={0.16}
          />
        ))}
      </svg>

      {/* 4 canales arriba */}
      {srcX.map((sx, i) => (
        <div
          key={CH[i].name}
          style={{
            position: "absolute",
            left: sx,
            top: srcY,
            transform: `translate(-50%,-50%) scale(${appear})`,
            opacity: appear,
          }}
        >
          <Node sym={CH[i].sym} color={CH[i].color} size={82} glow={0.4} />
        </div>
      ))}

      {/* paquetes convergiendo */}
      {packets.map((pk) => (
        <div
          key={pk.key}
          style={{
            position: "absolute",
            left: pk.x,
            top: pk.y,
            width: 22,
            height: 22,
            marginLeft: -11,
            marginTop: -11,
            borderRadius: "50% 50% 50% 5px",
            background: pk.c,
            opacity: pk.op,
            boxShadow: `0 0 12px ${pk.c}`,
          }}
        />
      ))}

      {/* bandeja única */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: inboxY,
          transform: "translate(-50%,-50%)",
          width: 300,
          padding: "26px 20px 30px",
          borderRadius: 26,
          background: "rgba(255,255,255,0.05)",
          border: `2px solid ${C.accent}`,
          boxShadow: `0 0 ${24 + trayPulse * 26}px ${C.accent}44`,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: FONT, fontSize: 54, lineHeight: 1, color: C.accent }}>▤</div>
        <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: C.ink, marginTop: 10 }}>
          1 sola bandeja
        </div>
      </div>
    </div>
  );
};

// ===== 4 — Base de conocimiento: texto/doc/audio -> IA responde =====
const HeroKnowledge: React.FC = () => {
  const frame = useCurrentFrame();
  const inputs = [
    { sym: "≡", label: "Texto", color: C.accent },
    { sym: "▤", label: "Documento", color: "#f2b64d" },
    { sym: "♪", label: "Audio", color: "#e1306c" },
  ];
  const coreY = 340;
  const cx = 300;
  const corePulse = (1 + Math.sin(frame * 0.09)) / 2;
  const answer = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  return (
    <div style={{ position: "relative", width: 600, height: 620 }}>
      {/* entradas en fila arriba */}
      {inputs.map((it, i) => {
        const x = 110 + i * 190;
        const a = interpolate(frame, [15 + i * 12, 45 + i * 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: easeInOut,
        });
        // paquete que baja al core
        const t = loop(frame + i * 30, 120);
        const k = easeInOut(t);
        const py = lerp(120, coreY - 60, k);
        const px = lerp(x, cx, k);
        return (
          <div key={it.label}>
            <div
              style={{
                position: "absolute",
                left: x,
                top: 70,
                transform: `translate(-50%,-50%) scale(${a})`,
                opacity: a,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Node sym={it.sym} color={it.color} size={84} glow={0.4} />
              <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 700, color: C.soft }}>
                {it.label}
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                left: px,
                top: py,
                width: 18,
                height: 18,
                marginLeft: -9,
                marginTop: -9,
                borderRadius: "50%",
                background: it.color,
                opacity: t < 0.85 ? 0.9 : interpolate(t, [0.85, 1], [0.9, 0]),
                boxShadow: `0 0 10px ${it.color}`,
              }}
            />
          </div>
        );
      })}

      {/* núcleo cerebro IA */}
      <div style={{ position: "absolute", left: cx, top: coreY, transform: "translate(-50%,-50%)" }}>
        <div
          style={{
            width: 150,
            height: 150,
            marginLeft: -75,
            marginTop: -75,
            position: "absolute",
            borderRadius: "42% 58% 54% 46% / 52% 44% 56% 48%",
            background: `radial-gradient(circle at 42% 38%, ${C.accent}, ${C.accentDeep})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 44,
            color: "#04141a",
            boxShadow: `0 0 ${30 + corePulse * 30}px ${C.accent}aa`,
          }}
        >
          IA
        </div>
      </div>

      {/* respuesta con precisión */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: coreY + 180,
          transform: "translate(-50%,-50%)",
          opacity: answer,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 30px",
          borderRadius: 999,
          background: "rgba(79,214,201,0.12)",
          border: `1px solid ${C.accent}`,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: C.accent }}>
          Responde con precisión
        </span>
      </div>
    </div>
  );
};

// ===== 5 — Fidelización: cliente sube de nivel (curva + corazón) =====
const HeroLoyalty: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [15, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const beat = 1 + Math.sin(frame * 0.18) * 0.06;
  // curva ascendente (bezier) muestreada
  const pts = Array.from({ length: 40 }, (_, i) => {
    const t = i / 39;
    const x = 90 + t * 420;
    const y = 470 - Math.pow(t, 1.5) * 360;
    return [x, y] as const;
  });
  const shown = pts.slice(0, Math.max(2, Math.floor(pts.length * draw)));
  const d = shown.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
  const tip = shown[shown.length - 1];
  return (
    <div style={{ position: "relative", width: 600, height: 560 }}>
      <svg width={600} height={560} viewBox="0 0 600 560" style={{ overflow: "visible" }}>
        {/* eje */}
        <line x1={90} y1={470} x2={540} y2={470} stroke={C.line} strokeWidth={2} />
        <line x1={90} y1={470} x2={90} y2={90} stroke={C.line} strokeWidth={2} />
        <path
          d={d}
          fill="none"
          stroke={C.accent}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 8px ${C.accent})` }}
        />
        {/* área bajo curva */}
        {shown.length > 2 && (
          <path
            d={`${d} L${tip[0]} 470 L90 470 Z`}
            fill={`${C.accent}14`}
            stroke="none"
          />
        )}
      </svg>
      {/* corazón / cliente fiel en la punta */}
      <div
        style={{
          position: "absolute",
          left: tip[0],
          top: tip[1],
          transform: `translate(-50%,-50%) scale(${beat})`,
        }}
      >
        <Node sym="♥" color={C.warn} size={96} glow={0.7} />
      </div>
    </div>
  );
};

// ===== 6 — Cierre: estrategia de IA (badge + flecha que sube) =====
const HeroClose: React.FC = () => {
  const frame = useCurrentFrame();
  const app = interpolate(frame, [10, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const pulse = (1 + Math.sin(frame * 0.07)) / 2;
  const ringR = 160;
  const Circ = 2 * Math.PI * ringR;
  return (
    <div
      style={{
        position: "relative",
        width: 460,
        height: 460,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={380} height={380} style={{ position: "absolute" }}>
        <circle cx={190} cy={190} r={ringR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
        <circle
          cx={190}
          cy={190}
          r={ringR}
          fill="none"
          stroke={C.accent}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={Circ}
          strokeDashoffset={Circ * (1 - app)}
          transform="rotate(-90 190 190)"
          style={{ filter: `drop-shadow(0 0 10px ${C.accent})` }}
        />
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          transform: `scale(${lerp(0.85, 1, app)})`,
          opacity: app,
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 40,
            background: `radial-gradient(circle at 42% 38%, ${C.accent}, ${C.accentDeep})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${30 + pulse * 28}px ${C.accent}aa`,
          }}
        >
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 58, color: "#04141a" }}>IA↗</span>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.ink }}>Llega más lejos</div>
      </div>
    </div>
  );
};

export type TemaEmp = { id: string; titulo: string; durationInFrames: number; Clip: React.FC };
export const TEMAS_EMP: TemaEmp[] = [
  { id: "E1-Vision", titulo: "La visión: edificar con IA", durationInFrames: 300, Clip: wrap(HeroVision, "La Visión", "Edificá tu empresa con IA", C.ink, 70) },
  { id: "E2-Ecosistema", titulo: "Un ecosistema con IA", durationInFrames: 300, Clip: wrap(HeroEcosystem, "El Ecosistema", "Un ecosistema con IA", C.ink, 76) },
  { id: "E3-Bandeja", titulo: "Todos los canales en 1 bandeja", durationInFrames: 300, Clip: wrap(HeroInbox, "La Bandeja Única", "Todo en una sola bandeja", C.accent, 74) },
  { id: "E4-Conocimiento", titulo: "Base de conocimiento", durationInFrames: 300, Clip: wrap(HeroKnowledge, "Base de Conocimiento", "La IA responde por ti", C.ink, 76) },
  { id: "E5-Fidelidad", titulo: "Fidelización y crecimiento", durationInFrames: 300, Clip: wrap(HeroLoyalty, "Fidelización", "Llevá tu cliente al siguiente nivel", C.warn, 60) },
  { id: "E6-Cierre", titulo: "Estrategia de IA real", durationInFrames: 300, Clip: wrap(HeroClose, "El Cierre", "Estrategia de IA real", C.accent, 76) },
];
