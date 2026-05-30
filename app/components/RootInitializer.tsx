"use client";
import { useEffect } from "react";

export default function ClientRootLayout({
  children,
  serverInfo,
}: {
  children: React.ReactNode;
  serverInfo?: any;
}) {
  useEffect(() => {
    if (serverInfo) {
      (window as any).__SERVER_INFO__ = serverInfo;
    }
  }, [serverInfo]);

  return <>{children}</>;
}
