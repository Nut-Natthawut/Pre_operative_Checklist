import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'sonner';

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "รายงานการเตรียมผู้ป่วยก่อนผ่าตัด",
  description: "ระบบบันทึกข้อมูลการเตรียมผู้ป่วยก่อนผ่าตัด โรงพยาบาลมหาราชนครเชียงใหม่",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
