import { AbsoluteFill, useVideoConfig } from "remotion";
import { FadeWrap } from "../Campana/scenes";
import { COLORS } from "../Campana/theme";
import {
  Balanza,
  BigWord,
  Clasificador,
  Drenaje,
  Enjambre,
  RedParticulas,
} from "./FX4";

// Cada clip = gráfico a pantalla completa + UNA palabra. Puro movimiento.
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>{children}</AbsoluteFill>
);

const S1: React.FC = () => (
  <Stage>
    <Enjambre />
    <BigWord text="DISPERSO" color={COLORS.heatHigh} delay={40} />
  </Stage>
);
const S2: React.FC = () => (
  <Stage>
    <Clasificador />
    <BigWord text="CLASIFICA" color={COLORS.accent} delay={40} />
  </Stage>
);
const S3: React.FC = () => (
  <Stage>
    <Balanza />
    <BigWord text="TÚ DECIDES" color={COLORS.ink} delay={40} />
  </Stage>
);
const S4: React.FC = () => (
  <Stage>
    <RedParticulas />
    <BigWord text="CONECTA" color={COLORS.accent} delay={40} />
  </Stage>
);
const S5: React.FC = () => (
  <Stage>
    <Drenaje />
    <BigWord text="NO LO ABANDONES" color={COLORS.heatHigh} delay={40} />
  </Stage>
);

export type TemaDyn = { id: string; titulo: string; durationInFrames: number; Clip: React.FC };
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

export const TEMAS_DYN: TemaDyn[] = [
  { id: "DYN1-Enjambre", titulo: "Dinámico · Disperso", durationInFrames: 300, Clip: clip(S1) },
  { id: "DYN2-Clasifica", titulo: "Dinámico · Clasifica", durationInFrames: 300, Clip: clip(S2) },
  { id: "DYN3-Balanza", titulo: "Dinámico · Tú decides", durationInFrames: 300, Clip: clip(S3) },
  { id: "DYN4-Red", titulo: "Dinámico · Conecta", durationInFrames: 300, Clip: clip(S4) },
  { id: "DYN5-Drenaje", titulo: "Dinámico · No lo abandones", durationInFrames: 300, Clip: clip(S5) },
];
