import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HeatBackground } from "./HeatBackground";
import { KineticLine, Kicker } from "./AnimatedText";
import { COLORS, FONT } from "./theme";

/** Envuelve una escena con fade de entrada/salida. */
const Scene: React.FC<{
  from: number;
  duration: number;
  children: React.ReactNode;
}> = ({ from, duration, children }) => {
  return (
    <Sequence from={from} durationInFrames={duration}>
      <SceneInner duration={duration}>{children}</SceneInner>
    </Sequence>
  );
};

const SceneInner: React.FC<{
  duration: number;
  children: React.ReactNode;
}> = ({ duration, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 12, duration - 14, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill
      style={{
        opacity,
        justifyContent: "center",
        alignItems: "center",
        padding: "0 70px",
      }}
    >
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Barra de progreso inferior que avanza durante todo el video. */
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div style={{ height: 6, width: "100%", background: "rgba(255,255,255,0.08)" }}>
        <div
          style={{
            height: "100%",
            width: `${p * 100}%`,
            background: `linear-gradient(90deg, ${COLORS.heatLow}, ${COLORS.accent}, ${COLORS.heatHigh})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Campana: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg0 }}>
      <HeatBackground />

      {/* 1. Hook — la edad no basta */}
      <Scene from={0} duration={150}>
        <Kicker text="Campaña Electoral" delay={6} />
        <KineticLine
          size={130}
          segments={[{ text: "25" }, { text: "a" }, { text: "55", accent: true }, { text: "años" }]}
          delay={14}
        />
        <div style={{ height: 30 }} />
        <KineticLine
          size={62}
          weight={600}
          delay={44}
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
      </Scene>

      {/* 2. Demografía vs territorio */}
      <Scene from={150} duration={180}>
        <KineticLine
          size={78}
          delay={8}
          segments={[
            { text: "La" },
            { text: "demografía" },
            { text: "te" },
            { text: "da" },
            { text: "el" },
            { text: "dato." },
          ]}
        />
        <div style={{ height: 44 }} />
        <KineticLine
          size={90}
          delay={54}
          segments={[
            { text: "El" },
            { text: "territorio", accent: true },
            { text: "te" },
            { text: "da" },
            { text: "la" },
            { text: "verdad.", accent: true },
          ]}
        />
      </Scene>

      {/* 3. Cada persona es un mundo */}
      <Scene from={330} duration={200}>
        <Kicker text="Escucha Territorial" delay={6} />
        <KineticLine
          size={84}
          delay={16}
          segments={[
            { text: "Cada" },
            { text: "persona" },
            { text: "es" },
            { text: "un" },
            { text: "mundo", accent: true },
            { text: "distinto." },
          ]}
        />
        <div style={{ height: 40 }} />
        <KineticLine
          size={52}
          weight={600}
          delay={64}
          segments={[
            { text: "A" },
            { text: "uno" },
            { text: "le" },
            { text: "falta" },
            { text: "agua.", heat: true },
            { text: "A" },
            { text: "otro," },
            { text: "un" },
            { text: "trámite.", heat: true },
          ]}
        />
      </Scene>

      {/* 4. Misma edad, distinto problema */}
      <Scene from={530} duration={160}>
        <KineticLine
          size={104}
          delay={8}
          segments={[{ text: "Misma" }, { text: "edad." }]}
        />
        <div style={{ height: 28 }} />
        <KineticLine
          size={104}
          delay={40}
          segments={[
            { text: "Problemas" },
            { text: "distintos.", heat: true },
          ]}
        />
      </Scene>

      {/* 5. Inteligencia Artificial + mapa de calor */}
      <Scene from={690} duration={210}>
        <Kicker text="Inteligencia Artificial" delay={6} />
        <KineticLine
          size={80}
          delay={16}
          segments={[
            { text: "Suma" },
            { text: "la" },
            { text: "IA", accent: true },
            { text: "y" },
            { text: "el" },
          ]}
        />
        <KineticLine
          size={98}
          delay={44}
          segments={[
            { text: "mapa", heat: true },
            { text: "de", heat: true },
            { text: "calor", heat: true },
          ]}
        />
        <div style={{ height: 30 }} />
        <KineticLine
          size={54}
          weight={600}
          delay={78}
          segments={[
            { text: "aterriza" },
            { text: "en" },
            { text: "el" },
            { text: "territorio.", accent: true },
          ]}
        />
      </Scene>

      {/* 6. La data habla */}
      <Scene from={900} duration={180}>
        <KineticLine
          size={78}
          delay={8}
          segments={[
            { text: "La" },
            { text: "data", accent: true },
            { text: "te" },
            { text: "dice" },
          ]}
        />
        <div style={{ height: 30 }} />
        <KineticLine
          size={66}
          weight={600}
          delay={48}
          segments={[
            { text: "lo" },
            { text: "que" },
            { text: "la" },
            { text: "gente" },
            { text: "quiere" },
            { text: "decirte.", accent: true },
          ]}
        />
      </Scene>

      {/* 7. Del territorio al WhatsApp */}
      <Scene from={1080} duration={210}>
        <Kicker text="Del Mapa a la Conversación" delay={6} />
        <KineticLine
          size={88}
          delay={16}
          segments={[
            { text: "Del" },
            { text: "territorio" },
            { text: "al" },
          ]}
        />
        <KineticLine
          size={112}
          delay={46}
          segments={[{ text: "WhatsApp.", accent: true }]}
        />
        <div style={{ height: 34 }} />
        <KineticLine
          size={54}
          weight={600}
          delay={76}
          segments={[
            { text: "Una" },
            { text: "conversación," },
            { text: "uno" },
            { text: "a" },
            { text: "uno.", accent: true },
          ]}
        />
      </Scene>

      {/* 8. Siente el dolor, humaniza, ofrece la solución */}
      <Scene from={1290} duration={200}>
        <KineticLine
          size={72}
          delay={8}
          segments={[
            { text: "Sientes" },
            { text: "el" },
            { text: "dolor.", heat: true },
          ]}
        />
        <div style={{ height: 24 }} />
        <KineticLine
          size={72}
          delay={44}
          segments={[{ text: "Lo" }, { text: "humanizas." }]}
        />
        <div style={{ height: 24 }} />
        <KineticLine
          size={80}
          delay={80}
          segments={[
            { text: "Ofreces" },
            { text: "la" },
            { text: "solución.", accent: true },
          ]}
        />
      </Scene>

      {/* 9. Tu campaña es la solución */}
      <Scene from={1490} duration={180}>
        <KineticLine
          size={78}
          delay={8}
          segments={[{ text: "Y" }, { text: "tu" }, { text: "campaña" }]}
        />
        <div style={{ height: 26 }} />
        <KineticLine
          size={112}
          delay={40}
          segments={[
            { text: "se" },
            { text: "vuelve" },
            { text: "la" },
            { text: "solución.", accent: true },
          ]}
        />
      </Scene>

      {/* 10. Cierre */}
      <Scene from={1670} duration={190}>
        <KineticLine
          size={70}
          delay={8}
          segments={[
            { text: "No" },
            { text: "importa" },
            { text: "la" },
            { text: "edad." },
          ]}
        />
        <div style={{ height: 30 }} />
        <KineticLine
          size={82}
          delay={44}
          segments={[
            { text: "Nunca" },
            { text: "son" },
            { text: "los" },
            { text: "mismos" },
            { text: "problemas.", heat: true },
          ]}
        />
        <div style={{ height: 60 }} />
        <div
          style={{
            fontFamily: FONT,
            color: COLORS.inkSoft,
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          Nos vemos en la próxima.
        </div>
      </Scene>

      <ProgressBar />
    </AbsoluteFill>
  );
};
