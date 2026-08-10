import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "../Campana/theme";
import { C, CleanBg, Frame, easeInOut, lerp, loop } from "./Clean";

const wrap = (Hero: React.FC, eyebrow: string, word: string, wordColor = C.ink, wordSize = 78): React.FC => {
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

const DoubleCheck: React.FC<{ c: string; s?: number; draw?: number }> = ({ c, s = 30, draw = 1 }) => (
  <svg width={s * 1.5} height={s} viewBox="0 0 36 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 13l5 5L18 7" strokeDasharray={28} strokeDashoffset={28 * (1 - draw)} />
    <path d="M13 18L24 7" strokeDasharray={16} strokeDashoffset={16 * (1 - draw)} />
  </svg>
);

// ---- Tarjeta comparativa reutilizable (balanceada) ----
const Row: React.FC<{ top: number; label: string; color: string; children: React.ReactNode; delay: number }> = ({ top, label, color, children, delay }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [delay, delay + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  return (
    <div style={{ position: "absolute", top, left: "50%", width: 700, marginLeft: -350, display: "flex", alignItems: "center", gap: 24, padding: "30px 34px", borderRadius: 26, background: "rgba(255,255,255,0.045)", border: `1px solid ${color}44`, boxShadow: `0 0 30px ${color}18`, opacity: a, transform: `translateX(${(1 - a) * 30}px)` }}>
      <div style={{ width: 66, height: 66, borderRadius: "50%", background: `${color}22`, border: `2px solid ${color}`, flexShrink: 0 }} />
      <span style={{ fontFamily: FONT, fontSize: 34, fontWeight: 800, color: C.ink, minWidth: 200 }}>{label}</span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>{children}</div>
    </div>
  );
};

// ===== L1 — Hook: tú tarde vs rival ya respondió =====
const HeroClock: React.FC = () => {
  const frame = useCurrentFrame();
  const spin = frame * 4;
  const dots = 1 + Math.floor(loop(frame, 45) * 3);
  return (
    <div style={{ position: "relative", width: 760, height: 520 }}>
      <Row top={80} label="Tú" color={C.warn} delay={20}>
        <svg width={40} height={40} viewBox="0 0 24 24" style={{ transform: `rotate(${spin}deg)` }}>
          <circle cx="12" cy="12" r="9" fill="none" stroke={C.warn} strokeWidth="3" strokeDasharray="14 40" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 900, color: C.warn, minWidth: 60, textAlign: "left" }}>{".".repeat(dots)}</span>
      </Row>
      <Row top={300} label="Contrincante" color={C.accent} delay={50}>
        <DoubleCheck c={C.accent} s={34} draw={interpolate(frame, [66, 86], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: C.soft }}>hace 2 h</span>
      </Row>
    </div>
  );
};

// ===== L2 — Medidor de velocidad =====
const HeroSpeed: React.FC = () => {
  const frame = useCurrentFrame();
  const R = 230;
  const cx = 300;
  const cy = 300;
  const sweep = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const needle = -135 + sweep * 270 * (0.85 + 0.15 * Math.sin(frame * 0.2));
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [cx + R * Math.cos((a * Math.PI) / 180), cy + R * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M${x0} ${y0} A${R} ${R} 0 ${large} 1 ${x1} ${y1}`;
  };
  return (
    <div style={{ position: "relative", width: 600, height: 480 }}>
      <svg width={600} height={480} viewBox="0 0 600 480" style={{ overflow: "visible" }}>
        <path d={arc(135, 405)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={22} strokeLinecap="round" />
        <path d={arc(135, 135 + 270 * sweep)} fill="none" stroke={C.accent} strokeWidth={22} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${C.accent})` }} />
        <g transform={`rotate(${needle} ${cx} ${cy})`}>
          <line x1={cx} y1={cy} x2={cx + R - 40} y2={cy} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        </g>
        <circle cx={cx} cy={cy} r={20} fill={C.ink} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 96, fontWeight: 900, color: C.accent, lineHeight: 1 }}>{Math.round(sweep * 100)}</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.soft, letterSpacing: "0.2em" }}>VELOCIDAD</div>
      </div>
    </div>
  );
};

// ===== L3 — Chat WhatsApp: pregunta -> respuesta en 0s =====
const HeroWhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  const cycle = 150;
  const t = loop(frame, cycle);
  // countdown 3..0 mientras "responde"
  const cd = Math.max(0, 3 - Math.floor(loop(frame, cycle) * 6));
  const qA = interpolate(t, [0.05, 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const rA = interpolate(t, [0.5, 0.65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  return (
    <div style={{ width: 620, borderRadius: 34, overflow: "hidden", background: "rgba(6,10,26,0.6)", border: `1px solid ${C.line}`, boxShadow: "0 30px 70px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 28px", background: "#0b7a5b" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
        <div style={{ fontFamily: FONT, color: "#fff", fontSize: 30, fontWeight: 700 }}>Ciudadano</div>
        <div style={{ marginLeft: "auto", fontFamily: FONT, color: "#eafff6", fontSize: 24 }}>en línea</div>
      </div>
      <div style={{ padding: "34px 28px", display: "flex", flexDirection: "column", gap: 20, minHeight: 300 }}>
        <div style={{ alignSelf: "flex-start", maxWidth: "80%", background: "rgba(255,255,255,0.10)", color: C.ink, fontFamily: FONT, fontSize: 32, fontWeight: 500, padding: "20px 26px", borderRadius: 22, borderBottomLeftRadius: 6, opacity: qA, transform: `translateY(${(1 - qA) * 16}px)` }}>¿Cuándo arreglan mi calle?</div>
        {rA > 0.01 ? (
          <div style={{ alignSelf: "flex-end", maxWidth: "80%", background: "#0b7a5b", color: "#fff", fontFamily: FONT, fontSize: 32, fontWeight: 500, padding: "20px 26px", borderRadius: 22, borderBottomRightRadius: 6, opacity: rA, transform: `translateY(${(1 - rA) * 16}px)` }}>
            Ya está en el plan. Te confirmo hoy. <span style={{ display: "inline-block", marginLeft: 6, verticalAlign: "middle" }}><DoubleCheck c="#bff3df" s={22} /></span>
          </div>
        ) : (
          <div style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderRadius: 999, background: "rgba(79,214,201,0.14)", border: `1px solid ${C.accent}` }}>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.accent }}>respondiendo… {cd}s</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== L4 — Confianza: auto-respuesta vs spot =====
const HeroTrust: React.FC = () => {
  const frame = useCurrentFrame();
  const bars = [
    { label: "Auto-respuesta", color: C.accent, target: 1, speed: [20, 70] as const },
    { label: "Spot", color: C.soft, target: 0.42, speed: [20, 110] as const },
  ];
  const H = 300;
  return (
    <div style={{ display: "flex", gap: 70, alignItems: "flex-end", height: 430 }}>
      {bars.map((b) => {
        const g = interpolate(frame, [b.speed[0], b.speed[1]], [0, b.target], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
        return (
          <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", width: 150, height: H, borderRadius: 18, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}`, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${g * 100}%`, background: `linear-gradient(180deg, ${b.color}, ${b.color}aa)`, boxShadow: `0 0 26px ${b.color}66` }} />
            </div>
            <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: C.ink }}>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ===== L5 — Lockup 24/7 WhatsApp =====
const HeroLockup: React.FC = () => {
  const frame = useCurrentFrame();
  const app = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const pulse = (1 + Math.sin(frame * 0.07)) / 2;
  const ringR = 150;
  const Circ = 2 * Math.PI * ringR;
  return (
    <div style={{ position: "relative", width: 460, height: 460, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={360} height={360} style={{ position: "absolute" }}>
        <circle cx={180} cy={180} r={ringR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
        <circle cx={180} cy={180} r={ringR} fill="none" stroke={C.accent} strokeWidth={10} strokeLinecap="round" strokeDasharray={Circ} strokeDashoffset={Circ * (1 - app)} transform="rotate(-90 180 180)" style={{ filter: `drop-shadow(0 0 10px ${C.accent})` }} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, transform: `scale(${lerp(0.85, 1, app)})`, opacity: app }}>
        <div style={{ width: 130, height: 130, borderRadius: 34, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${30 + pulse * 26}px #25D366aa` }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 66, color: "#fff" }}>✆</span>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 70, color: C.ink, letterSpacing: "0.02em" }}>24/7</div>
      </div>
    </div>
  );
};

export type TemaW = { id: string; titulo: string; durationInFrames: number; Clip: React.FC };
export const TEMAS_W: TemaW[] = [
  { id: "W1-Tarde", titulo: "Hook · llegaste tarde", durationInFrames: 300, Clip: wrap(HeroClock, "El Enganche", "Tu rival ya respondió", C.warn, 74) },
  { id: "W2-Velocidad", titulo: "La velocidad decide", durationInFrames: 300, Clip: wrap(HeroSpeed, "Velocidad", "La velocidad decide", C.ink, 78) },
  { id: "W3-CeroTiempo", titulo: "Cero tiempo muerto", durationInFrames: 300, Clip: wrap(HeroWhatsApp, "Automatización", "Cero tiempo muerto", C.accent, 78) },
  { id: "W4-Confianza", titulo: "Más que un spot", durationInFrames: 300, Clip: wrap(HeroTrust, "Por Qué Funciona", "Confianza al instante", C.ink, 76) },
  { id: "W5-Lockup", titulo: "Respuesta automática 24/7", durationInFrames: 300, Clip: wrap(HeroLockup, "Respuesta Automática", "24/7 por WhatsApp", C.accent, 72) },
];
