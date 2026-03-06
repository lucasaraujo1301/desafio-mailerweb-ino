import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "RoomBook — Gestão de Salas",
  description: "Sistema de reserva de salas com notificações por e-mail",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-950 text-surface-50 font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#13161b",
                color: "#eef0f3",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                fontSize: "13px",
                fontFamily: "'Instrument Sans', sans-serif",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#0d0f12" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#0d0f12" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
