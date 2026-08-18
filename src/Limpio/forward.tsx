import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "../Campana/theme";
import { C, CleanBg, Frame, easeInOut, lerp, loop } from "./Clean";

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

const Pill: React.FC<{ label: string; color: string; big?: boolean }> = ({ label, color, big }) => (
  <div
    style={{
      padding: big ? "26px 40px" : "20px 32px",
      borderRadius: 20,
      background: `${color}16`,
      border: `2px solid ${color}`,
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: big ? 38 : 32,
      color: C.ink,
      whiteSpace: "nowrap",
      boxShadow: `0 0 24px ${color}22`,
    }}
  >
    {label}
  </div>
);

// ===== 1 — Consejo: exigí "forward deploy" al contratar =====
const HeroAdvice: React.FC = () => {
  const frame = useCurrentFrame();
  const items = ["Soporte", "Integraciones", "Forward Deploy", "Reportes"];
  const highlight = 2;
  const check = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        width: 640,
        borderRadius: 30,
        background: "rgba(6,10,26,0.6)",
        border: `1px solid ${C.line}`,
        boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "26px 34px", background: "rgba(255,255,255,0.05)", fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.soft, letterSpacing: "0.04em" }}>
        Checklist del CRM
      </div>
      <div style={{ padding: "16px 34px 30px", display: "flex", flexDirection: "column", gap: 18 }}>
        {items.map((it, i) => {
          const a = interpolate(frame, [16 + i * 12, 40 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
          const isH = i === highlight;
          return (
            <div key={it} style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 22px", borderRadius: 16, background: isH ? `${C.accent}14` : "transparent", border: isH ? `2px solid ${C.accent}` : `1px solid ${C.line}`, opacity: a, transform: `translateX(${(1 - a) * 24}px)` }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, border: `2px solid ${isH ? C.accent : C.soft}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isH ? (
                  <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4 4L19 7" strokeDasharray={30} strokeDashoffset={30 * (1 - check)} />
                  </svg>
                ) : null}
              </div>
              <span style={{ fontFamily: FONT, fontSize: 34, fontWeight: isH ? 900 : 600, color: isH ? C.ink : C.soft }}>{it}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===== 2 — El giro: el CRM se adapta a VOS (no al revés) =====
const HeroFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const cycle = 170;
  const t = loop(frame, cycle);
  const wrongPhase = t < 0.42; // primero muestra lo incorrecto
  const flip = interpolate(t, [0.42, 0.58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  // arrow direction: wrong = empresa->crm (derecha); right = crm->empresa (izquierda)
  const dir = flip; // 0 = derecha, 1 = izquierda
  const headX = lerp(1, 0, dir); // 1 apunta derecha
  const col = wrongPhase ? C.warn : C.accent;
  return (
    <div style={{ position: "relative", width: 780, height: 360 }}>
      <div style={{ position: "absolute", left: 0, top: 120, display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", padding: "0 10px" }}>
        <Pill label="TU EMPRESA" color={C.accent} big />
        <div style={{ flex: 1, position: "relative", height: 80, margin: "0 26px" }}>
          <svg width="100%" height="80" viewBox="0 0 360 80" preserveAspectRatio="none" style={{ overflow: "visible" }}>
            <line x1={20} y1={40} x2={340} y2={40} stroke={col} strokeWidth={5} strokeLinecap="round" />
            {/* cabeza que apunta según fase */}
            <polygon
              points={headX > 0.5 ? "340,40 314,26 314,54" : "20,40 46,26 46,54"}
              fill={col}
            />
          </svg>
          <div style={{ position: "absolute", left: "50%", top: -6, transform: "translateX(-50%)", fontFamily: FONT, fontWeight: 800, fontSize: 26, color: col, whiteSpace: "nowrap" }}>
            {wrongPhase ? "te adaptás vos ✗" : "se adapta a vos ✓"}
          </div>
        </div>
        <Pill label="IA / CRM" color={wrongPhase ? C.warn : "#f2b64d"} big />
      </div>
    </div>
  );
};

// ===== 3 — Diagnóstico de tu "dolencia" =====
const HeroDiagnostico: React.FC = () => {
  const frame = useCurrentFrame();
  const w = 560;
  const sweep = loop(frame, 90);
  const scanX = lerp(40, w - 40, sweep);
  const painFound = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const painPulse = (1 + Math.sin(frame * 0.2)) / 2;
  // ECG path
  const pts: number[][] = [];
  for (let i = 0; i <= 80; i++) {
    const x = 40 + (i / 80) * (w - 80);
    let y = 250;
    const seg = i % 20;
    if (seg === 8) y = 190;
    else if (seg === 10) y = 320;
    else if (seg === 12) y = 250;
    pts.push([x, y]);
  }
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
  return (
    <div style={{ position: "relative", width: w, height: 460 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 28, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.line}` }} />
      {/* icono empresa */}
      <div style={{ position: "absolute", left: 30, top: 30, fontFamily: FONT, fontSize: 28, fontWeight: 800, color: C.soft }}>Tu negocio</div>
      <svg width={w} height={460} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={d} fill="none" stroke={`${C.accent}66`} strokeWidth={3} />
        {/* barra de escaneo */}
        <line x1={scanX} y1={60} x2={scanX} y2={400} stroke={C.accent} strokeWidth={3} opacity={0.5} style={{ filter: `drop-shadow(0 0 10px ${C.accent})` }} />
        {/* punto de dolencia */}
        <circle cx={w * 0.62} cy={250} r={10 + painPulse * 6} fill={C.warn} opacity={painFound} />
        {painFound > 0.4 && (
          <g opacity={painFound} stroke={C.warn} strokeWidth={3} fill="none">
            <circle cx={w * 0.62} cy={250} r={40} />
            <line x1={w * 0.62 - 56} y1={250} x2={w * 0.62 - 40} y2={250} />
            <line x1={w * 0.62 + 40} y1={250} x2={w * 0.62 + 56} y2={250} />
          </g>
        )}
      </svg>
      {painFound > 0.5 && (
        <div style={{ position: "absolute", left: "50%", bottom: 26, transform: "translateX(-50%)", fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.warn, opacity: painFound }}>
          dolencia detectada
        </div>
      )}
    </div>
  );
};

// ===== 4 — Construido a tu medida: se llenan las citas =====
const HeroBuild: React.FC = () => {
  const frame = useCurrentFrame();
  const cols = 4;
  const rows = 3;
  const cell = 118;
  const gap = 18;
  const gw = cols * cell + (cols - 1) * gap;
  const gh = rows * cell + (rows - 1) * gap;
  return (
    <div style={{ position: "relative", width: gw, height: gh + 70 }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.soft, marginBottom: 24, textAlign: "center" }}>Tu agenda</div>
      <div style={{ position: "relative", width: gw, height: gh, margin: "0 auto" }}>
        {Array.from({ length: cols * rows }, (_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const on = interpolate(frame, [20 + i * 8, 40 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
          const filled = on > 0.5;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: c * (cell + gap),
                top: r * (cell + gap),
                width: cell,
                height: cell,
                borderRadius: 16,
                background: filled ? `${C.accent}22` : "rgba(255,255,255,0.04)",
                border: `2px solid ${filled ? C.accent : C.line}`,
                boxShadow: filled ? `0 0 18px ${C.accent}33` : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {filled && (
                <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: on }}>
                  <path d="M6 12.5l4 4L18 7" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===== 5 — El núcleo es tu cliente (IA = motor alrededor) =====
const HeroClientCore: React.FC = () => {
  const frame = useCurrentFrame();
  const R = 205;
  const cx = 300;
  const cy = 300;
  const ring = frame * 0.5;
  const beat = 1 + Math.sin(frame * 0.16) * 0.05;
  const gears = ["IA", "CRM", "Datos", "Auto"];
  const appear = interpolate(frame, [10, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  return (
    <div style={{ position: "relative", width: 600, height: 600 }}>
      <svg width={600} height={600} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.line} strokeWidth={2} strokeDasharray="4 10" />
        {gears.map((_, i) => {
          const a = (i / gears.length) * Math.PI * 2 - Math.PI / 2 + (ring * Math.PI) / 180;
          const x = cx + R * Math.cos(a);
          const y = cy + R * Math.sin(a);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.accent} strokeWidth={2} opacity={0.18} />;
        })}
      </svg>
      {/* núcleo = cliente */}
      <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%,-50%) scale(${beat})` }}>
        <div style={{ width: 170, height: 170, marginLeft: -85, marginTop: -85, position: "absolute", borderRadius: "50%", background: `radial-gradient(circle at 42% 38%, ${C.warn}, #b83048)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${C.warn}88` }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#fff", lineHeight: 1 }}>♥</span>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: "#ffe1e7", marginTop: 4 }}>Tu cliente</span>
        </div>
      </div>
      {/* engranajes IA orbitando */}
      {gears.map((g, i) => {
        const a = (i / gears.length) * Math.PI * 2 - Math.PI / 2 + (ring * Math.PI) / 180;
        const x = cx + R * Math.cos(a);
        const y = cy + R * Math.sin(a);
        return (
          <div key={g} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${appear})`, opacity: appear }}>
            <div style={{ width: 92, height: 92, borderRadius: "50%", background: `${C.accent}16`, border: `2px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.accent }}>{g}</div>
          </div>
        );
      })}
    </div>
  );
};

// ===== 6 — Cierre: diseñado para vos =====
const HeroClose: React.FC = () => {
  const frame = useCurrentFrame();
  const app = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const pulse = (1 + Math.sin(frame * 0.07)) / 2;
  const ringR = 160;
  const Circ = 2 * Math.PI * ringR;
  return (
    <div style={{ position: "relative", width: 460, height: 460, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={380} height={380} style={{ position: "absolute" }}>
        <circle cx={190} cy={190} r={ringR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
        <circle cx={190} cy={190} r={ringR} fill="none" stroke={C.accent} strokeWidth={10} strokeLinecap="round" strokeDasharray={Circ} strokeDashoffset={Circ * (1 - app)} transform="rotate(-90 190 190)" style={{ filter: `drop-shadow(0 0 10px ${C.accent})` }} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, transform: `scale(${lerp(0.85, 1, app)})`, opacity: app }}>
        <div style={{ width: 150, height: 150, borderRadius: "50%", background: `radial-gradient(circle at 42% 38%, ${C.accent}, ${C.accentDeep})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${30 + pulse * 28}px ${C.accent}aa` }}>
          {/* diana */}
          <svg width={90} height={90} viewBox="0 0 24 24" fill="none" stroke="#04141a" strokeWidth="2.4">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1.4" fill="#04141a" />
          </svg>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.ink }}>Forward deploy</div>
      </div>
    </div>
  );
};

export type TemaFd = { id: string; titulo: string; durationInFrames: number; Clip: React.FC };
export const TEMAS_FD: TemaFd[] = [
  { id: "F1-Consejo", titulo: "Exigí forward deploy", durationInFrames: 300, Clip: wrap(HeroAdvice, "El Consejo", "Exigí forward deploy", C.accent, 76) },
  { id: "F2-Giro", titulo: "El CRM se adapta a vos", durationInFrames: 300, Clip: wrap(HeroFlip, "Forward Deploy", "El CRM se adapta a vos", C.ink, 74) },
  { id: "F3-Diagnostico", titulo: "Primero, un diagnóstico", durationInFrames: 300, Clip: wrap(HeroDiagnostico, "Diagnóstico", "Primero, tu dolencia", C.warn, 74) },
  { id: "F4-Medida", titulo: "Construido a tu medida", durationInFrames: 300, Clip: wrap(HeroBuild, "A Tu Medida", "Más citas, más recurrencia", C.accent, 72) },
  { id: "F5-Cliente", titulo: "El núcleo es tu cliente", durationInFrames: 300, Clip: wrap(HeroClientCore, "El Núcleo", "El centro es tu cliente", C.warn, 74) },
  { id: "F6-Cierre", titulo: "Diseñado para vos", durationInFrames: 300, Clip: wrap(HeroClose, "El Cierre", "Diseñado para vos, no para ellos", C.accent, 64) },
];
