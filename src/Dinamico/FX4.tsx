import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT, rand } from "../Campana/theme";

// Movimiento continuo (loop) — clave del estilo dinámico.
const loop = (f: number, period: number) => ((f % period) + period) / period % 1;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Palabra grande minimalista que late (poco texto, mucho impacto).
export const BigWord: React.FC<{ text: string; color?: string; delay?: number }> = ({
  text,
  color = COLORS.ink,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const app = interpolate(f, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 1 + Math.sin(f * 0.08) * 0.02;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 300,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 118,
        letterSpacing: "-0.02em",
        color,
        opacity: app,
        transform: `scale(${lerp(0.8, pulse, app)})`,
        textShadow: `0 0 50px ${color}55`,
      }}
    >
      {text}
    </div>
  );
};

// ====== DD1 — Enjambre entre canales (todo en movimiento) ======
export const Enjambre: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 540;
  const cy = 820;
  const nodes = [
    { x: cx - 320, y: cy - 360 },
    { x: cx + 320, y: cy - 360 },
    { x: cx - 320, y: cy + 360 },
    { x: cx + 320, y: cy + 360 },
  ];
  const bubbles = Array.from({ length: 40 }, (_, i) => {
    const a = Math.floor(rand(i) * 4);
    let b = Math.floor(rand(i + 100) * 4);
    if (b === a) b = (b + 1) % 4;
    const period = 90 + rand(i + 5) * 120;
    const t = loop(frame + rand(i) * period, period);
    const na = nodes[a];
    const nb = nodes[b];
    const wob = Math.sin((frame + i * 9) * 0.08) * 40;
    const x = lerp(na.x, nb.x, t) + wob;
    const y = lerp(na.y, nb.y, t) - Math.sin(t * Math.PI) * 90;
    const lost = i % 9 === 4;
    const lp = lost ? loop(frame + i * 7, 150) : 0;
    const yy = lost ? y + lp * 500 : y;
    const op = lost ? 1 - lp : 0.55;
    const c = lost ? COLORS.heatHigh : COLORS.inkSoft;
    const s = lost ? 30 : 18;
    return { x, y: yy, s, c, op, key: i };
  });
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Conexiones que titilan */}
      <svg style={{ position: "absolute", inset: 0 }} width={1080} height={1920}>
        {nodes.map((n, i) =>
          nodes.slice(i + 1).map((m, j) => (
            <line key={`${i}-${j}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke={COLORS.accent} strokeWidth={1.5} opacity={0.06 + 0.06 * (1 + Math.sin(frame * 0.05 + i + j)) / 2} />
          )),
        )}
      </svg>
      {/* Nodos de canal, pulsando */}
      {nodes.map((n, i) => {
        const p = (1 + Math.sin(frame * 0.06 + i * 1.6)) / 2;
        const s = 60 + p * 26;
        return (
          <div key={i} style={{ position: "absolute", left: n.x, top: n.y, width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${COLORS.accent}, #0b7a5b)`, opacity: 0.9, boxShadow: `0 0 ${20 + p * 30}px ${COLORS.accent}` }} />
        );
      })}
      {/* Burbujas en movimiento constante */}
      {bubbles.map((b) => (
        <div key={b.key} style={{ position: "absolute", left: b.x, top: b.y, width: b.s, height: b.s, marginLeft: -b.s / 2, marginTop: -b.s / 2, borderRadius: "50% 50% 50% 4px", background: b.c, opacity: b.op, boxShadow: b.c === COLORS.heatHigh ? `0 0 18px ${b.c}` : "none" }} />
      ))}
    </div>
  );
};

// ====== DD2 — Clasificador (flujo continuo + anillo giratorio) ======
export const Clasificador: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 540;
  const topY = 320;
  const ringY = 760;
  const laneY = 1300;
  const lanes = [
    { x: 260, color: COLORS.accent },
    { x: 540, color: COLORS.heatMid },
    { x: 820, color: COLORS.heatHigh },
  ];
  const N = 18;
  const cycle = 84;
  const items = Array.from({ length: N }, (_, i) => {
    const phase = (i / N) * cycle * 3;
    const local = ((frame - phase) % (cycle * 3) + cycle * 3) % (cycle * 3);
    const lane = lanes[i % 3];
    let x = cx;
    let y = topY;
    let op = 1;
    if (local < cycle) {
      const t = local / cycle;
      y = lerp(topY, ringY, t);
    } else if (local < cycle * 2) {
      const t = (local - cycle) / cycle;
      x = lerp(cx, lane.x, t);
      y = lerp(ringY, laneY, t);
    } else {
      op = 0;
    }
    return { x, y, op, c: lane.color, key: i };
  });
  const ring = frame * 3;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Anillo IA giratorio */}
      <div style={{ position: "absolute", left: cx, top: ringY, width: 200, height: 200, marginLeft: -100, marginTop: -100, borderRadius: "50%", border: `4px dashed ${COLORS.accent}`, transform: `rotate(${ring}deg)`, opacity: 0.9, boxShadow: `0 0 40px ${COLORS.accent}55` }} />
      <div style={{ position: "absolute", left: cx, top: ringY, width: 120, height: 120, marginLeft: -60, marginTop: -60, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${COLORS.accent}, #0b7a5b)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#04121a", boxShadow: `0 0 50px ${COLORS.accent}` }}>IA</div>
      {/* Carriles receptores */}
      {lanes.map((l, i) => {
        const p = (1 + Math.sin(frame * 0.1 + i)) / 2;
        return (
          <div key={i} style={{ position: "absolute", left: l.x, top: laneY, width: 150, height: 150, marginLeft: -75, marginTop: -75, borderRadius: 30, border: `3px solid ${l.color}`, background: `${l.color}1a`, boxShadow: `0 0 ${16 + p * 24}px ${l.color}66` }} />
        );
      })}
      {/* Items en flujo */}
      {items.map((it) => (
        <div key={it.key} style={{ position: "absolute", left: it.x, top: it.y, width: 26, height: 26, marginLeft: -13, marginTop: -13, borderRadius: "50% 50% 50% 5px", background: it.c, opacity: it.op, boxShadow: `0 0 14px ${it.c}` }} />
      ))}
    </div>
  );
};

// ====== DD3 — Balanza con física (oscila + pesas caen) ======
export const Balanza: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 540;
  const pivotY = 720;
  const beam = 360;
  // oscilación amortiguada + leve sway continuo
  const decay = Math.exp(-frame / 120);
  const angle = Math.sin(frame * 0.12) * (6 + 14 * decay) + Math.sin(frame * 0.03) * 2;
  const rad = (angle * Math.PI) / 180;
  const lx = cx - Math.cos(rad) * beam;
  const ly = pivotY - Math.sin(rad) * beam;
  const rx = cx + Math.cos(rad) * beam;
  const ry = pivotY + Math.sin(rad) * beam;
  const gear = frame * 4;
  // pesas que caen periódicamente sobre lado humano
  const dropT = loop(frame, 120);
  const dropY = dropT < 0.5 ? lerp(200, ry - 90, dropT * 2) : ry - 90;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg style={{ position: "absolute", inset: 0 }} width={1080} height={1920}>
        {/* poste */}
        <line x1={cx} y1={pivotY} x2={cx} y2={pivotY + 300} stroke={COLORS.line} strokeWidth={10} />
        {/* viga */}
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={COLORS.ink} strokeWidth={12} strokeLinecap="round" />
        <line x1={lx} y1={ly} x2={lx} y2={ly + 90} stroke={COLORS.line} strokeWidth={4} />
        <line x1={rx} y1={ry} x2={rx} y2={ry + 90} stroke={COLORS.line} strokeWidth={4} />
        <circle cx={cx} cy={pivotY} r={16} fill={COLORS.accent} />
      </svg>
      {/* pan IA (engranaje girando) */}
      <div style={{ position: "absolute", left: lx, top: ly + 130, marginLeft: -60, marginTop: -60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: `2px solid ${COLORS.accent}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 26px ${COLORS.accent}44` }}>
        <svg width={70} height={70} viewBox="0 0 24 24" fill={COLORS.accent} style={{ transform: `rotate(${gear}deg)` }}>
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 4a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2l-.4-2.6H9.9l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 3 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h4.2l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" />
        </svg>
      </div>
      {/* pan Humano (persona) */}
      <div style={{ position: "absolute", left: rx, top: ry + 130, marginLeft: -60, marginTop: -60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: `2px solid ${COLORS.heatMid}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 26px ${COLORS.heatMid}44` }}>
        <svg width={64} height={64} viewBox="0 0 24 24" fill={COLORS.heatMid}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7Z" />
        </svg>
      </div>
      {/* pesa cayendo */}
      <div style={{ position: "absolute", left: rx, top: dropY, marginLeft: -22, width: 44, height: 44, borderRadius: 10, background: COLORS.heatMid, opacity: dropT < 0.55 ? 1 : 0, boxShadow: `0 0 16px ${COLORS.heatMid}` }} />
    </div>
  );
};

// ====== DD4 — Red de partículas (remolino -> conexión, en loop) ======
export const RedParticulas: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 540;
  const cy = 820;
  const breathe = (1 + Math.sin(frame * 0.03)) / 2; // 0..1 respira
  const count = 90;
  const parts = Array.from({ length: count }, (_, i) => {
    const a = rand(i) * Math.PI * 2 + frame * 0.01 * (0.5 + rand(i + 3));
    const baseR = 120 + rand(i + 9) * 340;
    const r = lerp(baseR, 170 + (i % 10) * 6, breathe); // se contrae al respirar
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 1.05;
    const s = 8 + rand(i + 1) * 8;
    const c = i % 7 === 0 ? COLORS.heatHigh : i % 3 === 0 ? COLORS.accent : COLORS.inkSoft;
    return { x, y, s, c, key: i };
  });
  // polígono de conexión cuando está contraído
  const nodesN = 10;
  const ringR = lerp(360, 190, breathe);
  const poly = Array.from({ length: nodesN }, (_, i) => {
    const a = (i / nodesN) * Math.PI * 2 + frame * 0.02;
    return [cx + Math.cos(a) * ringR, cy + Math.sin(a) * ringR];
  });
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg style={{ position: "absolute", inset: 0 }} width={1080} height={1920}>
        {poly.map((p, i) => {
          const q = poly[(i + 1) % nodesN];
          return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={COLORS.accent} strokeWidth={2} opacity={breathe * 0.6} />;
        })}
        {poly.map((p, i) => (
          <line key={`c${i}`} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke={COLORS.accent} strokeWidth={1} opacity={breathe * 0.25} />
        ))}
      </svg>
      {parts.map((p) => (
        <div key={p.key} style={{ position: "absolute", left: p.x, top: p.y, width: p.s, height: p.s, marginLeft: -p.s / 2, marginTop: -p.s / 2, borderRadius: "50%", background: p.c, opacity: 0.5 + breathe * 0.4, boxShadow: p.c !== COLORS.inkSoft ? `0 0 10px ${p.c}` : "none" }} />
      ))}
      {/* núcleo */}
      <div style={{ position: "absolute", left: cx, top: cy, width: 90 + breathe * 40, height: 90 + breathe * 40, marginLeft: -(45 + breathe * 20), marginTop: -(45 + breathe * 20), borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${COLORS.accent}, #0b7a5b)`, boxShadow: `0 0 ${40 + breathe * 40}px ${COLORS.accent}` }} />
    </div>
  );
};

// ====== DD5 — Drenaje (líquido baja, gotas caen, flatline) ======
export const Drenaje: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 540;
  const tubeTop = 420;
  const tubeH = 760;
  const tubeW = 200;
  const level = interpolate(frame, [20, 140], [0.9, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fillH = level * tubeH;
  const c = level > 0.5 ? COLORS.accent : level > 0.3 ? COLORS.heatMid : COLORS.heatHigh;
  const pct = Math.round(level * 100);
  // gotas cayendo desde el tubo
  const drops = Array.from({ length: 10 }, (_, i) => {
    const t = loop(frame + i * 24, 60);
    const x = cx - tubeW / 2 + rand(i) * tubeW;
    const y = tubeTop + tubeH + t * 380;
    return { x, y, op: 1 - t, key: i };
  });
  // burbujas subiendo dentro del líquido
  const rise = Array.from({ length: 8 }, (_, i) => {
    const t = loop(frame + i * 15, 70);
    const x = cx - tubeW / 2 + 20 + rand(i) * (tubeW - 40);
    const y = tubeTop + tubeH - t * fillH;
    return { x, y, op: (1 - t) * 0.6, key: i };
  });
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* tubo */}
      <div style={{ position: "absolute", left: cx - tubeW / 2, top: tubeTop, width: tubeW, height: tubeH, borderRadius: 40, background: "rgba(255,255,255,0.05)", border: "2px solid rgba(150,170,255,0.25)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: fillH, background: `linear-gradient(180deg, ${c}, ${c}aa)`, boxShadow: `0 0 40px ${c}` }} />
        {rise.map((b) => (
          <div key={b.key} style={{ position: "absolute", left: b.x - (cx - tubeW / 2), top: b.y - tubeTop, width: 12, height: 12, borderRadius: "50%", background: "rgba(255,255,255,0.5)", opacity: b.op }} />
        ))}
      </div>
      {/* gotas */}
      {drops.map((d) => (
        <div key={d.key} style={{ position: "absolute", left: d.x, top: d.y, width: 12, height: 18, marginLeft: -6, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: c, opacity: d.op, boxShadow: `0 0 10px ${c}` }} />
      ))}
      {/* % gigante */}
      <div style={{ position: "absolute", left: 0, right: 0, top: tubeTop + tubeH + 120, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 150, color: c, textShadow: `0 0 50px ${c}66` }}>{pct}%</div>
    </div>
  );
};
