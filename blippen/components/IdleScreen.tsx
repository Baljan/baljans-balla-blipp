import React, { useMemo } from "react";
import { FaGithub } from "react-icons/fa";
import { Theme } from "../utils/types";
import styles from "./IdleScreen.module.css";

type Props = {
  theme: Theme;
  loading: boolean;
  testing: boolean;
};

export default React.memo(function IdleScreen({
  theme,
  loading,
  testing,
}: Props) {
  const {
    backgroundColor,
    backgroundImage,
    backgroundBlendMode,
    infoFontColor,
    titleFontColor,
    footerFontColor,
    infoText,
    title,
    invertGithub,
  } = useMemo(() => theme.mainScreen(), [theme]);

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
          <h1 className={styles.mainTitle} style={{ color: titleFontColor }}>
            {title}
          </h1>
        ) : null}
        {/* TODO: decide whether to remove, if so remove related styles and theme data */}
        {infoText ? (
          <p className={styles.infoText} style={{ color: infoFontColor }}>
            {infoText}
          </p>
        ) : null}
      </div>
      <div className={styles.footer} style={{ color: footerFontColor }}>
        <div className={styles.github} data-inverted={!!invertGithub}>
          <FaGithub />
          <span>
            {testing ? "Blippen körs nu i testläge" : "github.com/Baljan"}
          </span>
        </div>
        <div className={styles.loader} data-loading={loading} />
      </div>
    </>
  );
});
