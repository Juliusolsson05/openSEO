import { Audio, Sequence, staticFile } from "remotion";
import React from "react";
import { sec, DURATIONS } from "./constants";
import { TitleCard } from "./scenes/TitleCard";
import { LoginScene } from "./scenes/LoginScene";
import { TitleGenerationScene } from "./scenes/TitleGenerationScene";
import { BlogPostScene } from "./scenes/BlogPostScene";
import { PublishedBlogScene } from "./scenes/PublishedBlogScene";
import { TrafficGrowthScene } from "./scenes/TrafficGrowthScene";
import { OutroScene } from "./scenes/OutroScene";
import { SlideTransition } from "./components/SlideTransition";
import { ProgressBar } from "./components/ProgressBar";
import { GuideBox } from "./components/GuideBox";

const backgroundMusic = staticFile("audio/background.mp3");

/* Overlap frames — next scene starts sliding in while previous scene is still showing */
const OV = 8;

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

  const publishedBlogDur = sec(DURATIONS.publishedBlog);
  const publishedBlogFrom = offset - OV; // overlap with blog post end
  offset += publishedBlogDur - OV;

  const trafficGrowthDur = sec(DURATIONS.trafficGrowth);
  const trafficGrowthFrom = offset - OV;
  offset += trafficGrowthDur - OV;

  const outroDur = sec(DURATIONS.outro);
  const outroFrom = offset - OV;
  offset += outroDur - OV;

  return (
    <div style={{ width: "100%", height: "100%", background: "#0A1628" }}>
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

      {/* After publish click — slide in the real website */}
      <Sequence from={publishedBlogFrom} durationInFrames={publishedBlogDur + OV}>
        <SlideTransition direction="right" durationFrames={14}>
          <PublishedBlogScene />
        </SlideTransition>
      </Sequence>

      {/* Traffic results — slide up */}
      <Sequence from={trafficGrowthFrom} durationInFrames={trafficGrowthDur + OV}>
        <SlideTransition direction="up" durationFrames={12}>
          <TrafficGrowthScene />
        </SlideTransition>
      </Sequence>

      {/* Outro — slide up */}
      <Sequence from={outroFrom} durationInFrames={outroDur + OV}>
        <SlideTransition direction="up" durationFrames={12}>
          <OutroScene />
        </SlideTransition>
      </Sequence>

      <GuideBox />
      <ProgressBar />
    </div>
  );
};
