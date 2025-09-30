import React, { useMemo } from "react";
import BlippImage from "../utils/blippImage";
import { Theme } from "../utils/types";
import { getRandomNumberBetween } from "../utils/utils";
import styles from "./Snowfall.module.css";

type Props = {
  theme: Theme;
};

export default React.memo(function Snowfall({ theme }: Props) {
  const snowfall = useMemo(
    () => (theme.snowfall ? theme.snowfall() : undefined),
    [theme]
  );

  if (!snowfall) return null;

  const range = Array.from(Array(snowfall.count).keys()); // array of [0, ..., count]

  return (
    <div
      className={styles.snowfall}
      aria-hidden="true"
      data-rotation={!!snowfall.randomRotation}
    >
      {range.map((i) => {
        const { content, size, speed } = snowfall.getFlake(i);
        const fallSpeed = getRandomNumberBetween(7, 12) / speed;
        const shakeSpeed = getRandomNumberBetween(2.5, 3.5) / speed;
        const fallDelay = getRandomNumberBetween(0, fallSpeed);
        const shakeDelay = getRandomNumberBetween(0, shakeSpeed);
        const hueRotate = getRandomNumberBetween(0, 360);
        const rotation = getRandomNumberBetween(0, 360);
        const flakeVariables = {
          "--snowflake-size": size,
          "--shake-speed": `${shakeSpeed}s`,
          "--shake-delay": `-${shakeDelay}s`, // Negative delays for instant start.
          "--fall-speed": `${fallSpeed}s`,
          "--fall-delay": `-${fallDelay}s`,
          "--hue-rotate": `${hueRotate}deg`,
          "--rotate": `${rotation}deg`,
        } as React.CSSProperties;

        return (
          <div key={i} className={styles.snowflake} style={flakeVariables}>
            <div
              style={{
                animationDirection: snowfall.reverse ? "reverse" : "normal",

                filter: snowfall.randomHue
                  ? "hue-rotate(var(--hue-rotate))"
                  : "none",
              }}
            >
              {content instanceof BlippImage ? content.getReactNode() : content}
            </div>
          </div>
        );
      })}
    </div>
  );
});
