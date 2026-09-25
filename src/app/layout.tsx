import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chordture — Real-Time Hand Gesture Chord Recognizer',
  description:
    'Recognize musical chords in real-time from webcam hand gestures using MediaPipe Vision WASM and computer vision music theory logic.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&family=Outfit:wght@300;400;600;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#05020c] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
