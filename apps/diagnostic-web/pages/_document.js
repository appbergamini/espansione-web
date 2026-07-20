import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/crescimento/brand/espansione-favicon-32.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/crescimento/brand/espansione-favicon-256.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/crescimento/brand/espansione-favicon-180.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
