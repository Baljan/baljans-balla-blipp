import React from "react";
import classes from "./LoadingScreen.module.css";

import { motion } from "framer-motion";

export default React.memo(function LoadingScreen() {
    return (
        <motion.div
            className={classes["content"]}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
        >
            <h2 className={classes["title"]}>Blippen laddar...</h2>
            <p className={classes["subtitle"]}>Chilla</p>
        </motion.div>
    );
});
