import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";

// Client-only: the builder constructs BlippImage/BlippAudio which touch
// window, and renders the real (browser-only) screen components.
const ThemeBuilder = dynamic(() => import("../blippen/admin/ThemeBuilder"), {
  ssr: false,
});

const Admin: NextPage = () => (
  <>
    <Head>
      <title>Temabyggaren — Baljans Balla Blipp</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* Lobster is one of the display faces in Baljans grafiska profil.
          Loaded here (not in _document) on purpose: only /admin uses it and
          the kiosk should not fetch Google Fonts. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Lobster&display=swap"
        rel="stylesheet"
      />
    </Head>
    <ThemeBuilder />
  </>
);

export default Admin;
