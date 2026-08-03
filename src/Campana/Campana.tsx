import { AbsoluteFill, Sequence } from "remotion";
import { FadeWrap, TEMAS } from "./scenes";
import { COLORS } from "./theme";

/**
 * Video combinado: encadena todos los temas (párrafos) uno tras otro.
 * Cada clip también existe como composición independiente (ver Root.tsx),
 * por si quieres agregarlos por separado en tu edición.
 */
export const Campana: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ background: COLORS.bg0 }}>
      {TEMAS.map((t) => {
        const from = cursor;
        cursor += t.durationInFrames;
        const Content = t.Body;
        return (
          <Sequence key={t.id} from={from} durationInFrames={t.durationInFrames}>
            <FadeWrap duration={t.durationInFrames} withProgress={false}>
              <Content />
            </FadeWrap>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const CAMPANA_TOTAL = TEMAS.reduce((a, t) => a + t.durationInFrames, 0);
