import { AnimatePresence, motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import React from "react";
import { FaTimes } from "react-icons/fa";
import { BlippStatus, RegisterCardState } from "../utils/types";
import styles from "./RegisterCard.module.css";
import { useThemeContext } from "../utils/ThemeContext";
import { useBlippContext } from "../utils/BlippContext";

type Props = {
    registerCardState: RegisterCardState;
};

export default function RegisterCard({ registerCardState }: Props) {
    const { status } = useBlippContext();
    return (
        <>
            <AnimatePresence>
                {registerCardState.status === "shown" ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.overlay}
                        layoutId="overlay"
                        onClick={() => registerCardState.close()}
                    />
                ) : null}
            </AnimatePresence>
            <div className={styles.container}>
                <AnimatePresence>
                    {/* TODO: Figure out what signedRfid is */}
                    {/* {status.show &&
                    status.signedRfid &&
                    registerCardState.status === "hidden" ? (
                        <motion.div
                            key="button"
                            initial={{ translateY: "200%" }}
                            animate={{ translateY: "0%" }}
                            exit={{ translateY: "200%" }}
                            transition={{ delay: 0.6 }}
                            className={styles.button}
                            onClick={() =>
                                status.signedRfid &&
                                registerCardState.show(status.signedRfid)
                            }
                            layoutId="cool"
                        >
                            <motion.div
                                layoutId="buttontext1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={styles.smallText}
                            >
                                Ingen kö?
                            </motion.div>
                            <motion.div
                                layoutId="buttontext2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                Klicka för att koppla ditt blippkort
                            </motion.div>
                        </motion.div>
                    ) : null} */}
                    {registerCardState.status === "shown" ? (
                        <motion.div
                            key="modal"
                            animate={{ scale: 1, opacity: 1, translateY: "0%" }}
                            exit={{ scale: 0, opacity: 0 }}
                            className={styles.qrView}
                            layoutId="cool"
                        >
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                layoutId="modalcontent"
                            >
                                <div className={styles.titleRow}>
                                    <div className={styles.title}>
                                        Registrera blippkort
                                    </div>
                                    <FaTimes
                                        className={styles.close}
                                        onClick={() => {
                                            registerCardState.close();
                                        }}
                                    />
                                </div>
                                <QRCodeCanvas
                                    value={registerCardState.value}
                                    size={400}
                                />
                                <div className={styles.bottomRow}>
                                    <p className={styles.helpText}>
                                        Skanna QR-koden för att fortsätta.
                                    </p>
                                    <p className={styles.helpText}>
                                        Stäng rutan och lämna blippen när du har
                                        skannat koden.
                                    </p>
                                    <div
                                        className={styles.countdown}
                                        onClick={() =>
                                            registerCardState.extendTime(5)
                                        }
                                    >
                                        <AnimatePresence>
                                            <motion.div
                                                key={
                                                    registerCardState.remainingTime
                                                }
                                                initial={{
                                                    opacity: 0,
                                                    scale: 1.5,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                exit={{ opacity: 0, scale: 0 }}
                                                className={styles.number}
                                            >
                                                {
                                                    registerCardState.remainingTime
                                                }
                                            </motion.div>
                                        </AnimatePresence>
                                        <div className={styles.moreTime}>
                                            Mer tid
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </>
    );
}
