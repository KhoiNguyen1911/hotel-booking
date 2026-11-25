import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata = {
  title: "Aurelia Grand Hotel — Khách sạn 5 sao Vũng Tàu",
  description: "Aurelia Grand Hotel: khách sạn 5 sao bên Bãi Sau, Vũng Tàu, với dịch vụ tinh tế. Đặt phòng trực tuyến nhanh chóng.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${serif.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
