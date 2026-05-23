import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />

        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root { background-color: #EAFBFF; min-height: 100%; height: 100%; overflow-x: hidden; max-width: 100%; }
          body { margin: 0; }
          [class*="font-heebo"], [style*="Heebo_"] {
            font-family: 'Heebo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          }
          [class~="font-heebo"]:not([class*="-"]) { font-weight: 400; }
          [class*="font-heebo-medium"] { font-weight: 500; }
          [class*="font-heebo-bold"] { font-weight: 700; }
          [class*="font-heebo-black"] { font-weight: 900; }
          [style*="Heebo_400Regular"] { font-weight: 400; }
          [style*="Heebo_500Medium"] { font-weight: 500; }
          [style*="Heebo_700Bold"] { font-weight: 700; }
          [style*="Heebo_900Black"] { font-weight: 900; }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
