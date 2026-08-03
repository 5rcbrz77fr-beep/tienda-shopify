import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticLine, Kicker } from "../Campana/AnimatedText";
import { FadeWrap } from "../Campana/scenes";
import { COLORS, FONT } from "../Campana/theme";
import { SLOW } from "../Estrategia/FX";
import {
  AgeSegments,
  ElectedBadge,
  EcosystemHub,
  HeatChecklist,
  MessageQueue,
  PhoneRinging,
  ProfileCard,
  SplitStat,
  VersusFreq,
} from "./FX2";

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 70px", textAlign: "center" }}>
    {children}
  </AbsoluteFill>
);
const Gap: React.FC<{ h: number }> = ({ h }) => <div style={{ height: h }} />;
const Caption: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: SLOW });
  const y = interpolate(frame, [delay, delay + 22], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: SLOW });
  return <div style={{ fontFamily: FONT, color: COLORS.inkSoft, fontSize: 36, fontWeight: 600, opacity: o, transform: `translateY(${y}px)`, maxWidth: 840 }}>{text}</div>;
};
const Slow: React.FC<React.ComponentProps<typeof KineticLine>> = (props) => <KineticLine stagger={7} {...props} />;

// C1 — El error letal
const K1: React.FC = () => (
  <Body>
    <Kicker text="El Error Letal" delay={6} />
    <PhoneRinging delay={16} />
    <Gap h={30} />
    <Slow size={58} weight={700} delay={130} segments={[{ text: "Nunca" }, { text: "contestar" }, { text: "el" }, { text: "teléfono.", heat: true }]} />
    <Gap h={22} />
    <Caption text="Cada llamada perdida es un voto perdido." delay={180} />
  </Body>
);

// C2 — 20% vs 80%
const K2: React.FC = () => (
  <Body>
    <Kicker text="Conexión Directa" delay={6} />
    <SplitStat delay={16} />
    <Gap h={50} />
    <Slow size={58} weight={700} delay={100} segments={[{ text: "El" }, { text: "80%", heat: true }, { text: "nunca" }, { text: "supo" }, { text: "de" }, { text: "ti." }]} />
    <Gap h={22} />
    <Caption text="El resto pudo escuchar a tu contrincante." delay={150} />
  </Body>
);

// C3 — Construcción del candidato
const K3: React.FC = () => (
  <Body>
    <Kicker text="Construcción" delay={6} />
    <ProfileCard delay={16} />
    <Gap h={44} />
    <Slow size={62} delay={120} segments={[{ text: "Humano," }, { text: "directo" }, { text: "y" }, { text: "creíble.", accent: true }]} />
  </Body>
);

// C4 — Territorio vs Redes
const K4: React.FC = () => (
  <Body>
    <Kicker text="Territorio vs Redes" delay={6} />
    <VersusFreq delay={16} />
    <Gap h={54} />
    <Slow size={56} weight={700} delay={110} segments={[{ text: "En" }, { text: "redes" }, { text: "nunca" }, { text: "dejan" }, { text: "de" }, { text: "verte.", accent: true }]} />
  </Body>
);

// C5 — Un solo ecosistema
const K5: React.FC = () => (
  <Body>
    <Kicker text="Ecosistema Digital" delay={6} />
    <EcosystemHub delay={16} />
    <Gap h={30} />
    <Slow size={60} delay={110} segments={[{ text: "Todas" }, { text: "las" }, { text: "redes," }, { text: "un" }, { text: "ecosistema.", accent: true }]} />
  </Body>
);

// C6 — Segmentación por edad
const K6: React.FC = () => (
  <Body>
    <Kicker text="Segmentación" delay={6} />
    <AgeSegments delay={16} />
    <Gap h={54} />
    <Slow size={60} delay={100} segments={[{ text: "El" }, { text: "contenido" }, { text: "correcto" }, { text: "por" }, { text: "edad.", accent: true }]} />
    <Gap h={22} />
    <Caption text="Cuándo un Live, qué post, cuál reels." delay={150} />
  </Body>
);

// C7 — Automatización IA 24/7
const K7: React.FC = () => (
  <Body>
    <Kicker text="Automatización · IA" delay={6} />
    <MessageQueue delay={16} />
    <Gap h={40} />
    <Slow size={56} weight={700} delay={130} segments={[{ text: "Ningún" }, { text: "mensaje" }, { text: "sin" }, { text: "responder.", accent: true }]} />
  </Body>
);

// C8 — CRM + mapa de calor
const K8: React.FC = () => (
  <Body>
    <Kicker text="CRM + Mapa de Calor" delay={6} />
    <HeatChecklist delay={16} />
    <Gap h={54} />
    <Slow size={58} delay={120} segments={[{ text: "Nada" }, { text: "se" }, { text: "vuelve" }, { text: "a" }, { text: "olvidar.", accent: true }]} />
  </Body>
);

// C9 — Elegido -> Reelegido
const K9: React.FC = () => (
  <Body>
    <Kicker text="El Resultado" delay={6} />
    <ElectedBadge delay={20} />
    <Gap h={70} />
    <Slow size={54} weight={600} delay={110} segments={[{ text: "Control" }, { text: "total" }, { text: "de" }, { text: "tu" }, { text: "campaña.", accent: true }]} />
  </Body>
);

export type TemaC = { id: string; titulo: string; durationInFrames: number; Clip: React.FC };
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

export const TEMAS_C: TemaC[] = [
  { id: "C1-Error-Letal", titulo: "Error letal · no contestar", durationInFrames: 320, Clip: clip(K1) },
  { id: "C2-20-80", titulo: "20% vs 80%", durationInFrames: 300, Clip: clip(K2) },
  { id: "C3-Candidato", titulo: "Construcción del candidato", durationInFrames: 320, Clip: clip(K3) },
  { id: "C4-Territorio-Redes", titulo: "Territorio vs Redes", durationInFrames: 300, Clip: clip(K4) },
  { id: "C5-Ecosistema", titulo: "Un solo ecosistema", durationInFrames: 300, Clip: clip(K5) },
  { id: "C6-Segmentacion", titulo: "Segmentación por edad", durationInFrames: 300, Clip: clip(K6) },
  { id: "C7-Automatizacion", titulo: "Automatización IA 24/7", durationInFrames: 320, Clip: clip(K7) },
  { id: "C8-CRM-Calor", titulo: "CRM + mapa de calor", durationInFrames: 320, Clip: clip(K8) },
  { id: "C9-Reelegido", titulo: "Elegido → reelegido", durationInFrames: 300, Clip: clip(K9) },
];
