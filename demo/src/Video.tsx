import { Audio, Sequence, staticFile } from "remotion";
import React from "react";
import { sec, DURATIONS } from "./constants";
import { TitleCard } from "./scenes/TitleCard";
import { LoginScene } from "./scenes/LoginScene";
import { TitleGenerationScene } from "./scenes/TitleGenerationScene";
import { BlogPostScene } from "./scenes/BlogPostScene";
import { ProgressBar } from "./components/ProgressBar";
import { SceneFade } from "./components/SceneFade";

const backgroundMusic = staticFile("audio/background.mp3");

export const Video: React.FC = () => {
  const OVERLAP = 10;
  let offset = 0;

  // Title card → Login: keep the fade transition
  const titleCardDur = sec(DURATIONS.titleCard);
  const titleCardFrom = offset;
  offset += titleCardDur - OVERLAP;

  const loginDur = sec(DURATIONS.login);
  const loginFrom = offset;
  offset += loginDur;

  // Login → Titles: hard cut
  const titleGenDur = sec(DURATIONS.titleGeneration);
  const titleGenFrom = offset;
  offset += titleGenDur;

  // Titles → Blog Post: hard cut
  const blogPostDur = sec(DURATIONS.blogPost);
  const blogPostFrom = offset;
  offset += blogPostDur;

  return (
    <div style={{ width: "100%", height: "100%", background: "#ffffff" }}>
      <Audio src={backgroundMusic} volume={0.11} />

      {/* Intro → Login (faded transition) */}
      <Sequence from={titleCardFrom} durationInFrames={titleCardDur}>
        <SceneFade durationInFrames={titleCardDur} overlapFrames={OVERLAP}>
          <TitleCard />
        </SceneFade>
      </Sequence>
      <Sequence from={loginFrom} durationInFrames={loginDur}>
        <SceneFade durationInFrames={loginDur} overlapFrames={OVERLAP}>
          <LoginScene />
        </SceneFade>
      </Sequence>

      {/* Remaining scenes: hard cuts */}
      <Sequence from={titleGenFrom} durationInFrames={titleGenDur}>
        <TitleGenerationScene />
      </Sequence>

      <Sequence from={blogPostFrom} durationInFrames={blogPostDur}>
        <BlogPostScene />
      </Sequence>

      <ProgressBar />
    </div>
  );
};
