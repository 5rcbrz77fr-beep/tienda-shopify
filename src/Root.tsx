import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { Campana, CAMPANA_TOTAL } from "./Campana/Campana";
import { TEMAS } from "./Campana/scenes";
import { SquareVideo } from "./Square/SquareVideo";
import { DURATION_SECONDS } from "./Square/captions";
import { TEMAS_E } from "./Estrategia/scenes";
import { TEMAS_C } from "./Comunicacion/scenes";
import { TEMAS_D } from "./Dispersa/scenes";
import { TEMAS_DYN } from "./Dinamico/scenes";
import { CleanSorting } from "./Limpio/Clean";
import { TEMAS_W } from "./Limpio/whatsapp";
import { TEMAS_V } from "./Limpio/mensaje";

const SQUARE_FPS = 30;

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Video combinado — formato vertical 9:16 (1080x1920) */}
      <Composition
        id="Campana"
        component={Campana}
        durationInFrames={CAMPANA_TOTAL}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Video CUADRADO 1:1 para YouTube — narración + subtítulos karaoke */}
      <Composition
        id="Cuadrado-YouTube"
        component={SquareVideo}
        durationInFrames={Math.ceil(DURATION_SECONDS * SQUARE_FPS) + 30}
        fps={SQUARE_FPS}
        width={1080}
        height={1080}
      />

      {/* Clips independientes, uno por párrafo del guión (guión 1) */}
      {TEMAS.map((t) => (
        <Composition
          key={t.id}
          id={t.id}
          component={t.Clip}
          durationInFrames={t.durationInFrames}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}

      {/* Clips del guión 2 — Estrategia + IA (más gráficos, slow-motion) */}
      {TEMAS_E.map((t) => (
        <Composition
          key={t.id}
          id={t.id}
          component={t.Clip}
          durationInFrames={t.durationInFrames}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}

      {/* Clips del guión 3 — Comunicación digital (9 clips premium) */}
      {TEMAS_C.map((t) => (
        <Composition
          key={t.id}
          id={t.id}
          component={t.Clip}
          durationInFrames={t.durationInFrames}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}

      {/* Clips del guión 4 — Comunicación dispersa (5 clips premium) */}
      {TEMAS_D.map((t) => (
        <Composition
          key={t.id}
          id={t.id}
          component={t.Clip}
          durationInFrames={t.durationInFrames}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}

      {/* Estilo LIMPIO — composición equilibrada (muestra para validar) */}
      <Composition
        id="LIMPIO-Clasifica"
        component={CleanSorting}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Guión WhatsApp — estilo LIMPIO equilibrado (5 clips) */}
      {TEMAS_W.map((t) => (
        <Composition
          key={t.id}
          id={t.id}
          component={t.Clip}
          durationInFrames={t.durationInFrames}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}

      {/* Guión Matriz de Mensajes — estilo LIMPIO equilibrado (5 clips) */}
      {TEMAS_V.map((t) => (
        <Composition
          key={t.id}
          id={t.id}
          component={t.Clip}
          durationInFrames={t.durationInFrames}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}

      {/* Estilo DINÁMICO — casi sin texto, pura animación en movimiento */}
      {TEMAS_DYN.map((t) => (
        <Composition
          key={t.id}
          id={t.id}
          component={t.Clip}
          durationInFrames={t.durationInFrames}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
