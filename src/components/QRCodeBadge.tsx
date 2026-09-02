"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeBadgeProps {
  value: string;
  label?: string;
  size?: number;
}

export default function QRCodeBadge({ value, label, size = 120 }: QRCodeBadgeProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (value) {
      QRCode.toDataURL(value, {
        width: size,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      }).then(setDataUrl).catch(console.error);
    }
  }, [value, size]);

  if (!dataUrl) return <div className="w-24 h-24 bg-slate-800 animate-pulse rounded"></div>;

  return (
    <div className="inline-flex flex-col items-center bg-white p-2.5 rounded-lg shadow-md border border-slate-200 text-slate-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="QR Code" className="rounded" />
      {label && <span className="text-[10px] font-mono font-bold mt-1 text-slate-700">{label}</span>}
    </div>
  );
}
