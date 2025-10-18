import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { BlippStatus, StatusTheme } from "../utils/types";
import styles from "./StatusScreen.module.css";
import { useBlippContext } from "../utils/BlippContext";
import { ANIMATION_DURATION } from "../utils/constants";
import { useThemeContext } from "../utils/ThemeContext";

export default function StatusScreen() {
    const { testing, theme, getVariant } = useThemeContext();
    const { status, resetStatus } = useBlippContext();
    const [show, setShow] = useState(false);

    const variant = getVariant(status);

    useEffect(() => {
        if (status.show) {
            setShow(true);
            setTimeout(() => {
                setShow(false);
            }, ANIMATION_DURATION);

            // variant.sound?.play();
            // TODO: get the appropriate sound
        }
    }, [status]);

    return (
        <AnimatePresence onExitComplete={resetStatus}>
            {show && status.show ? (
                <motion.div
                    key="screen"
                    initial={{
                        transformPerspective: "400px",
                        rotateX: "40deg",
                        translateY: "120%",
                        scale: 0,
                    }}
                    animate={{
                        transformPerspective: "400px",
                        rotateX: "0deg",
                        translateY: "0%",
                        scale: 1,
                    }}
                    exit={{
                        transformPerspective: "400px",
                        rotateX: "40deg",
                        translateY: "120%",
                        scale: 0,
                    }}
                    transition={{ type: "tween", delayChildren: 0.5 }}
                    className={styles.statusScreen}
                    style={{
                        backgroundColor: variant.backgroundColor,
                        backgroundImage: variant.backgroundImage,
                        backgroundBlendMode: variant.backgroundBlendMode,
                        // color: variant.fontColor,
                    }}
                >
                    {/* <motion.div
                        key="icon"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ delay: 0.2 }}
                        className={styles.icon}
                    >
                        {variant.image instanceof BlippImage
                            ? variant.image.getReactNode()
                            : variant.image}
                    </motion.div> */}
                    <motion.div
                        key="message"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ delay: 0.4 }}
                        className={styles.message}
                    >
                        {status.data.message}
                    </motion.div>
                    {/* {status.data.help_text && (
                        <motion.div
                            key="help_text"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ delay: 0.4 }}
                            className={styles.help_text}
                        >
                            {status.data.help_text}
                        </motion.div>
                    )} */}
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
