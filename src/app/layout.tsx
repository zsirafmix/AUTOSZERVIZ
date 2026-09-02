import type { Metadata } from "next";
import "./globals.css";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import { WorkshopProvider } from "@/context/WorkshopContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MŰHELY PRO - Autószerelő rendszer",
  description: "Professzionális autószerelő és műhelyirányítási rendszer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="dark">
      <body style={{ backgroundColor: "#0b1120", color: "#ffffff" }} className="min-h-screen antialiased flex flex-col">
        <FeatureFlagProvider>
          <WorkshopProvider>
            <Sidebar />
            <div className="lg:pl-64 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
                {children}
              </main>
            </div>
          </WorkshopProvider>
        </FeatureFlagProvider>
      </body>
    </html>
  );
}
