import "./globals.css";
import LayoutWrapper from "./LayoutWrapper";
import { ThemeProvider } from "@/context/ThemeContext";

// System font stack – no Google Fonts dependency; avoids connection errors at build/dev
const fontSans = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const fontMono = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";

export const metadata = {
  title: "BuildersInfo | Buy & Sell Verified Properties",
  description: "BuildersInfo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{
          "--font-geist-sans": fontSans,
          "--font-geist-mono": fontMono,
          fontFamily: fontSans,
        }}
      >
        <ThemeProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
