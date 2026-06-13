import "./globals.css";

export const metadata = {
  title: "Ale UGC AI",
  description: "Buat konten media sosial dan blog berkualitas menggunakan Claude dan Gemini AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
