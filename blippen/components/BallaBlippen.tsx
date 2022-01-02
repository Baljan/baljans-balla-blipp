import React, { useCallback, useEffect, useRef, useState } from "react";
import { Theme } from "../utils/types";
import { useBlippApi } from "../utils/useBlippApi";
import useRegisterCard from "../utils/useRegisterCard";
import styles from "./BallaBlippen.module.css";
import MainScreen from "./MainScreen";
import RegisterCard from "./RegisterCard";
import Snowfall from "./Snowfall";
import StatusScreen from "./StatusScreen";

type Props = {
  theme: Theme;
  testing: boolean;
};

export default function BallaBlippen({ theme, testing }: Props) {
  // const [rfidInput, setRfidInput] = useState<HTMLInputElement | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const rfid = useRef("");

  const { blippStatus, doBlipp, resetBlippStatus } = useBlippApi(
    theme,
    testing
  );

  const registerCardState = useRegisterCard();

  // // Handle the automatic focus of the input field
  // const onRefChange = useCallback((node: HTMLInputElement) => {
  //   if (node === null) {
  //     // DOM node referenced by ref has been unmounted
  //     setRfidInput(null);
  //     console.log("unfocus");
  //   } else {
  //     // DOM node referenced by ref has changed and exists
  //     node.focus();
  //     console.log("focus");

  //     setRfidInput(node);
  //   }
  // }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
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

  // useEffect(() => {
  //   const onFocus = () => {
  //     rfidInput?.focus();
  //   };
  //   window.addEventListener("focus", onFocus);
  //   return () => {
  //     window.removeEventListener("focus", onFocus);
  //   };
  // }, [rfidInput]);

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
    <div
    // onClick={() => {
    //   rfidInput?.focus();
    // }}
    >
      {/* Hidden form for reading input from keyboard emulated device */}
      {/* <form
        id="form" // To work in the blipp app
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (rfidInput) {
            // rfidInput is "uncontrolled" to keep up with the speed of the rfid reader.
            const rfid = rfidInput.value;
            setQueue((prev) => [...prev, rfid]);
            rfidInput.value = "";
          }
        }}
      >
        <input
          id="rfid" // To work in the blipp app
          ref={onRefChange}
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
      </form> */}

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

      <RegisterCard
        blippStatus={blippStatus}
        registerCardState={registerCardState}
      />
    </div>
  );
}
