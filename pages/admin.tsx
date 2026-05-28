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
      <title>Theme builder — Baljans Balla Blipp</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <ThemeBuilder />
  </>
);

export default Admin;
