import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { setToken } from "../blippen/utils/blippApi";
import { selectTheme } from "../blippen/themes";

// Import dynamically to stop server side rendering of the actual app,
// head tags are still server side rendered.
const BallaBlippen = dynamic(
  () => import("../blippen/components/BallaBlippen"),
  {
    ssr: false,
  }
);

const Home: NextPage = () => {
  const { query } = useRouter();

  const isPWA = query.pwa !== undefined;
  const isTestingEnvironment = query.testing !== undefined;

  const themeOverride = Array.isArray(query.theme)
    ? query.theme[0]
    : query.theme;
  const theme = selectTheme(themeOverride);

  useEffect(() => setToken(isPWA), [isPWA]);

  // Reload every day
  const pageLoadedAt = useMemo(() => new Date().toDateString(), []);
  useEffect(() => {
    const onFocus = () => {
      if (new Date().toDateString() !== pageLoadedAt) {
        window.location.reload();
      }
    };
    window.addEventListener("focus", onFocus, false);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [pageLoadedAt]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
        <title>Baljans Balla Blipp</title>
      </Head>
      <BallaBlippen theme={theme} testing={isTestingEnvironment} />
    </>
  );
};

export default Home;
