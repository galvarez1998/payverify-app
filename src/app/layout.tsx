import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "PayVerify | Verificación inteligente", description: "Demo SaaS para verificación de transferencias bancarias en Colombia." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
