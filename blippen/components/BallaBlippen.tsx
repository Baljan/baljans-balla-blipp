import React, { useEffect, useMemo, useRef, useState } from "react";
import BlippAudio from "../utils/blippAudio";
import { BlippStatus, Theme } from "../utils/types";
import { useBlippApi } from "../utils/useBlippApi";
import useRegisterCard from "../utils/useRegisterCard";
import IdleScreen from "./IdleScreen";
import RegisterCard from "./RegisterCard";
import Snowfall from "./Snowfall";
import StatusScreen from "./StatusScreen";

import styles from "./BallaBlippen.module.css";

type Props = {
  theme: Theme;
  testing: boolean;
  setThemeOverride: (name: string) => void;
  // Preview-only: pin the success/error screen so the theme editor can tweak
  // it live. The pinned screen reflects the current theme and never times out.
  holdStatus?: "success" | "error" | null;
};

export default function BallaBlippen({
  theme,
  testing,
  setThemeOverride,
  holdStatus = null,
}: Props) {
  const [queue, setQueue] = useState<string[]>([]);
  const rfid = useRef(""); // Save as ref to not rerender on every change.

  const { blippStatus, doBlipp, resetBlippStatus } = useBlippApi(
    theme,
    testing,
    setThemeOverride
  );

  const registerCardState = useRegisterCard();

  // A live, never-timing-out status built straight from the current theme.
  // Recomputing on every theme edit lets StatusScreen update in place.
  const heldStatus = useMemo<BlippStatus | null>(
    () =>
      holdStatus
        ? {
            show: true,
            loading: false,
            success: holdStatus === "success",
            theme:
              holdStatus === "success"
                ? theme.successScreen()
                : theme.errorScreen(),
            message:
              holdStatus === "success" ? (
                <span>
                  Du har <b>42 kr</b> kvar att blippa för
                </span>
              ) : (
                "Förhandsvisning"
              ),
            duration: 0,
          }
        : null,
    [holdStatus, theme]
  );

  // Read from blipp reader and add to queue.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        // Audio needs to be initialized by user interaction.
        // Will initialize each audio file only once.
        BlippAudio.initAll();

        setQueue((prev) => [...prev, rfid.current]);
        rfid.current = "";
      } else {
        rfid.current = rfid.current + e.key;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Handle blipp queue
  useEffect(() => {
    const readyToBlipp =
      !blippStatus.show &&
      !blippStatus.loading &&
      registerCardState.status !== "shown" &&
      queue.length > 0;
    if (readyToBlipp) {
      const [current, ...rest] = queue;
      registerCardState.reset();
      setQueue(rest);

      doBlipp(current);
    }
  }, [queue, blippStatus, doBlipp, registerCardState]);

  return (
    <div className={styles.container} data-testing={testing}>
      <IdleScreen
        theme={theme}
        loading={blippStatus.loading}
        show={blippStatus.show}
        testing={testing}
      />

      <StatusScreen
        blippStatus={heldStatus ?? blippStatus}
        onAnimationComplete={resetBlippStatus}
        hold={!!heldStatus}
      />

      <Snowfall theme={theme} />

      <RegisterCard
        blippStatus={blippStatus}
        registerCardState={registerCardState}
      />
    </div>
  );
}
