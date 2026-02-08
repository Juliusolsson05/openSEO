import { registerRoot, Composition } from "remotion";
import React from "react";
import { Video } from "./Video";
import { ShortDemo } from "./ShortDemo";
import { FPS, WIDTH, HEIGHT, TOTAL_DURATION, sec } from "./constants";

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video"
        component={Video}
        durationInFrames={sec(TOTAL_DURATION)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="ShortDemo"
        component={ShortDemo}
        durationInFrames={sec(30)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};

registerRoot(RemotionRoot);
