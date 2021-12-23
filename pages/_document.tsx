import Document, { Html, Head, Main, NextScript } from "next/document";
import { BaljanColors } from "../blippen/constants";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta name="description" content="Baljans Balla Blipp" />
          <meta name="theme-color" content={BaljanColors.BrightBlue} />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/images/pwa-icon-192.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <link rel="icon" href="/favicon.png" />
          <link
            href="https://fonts.googleapis.com/css?family=Nunito&display=swap"
            rel="stylesheet"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Lobster&display=swap"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
