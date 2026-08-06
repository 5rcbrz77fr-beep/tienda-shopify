import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, rand } from "../Campana/theme";
import { SLOW } from "../Estrategia/FX";

const ie = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SLOW,
  });

const Pill: React.FC<{ text: string; color: string; o?: number }> = ({ text, color, o = 1 }) => (
  <div style={{ padding: "10px 22px", borderRadius: 999, border: `1px solid ${color}`, background: `${color}18`, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: COLORS.ink, opacity: o, whiteSpace: "nowrap" }}>{text}</div>
);

// ============ D1 — Comunicación dispersa ============
export const ScatterChannels: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const W = 760;
  const H = 520;
  const channels = [
    { name: "Comentarios", x: 120, y: 70 },
    { name: "Mensajes", x: W - 120, y: 70 },
    { name: "Solicitudes", x: 120, y: H - 60 },
    { name: "Preguntas", x: W - 120, y: H - 60 },
  ];
  return (
    <div style={{ position: "relative", width: W, height: H, opacity: appear }}>
      {/* Burbujas dispersas jitter */}
      {Array.from({ length: 16 }, (_, i) => {
        const bx = 120 + rand(i) * (W - 240);
        const by = 120 + rand(i + 30) * (H - 240);
        const jx = Math.sin(f * 0.05 + rand(i) * 6) * 14;
        const jy = Math.cos(f * 0.045 + rand(i + 7) * 6) * 14;
        const lost = i % 8 === 3; // una par se pierde
        const c = lost ? COLORS.heatHigh : COLORS.inkSoft;
        const drift = lost ? ie(f, 40, 120, 0, 120) : 0;
        const fade = lost ? ie(f, 40, 120, 1, 0.15) : 0.5;
        const s = lost ? 30 : 20;
        const a = ie(f, 10 + i * 2, 30 + i * 2, 0, 1);
        return (
          <div key={i} style={{ position: "absolute", left: bx + jx, top: by + jy + drift, width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, borderRadius: "50% 50% 50% 4px", background: c, opacity: a * fade, boxShadow: lost ? `0 0 18px ${c}` : "none" }} />
        );
      })}
      {/* Chips de canal */}
      {channels.map((ch, i) => (
        <div key={ch.name} style={{ position: "absolute", left: ch.x, top: ch.y, transform: "translate(-50%,-50%)", opacity: ie(f, 6 + i * 6, 26 + i * 6, 0, 1) }}>
          <Pill text={ch.name} color={COLORS.accent} />
        </div>
      ))}
    </div>
  );
};

// ============ D2 — Clasificar en 3 carriles ============
export const SortingRouter: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const W = 900;
  const inbox = { x: W / 2, y: 70 };
  const lanes = [
    { name: "Equipo", color: COLORS.accent, x: W * 0.18 },
    { name: "Candidato", color: COLORS.heatMid, x: W * 0.5 },
    { name: "Revisar", color: COLORS.heatHigh, x: W * 0.82 },
  ];
  const laneY = 420;
  return (
    <div style={{ position: "relative", width: W, height: 500, opacity: appear }}>
      {/* Bandeja */}
      <div style={{ position: "absolute", left: inbox.x, top: inbox.y, transform: "translate(-50%,-50%)", padding: "18px 34px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(150,170,255,0.3)", fontFamily: FONT, fontWeight: 800, fontSize: 32, color: COLORS.ink }}>Bandeja</div>
      {/* Líneas + dots viajando */}
      <svg width={W} height={500} style={{ position: "absolute", left: 0, top: 0 }}>
        {lanes.map((l, i) => (
          <line key={i} x1={inbox.x} y1={inbox.y + 20} x2={l.x} y2={laneY - 60} stroke={l.color} strokeWidth={2} opacity={0.3 * appear} />
        ))}
      </svg>
      {Array.from({ length: 9 }, (_, i) => {
        const lane = lanes[i % 3];
        const start = 20 + i * 12;
        const t = ie(f, start, start + 30, 0, 1);
        if (t <= 0 || t >= 1) return null;
        const x = inbox.x + (lane.x - inbox.x) * t;
        const y = inbox.y + 20 + (laneY - 60 - inbox.y - 20) * t;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: "50%", background: lane.color, boxShadow: `0 0 12px ${lane.color}` }} />;
      })}
      {/* Carriles */}
      {lanes.map((l, i) => {
        const count = Math.max(0, Math.floor((f - (20 + i * 12) - 30) / 36) + 1);
        const cc = Math.min(3, count);
        return (
          <div key={l.name} style={{ position: "absolute", left: l.x, top: laneY, transform: "translate(-50%,0)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ padding: "12px 26px", borderRadius: 14, background: `${l.color}22`, border: `2px solid ${l.color}`, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: COLORS.ink }}>{l.name}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {Array.from({ length: 3 }, (_, k) => (
                <div key={k} style={{ width: 44, height: 12, borderRadius: 6, background: k < cc ? l.color : "rgba(255,255,255,0.1)", opacity: k < cc ? 1 : 0.5 }} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============ D3 — IA vs Criterio Humano ============
const Gear: React.FC<{ c: string; s?: number }> = ({ c, s = 54 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 4a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2l-.4-2.6H9.9l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 3 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h4.2l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" />
  </svg>
);
const Person: React.FC<{ c: string; s?: number }> = ({ c, s = 54 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7Z" />
  </svg>
);

export const BalanceAiHuman: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const left = spring({ frame: f, fps, config: { damping: 200 } });
  const right = spring({ frame: f - 12, fps, config: { damping: 200 } });
  const Col = (title: string, items: string[], Icon: React.FC<{ c: string; s?: number }>, color: string, p: number, dir: number) => (
    <div style={{ flex: 1, transform: `translateX(${(1 - p) * 40 * dir}px)`, opacity: p, borderRadius: 28, padding: 36, background: "rgba(255,255,255,0.05)", border: `1px solid ${color}66`, boxShadow: `0 0 34px ${color}22` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Icon c={color} s={52} />
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color }}>{title}</span>
      </div>
      {items.map((it, i) => (
        <div key={it} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, opacity: ie(f, 30 + i * 10, 46 + i * 10, 0, 1) }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />
          <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 600, color: COLORS.ink }}>{it}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 24, width: 920 }}>
      {Col("IA", ["Ordena", "Prioriza", "24/7"], Gear, COLORS.accent, left, -1)}
      <div style={{ display: "flex", alignItems: "center", fontFamily: FONT, fontSize: 40, fontWeight: 900, color: COLORS.ink, opacity: left }}>→</div>
      {Col("Humano", ["Decide", "Crisis", "Compromisos"], Person, COLORS.heatMid, right, 1)}
    </div>
  );
};

// ============ D4 — Atención -> Relación ============
export const AttentionToRelation: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const W = 700;
  const H = 460;
  const cx = W / 2;
  const cy = H / 2;
  const conv = ie(f, 30, 90, 0, 1); // convergencia
  const link = ie(f, 90, 120, 0, 1);
  return (
    <div style={{ position: "relative", width: W, height: H, opacity: appear }}>
      {/* Puntos de atención que convergen */}
      {Array.from({ length: 22 }, (_, i) => {
        const a = rand(i) * Math.PI * 2;
        const r = 120 + rand(i + 9) * 190;
        const sx = cx + Math.cos(a) * r;
        const sy = cy + Math.sin(a) * r;
        const tx = cx + (i % 2 === 0 ? -70 : 70);
        const ty = cy;
        const x = sx + (tx - sx) * conv;
        const y = sy + (ty - sy) * conv;
        const s = 12;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, borderRadius: "50%", background: COLORS.inkSoft, opacity: 0.35 + conv * 0.4 }} />;
      })}
      {/* Dos nodos + enlace */}
      {[-70, 70].map((dx, i) => (
        <div key={i} style={{ position: "absolute", left: cx + dx, top: cy, width: 90, height: 90, marginLeft: -45, marginTop: -45, borderRadius: "50%", transform: `scale(${conv})`, background: `radial-gradient(circle at 40% 35%, ${COLORS.accent}, #0b7a5b)`, boxShadow: `0 0 30px ${COLORS.accent}66` }} />
      ))}
      <div style={{ position: "absolute", left: cx - 70, top: cy - 4, width: 140 * link, height: 8, background: COLORS.accent, boxShadow: `0 0 16px ${COLORS.accent}`, borderRadius: 4 }} />
      {/* Etiquetas */}
      <div style={{ position: "absolute", left: 0, top: 8, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: COLORS.inkSoft, letterSpacing: "0.2em", opacity: 1 - conv * 0.6 }}>ATENCIÓN</div>
      <div style={{ position: "absolute", right: 0, bottom: 8, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: COLORS.accent, letterSpacing: "0.2em", opacity: link }}>RELACIÓN</div>
    </div>
  );
};

// ============ D5 — Confianza cayendo al piso ============
export const LoyaltyDrop: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const level = ie(f, 40, 110, 0.92, 0.08); // cae
  const pct = Math.round(level * 100);
  const color = level > 0.5 ? COLORS.accent : level > 0.3 ? COLORS.heatMid : COLORS.heatHigh;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 44, opacity: appear }}>
      {/* Medidor */}
      <div style={{ position: "relative", width: 150, height: 420, borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(150,170,255,0.2)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${level * 100}%`, background: `linear-gradient(180deg, ${color}, ${color}99)`, boxShadow: `0 0 30px ${color}88` }} />
        {/* marca de piso */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "8%", height: 2, background: COLORS.heatHigh, opacity: 0.6 }} />
      </div>
      <div style={{ fontFamily: FONT, textAlign: "left", paddingBottom: 12 }}>
        <div style={{ fontSize: 120, fontWeight: 900, color, lineHeight: 1 }}>{pct}%</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: COLORS.inkSoft, marginTop: 8 }}>Confianza</div>
        <div style={{ fontSize: 30, fontWeight: 600, color: COLORS.heatHigh, marginTop: 20, opacity: ie(f, 90, 110, 0, 1) }}>↓ al piso</div>
      </div>
    </div>
  );
};
