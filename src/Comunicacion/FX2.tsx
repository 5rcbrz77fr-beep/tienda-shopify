import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT } from "../Campana/theme";
import { SLOW } from "../Estrategia/FX";

const ie = (
  f: number,
  a: number,
  b: number,
  from: number,
  to: number,
) =>
  interpolate(f, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SLOW,
  });

const DoubleCheck: React.FC<{ c: string; s?: number; draw?: number }> = ({
  c,
  s = 30,
  draw = 1,
}) => (
  <svg width={s * 1.5} height={s} viewBox="0 0 36 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 13l5 5L18 7" strokeDasharray={28} strokeDashoffset={28 * (1 - draw)} />
    <path d="M13 18L24 7" strokeDasharray={16} strokeDashoffset={16 * (1 - draw)} />
  </svg>
);

// ============ C1 — Teléfono sonando + llamadas perdidas ============
export const PhoneRinging: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const shake = Math.sin(f * 0.7) * 2.4 * Math.max(0, appear);
  const missed = Math.min(9, Math.max(0, Math.floor((f - 30) / 12)));
  return (
    <div style={{ position: "relative", width: 620, height: 640, opacity: appear }}>
      {/* Ondas de sonido */}
      {[0, 1, 2].map((i) => {
        const t = ((f + i * 20) % 60) / 60;
        return (
          <div key={i} style={{ position: "absolute", left: 310, top: 320, width: 240 + t * 260, height: 240 + t * 260, marginLeft: -(120 + t * 130), marginTop: -(120 + t * 130), borderRadius: "50%", border: `2px solid ${COLORS.accent}`, opacity: (1 - t) * 0.4 }} />
        );
      })}
      {/* Teléfono */}
      <div style={{ position: "absolute", left: 310, top: 320, width: 300, height: 600, marginLeft: -150, marginTop: -300, transform: `rotate(${shake}deg)`, borderRadius: 46, background: "linear-gradient(160deg, #10193f, #070b1e)", border: "2px solid rgba(150,170,255,0.28)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "70px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <div style={{ width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.10)", border: `2px solid ${COLORS.accent}55` }} />
          <div style={{ fontFamily: FONT, color: COLORS.ink, fontSize: 40, fontWeight: 800 }}>Vecino</div>
          <div style={{ fontFamily: FONT, color: COLORS.inkSoft, fontSize: 26 }}>llamando…</div>
        </div>
        <div style={{ display: "flex", gap: 60 }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: COLORS.heatHigh, boxShadow: `0 0 24px ${COLORS.heatHigh}` }} />
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: "#0b7a5b", boxShadow: "0 0 24px #0b7a5b" }} />
        </div>
      </div>
      {/* Badge de perdidas */}
      <div style={{ position: "absolute", right: 30, top: 20, display: "flex", alignItems: "center", gap: 14, padding: "16px 26px", borderRadius: 999, background: `${COLORS.heatHigh}1f`, border: `2px solid ${COLORS.heatHigh}`, opacity: ie(f, 30, 46, 0, 1) }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: COLORS.heatHigh, boxShadow: `0 0 14px ${COLORS.heatHigh}` }} />
        <span style={{ fontFamily: FONT, color: COLORS.ink, fontSize: 34, fontWeight: 800 }}>{missed} sin responder</span>
      </div>
    </div>
  );
};

// ============ C2 — 20% vs 80% ============
export const SplitStat: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const grow = ie(f, 14, 70, 0, 1);
  const a = Math.round(grow * 20);
  const b = Math.round(grow * 80);
  const opacity = ie(f, 0, 12, 0, 1);
  return (
    <div style={{ width: 880, opacity }}>
      <div style={{ display: "flex", height: 90, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(150,170,255,0.2)" }}>
        <div style={{ width: `${grow * 20}%`, background: COLORS.accent, boxShadow: `0 0 24px ${COLORS.accent}88` }} />
        <div style={{ width: `${grow * 80}%`, background: COLORS.heatHigh, boxShadow: `0 0 24px ${COLORS.heatHigh}88` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 34, fontFamily: FONT }}>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 96, fontWeight: 900, color: COLORS.accent, lineHeight: 1 }}>{a}%</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: COLORS.inkSoft, marginTop: 6 }}>supo de ti</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 96, fontWeight: 900, color: COLORS.heatHigh, lineHeight: 1 }}>{b}%</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: COLORS.inkSoft, marginTop: 6 }}>sin respuesta</div>
        </div>
      </div>
    </div>
  );
};

// ============ C3 — Ficha de candidato armándose ============
export const ProfileCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const attrs = ["Humano", "Directo", "Amable", "Creíble"];
  return (
    <div style={{ width: 720, transform: `translateY(${interpolate(appear, [0, 1], [40, 0])}px)`, opacity: appear, borderRadius: 30, background: "rgba(8,14,34,0.72)", border: "1px solid rgba(150,170,255,0.22)", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", padding: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 34 }}>
        <div style={{ width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${COLORS.accent}, #0b7a5b)`, boxShadow: `0 0 34px ${COLORS.accent}66` }} />
        <div style={{ fontFamily: FONT }}>
          <div style={{ fontSize: 46, fontWeight: 900, color: COLORS.ink }}>El Candidato</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: COLORS.accent, letterSpacing: "0.1em" }}>PERFIL</div>
        </div>
      </div>
      {attrs.map((label, i) => {
        const g = ie(f, 24 + i * 16, 54 + i * 16, 0, 1);
        const done = g > 0.98;
        return (
          <div key={label} style={{ marginBottom: 22, opacity: ie(f, 20 + i * 16, 32 + i * 16, 0, 1) }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, marginBottom: 10 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: COLORS.ink }}>{label}</span>
              <span style={{ fontSize: 30, fontWeight: 800, color: done ? COLORS.accent : COLORS.inkSoft }}>{done ? "✓" : `${Math.round(g * 100)}%`}</span>
            </div>
            <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.08)" }}>
              <div style={{ height: "100%", width: `${g * 100}%`, borderRadius: 6, background: COLORS.accent, boxShadow: `0 0 14px ${COLORS.accent}77` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============ C4 — Territorio vs Redes ============
export const VersusFreq: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const left = spring({ frame: f, fps, config: { damping: 200 } });
  const right = spring({ frame: f - 14, fps, config: { damping: 200 } });
  const Panel = (title: string, big: string, sub: string, p: number, dir: number, color: string, glow: boolean) => (
    <div style={{ flex: 1, transform: `translateX(${(1 - p) * 40 * dir}px)`, opacity: p, borderRadius: 28, padding: "44px 30px", background: "rgba(255,255,255,0.05)", border: `1px solid ${color}66`, boxShadow: glow ? `0 0 40px ${color}44` : "none", textAlign: "center" }}>
      <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, letterSpacing: "0.2em", color: COLORS.inkSoft, textTransform: "uppercase" }}>{title}</div>
      <div style={{ fontFamily: FONT, fontSize: 100, fontWeight: 900, color, lineHeight: 1.1, textShadow: glow ? `0 0 30px ${color}66` : "none" }}>{big}</div>
      <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 600, color: COLORS.inkSoft }}>{sub}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, width: 900 }}>
      {Panel("Territorio", "1-2", "veces te ven", left, -1, COLORS.inkSoft, false)}
      <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 900, color: COLORS.ink, opacity: left }}>vs</div>
      {Panel("Redes", "24/7", "nunca dejan de verte", right, 1, COLORS.accent, true)}
    </div>
  );
};

// ============ C5 — Ecosistema (plataformas -> hub) ============
const Platform: React.FC<{ name: string; bg: string; glyph: React.ReactNode }> = ({ name, bg, glyph }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <div style={{ width: 96, height: 96, borderRadius: 26, background: bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 26px rgba(0,0,0,0.4)" }}>{glyph}</div>
    <span style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: COLORS.inkSoft }}>{name}</span>
  </div>
);

export const EcosystemHub: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const hub = spring({ frame: f, fps, config: { damping: 200, mass: 1.2 } });
  const W = 700;
  const cx = W / 2;
  const cy = 260;
  const items = [
    { name: "Facebook", bg: "#1877F2", glyph: <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: "#fff" }}>f</span>, pos: [cx - 260, cy - 150] },
    { name: "Instagram", bg: "linear-gradient(45deg,#f09433,#dc2743,#bc1888)", glyph: <div style={{ width: 44, height: 44, borderRadius: 12, border: "3px solid #fff" }} />, pos: [cx + 260, cy - 150] },
    { name: "TikTok", bg: "#111", glyph: <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 50, color: "#25F4EE" }}>♪</span>, pos: [cx - 260, cy + 150] },
    { name: "WhatsApp", bg: "#25D366", glyph: <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#fff" }}>✆</span>, pos: [cx + 260, cy + 150] },
  ];
  return (
    <div style={{ position: "relative", width: W, height: 560 }}>
      <svg width={W} height={560} style={{ position: "absolute", left: 0, top: 0 }}>
        {items.map((it, i) => {
          const g = ie(f, 20 + i * 8, 50 + i * 8, 0, 1);
          const x = it.pos[0];
          const y = it.pos[1];
          return <line key={i} x1={cx} y1={cy} x2={cx + (x - cx) * g} y2={cy + (y - cy) * g} stroke={COLORS.accent} strokeWidth={2} opacity={0.4} />;
        })}
      </svg>
      {/* Hub central */}
      <div style={{ position: "absolute", left: cx, top: cy, width: 180, height: 180, marginLeft: -90, marginTop: -90, borderRadius: "50%", transform: `scale(${hub})`, background: `radial-gradient(circle at 40% 35%, ${COLORS.accent}, #0b7a5b)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 60px ${COLORS.accent}88`, fontFamily: FONT }}>
        <span style={{ fontWeight: 900, fontSize: 64, color: "#04121a", lineHeight: 1 }}>1</span>
        <span style={{ fontWeight: 800, fontSize: 22, color: "#04121a", letterSpacing: "0.14em" }}>ECOSISTEMA</span>
      </div>
      {items.map((it, i) => {
        const g = ie(f, 26 + i * 8, 54 + i * 8, 0, 1);
        return (
          <div key={i} style={{ position: "absolute", left: it.pos[0], top: it.pos[1], marginLeft: -48, marginTop: -60, opacity: g, transform: `scale(${g})` }}>
            <Platform name={it.name} bg={it.bg} glyph={it.glyph} />
          </div>
        );
      })}
    </div>
  );
};

// ============ C6 — Segmentación por edad ============
export const AgeSegments: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const groups = [
    { label: "18-24", h: 0.55 },
    { label: "25-34", h: 1.0 },
    { label: "35-44", h: 0.78 },
    { label: "45-54", h: 0.6 },
    { label: "55+", h: 0.42 },
  ];
  const hi = 1; // resaltado
  const opacity = ie(f, 0, 12, 0, 1);
  return (
    <div style={{ display: "flex", gap: 22, alignItems: "flex-end", height: 380, opacity }}>
      {groups.map((g, i) => {
        const grow = ie(f, 20 + i * 8, 54 + i * 8, 0, g.h);
        const on = i === hi;
        const color = on ? COLORS.accent : COLORS.heatLow;
        return (
          <div key={g.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: 110, height: `${grow * 320}px`, borderRadius: 14, background: color, opacity: on ? 1 : 0.5, boxShadow: on ? `0 0 30px ${color}` : "none" }} />
            <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: on ? 800 : 600, color: on ? COLORS.ink : COLORS.inkSoft }}>{g.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ============ C7 — Cola de mensajes -> 0 (IA 24/7) ============
export const MessageQueue: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const rows = [0, 1, 2, 3];
  const pending = Math.max(0, 4 - Math.floor(Math.max(0, f - 30) / 16));
  return (
    <div style={{ width: 760, opacity: appear, transform: `translateY(${interpolate(appear, [0, 1], [40, 0])}px)` }}>
      {/* Badges superiores */}
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 28 }}>
        {["24/7", "IA"].map((b) => (
          <div key={b} style={{ padding: "12px 30px", borderRadius: 999, border: `2px solid ${COLORS.accent}`, background: `${COLORS.accent}14`, fontFamily: FONT, fontWeight: 800, fontSize: 32, color: COLORS.ink }}>{b}</div>
        ))}
      </div>
      {rows.map((i) => {
        const done = ie(f, 30 + i * 16, 46 + i * 16, 0, 1);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 26px", marginBottom: 16, borderRadius: 20, background: "rgba(255,255,255,0.05)", border: `1px solid ${done > 0.5 ? COLORS.accent + "66" : "rgba(150,170,255,0.14)"}` }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.10)" }} />
            <div style={{ flex: 1, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.12)" }} />
            <div style={{ width: 54, opacity: done }}>
              <DoubleCheck c={COLORS.accent} s={30} draw={done} />
            </div>
          </div>
        );
      })}
      <div style={{ textAlign: "center", marginTop: 20, fontFamily: FONT }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: COLORS.inkSoft }}>Sin responder: </span>
        <span style={{ fontSize: 56, fontWeight: 900, color: pending === 0 ? COLORS.accent : COLORS.heatHigh }}>{pending}</span>
      </div>
    </div>
  );
};

// ============ C8 — Mapa de calor + checklist (CRM) ============
export const HeatChecklist: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const items = ["Hasta dónde llegaste", "Qué prometiste", "A quién viste", "Qué hiciste"];
  // mini heat grid
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const i = r * 7 + c;
      const fx = 0.5 + 0.32 * Math.sin(f * 0.03);
      const fy = 0.5 + 0.3 * Math.cos(f * 0.024);
      const d = Math.hypot(c / 6 - fx, r / 6 - fy);
      const heat = Math.max(0, 1 - d * 1.7);
      const col = heat > 0.6 ? COLORS.heatHigh : heat > 0.3 ? COLORS.heatMid : COLORS.heatLow;
      const s = 12 + heat * 16;
      dots.push(<div key={i} style={{ position: "absolute", left: `${(c / 6) * 100}%`, top: `${(r / 6) * 100}%`, width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, borderRadius: "50%", background: col, opacity: 0.3 + heat * 0.6, boxShadow: heat > 0.5 ? `0 0 ${s}px ${col}` : "none" }} />);
    }
  }
  return (
    <div style={{ display: "flex", gap: 40, alignItems: "center", width: 920, opacity: appear, transform: `translateY(${interpolate(appear, [0, 1], [40, 0])}px)` }}>
      <div style={{ position: "relative", width: 360, height: 360, flexShrink: 0, borderRadius: 24, border: "1px solid rgba(150,170,255,0.18)", background: "rgba(8,14,34,0.5)", padding: 30 }}>
        <div style={{ position: "absolute", inset: 30 }}>{dots}</div>
      </div>
      <div style={{ flex: 1 }}>
        {items.map((it, i) => {
          const g = ie(f, 28 + i * 16, 48 + i * 16, 0, 1);
          return (
            <div key={it} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24, opacity: ie(f, 22 + i * 16, 36 + i * 16, 0, 1) }}>
              <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" stroke="rgba(150,170,255,0.3)" strokeWidth="1.6" />
                <path d="M7 12.5l3 3L17 8" strokeDasharray={22} strokeDashoffset={22 * (1 - g)} />
              </svg>
              <span style={{ fontFamily: FONT, fontSize: 38, fontWeight: 700, color: COLORS.ink }}>{it}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ C9 — Elegido -> Reelegido ============
export const ElectedBadge: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const seal = (label: string, d: number) => {
    const ring = spring({ frame: f - d, fps, config: { damping: 200 } });
    const check = ie(f, d + 14, d + 40, 0, 1);
    const R = 90;
    const C = 2 * Math.PI * (R - 8);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <svg width={180} height={180} viewBox="0 0 180 180">
          <circle cx={90} cy={90} r={R - 8} fill="none" stroke={COLORS.accent} strokeWidth={8} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - ring)} transform="rotate(-90 90 90)" style={{ filter: `drop-shadow(0 0 14px ${COLORS.accent})` }} />
          <path d="M56 92 L82 118 L128 66" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={120} strokeDashoffset={120 * (1 - check)} />
        </svg>
        <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 900, color: COLORS.ink, letterSpacing: "0.08em" }}>{label}</span>
      </div>
    );
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
      {seal("ELEGIDO", 0)}
      <div style={{ fontFamily: FONT, fontSize: 60, fontWeight: 900, color: COLORS.accent, opacity: ie(f, 40, 56, 0, 1) }}>→</div>
      {seal("REELEGIDO", 40)}
    </div>
  );
};
