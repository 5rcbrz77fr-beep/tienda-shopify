import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HeatBackground } from "../Campana/HeatBackground";
import { COLORS, FONT } from "../Campana/theme";
import { Captions } from "./Captions";
import { Waveform } from "./Waveform";

const AUDIO = "narracion.mp3";

const fmt = (s: number): string => {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};

const TopBar: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      position: "absolute",
      top: 54,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
      fontFamily: FONT,
    }}
  >
    <div style={{ width: 44, height: 3, background: COLORS.accent }} />
    <span
      style={{
        color: COLORS.accent,
        fontWeight: 700,
        fontSize: 28,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
    <div style={{ width: 44, height: 3, background: COLORS.accent }} />
  </div>
);

const BottomHud: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const total = durationInFrames / fps;
  const p = frame / durationInFrames;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 60,
        right: 60,
      }}
    >
      <Waveform src={src} bars={44} />
      <div style={{ height: 26 }} />
      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${p * 100}%`,
            background: `linear-gradient(90deg, ${COLORS.heatLow}, ${COLORS.accent}, ${COLORS.heatHigh})`,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 14,
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 600,
          color: COLORS.inkSoft,
        }}
      >
        <span>{fmt(t)}</span>
        <span>{fmt(total)}</span>
      </div>
    </div>
  );
};

export const SquareVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Fade global de entrada/salida
  const opacity = interpolate(
    frame,
    [0, 20, durationInFrames - 24, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: COLORS.bg0 }}>
      <HeatBackground intensity={0.85} />
      <Audio src={staticFile(AUDIO)} />
      <AbsoluteFill style={{ opacity }}>
        <TopBar label="Estrategia de Campaña" />
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <Captions />
        </AbsoluteFill>
        <BottomHud src={staticFile(AUDIO)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
