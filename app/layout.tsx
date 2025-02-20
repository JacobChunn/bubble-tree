import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app.css";
import AuthWrapper from "@/components/auth-wrapper";
import ConfigureAmplifyClientSide from "@/components/configure-amplify-client-side";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bubble Tree",
  description: "A social media app to identify with ideas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("hello from layout!!!!")
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigureAmplifyClientSide/>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
