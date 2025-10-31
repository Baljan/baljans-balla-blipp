import React, { useEffect, useRef, useState } from "react";
import BlippAudio from "../utils/blippAudio";
import { Theme } from "../utils/types";
import { useBlippApi } from "../utils/useBlippApi";
import useRegisterCard from "../utils/useRegisterCard";
import IdleScreen from "./IdleScreen";
import RegisterCard from "./RegisterCard";
import Snowfall from "./Snowfall";
import StatusScreen from "./StatusScreen";

type Props = {
  theme: Theme;
  testing: boolean;
  setThemeOverride: (name: string) => void;
};

export default function BallaBlippen({
  theme,
  testing,
  setThemeOverride,
}: Props) {
  const [queue, setQueue] = useState<string[]>([]);
  const rfid = useRef(""); // Save as ref to not rerender on every change.

  const { blippStatus, doBlipp, resetBlippStatus } = useBlippApi(
    theme,
    testing,
    setThemeOverride
  );

  const registerCardState = useRegisterCard();

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
    <div>
      <IdleScreen
        theme={theme}
        loading={blippStatus.loading}
        show={blippStatus.show}
        testing={testing}
      />

      <StatusScreen
        blippStatus={blippStatus}
        onAnimationComplete={resetBlippStatus}
      />

      <Snowfall theme={theme} />

      <RegisterCard
        blippStatus={blippStatus}
        registerCardState={registerCardState}
      />
    </div>
  );
}
