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
        {/* SF Pro is available via system fonts on Apple devices.
            Inter is the closest match for non-Apple browsers. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
