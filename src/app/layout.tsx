import type { Metadata } from "next";
import "./globals.css";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import { WorkshopProvider } from "@/context/WorkshopContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AutoMester Pro ERP - Professzionális Műhelyirányítási Rendszer",
  description: "Teljes körű autószerviz és járműnyilvántartó felhőalapú vállalatirányítási szoftver.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <FeatureFlagProvider>
          <WorkshopProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </WorkshopProvider>
        </FeatureFlagProvider>
      </body>
    </html>
  );
}
