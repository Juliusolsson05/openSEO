import { Audio, Sequence, staticFile } from "remotion";
import React from "react";
import { sec, DURATIONS } from "./constants";
import { TitleCard } from "./scenes/TitleCard";
import { LoginScene } from "./scenes/LoginScene";
import { TitleGenerationScene } from "./scenes/TitleGenerationScene";
import { ProgressBar } from "./components/ProgressBar";
import { SceneFade } from "./components/SceneFade";

const backgroundMusic = staticFile("audio/background.mp3");

export const Video: React.FC = () => {
  const OVERLAP = 10;
  let offset = 0;
  const scene = (durationSeconds: number, element: React.ReactNode) => {
    const duration = sec(durationSeconds);
    const from = offset;
    offset += duration - OVERLAP;
    return (
      <Sequence from={from} durationInFrames={duration}>
        <SceneFade durationInFrames={duration} overlapFrames={OVERLAP}>
          {element}
        </SceneFade>
      </Sequence>
    );
  };

  return (
    <div style={{ width: "100%", height: "100%", background: "#ffffff" }}>
      <Audio src={backgroundMusic} volume={0.22} />
      {scene(DURATIONS.titleCard, <TitleCard />)}
      {scene(DURATIONS.login, <LoginScene />)}
      {scene(DURATIONS.titleGeneration, <TitleGenerationScene />)}
      <ProgressBar />
    </div>
  );
};
