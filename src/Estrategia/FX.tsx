import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, rand } from "../Campana/theme";

// Easing "slow-motion": arranque suave, desaceleración larga (tipo easeOutExpo).
export const SLOW = Easing.bezier(0.16, 1, 0.3, 1);

/** interpolate con clamp + easing lento por defecto. */
const ie = (
  frame: number,
  a: number,
  b: number,
  from: number,
  to: number,
  easing = SLOW,
) =>
  interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

// ---------- Iconos SVG ----------
const Heart: React.FC<{ c: string; s?: number }> = ({ c, s = 44 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21Z" />
  </svg>
);
const Chat: React.FC<{ c: string; s?: number }> = ({ c, s = 44 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4V5a1 1 0 0 1 1-1Z" />
  </svg>
);
const Share: React.FC<{ c: string; s?: number }> = ({ c, s = 44 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" fill={c} stroke="none" />
    <circle cx="6" cy="12" r="3" fill={c} stroke="none" />
    <circle cx="18" cy="19" r="3" fill={c} stroke="none" />
    <path d="M8.6 10.6l6.8-4M8.6 13.4l6.8 4" />
  </svg>
);
const Play: React.FC<{ c: string; s?: number }> = ({ c, s = 44 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M7 5l12 7-12 7V5Z" />
  </svg>
);
const Check: React.FC<{ c: string; s?: number; draw?: number }> = ({ c, s = 44, draw = 1 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7" strokeDasharray={30} strokeDashoffset={30 * (1 - draw)} />
  </svg>
);

// ============ 1) Red social orbitando un núcleo IA ============
export const SocialCore: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const core = spring({ frame: f, fps, config: { damping: 200, mass: 1.2 } });
  const nodes = [
    { Icon: Heart, c: COLORS.heatHigh },
    { Icon: Chat, c: COLORS.accent },
    { Icon: Share, c: COLORS.heatMid },
    { Icon: Play, c: COLORS.heatLow },
  ];
  const R = 210;
  return (
    <div style={{ position: "relative", width: 560, height: 560 }}>
      {/* Anillos */}
      {[1, 0.7].map((k) => (
        <div key={k} style={{ position: "absolute", left: 280 - R * k, top: 280 - R * k, width: R * 2 * k, height: R * 2 * k, borderRadius: "50%", border: `1px solid ${COLORS.line}`, opacity: core }} />
      ))}
      {/* Líneas + nodos */}
      {nodes.map((n, i) => {
        const baseA = (i / nodes.length) * Math.PI * 2;
        const a = baseA + f * 0.008;
        const appear = ie(f, 14 + i * 8, 44 + i * 8, 0, 1);
        const x = 280 + Math.cos(a) * R * appear;
        const y = 280 + Math.sin(a) * R * appear;
        return (
          <div key={i}>
            <svg style={{ position: "absolute", left: 0, top: 0 }} width={560} height={560}>
              <line x1={280} y1={280} x2={x} y2={y} stroke={n.c} strokeWidth={2} opacity={appear * 0.35} />
            </svg>
            <div style={{ position: "absolute", left: x, top: y, width: 88, height: 88, marginLeft: -44, marginTop: -44, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: `1px solid ${n.c}55`, display: "flex", alignItems: "center", justifyContent: "center", opacity: appear, boxShadow: `0 0 24px ${n.c}44`, transform: `scale(${appear})` }}>
              <n.Icon c={n.c} s={44} />
            </div>
          </div>
        );
      })}
      {/* Núcleo IA */}
      <div style={{ position: "absolute", left: 280, top: 280, width: 150, height: 150, marginLeft: -75, marginTop: -75, borderRadius: "50%", transform: `scale(${core})`, background: `radial-gradient(circle at 40% 35%, ${COLORS.accent}, #0b7a5b)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 60px ${COLORS.accent}88`, fontFamily: FONT, fontWeight: 900, fontSize: 54, color: "#04121a", letterSpacing: "-0.02em" }}>
        IA
      </div>
    </div>
  );
};

// ============ 2) Contador de votos (mensajes → votos) ============
export const VoteCounter: React.FC<{ delay?: number; target?: number }> = ({ delay = 0, target = 1240 }) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const prog = ie(f, 10, 80, 0, 1);
  const value = Math.round(prog * target);
  const opacity = ie(f, 0, 12, 0, 1);
  const nf = new Intl.NumberFormat("es");
  return (
    <div style={{ opacity, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Chips mensaje -> voto */}
      <div style={{ display: "flex", gap: 18, marginBottom: 34 }}>
        {[0, 1, 2, 3].map((i) => {
          const a = ie(f, 20 + i * 12, 44 + i * 12, 0, 1);
          const converted = a > 0.55;
          const c = converted ? COLORS.accent : COLORS.inkSoft;
          return (
            <div key={i} style={{ width: 92, height: 92, borderRadius: 22, background: "rgba(255,255,255,0.06)", border: `1px solid ${c}55`, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - a) * 24}px) scale(${0.9 + a * 0.1})`, opacity: a, boxShadow: converted ? `0 0 22px ${COLORS.accent}55` : "none" }}>
              {converted ? <Check c={COLORS.accent} s={44} draw={ie(f, 30 + i * 12, 48 + i * 12, 0, 1)} /> : <Chat c={COLORS.inkSoft} s={40} />}
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color: COLORS.ink, lineHeight: 1, letterSpacing: "-0.03em", textShadow: `0 0 44px ${COLORS.accent}55` }}>
        {nf.format(value)}
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: COLORS.accent, letterSpacing: "0.34em", marginTop: 10 }}>
        VOTOS
      </div>
    </div>
  );
};

// ============ 3) Embudo con partículas (cuello de botella) ============
export const Funnel: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const W = 440;
  const H = 420;
  return (
    <div style={{ position: "relative", width: W, height: H, opacity: appear, transform: `scale(${interpolate(appear, [0, 1], [0.86, 1])})` }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={COLORS.accent} stopOpacity="0.35" />
            <stop offset="1" stopColor={COLORS.heatHigh} stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path d={`M40 30 L${W - 40} 30 L${W / 2 + 34} ${H - 120} L${W / 2 + 34} ${H - 20} L${W / 2 - 34} ${H - 20} L${W / 2 - 34} ${H - 120} Z`} fill="url(#fg)" stroke={COLORS.line} strokeWidth={2} />
      </svg>
      {/* Partículas atascándose en el cuello */}
      {Array.from({ length: 22 }, (_, i) => {
        const speed = 60 + rand(i) * 40;
        const t = ((f + rand(i + 20) * speed) % speed) / speed; // 0..1 baja
        const jam = Math.min(1, t * 1.6);
        const x = W / 2 + (rand(i) - 0.5) * (W - 120) * (1 - jam);
        const y = 40 + t * (H - 90);
        const c = jam > 0.7 ? COLORS.heatHigh : COLORS.accent;
        const s = 12;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, marginLeft: -s / 2, borderRadius: "50%", background: c, opacity: 0.5 + jam * 0.5, boxShadow: `0 0 10px ${c}` }} />;
      })}
    </div>
  );
};

export const YearBadge: React.FC<{ delay?: number; year?: string }> = ({ delay = 0, year = "2026" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: "18px 38px", borderRadius: 999, border: `2px solid ${COLORS.accent}`, background: `${COLORS.accent}14`, opacity: p, transform: `translateY(${(1 - p) * 24}px)`, boxShadow: `0 0 40px ${COLORS.accent}44` }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS.accent, boxShadow: `0 0 16px ${COLORS.accent}` }} />
      <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: COLORS.ink, letterSpacing: "0.06em" }}>{year}</span>
    </div>
  );
};

// ============ 4) IA + CRM (núcleo con datos fluyendo) ============
export const IaCrm: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const left = spring({ frame: f, fps, config: { damping: 200 } });
  const right = spring({ frame: f - 12, fps, config: { damping: 200 } });
  const line = ie(f, 24, 54, 0, 1);
  const Pill = (label: string, sub: string, p: number, dir: number, color: string) => (
    <div style={{ transform: `translateX(${(1 - p) * 40 * dir}px)`, opacity: p, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "30px 40px", borderRadius: 28, background: "rgba(255,255,255,0.06)", border: `1px solid ${color}66`, boxShadow: `0 0 34px ${color}33`, minWidth: 200 }}>
      <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 62, color, letterSpacing: "-0.02em" }}>{label}</span>
      <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 26, color: COLORS.inkSoft }}>{sub}</span>
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
      {Pill("IA", "inteligencia", left, -1, COLORS.accent)}
      <div style={{ position: "relative", width: 150, height: 40 }}>
        <div style={{ position: "absolute", top: 19, left: 0, height: 3, width: `${line * 100}%`, background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.heatMid})` }} />
        {line > 0.9 &&
          [0, 1, 2].map((i) => {
            const t = ((f + i * 20) % 60) / 60;
            return <div key={i} style={{ position: "absolute", top: 12, left: `${t * 100}%`, width: 16, height: 16, borderRadius: "50%", background: COLORS.ink, boxShadow: `0 0 12px ${COLORS.accent}`, opacity: 1 - Math.abs(t - 0.5) }} />;
          })}
      </div>
      {Pill("CRM", "tu campaña", right, 1, COLORS.heatMid)}
    </div>
  );
};

// ============ 5) Dashboard "cuarto de guerra" ============
const MiniBars: React.FC<{ f: number; color: string }> = ({ f, color }) => (
  <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 90 }}>
    {[0.5, 0.8, 0.4, 1, 0.65].map((h, i) => {
      const g = ie(f, 30 + i * 6, 60 + i * 6, 0, h);
      return <div key={i} style={{ width: 20, height: `${g * 100}%`, borderRadius: 5, background: color, boxShadow: `0 0 10px ${color}66` }} />;
    })}
  </div>
);
const MiniFunnel: React.FC<{ f: number; color: string }> = ({ f, color }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "center", height: 90, justifyContent: "center" }}>
    {[1, 0.72, 0.44].map((w, i) => {
      const g = ie(f, 30 + i * 8, 58 + i * 8, 0, 1);
      return <div key={i} style={{ width: `${w * 100 * g}%`, height: 20, borderRadius: 5, background: color, opacity: 0.6 + i * 0.15 }} />;
    })}
  </div>
);
const MiniCheck: React.FC<{ f: number; color: string }> = ({ f, color }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, height: 90, justifyContent: "center" }}>
    {[0, 1, 2].map((i) => {
      const g = ie(f, 34 + i * 10, 54 + i * 10, 0, 1);
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: g }}>
          <Check c={color} s={26} draw={g} />
          <div style={{ height: 8, width: 90 * g, borderRadius: 4, background: "rgba(255,255,255,0.16)" }} />
        </div>
      );
    })}
  </div>
);

export const Dashboard: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const panels = [
    { title: "Embudo", node: <MiniFunnel f={f} color={COLORS.accent} /> },
    { title: "Transición", node: <MiniBars f={f} color={COLORS.heatMid} /> },
    { title: "Trabajo de campo", node: <MiniCheck f={f} color={COLORS.heatHigh} /> },
  ];
  return (
    <div style={{ width: 860, transform: `translateY(${interpolate(appear, [0, 1], [50, 0])}px)`, opacity: appear, borderRadius: 30, overflow: "hidden", background: "rgba(8,14,34,0.72)", border: "1px solid rgba(150,170,255,0.22)", boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}>
      {/* Barra superior tipo ventana */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 28px", borderBottom: "1px solid rgba(150,170,255,0.16)" }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS.heatHigh }} />
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS.heatMid }} />
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS.accent }} />
        <span style={{ marginLeft: 14, fontFamily: FONT, fontWeight: 700, fontSize: 28, color: COLORS.inkSoft, letterSpacing: "0.16em" }}>CUARTO DE GUERRA</span>
      </div>
      <div style={{ display: "flex", gap: 20, padding: 26 }}>
        {panels.map((p, i) => {
          const pa = ie(f, 14 + i * 10, 40 + i * 10, 0, 1);
          return (
            <div key={i} style={{ flex: 1, opacity: pa, transform: `translateY(${(1 - pa) * 20}px)`, background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(150,170,255,0.14)", padding: 22 }}>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 26, color: COLORS.ink, marginBottom: 16 }}>{p.title}</div>
              {p.node}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ 6) Teaser mapa de calor (cliffhanger) ============
export const HeatTeaser: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const i = r * 8 + c;
      const fx = 0.5 + 0.3 * Math.sin(f * 0.02);
      const fy = 0.5 + 0.3 * Math.cos(f * 0.017);
      const d = Math.hypot(c / 7 - fx, r / 7 - fy);
      const heat = Math.max(0, 1 - d * 1.8);
      const col = heat > 0.6 ? COLORS.heatHigh : heat > 0.3 ? COLORS.heatMid : COLORS.heatLow;
      const s = 14 + heat * 20;
      dots.push(<div key={i} style={{ position: "absolute", left: `${(c / 7) * 100}%`, top: `${(r / 7) * 100}%`, width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, borderRadius: "50%", background: col, opacity: 0.3 + heat * 0.6, boxShadow: heat > 0.5 ? `0 0 ${s}px ${col}` : "none" }} />);
    }
  }
  const dots3 = ((Math.max(0, f) % 45) / 45) * 3;
  return (
    <div style={{ position: "relative", width: 460, height: 460, opacity: appear, transform: `scale(${interpolate(appear, [0, 1], [0.86, 1])})` }}>
      <div style={{ position: "absolute", inset: 30, filter: "blur(2px)" }}>{dots}</div>
      {/* Candado / próximamente */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "radial-gradient(circle at 50% 50%, rgba(5,6,15,0.35), rgba(5,6,15,0.75))" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: COLORS.ink, letterSpacing: "0.1em", textShadow: `0 0 30px ${COLORS.heatHigh}66` }}>
          {".".repeat(1 + Math.floor(dots3))}
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: COLORS.accent, letterSpacing: "0.3em" }}>PRÓXIMAMENTE</div>
      </div>
    </div>
  );
};
