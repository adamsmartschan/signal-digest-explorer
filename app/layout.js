import "./globals.css";

export const metadata = {
  title: "Signal Digest Explorer",
  description: "Live account-intelligence explorer for Altitude signal digests",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
