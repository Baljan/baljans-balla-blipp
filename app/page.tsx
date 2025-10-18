"use client";

import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { ThemeProvider } from "../utils/ThemeContext";
import { BlippProvider } from "../utils/BlippContext";

// Import dynamically to stop server side rendering of the actual app,
// head tags are still server side rendered.
const BallaBlippen = dynamic(() => import("../components/BallaBlippen"), {
    ssr: false,
});

const Home: NextPage = () => {
    // TODO: Reload every day, or more

    return (
        <ThemeProvider>
            <BlippProvider>
                <BallaBlippen />
            </BlippProvider>
        </ThemeProvider>
    );
};

export default Home;
