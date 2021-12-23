import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import BlippImage from "../utils/blippImage";
import { BlippStatus } from "../utils/types";
import styles from "./StatusScreen.module.css";

type Props = {
  blippStatus: BlippStatus;
  onAnimationComplete: () => void;
};

export default function StatusScreen({
  blippStatus,
  onAnimationComplete,
}: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (blippStatus.show) {
      setShow(true);
      setTimeout(() => {
        setShow(false);
      }, blippStatus.duration);

      blippStatus.theme.sound?.play();
    }
  }, [blippStatus]);

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {show && blippStatus.show ? (
        <motion.div
          initial={{ translateY: "100%", scale: 0 }}
          animate={{ translateY: "0%", scale: 1 }}
          exit={{ translateY: "100%", scale: 0 }}
          transition={{ type: "tween", delayChildren: 0.5 }}
          className={styles.statusScreen}
          style={{
            backgroundColor: blippStatus.theme.backgroundColor,
            backgroundImage: blippStatus.theme.backgroundImage,
            backgroundBlendMode: blippStatus.theme.backgroundBlendMode,
            color: blippStatus.theme.fontColor,
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={styles.icon}
          >
            {blippStatus.theme.image instanceof BlippImage
              ? blippStatus.theme.image.getReactNode()
              : blippStatus.theme.image}
          </motion.div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={styles.message}
          >
            {blippStatus.message}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
