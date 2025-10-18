import React, { useEffect, useRef, useState } from "react";
import BlippAudio from "../blippen/utils/blippAudio";
import useRegisterCard from "../blippen/utils/useRegisterCard";
import IdleScreen from "./IdleScreen";
import RegisterCard from "./RegisterCard";
import Snowfall from "./Snowfall";
import StatusScreen from "./StatusScreen";
import { AnimatePresence, motion } from "framer-motion";
import { useBlippContext } from "../utils/BlippContext";
import { useThemeContext } from "../utils/ThemeContext";
import LoadingScreen from "./LoadingScreen";

export default function BallaBlippen() {
    const [queue, setQueue] = useState<string[]>([]);
    const rfid = useRef(""); // Save as ref to not rerender on every change.

    const { status, doBlipp, resetStatus } = useBlippContext();
    const { ready } = useThemeContext();

    const registerCardState = useRegisterCard();

    // Read from blipp reader and add to queue.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                // Audio needs to be initialized by user interaction.
                // Will initialize each audio file only once.
                // BlippAudio.initAll();

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
            ready &&
            !status.show &&
            !status.loading &&
            registerCardState.status !== "shown" &&
            queue.length > 0;
        if (readyToBlipp) {
            const [current, ...rest] = queue;
            registerCardState.reset();
            setQueue(rest);

            doBlipp(current);
        }
    }, [queue, status, doBlipp, registerCardState, ready]);

    return (
        <AnimatePresence onExitComplete={resetStatus}>
            {!ready && <LoadingScreen key="loading" />}
            <IdleScreen />

            <StatusScreen />
            {/* <Snowfall /> */}

            <RegisterCard registerCardState={registerCardState} />
        </AnimatePresence>
    );
}
