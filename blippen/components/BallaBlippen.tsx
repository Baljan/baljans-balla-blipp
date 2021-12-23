import React, { useCallback, useEffect, useState } from "react";
import { BlippStatus, Theme } from "../utils/types";
import { useBlippApi } from "../utils/useBlippApi";
import styles from "./BallaBlippen.module.css";
import MainScreen from "./MainScreen";
import Snowfall from "./Snowfall";
import StatusScreen from "./StatusScreen";

type Props = {
  theme: Theme;
  testing: boolean;
};

export default function BallaBlippen({ theme, testing }: Props) {
  const [rfid, setRfid] = useState("");
  const [rfidInput, setRfidInput] = useState<HTMLInputElement | null>(null);
  const [queue, setQueue] = useState<string[]>([]);

  const { blippStatus, doBlipp, resetBlippStatus } = useBlippApi(
    theme,
    testing
  );

  // Handle the automatic focus of the input field
  const onRefChange = useCallback((node: HTMLInputElement) => {
    if (node === null) {
      // DOM node referenced by ref has been unmounted
      setRfidInput(null);
    } else {
      // DOM node referenced by ref has changed and exists
      node.focus();
      setRfidInput(node);
    }
  }, []);
  useEffect(() => {
    const onFocus = () => {
      rfidInput?.focus();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [rfidInput]);

  // Handle blipp queue
  useEffect(() => {
    const readyToBlipp =
      !blippStatus.show && !blippStatus.loading && queue.length > 0;
    if (readyToBlipp) {
      const [current, ...rest] = queue;
      setQueue(rest);

      doBlipp(current);
    }
  }, [queue, blippStatus, doBlipp]);

  return (
    <div
      onClick={() => {
        rfidInput?.focus();
      }}
    >
      {/* Hidden form for reading input from keyboard emulated device */}
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          setQueue((prev) => [...prev, rfid]);
          setRfid("");
        }}
      >
        <input
          ref={onRefChange}
          value={rfid}
          onChange={(e) => {
            setRfid(e.target.value);
          }}
          onBlur={(e) => {
            // Refocus input on blur
            e.target.focus();
          }}
          onLoad={(e) => {
            e.currentTarget.focus();
          }}
          type="text"
          name="rfid"
          autoComplete="off"
        />
      </form>

      <MainScreen
        theme={theme}
        loading={blippStatus.loading}
        testing={testing}
      />

      <StatusScreen
        blippStatus={blippStatus}
        onAnimationComplete={resetBlippStatus}
      />

      <Snowfall theme={theme} />
    </div>
  );
}
