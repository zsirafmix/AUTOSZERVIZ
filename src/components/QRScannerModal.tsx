"use client";

import React, { useEffect, useState } from "react";
import { X, Camera, ScanLine, AlertCircle } from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [scannerActive, setScannerActive] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // When opened, initialize camera scanner if supported
    let scanner: any = null;

    const startScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        scanner = new Html5QrcodeScanner(
          "qr-reader-element",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        scanner.render(
          (decodedText: string) => {
            onScanSuccess(decodedText);
            onClose();
          },
          (error: any) => {
            // Ignore scan errors while looking for code
          }
        );
        setScannerActive(true);
      } catch (e) {
        console.error("Scanner init error:", e);
      }
    };

    startScanner();

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {}
      }
    };
  }, [isOpen, onScanSuccess, onClose]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <ScanLine className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-base">QR & Vonalkód Beolvasása</h3>
        </div>

        <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-2 min-h-[260px] flex flex-col items-center justify-center">
          <div id="qr-reader-element" className="w-full text-xs text-slate-300"></div>
        </div>

        {/* Manual code fallback */}
        <form onSubmit={handleManualSubmit} className="mt-4 pt-3 border-t border-slate-800">
          <label className="block text-xs text-slate-400 mb-1.5">
            Kézi kód vagy rendszám megadása:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Pl. ML-2026-0089 vagy AA-BC-123"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-lg text-white"
            >
              Ugrás
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
