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

// Tarjeta-documento reutilizable (con líneas de texto).
const DocCard: React.FC<{ w?: number; h?: number; color?: string; corner?: string }> = ({
  w = 96,
  h = 122,
  color = C.ink,
  corner = C.accent,
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 12,
      background: "rgba(255,255,255,0.06)",
      border: `2px solid ${color}55`,
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 26,
        height: 26,
        background: `linear-gradient(225deg, ${corner} 50%, transparent 50%)`,
      }}
    />
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: 14,
          right: i === 3 ? 40 : 14,
          top: 34 + i * 18,
          height: 6,
          borderRadius: 3,
          background: `${color}33`,
        }}
      />
    ))}
  </div>
);

// Carpeta reutilizable.
const Folder: React.FC<{ label: string; color: string; active?: number; size?: number }> = ({
  label,
  color,
  active = 0,
  size = 118,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
    <div
      style={{
        width: size,
        height: size * 0.8,
        borderRadius: 16,
        background: `${color}${active > 0.5 ? "2e" : "14"}`,
        border: `2px solid ${color}`,
        position: "relative",
        boxShadow: `0 0 ${10 + active * 30}px ${color}${active > 0.5 ? "88" : "22"}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -12,
          left: 14,
          width: size * 0.42,
          height: 16,
          borderRadius: "8px 8px 0 0",
          background: color,
        }}
      />
    </div>
    <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 700, color: C.soft }}>{label}</span>
  </div>
);

// ===== 1 — Todo en un solo lugar: docs convergen a un hub =====
const HeroOnePlace: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 300;
  const cy = 300;
  const hubPulse = (1 + Math.sin(frame * 0.08)) / 2;
  const corners = [
    [70, 70],
    [530, 70],
    [70, 530],
    [530, 530],
  ];
  const N = 4;
  const period = 130;
  const cards = corners.map(([sx, sy], i) => {
    const t = loop(frame + (i / N) * period, period);
    const k = easeInOut(t);
    const x = lerp(sx, cx, k);
    const y = lerp(sy, cy, k);
    const op = t < 0.8 ? 1 : interpolate(t, [0.8, 1], [1, 0]);
    const sc = lerp(1, 0.4, k);
    return { x, y, op, sc, key: i };
  });
  return (
    <div style={{ position: "relative", width: 600, height: 600 }}>
      {/* hub central */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          transform: "translate(-50%,-50%)",
          width: 190,
          height: 160,
          borderRadius: 26,
          background: "rgba(79,214,201,0.10)",
          border: `2px solid ${C.accent}`,
          boxShadow: `0 0 ${26 + hubPulse * 30}px ${C.accent}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -16,
            left: 22,
            width: 90,
            height: 22,
            borderRadius: "10px 10px 0 0",
            background: C.accent,
          }}
        />
        <span style={{ fontFamily: FONT, fontSize: 54, color: C.accent }}>▤</span>
      </div>
      {/* tarjetas que entran */}
      {cards.map((cd) => (
        <div
          key={cd.key}
          style={{
            position: "absolute",
            left: cd.x,
            top: cd.y,
            transform: `translate(-50%,-50%) scale(${cd.sc})`,
            opacity: cd.op,
          }}
        >
          <DocCard />
        </div>
      ))}
    </div>
  );
};

// ===== 2 — Escaneo desde el celular =====
const HeroScan: React.FC = () => {
  const frame = useCurrentFrame();
  const cycle = 120;
  const t = loop(frame, cycle);
  const scanY = 60 + easeInOut(Math.min(1, t / 0.6)) * 300; // barra baja
  const done = t > 0.62;
  const lift = done ? interpolate(t, [0.62, 0.9], [0, 1], { extrapolateRight: "clamp" }) : 0;
  return (
    <div style={{ position: "relative", width: 480, height: 620, margin: "0 auto" }}>
      {/* teléfono */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 20,
          transform: "translateX(-50%)",
          width: 300,
          height: 560,
          borderRadius: 46,
          border: `3px solid ${C.soft}`,
          background: "rgba(255,255,255,0.03)",
          overflow: "hidden",
        }}
      >
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 12,
            borderRadius: 8,
            background: `${C.soft}66`,
          }}
        />
        {/* documento dentro */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 90,
            transform: `translateX(-50%) translateY(${-lift * 60}px)`,
            opacity: 1 - lift * 0.15,
          }}
        >
          <DocCard w={170} h={230} corner={C.accent} />
        </div>
        {/* línea de escaneo */}
        {!done && (
          <div
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              top: scanY,
              height: 4,
              borderRadius: 2,
              background: C.accent,
              boxShadow: `0 0 18px ${C.accent}, 0 0 40px ${C.accent}`,
            }}
          />
        )}
        {/* check al terminar */}
        {done && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 150,
              transform: `translate(-50%,-50%) scale(${lift})`,
            }}
          >
            <svg width={90} height={90} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" opacity="0.5" />
              <path d="M7 12.5l3.5 3.5L17 8" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== 3 — Se archiva solo: doc cae en la carpeta correcta =====
const HeroAutoFile: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 300;
  const topY = 90;
  const foldY = 470;
  const foldX = [110, 300, 490];
  const labels = ["Ventas", "Clientes", "Gastos"];
  const cols = [C.accent, "#f2b64d", C.warn];
  const cycle = 130;
  const t = loop(frame, cycle);
  // destino cambia cada ciclo
  const dest = Math.floor(loop(frame, cycle * 3) * 3) % 3;
  const k = easeInOut(Math.min(1, t / 0.8));
  const x = lerp(cx, foldX[dest], k);
  const y = lerp(topY, foldY - 70, k);
  const dropping = t > 0.8;
  const activeGlow = dropping ? interpolate(t, [0.8, 0.95, 1], [0, 1, 0.3], { extrapolateRight: "clamp" }) : 0;
  return (
    <div style={{ position: "relative", width: 600, height: 600 }}>
      <svg width={600} height={600} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {foldX.map((fx, i) => (
          <line key={i} x1={cx} y1={topY} x2={fx} y2={foldY - 70} stroke={cols[i]} strokeWidth={2} opacity={i === dest ? 0.4 : 0.1} strokeDasharray="6 8" />
        ))}
      </svg>
      {/* doc viajando */}
      <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", opacity: dropping ? 1 - (activeGlow > 0.5 ? (t - 0.9) * 6 : 0) : 1 }}>
        <DocCard w={84} h={106} corner={cols[dest]} color={cols[dest]} />
      </div>
      {/* carpetas */}
      {foldX.map((fx, i) => (
        <div key={labels[i]} style={{ position: "absolute", left: fx, top: foldY, transform: "translate(-50%,-50%)" }}>
          <Folder label={labels[i]} color={cols[i]} active={i === dest ? activeGlow : 0} />
        </div>
      ))}
    </div>
  );
};

// ===== 4 — Cada tipo de archivo en su carpeta =====
const Row: React.FC<{ top: number; sym: string; label: string; color: string; delay: number }> = ({ top, sym, label, color, delay }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [delay, delay + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const dot = loop(frame + delay, 90);
  const dx = lerp(400, 590, easeInOut(dot));
  return (
    <div style={{ position: "absolute", top, left: "50%", width: 720, marginLeft: -360, height: 96, opacity: a, transform: `translateX(${(1 - a) * 26}px)` }}>
      {/* chip tipo */}
      <div style={{ position: "absolute", left: 40, top: 8, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 74, height: 74, borderRadius: 16, background: `${color}18`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 34, color }}>{sym}</div>
        <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: C.ink }}>{label}</span>
      </div>
      {/* línea */}
      <div style={{ position: "absolute", left: 390, right: 90, top: 46, height: 2, background: `${color}33` }} />
      {/* punto viajando */}
      <div style={{ position: "absolute", left: dx, top: 40, width: 16, height: 16, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}`, opacity: a }} />
      {/* carpeta destino */}
      <div style={{ position: "absolute", right: 20, top: 4, width: 82, height: 66, borderRadius: 12, background: `${color}14`, border: `2px solid ${color}` }}>
        <div style={{ position: "absolute", top: -9, left: 12, width: 34, height: 12, borderRadius: "6px 6px 0 0", background: color }} />
      </div>
    </div>
  );
};

const HeroClassify: React.FC = () => (
  <div style={{ position: "relative", width: 760, height: 460 }}>
    <Row top={40} sym="≡" label="Documento" color={C.accent} delay={20} />
    <Row top={180} sym="▦" label="Hoja de cálculo" color="#f2b64d" delay={40} />
    <Row top={320} sym="◫" label="Presentación" color="#e1306c" delay={60} />
  </div>
);

// ===== 5 — Beneficio: más rápido -> más ingresos =====
const HeroBenefit: React.FC = () => {
  const frame = useCurrentFrame();
  const bars = [
    { label: "Atención", color: C.accent, target: 1, cap: "rápida" },
    { label: "Ingresos", color: "#f2b64d", target: 0.9, cap: "$" },
  ];
  const H = 320;
  return (
    <div style={{ display: "flex", gap: 90, alignItems: "flex-end", height: 460, justifyContent: "center" }}>
      {bars.map((b, idx) => {
        const g = interpolate(frame, [20 + idx * 20, 80 + idx * 20], [0, b.target], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
        return (
          <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", width: 160, height: H, borderRadius: 20, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}`, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${g * 100}%`, background: `linear-gradient(180deg, ${b.color}, ${b.color}aa)`, boxShadow: `0 0 26px ${b.color}66`, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 14 }}>
                <span style={{ fontFamily: FONT, fontSize: 44, fontWeight: 900, color: "#04141a" }}>{b.cap}</span>
              </div>
            </div>
            <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: C.ink }}>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ===== 6 — Cierre: gestión documental =====
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
        <div style={{ width: 150, height: 150, borderRadius: 40, background: `radial-gradient(circle at 42% 38%, ${C.accent}, ${C.accentDeep})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${30 + pulse * 28}px ${C.accent}aa` }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 70, color: "#04141a" }}>▤</span>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.ink }}>Todo ordenado</div>
      </div>
    </div>
  );
};

export type TemaDoc = { id: string; titulo: string; durationInFrames: number; Clip: React.FC };
export const TEMAS_DOC: TemaDoc[] = [
  { id: "D1-UnLugar", titulo: "Todo en un solo lugar", durationInFrames: 300, Clip: wrap(HeroOnePlace, "Un Solo Lugar", "Administrá todo en un lugar", C.accent, 72) },
  { id: "D2-Escaneo", titulo: "Escaneá desde el celular", durationInFrames: 300, Clip: wrap(HeroScan, "Escaneo", "Escaneá desde donde estés", C.ink, 74) },
  { id: "D3-ArchivaSolo", titulo: "Se archiva solo", durationInFrames: 300, Clip: wrap(HeroAutoFile, "Gestión Documental", "Se archiva solo, sin carpetas", C.accent, 70) },
  { id: "D4-Clasifica", titulo: "Cada archivo en su carpeta", durationInFrames: 300, Clip: wrap(HeroClassify, "Clasificación", "Cada archivo en su lugar", C.ink, 76) },
  { id: "D5-Beneficio", titulo: "Más rápido, más ingresos", durationInFrames: 300, Clip: wrap(HeroBenefit, "El Beneficio", "Más rápido, más ingresos", C.ink, 76) },
  { id: "D6-Cierre", titulo: "Todo ordenado", durationInFrames: 300, Clip: wrap(HeroClose, "El Cierre", "Gestión documental real", C.accent, 76) },
];
