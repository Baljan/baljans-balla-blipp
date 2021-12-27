import React, { useMemo } from "react";
import { FaGithub } from "react-icons/fa";
import { Theme } from "../utils/types";
import styles from "./MainScreen.module.css";

type Props = {
  theme: Theme;
  loading: boolean;
  testing: boolean;
};

export default React.memo(function MainScreen({
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
        <h1 className={styles.mainTitle} style={{ color: titleFontColor }}>
          Baljans Balla Blipp
        </h1>
        {/* TODO: decide whether to remove, if so remove related styles and theme data */}
        {/* <p className={styles.infoText} style={{ color: infoFontColor }}>
          För att blippa måste du fylla i ditt LiU-kortnummer på baljan.org
        </p>
        <p className={styles.infoText} style={{ color: infoFontColor }}>
          Logga in och klicka på &quot;Fyll i kortnummer&quot; för instruktioner
        </p> */}
      </div>
      <div className={styles.footer} style={{ color: footerFontColor }}>
        <div className={styles.github}>
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
