import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "../Campana/theme";
import { C, CleanBg, Frame, easeInOut, lerp, loop } from "./Clean";

const wrap = (Hero: React.FC, eyebrow: string, word: string, wordColor = C.ink, wordSize = 76): React.FC => {
  const Comp: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const fade = interpolate(frame, [0, 18, durationInFrames - 18, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

const Person: React.FC<{ c: string; s?: number }> = ({ c, s = 44 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7Z" />
  </svg>
);
const Check: React.FC<{ c: string; s?: number; draw?: number }> = ({ c, s = 34, draw = 1 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7" strokeDasharray={30} strokeDashoffset={30 * (1 - draw)} />
  </svg>
);

// ===== V1 — 3 voceros, 3 mensajes = desorden =====
const ThreeVoices: React.FC = () => {
  const frame = useCurrentFrame();
  const cols = [C.accent, "#f2b64d", C.warn];
  const shapes = ["●", "▲", "■"];
  const spk = [
    { x: 150, y: 90 },
    { x: 380, y: 60 },
    { x: 610, y: 90 },
  ];
  const cxc = 380;
  const cyc = 430;
  const flick = cols[Math.floor(loop(frame, 36) * 3)];
  return (
    <div style={{ position: "relative", width: 760, height: 560 }}>
      <svg width={760} height={560} style={{ position: "absolute", left: 0, top: 0 }}>
        {spk.map((s, i) => {
          const wob = Math.sin((frame + i * 20) * 0.08) * 8;
          return <line key={i} x1={s.x} y1={s.y + 40} x2={cxc + wob} y2={cyc - 60} stroke={cols[i]} strokeWidth={2} opacity={0.35} />;
        })}
      </svg>
      {spk.map((s, i) => {
        const a = interpolate(frame, [16 + i * 10, 34 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
        const bob = Math.sin((frame + i * 30) * 0.06) * 6;
        return (
          <div key={i} style={{ position: "absolute", left: s.x, top: s.y + bob, transform: "translate(-50%,-50%)", opacity: a }}>
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: `${cols[i]}18`, border: `2px solid ${cols[i]}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Person c={cols[i]} s={44} />
            </div>
            <div style={{ position: "absolute", left: "100%", top: -6, marginLeft: 10, padding: "8px 16px", borderRadius: 16, borderBottomLeftRadius: 4, background: `${cols[i]}22`, border: `1px solid ${cols[i]}`, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: cols[i] }}>{shapes[i]}</div>
          </div>
        );
      })}
      {/* Ciudadanía confundida */}
      <div style={{ position: "absolute", left: cxc, top: cyc, transform: "translate(-50%,-50%)", width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: `2px solid ${flick}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 26px ${flick}44` }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 72, color: flick }}>?</span>
      </div>
    </div>
  );
};

// ===== V2 — Estructura simple: Problema -> Acción -> Resultado =====
const StructureSteps: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    { n: "1", t: "Qué problema", c: C.warn },
    { n: "2", t: "Qué acción", c: C.accent },
    { n: "3", t: "Qué resultado", c: "#f2b64d" },
  ];
  return (
    <div style={{ position: "relative", width: 620, height: 520, display: "flex", flexDirection: "column", gap: 26, justifyContent: "center" }}>
      {steps.map((s, i) => {
        const a = interpolate(frame, [16 + i * 18, 36 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
        return (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "26px 30px", borderRadius: 22, background: "rgba(255,255,255,0.045)", border: `1px solid ${s.c}55`, boxShadow: `0 0 24px ${s.c}18`, opacity: a, transform: `translateX(${(1 - a) * 30}px)` }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${s.c}22`, border: `2px solid ${s.c}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 34, color: s.c, flexShrink: 0 }}>{s.n}</div>
              <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.ink }}>{s.t}</span>
            </div>
            {i < 2 && (
              <div style={{ textAlign: "center", height: 10 }}>
                <span style={{ fontFamily: FONT, fontSize: 30, color: C.soft, opacity: a }}>↓</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ===== V3 — Matriz única =====
const MatrixCard: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { t: "Mensajes centrales", c: C.accent },
    { t: "Preguntas difíciles", c: "#f2b64d" },
    { t: "Respuestas aprobadas", c: C.accent },
    { t: "Límites", c: C.warn },
  ];
  const app = interpolate(frame, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  return (
    <div style={{ width: 680, transform: `translateY(${(1 - app) * 30}px)`, opacity: app, borderRadius: 28, background: "rgba(8,14,34,0.6)", border: `1px solid ${C.line}`, boxShadow: "0 30px 70px rgba(0,0,0,0.5)", overflow: "hidden" }}>
      <div style={{ padding: "22px 30px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 14, height: 14, borderRadius: 4, background: C.accent }} />
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.ink, letterSpacing: "0.06em" }}>MATRIZ ÚNICA</span>
      </div>
      {rows.map((r, i) => {
        const g = interpolate(frame, [26 + i * 14, 44 + i * 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "24px 30px", borderBottom: i < 3 ? `1px solid ${C.line}` : "none", opacity: interpolate(frame, [22 + i * 14, 34 + i * 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            <Check c={r.c} s={36} draw={g} />
            <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: C.ink }}>{r.t}</span>
          </div>
        );
      })}
    </div>
  );
};

// ===== V4 — IA escanea 3 documentos, señala 1 contradicción =====
const AiScan: React.FC = () => {
  const frame = useCurrentFrame();
  const docs = [0, 1, 2];
  const scanT = loop(frame, 120);
  const scanY = easeInOut(Math.min(1, scanT * 1.4)) * 300;
  const revealed = frame > 70;
  return (
    <div style={{ position: "relative", width: 720, height: 520 }}>
      {/* chip IA */}
      <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", padding: "10px 26px", borderRadius: 999, border: `2px solid ${C.accent}`, background: `${C.accent}14`, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.accent }}>IA</div>
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
        {docs.map((i) => {
          const bad = i === 1;
          const c = revealed ? (bad ? C.warn : C.accent) : C.line;
          return (
            <div key={i} style={{ position: "relative", width: 180, height: 300, borderRadius: 20, background: "rgba(255,255,255,0.04)", border: `2px solid ${c}`, boxShadow: revealed ? `0 0 26px ${c}33` : "none", padding: 22, overflow: "hidden" }}>
              {[0, 1, 2, 3, 4].map((k) => (
                <div key={k} style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.12)", marginBottom: 16, width: `${70 + ((i * 7 + k * 13) % 30)}%` }} />
              ))}
              {/* insignia resultado */}
              {revealed && (
                <div style={{ position: "absolute", right: 12, bottom: 12, width: 46, height: 46, borderRadius: "50%", background: `${c}22`, border: `2px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 30, color: c }}>
                  {bad ? "!" : "✓"}
                </div>
              )}
              {/* línea de escaneo */}
              {!revealed && <div style={{ position: "absolute", left: 0, right: 0, top: scanY, height: 3, background: C.accent, boxShadow: `0 0 14px ${C.accent}` }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===== V5 — Alinear antes de publicar =====
const AlignPublish: React.FC = () => {
  const frame = useCurrentFrame();
  const align = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const cols = [C.accent, "#f2b64d", C.warn];
  const W = 620;
  const midY = 200;
  const pubA = interpolate(frame, [95, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  return (
    <div style={{ position: "relative", width: W, height: 480 }}>
      <svg width={W} height={340} style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}>
        {cols.map((c, i) => {
          const baseY = 90 + i * 90;
          const y = lerp(baseY, midY, align);
          const amp = (1 - align) * 26;
          const d = `M20 ${y} C ${W * 0.3} ${y - amp}, ${W * 0.5} ${y + amp}, ${W - 20} ${y}`;
          return <path key={i} d={d} fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" opacity={i === 0 ? 1 : 1 - align * (i === 1 ? 0.6 : 0.6)} style={{ filter: `drop-shadow(0 0 8px ${c}66)` }} />;
        })}
      </svg>
      {/* Publicar */}
      <div style={{ position: "absolute", top: 360, left: "50%", transform: `translateX(-50%) scale(${lerp(0.9, 1, pubA)})`, opacity: pubA, display: "flex", alignItems: "center", gap: 14, padding: "20px 40px", borderRadius: 999, background: `${C.accent}18`, border: `2px solid ${C.accent}`, boxShadow: `0 0 30px ${C.accent}44` }}>
        <Check c={C.accent} s={38} draw={pubA} />
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.ink }}>Publicar</span>
      </div>
    </div>
  );
};

export type TemaV = { id: string; titulo: string; durationInFrames: number; Clip: React.FC };
export const TEMAS_V: TemaV[] = [
  { id: "V1-Desorden", titulo: "3 voceros = desorden", durationInFrames: 300, Clip: wrap(ThreeVoices, "El Problema", "No es diversidad: es desorden", C.warn, 66) },
  { id: "V2-Estructura", titulo: "Estructura simple", durationInFrames: 300, Clip: wrap(StructureSteps, "Paso 1", "Una sola idea oficial", C.ink, 76) },
  { id: "V3-Matriz", titulo: "Matriz única", durationInFrames: 300, Clip: wrap(MatrixCard, "Paso 2", "Una matriz única", C.accent, 78) },
  { id: "V4-IA", titulo: "IA señala contradicciones", durationInFrames: 300, Clip: wrap(AiScan, "El Rol de la IA", "IA señala contradicciones", C.ink, 68) },
  { id: "V5-Alinear", titulo: "Alinear antes de publicar", durationInFrames: 300, Clip: wrap(AlignPublish, "Acción Concreta", "Alinea antes de publicar", C.accent, 74) },
];
