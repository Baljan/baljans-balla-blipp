import React from "react";
import classes from "./LoadingScreen.module.css";

import { AnimatePresence, motion } from "framer-motion";
import { useThemeContext } from "../utils/ThemeContext";

export default React.memo(function LoadingScreen() {
    const { ready } = useThemeContext();

    return (
        <motion.div
            className={classes["content"]}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <h2 className={classes["title"]}>Blippen laddar...</h2>
            <p className={classes["subtitle"]}>Chilla</p>
        </motion.div>
    );
});
