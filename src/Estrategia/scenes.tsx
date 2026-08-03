import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AbsoluteFill } from "remotion";
import { KineticLine, Kicker } from "../Campana/AnimatedText";
import { FadeWrap } from "../Campana/scenes";
import { COLORS, FONT } from "../Campana/theme";
import {
  Dashboard,
  Funnel,
  HeatTeaser,
  IaCrm,
  SLOW,
  SocialCore,
  VoteCounter,
  YearBadge,
} from "./FX";

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
  const o = interpolate(frame, [delay, delay + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SLOW,
  });
  const y = interpolate(frame, [delay, delay + 22], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SLOW,
  });
  return (
    <div
      style={{
        fontFamily: FONT,
        color: COLORS.inkSoft,
        fontSize: 36,
        fontWeight: 600,
        letterSpacing: "0.02em",
        opacity: o,
        transform: `translateY(${y}px)`,
        maxWidth: 820,
      }}
    >
      {text}
    </div>
  );
};

// Texto cinético con cascada lenta (slow-motion)
const Slow: React.FC<React.ComponentProps<typeof KineticLine>> = (props) => (
  <KineticLine stagger={7} {...props} />
);

// ============ TEMA 1 — Redes + estrategia + IA ============
const E1: React.FC = () => (
  <Body>
    <Kicker text="Redes + Estrategia" delay={6} />
    <SocialCore delay={16} />
    <Gap h={40} />
    <Slow
      size={72}
      delay={110}
      segments={[
        { text: "La" },
        { text: "IA", accent: true },
        { text: "vino" },
        { text: "a" },
        { text: "cambiar" },
        { text: "el" },
        { text: "mundo.", accent: true },
      ]}
    />
    <Gap h={30} />
    <Caption text="Las redes importan; la estrategia manda." delay={165} />
  </Body>
);

// ============ TEMA 2 — Cada conversación = un voto ============
const E2: React.FC = () => (
  <Body>
    <Kicker text="Latinoamérica · IA" delay={6} />
    <VoteCounter delay={16} target={1240} />
    <Gap h={54} />
    <Slow
      size={64}
      delay={120}
      segments={[
        { text: "Cada" },
        { text: "conversación" },
        { text: "es" },
        { text: "un" },
        { text: "voto.", accent: true },
      ]}
    />
    <Gap h={26} />
    <Caption text="La campaña se gana mensaje por mensaje." delay={172} />
  </Body>
);

// ============ TEMA 3 — Cuello de botella + 2026 ============
const E3: React.FC = () => (
  <Body>
    <Kicker text="Medios Digitales" delay={6} />
    <Funnel delay={16} />
    <Gap h={30} />
    <Slow
      size={62}
      delay={90}
      segments={[
        { text: "El" },
        { text: "cuello", heat: true },
        { text: "de", heat: true },
        { text: "botella.", heat: true },
      ]}
    />
    <Gap h={40} />
    <YearBadge delay={140} year="2026" />
    <Gap h={26} />
    <Caption text="Lo que más influye en tu campaña." delay={185} />
  </Body>
);

// ============ TEMA 4 — IA + CRM = núcleo ============
const E4: React.FC = () => (
  <Body>
    <Kicker text="El Núcleo" delay={6} />
    <IaCrm delay={18} />
    <Gap h={60} />
    <Slow
      size={70}
      delay={110}
      segments={[
        { text: "El" },
        { text: "núcleo", accent: true },
        { text: "de" },
        { text: "tu" },
        { text: "campaña." },
      ]}
    />
    <Gap h={28} />
    <Caption text="Inteligencia Artificial + CRM, todo conectado." delay={165} />
  </Body>
);

// ============ TEMA 5 — Un solo monitor ============
const E5: React.FC = () => (
  <Body>
    <Kicker text="Un Solo Panel" delay={6} />
    <Dashboard delay={16} />
    <Gap h={54} />
    <Slow
      size={66}
      delay={130}
      segments={[
        { text: "Todo" },
        { text: "en" },
        { text: "un" },
        { text: "solo" },
        { text: "monitor.", accent: true },
      ]}
    />
    <Gap h={26} />
    <Caption text="Qué se hizo y qué falta, en tiempo real." delay={182} />
  </Body>
);

// ============ TEMA 6 — Teaser mapa de calor ============
const E6: React.FC = () => (
  <Body>
    <Kicker text="Lo Que Viene" delay={6} />
    <Slow
      size={60}
      delay={16}
      segments={[
        { text: "El" },
        { text: "mapa", heat: true },
        { text: "de", heat: true },
        { text: "calor", heat: true },
        { text: "es" },
        { text: "clave." },
      ]}
    />
    <Gap h={44} />
    <HeatTeaser delay={64} />
    <Gap h={44} />
    <Slow
      size={52}
      weight={600}
      delay={150}
      segments={[
        { text: "Pero" },
        { text: "eso" },
        { text: "te" },
        { text: "lo" },
        { text: "cuento" },
        { text: "luego.", accent: true },
      ]}
    />
  </Body>
);

// ---------- Metadatos ----------
export type TemaE = {
  id: string;
  titulo: string;
  durationInFrames: number;
  Clip: React.FC;
};

const clip = (Content: React.FC): React.FC => {
  const C: React.FC = () => {
    const { durationInFrames } = useVideoConfig();
    return (
      <FadeWrap duration={durationInFrames}>
        <Content />
      </FadeWrap>
    );
  };
  return C;
};

export const TEMAS_E: TemaE[] = [
  { id: "E1-Redes-IA", titulo: "P1 · Redes + estrategia + IA", durationInFrames: 320, Clip: clip(E1) },
  { id: "E2-Voto", titulo: "P2 · Cada conversación un voto", durationInFrames: 320, Clip: clip(E2) },
  { id: "E3-Botella-2026", titulo: "P3 · Cuello de botella + 2026", durationInFrames: 330, Clip: clip(E3) },
  { id: "E4-IA-CRM", titulo: "P4 · IA + CRM = núcleo", durationInFrames: 300, Clip: clip(E4) },
  { id: "E5-Monitor", titulo: "P5 · Todo en un monitor", durationInFrames: 330, Clip: clip(E5) },
  { id: "E6-Mapa-Teaser", titulo: "P6 · Teaser mapa de calor", durationInFrames: 300, Clip: clip(E6) },
];
