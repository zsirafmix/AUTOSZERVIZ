import type { Metadata } from "next";
import "./globals.css";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import { WorkshopProvider } from "@/context/WorkshopContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AppContent from "@/components/AppContent";

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
            <AppContent>{children}</AppContent>
          </WorkshopProvider>
        </FeatureFlagProvider>
      </body>
    </html>
  );
}
