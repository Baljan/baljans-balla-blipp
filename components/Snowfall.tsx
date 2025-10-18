import Image from "next/image";
import React from "react";
import { getRandomNumberBetween } from "../utils/helpers";
import { useThemeContext } from "../utils/ThemeContext";
import styles from "./Snowfall.module.css";

export default React.memo(function Snowfall() {
    const { theme } = useThemeContext();
    const { snowfall, assets } = theme;

    if (!snowfall) return null;
    const { count, size, speed } = snowfall;
    const range = Array.from(Array(count).keys()); // array of [0, ..., count]

    return (
        <div
            className={styles.snowfall}
            aria-hidden="true"
            data-rotation={!!snowfall.randomRotation}
            style={{ "--snowflake-size": size } as React.CSSProperties}
        >
            {range.map((i) => {
                const assetId = snowfall.content[i % snowfall.content.length];
                const asset = assets[assetId];

                const fallSpeed = getRandomNumberBetween(16, 24) / speed;
                const shakeSpeed = getRandomNumberBetween(2.5, 3.5) / speed;
                const fallDelay = getRandomNumberBetween(0, fallSpeed);
                const shakeDelay = getRandomNumberBetween(0, shakeSpeed);
                const hueRotate = getRandomNumberBetween(0, 360);
                const rotation = getRandomNumberBetween(0, 360);
                const flakeVariables = {
                    "--shake-speed": `${shakeSpeed}s`,
                    "--shake-delay": `-${shakeDelay}s`, // Negative delays for instant start.
                    "--fall-speed": `${fallSpeed}s`,
                    "--fall-delay": `-${fallDelay}s`,
                    "--hue-rotate": `${hueRotate}deg`,
                    "--rotate": `${rotation}deg`,
                } as React.CSSProperties;

                return (
                    <div
                        key={i}
                        className={styles.snowflake}
                        style={flakeVariables}
                    >
                        <div
                            style={
                                {
                                    // animationDirection: snowfall.reverse
                                    //     ? "reverse"
                                    //     : "normal",
                                    // filter: snowfall.randomHue
                                    //     ? "hue-rotate(var(--hue-rotate))"
                                    //     : "none",
                                }
                            }
                        >
                            <Image src={asset.url} alt="snowflake" fill />
                        </div>
                    </div>
                );
            })}
        </div>
    );
});
