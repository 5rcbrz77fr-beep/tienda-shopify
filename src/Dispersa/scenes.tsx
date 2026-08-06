import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticLine, Kicker } from "../Campana/AnimatedText";
import { FadeWrap } from "../Campana/scenes";
import { COLORS, FONT } from "../Campana/theme";
import { SLOW } from "../Estrategia/FX";
import {
  AttentionToRelation,
  BalanceAiHuman,
  LoyaltyDrop,
  ScatterChannels,
  SortingRouter,
} from "./FX3";

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

// D1 — Comunicación dispersa
const D1: React.FC = () => (
  <Body>
    <Kicker text="El Problema" delay={6} />
    <ScatterChannels delay={16} />
    <Gap h={30} />
    <Slow size={56} weight={700} delay={130} segments={[{ text: "No" }, { text: "sabes" }, { text: "qué" }, { text: "conversación" }, { text: "pierdes.", heat: true }]} />
    <Gap h={22} />
    <Caption text="Comentarios, mensajes y solicitudes, todo disperso." delay={182} />
  </Body>
);

// D2 — Clasificar
const D2: React.FC = () => (
  <Body>
    <Kicker text="La Solución" delay={6} />
    <SortingRouter delay={16} />
    <Gap h={40} />
    <Slow size={58} weight={700} delay={130} segments={[{ text: "Primero," }, { text: "clasificar.", accent: true }]} />
    <Gap h={20} />
    <Caption text="No responder todo: enrutar cada conversación." delay={175} />
  </Body>
);

// D3 — IA vs Humano
const D3: React.FC = () => (
  <Body>
    <Kicker text="IA vs Criterio" delay={6} />
    <BalanceAiHuman delay={16} />
    <Gap h={54} />
    <Slow size={58} delay={120} segments={[{ text: "La" }, { text: "IA", accent: true }, { text: "ordena;" }, { text: "tú" }, { text: "decides.", accent: true }]} />
  </Body>
);

// D4 — Atención -> Relación
const D4: React.FC = () => (
  <Body>
    <Kicker text="Atención en Relación" delay={6} />
    <AttentionToRelation delay={16} />
    <Gap h={44} />
    <Slow size={58} delay={130} segments={[{ text: "De" }, { text: "la" }, { text: "atención" }, { text: "a" }, { text: "la" }, { text: "relación.", accent: true }]} />
  </Body>
);

// D5 — Advertencia
const D5: React.FC = () => (
  <Body>
    <Kicker text="La Advertencia" delay={6} />
    <LoyaltyDrop delay={16} />
    <Gap h={54} />
    <Slow size={54} weight={700} delay={130} segments={[{ text: "La" }, { text: "conversación" }, { text: "que" }, { text: "abandonas," }, { text: "se" }, { text: "va" }, { text: "al" }, { text: "piso.", heat: true }]} />
  </Body>
);

export type TemaD = { id: string; titulo: string; durationInFrames: number; Clip: React.FC };
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

export const TEMAS_D: TemaD[] = [
  { id: "D1-Dispersa", titulo: "Comunicación dispersa", durationInFrames: 320, Clip: clip(D1) },
  { id: "D2-Clasificar", titulo: "Clasificar conversaciones", durationInFrames: 320, Clip: clip(D2) },
  { id: "D3-IA-Humano", titulo: "IA vs criterio humano", durationInFrames: 300, Clip: clip(D3) },
  { id: "D4-Relacion", titulo: "Atención en relación", durationInFrames: 320, Clip: clip(D4) },
  { id: "D5-Advertencia", titulo: "Advertencia: confianza al piso", durationInFrames: 320, Clip: clip(D5) },
];
