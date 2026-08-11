import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "../Campana/theme";
import { C, CleanBg, Frame, easeInOut, lerp, loop } from "./Clean";

const HEAT_LOW = "#2f5bff";
const HEAT_MID = "#f2b64d";
const HEAT_HIGH = "#ff5a72";

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

// Panel de mapa de calor contenido y limpio.
const HeatPanel: React.FC<{ w: number; h: number; cols: number; rows: number; reveal: number }> = ({ w, h, cols, rows, reveal }) => {
  const frame = useCurrentFrame();
  const cells: React.ReactNode[] = [];
  const hotspots = [
    { x: 0.3, y: 0.35, r: 0.28 },
    { x: 0.68, y: 0.62, r: 0.24 },
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const ux = (c + 0.5) / cols;
      const uy = (r + 0.5) / rows;
      let heat = 0;
      for (const hs of hotspots) {
        const pulse = 0.9 + 0.1 * Math.sin(frame * 0.06 + hs.x * 10);
        const d = Math.hypot(ux - hs.x, uy - hs.y);
        heat += Math.max(0, 1 - d / (hs.r * pulse));
      }
      heat = Math.min(1, heat);
      const cellReveal = Math.max(0, Math.min(1, reveal * cols * rows - i)) ;
      const col = heat > 0.6 ? HEAT_HIGH : heat > 0.3 ? HEAT_MID : HEAT_LOW;
      const op = (0.14 + heat * 0.8) * cellReveal;
      const cw = w / cols;
      const ch = h / rows;
      cells.push(
        <div key={i} style={{ position: "absolute", left: c * cw + 3, top: r * ch + 3, width: cw - 6, height: ch - 6, borderRadius: 8, background: col, opacity: op, boxShadow: heat > 0.55 ? `0 0 ${cw * 0.7}px ${col}` : "none" }} />,
      );
    }
  }
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 26, background: "rgba(8,14,34,0.5)", border: `1px solid ${C.line}`, overflow: "hidden" }}>
      {cells}
    </div>
  );
};

const Chip: React.FC<{ label: string; color: string; hot?: boolean; delay: number }> = ({ label, color, hot, delay }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [delay, delay + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", borderRadius: 999, background: hot ? `${color}20` : "rgba(255,255,255,0.04)", border: `1px solid ${hot ? color : C.line}`, opacity: a, transform: `translateY(${(1 - a) * 14}px)`, boxShadow: hot ? `0 0 20px ${color}44` : "none" }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: color }} />
      <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: hot ? C.ink : C.soft }}>{label}</span>
    </div>
  );
};

// ===== H1 — Percepciones aisladas =====
const IsolatedShots: React.FC = () => {
  const frame = useCurrentFrame();
  const cards = [
    { x: 150, y: 150, rot: -8 },
    { x: 400, y: 90, rot: 5 },
    { x: 620, y: 170, rot: -4 },
  ];
  return (
    <div style={{ position: "relative", width: 760, height: 520 }}>
      {cards.map((c, i) => {
        const a = interpolate(frame, [14 + i * 12, 34 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
        const bob = Math.sin((frame + i * 40) * 0.05) * 6;
        return (
          <div key={i} style={{ position: "absolute", left: c.x, top: c.y + bob, transform: `translate(-50%,-50%) rotate(${c.rot}deg)`, opacity: a * 0.9, width: 190, height: 230, borderRadius: 18, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}`, padding: 14, boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}>
            <div style={{ width: "100%", height: 150, borderRadius: 12, background: `linear-gradient(160deg, ${C.line}, rgba(255,255,255,0.02))` }} />
            <div style={{ marginTop: 14, height: 12, width: "70%", borderRadius: 6, background: "rgba(255,255,255,0.12)" }} />
            {/* pin */}
            <div style={{ position: "absolute", top: -12, right: 18, width: 26, height: 26, borderRadius: "50% 50% 50% 2px", transform: "rotate(45deg)", background: C.warn }} />
          </div>
        );
      })}
      {/* signo de interrogación central */}
      <div style={{ position: "absolute", left: 380, top: 420, transform: "translate(-50%,-50%)", width: 110, height: 110, borderRadius: "50%", border: `2px solid ${C.soft}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 60, color: C.soft }}>?</span>
      </div>
    </div>
  );
};

// ===== H2 — Mapa de calor por temas =====
const HeatByTopic: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [10, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <HeatPanel w={460} h={400} cols={9} rows={8} reveal={reveal} />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", maxWidth: 620 }}>
        <Chip label="Agua" color={HEAT_HIGH} hot delay={60} />
        <Chip label="Seguridad" color={HEAT_MID} delay={72} />
        <Chip label="Empleo" color={HEAT_LOW} delay={84} />
        <Chip label="Movilidad" color={HEAT_LOW} delay={96} />
      </div>
    </div>
  );
};

// ===== H3 — No reemplaza el territorio =====
const MapVsTerritory: React.FC = () => {
  const frame = useCurrentFrame();
  const la = interpolate(frame, [14, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const ra = interpolate(frame, [26, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const warn = (1 + Math.sin(frame * 0.12)) / 2;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, width: 900 }}>
      <div style={{ flex: 1, opacity: la, transform: `translateX(${(1 - la) * -30}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <HeatPanel w={280} h={240} cols={7} rows={6} reveal={1} />
        <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: C.soft }}>Mapa de calor</span>
      </div>
      <div style={{ fontFamily: FONT, fontSize: 74, fontWeight: 900, color: C.warn, opacity: 0.5 + warn * 0.5, textShadow: `0 0 24px ${C.warn}66` }}>≠</div>
      <div style={{ flex: 1, opacity: ra, transform: `translateX(${(1 - ra) * 30}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 240, height: 240, borderRadius: 26, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 26px ${C.accent}22` }}>
          <svg width={120} height={120} viewBox="0 0 24 24" fill={C.accent}>
            <path d="M12 2C7.6 2 4 5.6 4 10c0 5.2 7 11.5 7.3 11.8.4.3 1 .3 1.4 0C13 21.5 20 15.2 20 10c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
          </svg>
        </div>
        <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: C.soft }}>Territorio</span>
      </div>
    </div>
  );
};

// ===== H4 — Señales -> Decisiones =====
const SignalsToDecisions: React.FC = () => {
  const frame = useCurrentFrame();
  const cx1 = 130;
  const cy = 240;
  const cx2 = 590;
  return (
    <div style={{ position: "relative", width: 720, height: 480 }}>
      {/* ondas de señal */}
      {[0, 1, 2].map((i) => {
        const t = loop(frame + i * 18, 54);
        return <div key={i} style={{ position: "absolute", left: cx1, top: cy, width: 60 + t * 180, height: 60 + t * 180, marginLeft: -(30 + t * 90), marginTop: -(30 + t * 90), borderRadius: "50%", border: `2px solid ${C.accent}`, opacity: (1 - t) * 0.5 }} />;
      })}
      <div style={{ position: "absolute", left: cx1, top: cy, transform: "translate(-50%,-50%)", width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${C.accent}, #2aa9a0)`, boxShadow: `0 0 30px ${C.accent}` }} />
      <div style={{ position: "absolute", left: cx1, top: cy + 90, transform: "translate(-50%,0)", fontFamily: FONT, fontSize: 28, fontWeight: 800, color: C.soft, letterSpacing: "0.16em" }}>SEÑALES</div>
      {/* paquetes viajando */}
      {[0, 1, 2, 3].map((i) => {
        const t = loop(frame + i * 20, 80);
        const x = lerp(cx1, cx2, t);
        return <div key={`p${i}`} style={{ position: "absolute", left: x, top: cy, width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: "50%", background: C.ink, opacity: 1 - Math.abs(t - 0.5) * 1.2, boxShadow: `0 0 12px ${C.accent}` }} />;
      })}
      {/* decisión (check/target) */}
      <div style={{ position: "absolute", left: cx2, top: cy, transform: "translate(-50%,-50%)", width: 120, height: 120, borderRadius: 28, background: "rgba(255,255,255,0.05)", border: `2px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 26px ${C.accent}44` }}>
        <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: cx2, top: cy + 90, transform: "translate(-50%,0)", fontFamily: FONT, fontSize: 28, fontWeight: 800, color: C.soft, letterSpacing: "0.16em" }}>DECISIONES</div>
    </div>
  );
};

// ===== H5 — Pregunta / encuesta =====
const PollQuestion: React.FC = () => {
  const frame = useCurrentFrame();
  const terr = interpolate(frame, [30, 80], [0, 0.82], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const impr = interpolate(frame, [30, 80], [0, 0.34], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const app = interpolate(frame, [10, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const Option = (label: string, v: number, color: string) => (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, marginBottom: 12 }}>
        <span style={{ fontSize: 34, fontWeight: 800, color: C.ink }}>{label}</span>
        <span style={{ fontSize: 34, fontWeight: 800, color }}>{Math.round(v * 100)}%</span>
      </div>
      <div style={{ height: 26, borderRadius: 13, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${v * 100}%`, borderRadius: 13, background: color, boxShadow: `0 0 18px ${color}66` }} />
      </div>
    </div>
  );
  return (
    <div style={{ width: 700, opacity: app, transform: `translateY(${(1 - app) * 24}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 34, justifyContent: "center" }}>
        <svg width={44} height={44} viewBox="0 0 24 24" fill={C.accent}><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4V5a1 1 0 0 1 1-1Z" /></svg>
        <span style={{ fontFamily: FONT, fontSize: 32, fontWeight: 800, color: C.soft, letterSpacing: "0.08em" }}>COMENTA</span>
      </div>
      {Option("Por territorio", terr, C.accent)}
      {Option("Por impresiones", impr, C.warn)}
    </div>
  );
};

export type TemaH = { id: string; titulo: string; durationInFrames: number; Clip: React.FC };
export const TEMAS_H: TemaH[] = [
  { id: "H1-Aislado", titulo: "Percepciones aisladas", durationInFrames: 300, Clip: wrap(IsolatedShots, "El Problema", "Recorrer no es entender", C.ink, 74) },
  { id: "H2-MapaCalor", titulo: "Mapa de calor por temas", durationInFrames: 300, Clip: wrap(HeatByTopic, "La Solución", "El mapa de calor", HEAT_HIGH, 82) },
  { id: "H3-NoReemplaza", titulo: "No reemplaza el territorio", durationInFrames: 300, Clip: wrap(MapVsTerritory, "¡Cuidado!", "No reemplaza el territorio", C.warn, 66) },
  { id: "H4-SenalesDecisiones", titulo: "Señales a decisiones", durationInFrames: 300, Clip: wrap(SignalsToDecisions, "La Clave", "Señales en decisiones", C.ink, 76) },
  { id: "H5-Pregunta", titulo: "Pregunta para comentarios", durationInFrames: 300, Clip: wrap(PollQuestion, "Tu Turno", "¿Territorio o impresiones?", C.accent, 66) },
];
