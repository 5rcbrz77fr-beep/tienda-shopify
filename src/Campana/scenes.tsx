import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HeatBackground } from "./HeatBackground";
import { KineticLine, Kicker } from "./AnimatedText";
import {
  AgeCounter,
  CheckSeal,
  GlassCard,
  Heartbeat,
  HeatRadar,
  IconDoc,
  IconDrop,
  TopProgress,
  WhatsAppChat,
} from "./Graphics";
import { COLORS, FONT } from "./theme";

/**
 * Cada "Tema" corresponde a un párrafo del guión y se renderiza como un
 * clip independiente, con un gráfico animado característico + tipografía
 * cinética. El contenido asume que empieza en el frame 0 (funciona suelto
 * o dentro de una <Sequence>).
 */

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      padding: "0 70px",
      textAlign: "center",
    }}
  >
    {children}
  </AbsoluteFill>
);

const Gap: React.FC<{ h: number }> = ({ h }) => <div style={{ height: h }} />;

const Caption: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontFamily: FONT,
        color: COLORS.inkSoft,
        fontSize: 34,
        fontWeight: 600,
        letterSpacing: "0.02em",
        opacity,
      }}
    >
      {text}
    </div>
  );
};

/** Fila estadística animada (icono + etiqueta + barra). */
const StatRow: React.FC<{
  delay: number;
  label: string;
  value: string;
  color: string;
  fill: number;
}> = ({ delay, label, value, color, fill }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const grow = interpolate(frame, [delay + 6, delay + 34], [0, fill], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ width: 640, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: FONT,
          marginBottom: 12,
        }}
      >
        <span style={{ color: COLORS.ink, fontSize: 34, fontWeight: 700 }}>
          {label}
        </span>
        <span style={{ color, fontSize: 34, fontWeight: 800 }}>{value}</span>
      </div>
      <div style={{ height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)" }}>
        <div
          style={{
            height: "100%",
            width: `${grow * 100}%`,
            borderRadius: 7,
            background: color,
            boxShadow: `0 0 16px ${color}88`,
          }}
        />
      </div>
    </div>
  );
};

// ================= TEMA 1 — La edad no basta =================
const Tema1Body: React.FC = () => (
  <Body>
    <Kicker text="Campaña Electoral" delay={6} />
    <AgeCounter delay={18} />
    <Gap h={54} />
    <KineticLine
      size={58}
      weight={700}
      delay={70}
      segments={[
        { text: "Pero" },
        { text: "la" },
        { text: "edad" },
        { text: "no" },
        { text: "te" },
        { text: "dice", heat: true },
        { text: "nada.", heat: true },
      ]}
    />
    <Gap h={56} />
    <StatRow delay={112} label="Demografía" value="el dato" color={COLORS.inkSoft} fill={0.55} />
    <Gap h={26} />
    <StatRow delay={140} label="Territorio" value="la verdad" color={COLORS.accent} fill={1} />
  </Body>
);

// ================= TEMA 2 — Cada persona, un mundo =================
const ContrastCards: React.FC<{ delay: number }> = ({ delay }) => (
  <div style={{ display: "flex", gap: 26 }}>
    <GlassCard delay={delay} from="left" width={300}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <IconDrop c={COLORS.heatLow} size={72} />
        <div style={{ fontFamily: FONT, color: COLORS.ink, fontSize: 40, fontWeight: 800 }}>
          Agua potable
        </div>
        <div style={{ fontFamily: FONT, color: COLORS.inkSoft, fontSize: 28 }}>
          El vecino A
        </div>
      </div>
    </GlassCard>
    <GlassCard delay={delay + 12} from="right" width={300}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <IconDoc c={COLORS.heatMid} size={72} />
        <div style={{ fontFamily: FONT, color: COLORS.ink, fontSize: 40, fontWeight: 800 }}>
          Un trámite
        </div>
        <div style={{ fontFamily: FONT, color: COLORS.inkSoft, fontSize: 28 }}>
          El vecino B
        </div>
      </div>
    </GlassCard>
  </div>
);

const Tema2Body: React.FC = () => (
  <Body>
    <Kicker text="Escucha Territorial" delay={6} />
    <KineticLine
      size={74}
      delay={16}
      segments={[
        { text: "Cada" },
        { text: "persona," },
        { text: "un" },
        { text: "mundo", accent: true },
        { text: "distinto." },
      ]}
    />
    <Gap h={60} />
    <ContrastCards delay={70} />
    <Gap h={64} />
    <KineticLine
      size={80}
      delay={130}
      segments={[
        { text: "Misma" },
        { text: "edad." },
        { text: "Otro", heat: true },
        { text: "problema.", heat: true },
      ]}
    />
  </Body>
);

// ================= TEMA 3 — IA y mapa de calor =================
const Tema3Body: React.FC = () => (
  <Body>
    <Kicker text="Inteligencia Artificial" delay={6} />
    <HeatRadar delay={14} size={440} />
    <Gap h={40} />
    <KineticLine
      size={66}
      delay={70}
      segments={[
        { text: "El" },
        { text: "mapa", heat: true },
        { text: "de", heat: true },
        { text: "calor", heat: true },
      ]}
    />
    <KineticLine
      size={50}
      weight={600}
      delay={100}
      segments={[
        { text: "aterriza" },
        { text: "en" },
        { text: "el" },
        { text: "territorio.", accent: true },
      ]}
    />
    <Gap h={44} />
    <Caption text="La data dice lo que la gente quiere decirte." delay={150} />
  </Body>
);

// ================= TEMA 4 — Del territorio al WhatsApp =================
const Tema4Body: React.FC = () => (
  <Body>
    <Kicker text="Del Mapa a la Conversación" delay={6} />
    <WhatsAppChat delay={16} />
    <Gap h={54} />
    <KineticLine
      size={62}
      delay={140}
      segments={[
        { text: "Ahí" },
        { text: "eres" },
        { text: "la" },
        { text: "solución.", accent: true },
      ]}
    />
  </Body>
);

// ================= TEMA 5 — Sentir y humanizar =================
const Tema5Body: React.FC = () => (
  <Body>
    <Kicker text="Conexión Humana" delay={6} />
    <KineticLine
      size={54}
      weight={600}
      delay={16}
      segments={[
        { text: "Hablas" },
        { text: "el" },
        { text: "problema" },
        { text: "que" },
        { text: "ya" },
        { text: "tienen." },
      ]}
    />
    <Gap h={40} />
    <Heartbeat delay={54} width={720} />
    <Gap h={30} />
    <KineticLine
      size={74}
      delay={100}
      segments={[
        { text: "Sientes" },
        { text: "el" },
        { text: "dolor.", heat: true },
        { text: "Lo" },
        { text: "humanizas." },
      ]}
    />
    <Gap h={40} />
    <KineticLine
      size={58}
      weight={700}
      delay={150}
      segments={[
        { text: "Ofreces" },
        { text: "la" },
        { text: "solución.", accent: true },
      ]}
    />
  </Body>
);

// ================= TEMA 6 — Cierre =================
const Tema6Body: React.FC = () => (
  <Body>
    <Kicker text="El Cierre" delay={6} />
    <CheckSeal delay={16} size={180} />
    <Gap h={44} />
    <KineticLine
      size={62}
      weight={700}
      delay={54}
      segments={[{ text: "Tu" }, { text: "campaña" }, { text: "es" }]}
    />
    <KineticLine
      size={98}
      delay={80}
      segments={[{ text: "la" }, { text: "solución.", accent: true }]}
    />
    <Gap h={54} />
    <KineticLine
      size={54}
      weight={600}
      delay={124}
      segments={[
        { text: "Nunca" },
        { text: "son" },
        { text: "los" },
        { text: "mismos" },
        { text: "problemas.", heat: true },
      ]}
    />
    <Gap h={54} />
    <Caption text="Nos vemos en la próxima." delay={168} />
  </Body>
);

// ---------- Envoltura con fondo + fade + barra de progreso ----------

export const FadeWrap: React.FC<{
  duration: number;
  withProgress?: boolean;
  children: React.ReactNode;
}> = ({ duration, withProgress = true, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 14, duration - 16, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ background: COLORS.bg0 }}>
      <HeatBackground />
      <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
      {withProgress ? <TopProgress /> : null}
    </AbsoluteFill>
  );
};

const Standalone: React.FC<{ Content: React.FC }> = ({ Content }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <FadeWrap duration={durationInFrames}>
      <Content />
    </FadeWrap>
  );
};

// ---------- Metadatos: un tema por párrafo ----------

export type Tema = {
  id: string;
  titulo: string;
  durationInFrames: number;
  Body: React.FC;
  Clip: React.FC;
};

const clipOf = (Content: React.FC): React.FC => {
  const C: React.FC = () => <Standalone Content={Content} />;
  return C;
};

export const TEMAS: Tema[] = [
  { id: "Tema1-Edad", titulo: "Párrafo 1 · La edad no basta", durationInFrames: 240, Body: Tema1Body, Clip: clipOf(Tema1Body) },
  { id: "Tema2-Mundo", titulo: "Párrafo 2 · Cada persona un mundo", durationInFrames: 260, Body: Tema2Body, Clip: clipOf(Tema2Body) },
  { id: "Tema3-IA", titulo: "Párrafo 3 · IA y mapa de calor", durationInFrames: 300, Body: Tema3Body, Clip: clipOf(Tema3Body) },
  { id: "Tema4-WhatsApp", titulo: "Párrafo 4 · Del territorio al WhatsApp", durationInFrames: 300, Body: Tema4Body, Clip: clipOf(Tema4Body) },
  { id: "Tema5-Dolor", titulo: "Párrafo 5 · Sentir y humanizar", durationInFrames: 290, Body: Tema5Body, Clip: clipOf(Tema5Body) },
  { id: "Tema6-Cierre", titulo: "Párrafo 6 · Tu campaña es la solución", durationInFrames: 270, Body: Tema6Body, Clip: clipOf(Tema6Body) },
];
