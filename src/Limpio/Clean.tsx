import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "../Campana/theme";

// Paleta limpia y sobria (más premium, menos ruido)
export const C = {
  bgTop: "#0b1020",
  bgMid: "#0e1530",
  bgBot: "#070a16",
  ink: "#f4f7ff",
  soft: "#93a0c8",
  accent: "#4fd6c9",
  accentDeep: "#2aa9a0",
  warn: "#ff5a72",
  line: "rgba(140,160,220,0.10)",
};

// Fondo calmado: gradiente + glow central + viñeta. Sin puntos de colores.
export const CleanBg: React.FC = () => {
  const frame = useCurrentFrame();
  const breathe = (1 + Math.sin(frame * 0.03)) / 2;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bgTop} 0%, ${C.bgMid} 52%, ${C.bgBot} 100%)` }} />
      {/* Glow central suave que respira */}
      <AbsoluteFill style={{ background: `radial-gradient(46% 30% at 50% 44%, ${C.accent}22, transparent 70%)`, opacity: 0.6 + breathe * 0.4 }} />
      {/* Rejilla fina y discreta */}
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "120px 120px", maskImage: "radial-gradient(70% 60% at 50% 45%, #000 40%, transparent 85%)", WebkitMaskImage: "radial-gradient(70% 60% at 50% 45%, #000 40%, transparent 85%)", opacity: 0.5 }} />
      {/* Viñeta */}
      <AbsoluteFill style={{ background: "radial-gradient(75% 60% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// Marco con zonas balanceadas: eyebrow arriba, héroe al centro óptico, palabra abajo.
export const Frame: React.FC<{
  eyebrow: string;
  word: string;
  wordColor?: string;
  wordSize?: number;
  children: React.ReactNode;
}> = ({ eyebrow, word, wordColor = C.ink, wordSize = 78, children }) => {
  const frame = useCurrentFrame();
  const ea = interpolate(frame, [6, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wa = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wy = interpolate(frame, [40, 60], [22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {/* Eyebrow */}
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: ea }}>
        <div style={{ width: 40, height: 2, background: C.accent }} />
        <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, letterSpacing: "0.36em", textTransform: "uppercase", color: C.accent }}>{eyebrow}</span>
        <div style={{ width: 40, height: 2, background: C.accent }} />
      </div>
      {/* Héroe centrado (centro óptico ~ 47% de altura) */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top: -120 }}>
        {children}
      </AbsoluteFill>
      {/* Palabra abajo, con ancla */}
      <div style={{ position: "absolute", bottom: 320, left: 0, right: 0, textAlign: "center", opacity: wa, transform: `translateY(${wy}px)` }}>
        <div style={{ width: 60, height: 3, background: wordColor, margin: "0 auto 30px", borderRadius: 2, opacity: 0.8 }} />
        <div style={{ fontFamily: FONT, fontSize: wordSize, fontWeight: 800, letterSpacing: "-0.01em", color: wordColor, maxWidth: 900, margin: "0 auto", lineHeight: 1.06, padding: "0 40px" }}>{word}</div>
      </div>
    </AbsoluteFill>
  );
};

export const loop = (f: number, p: number) => (((f % p) + p) / p) % 1;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// HÉROE: clasificador limpio y simétrico (entrada -> IA -> 3 destinos).
const SortingClean: React.FC = () => {
  const frame = useCurrentFrame();
  // dimensiones del héroe (600 de ancho, centrado)
  const cx = 0; // relativo al centro del contenedor
  const inboxY = -300;
  const coreY = -40;
  const destY = 250;
  const destX = [-210, 0, 210];
  const cols = [C.accent, "#f2b64d", C.warn];
  const ring = frame * 1.4;
  const corePulse = (1 + Math.sin(frame * 0.08)) / 2;

  // 6 paquetes en flujo continuo y suave
  const N = 6;
  const period = 150;
  const packets = Array.from({ length: N }, (_, i) => {
    const t = loop(frame + (i / N) * period, period);
    const lane = i % 3;
    let x = cx;
    let y = inboxY;
    let op = 1;
    let scale = 1;
    if (t < 0.45) {
      const k = easeInOut(t / 0.45);
      y = lerp(inboxY, coreY, k);
    } else if (t < 0.9) {
      const k = easeInOut((t - 0.45) / 0.45);
      x = lerp(cx, destX[lane], k);
      y = lerp(coreY, destY, k);
    } else {
      op = interpolate(t, [0.9, 1], [1, 0]);
      x = destX[lane];
      y = destY;
      scale = 1 + (t - 0.9) * 4;
    }
    return { x, y, op, scale, c: cols[lane], key: i };
  });

  return (
    <div style={{ position: "relative", width: 600, height: 640 }}>
      {/* Guías sutiles */}
      <svg width={600} height={640} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <g transform="translate(300,320)">
          {destX.map((dx, i) => (
            <line key={i} x1={0} y1={coreY} x2={dx} y2={destY} stroke={cols[i]} strokeWidth={2} opacity={0.18} />
          ))}
          <line x1={0} y1={inboxY} x2={0} y2={coreY} stroke={C.line} strokeWidth={2} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 300, top: 320 }}>
        {/* Entrada */}
        <div style={{ position: "absolute", left: inboxY * 0 + cx, top: inboxY, transform: "translate(-50%,-50%)", padding: "16px 34px", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}`, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.soft, whiteSpace: "nowrap" }}>Entrada</div>

        {/* Núcleo IA */}
        <div style={{ position: "absolute", left: cx, top: coreY, transform: "translate(-50%,-50%)" }}>
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 150, height: 150, marginLeft: -75, marginTop: -75, borderRadius: "50%", border: `2px dashed ${C.accent}`, transform: `rotate(${ring}deg)`, opacity: 0.7 }} />
          <div style={{ width: 108, height: 108, marginLeft: -54, marginTop: -54, position: "absolute", left: "50%", top: "50%", borderRadius: "50%", background: `radial-gradient(circle at 42% 38%, ${C.accent}, ${C.accentDeep})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#04141a", boxShadow: `0 0 ${28 + corePulse * 26}px ${C.accent}aa` }}>IA</div>
        </div>

        {/* Destinos */}
        {destX.map((dx, i) => {
          const p = (1 + Math.sin(frame * 0.09 + i * 1.3)) / 2;
          return (
            <div key={i} style={{ position: "absolute", left: dx, top: destY, transform: "translate(-50%,-50%)", width: 118, height: 118, marginLeft: 0, borderRadius: 26, border: `2px solid ${cols[i]}`, background: `${cols[i]}14`, boxShadow: `0 0 ${14 + p * 20}px ${cols[i]}44` }} />
          );
        })}

        {/* Paquetes */}
        {packets.map((pk) => (
          <div key={pk.key} style={{ position: "absolute", left: pk.x, top: pk.y, width: 24, height: 24, marginLeft: -12, marginTop: -12, borderRadius: "50% 50% 50% 5px", background: pk.c, opacity: pk.op, transform: `scale(${pk.scale})`, boxShadow: `0 0 14px ${pk.c}` }} />
        ))}
      </div>
    </div>
  );
};

export const CleanSorting: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fade = interpolate(frame, [0, 18, durationInFrames - 18, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <CleanBg />
      <AbsoluteFill style={{ opacity: fade }}>
        <Frame eyebrow="La Solución" word="Clasifica cada mensaje" wordColor={C.ink}>
          <SortingClean />
        </Frame>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
