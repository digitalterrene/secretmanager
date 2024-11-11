import type { Metadata } from "next";
import "./globals.css";
import PrelineScript from "@/components/PrelineScript";
import Navbar from "@/components/ui/navbar";
import dynamic from "next/dynamic";
// const AppWrap = dynamic(() => import("@/components/appwrapper"), {
//   ssr: false,
// });
const AppWrap = dynamic(() => import("@/components/appwrapper"), {
  // ssr: false,
});
export const metadata: Metadata = {
  title: "Secret & Password Manager",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased p-4 dark:bg-[#040918] bg-white`}>
        <AppWrap>
          <Navbar />
          <div className=" ">{children}</div>
        </AppWrap>
      </body>
      <PrelineScript />
    </html>
  );
}