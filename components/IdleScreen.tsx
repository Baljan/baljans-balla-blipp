import React, { useMemo } from "react";
import { FaGithub } from "react-icons/fa";
import styles from "./IdleScreen.module.css";
import { useThemeContext } from "../utils/ThemeContext";
import { useBlippContext } from "../utils/BlippContext";

export default React.memo(function IdleScreen() {
    const { theme, testing } = useThemeContext();
    const { status } = useBlippContext();

    const invertGithub = false; // TODO: imp

    const {
        backgroundColor,
        backgroundImage,
        backgroundBlendMode,
        infoFontColor,
        titleFontColor,
        footerFontColor,
        infoText,
        title,
    } = theme.idle;

    return (
        <>
            <div
                className={styles.content}
                style={{
                    backgroundImage: backgroundImage,
                    backgroundColor: backgroundColor,
                    backgroundBlendMode: backgroundBlendMode,
                }}
            >
                {title !== "" ? (
                    <h1
                        className={styles.mainTitle}
                        style={{ color: titleFontColor }}
                    >
                        {title}
                    </h1>
                ) : null}
                {/* TODO: decide whether to remove, if so remove related styles and theme data */}
                {infoText ? (
                    <p
                        className={styles.infoText}
                        style={{ color: infoFontColor }}
                    >
                        {infoText}
                    </p>
                ) : null}
            </div>
            <div className={styles.footer} style={{ color: footerFontColor }}>
                <div className={styles.github} data-inverted={!!invertGithub}>
                    <FaGithub />
                    <span>
                        {testing
                            ? "Blippen körs nu i testläge"
                            : "github.com/Baljan"}
                    </span>
                </div>
                <div className={styles.loader} data-loading={status.loading} />
            </div>
        </>
    );
});
