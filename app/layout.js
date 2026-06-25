import "./globals.css";

export const metadata = {
  title: "NodeQuest",
  description: "NodeQuest - Gamified GPU bounties and routing.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
