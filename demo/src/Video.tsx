import { Audio, Sequence, staticFile } from "remotion";
import React from "react";
import { sec, DURATIONS } from "./constants";
import { TitleCard } from "./scenes/TitleCard";
import { LoginScene } from "./scenes/LoginScene";
import { TitleGenerationScene } from "./scenes/TitleGenerationScene";
import { BlogPostScene } from "./scenes/BlogPostScene";
import { OutroScene } from "./scenes/OutroScene";
import { ProgressBar } from "./components/ProgressBar";
import { GuideBox } from "./components/GuideBox";

const backgroundMusic = staticFile("audio/background.mp3");

export const Video: React.FC = () => {
  let offset = 0;

  const introDur = sec(DURATIONS.intro);
  const introFrom = offset;
  offset += introDur;

  const loginDur = sec(DURATIONS.login);
  const loginFrom = offset;
  offset += loginDur;

  const titleGenDur = sec(DURATIONS.titleGeneration);
  const titleGenFrom = offset;
  offset += titleGenDur;

  const blogPostDur = sec(DURATIONS.blogPost);
  const blogPostFrom = offset;
  offset += blogPostDur;

  const outroDur = sec(DURATIONS.outro);
  const outroFrom = offset;
  offset += outroDur;

  return (
    <div style={{ width: "100%", height: "100%", background: "#ffffff" }}>
      <Audio src={backgroundMusic} volume={0.11} />

      <Sequence from={introFrom} durationInFrames={introDur}>
        <TitleCard />
      </Sequence>

      <Sequence from={loginFrom} durationInFrames={loginDur}>
        <LoginScene />
      </Sequence>

      <Sequence from={titleGenFrom} durationInFrames={titleGenDur}>
        <TitleGenerationScene />
      </Sequence>

      <Sequence from={blogPostFrom} durationInFrames={blogPostDur}>
        <BlogPostScene />
      </Sequence>

      <Sequence from={outroFrom} durationInFrames={outroDur}>
        <OutroScene />
      </Sequence>

      <GuideBox />
      <ProgressBar />
    </div>
  );
};
