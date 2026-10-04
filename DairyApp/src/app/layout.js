import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Nitara FarmPro Clone",
  description: "Advanced Dairy Farm Management ERP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#f4f7f6] text-gray-900`}>
        <Providers>
          <div className="flex min-h-screen">
            <div className="hidden lg:block w-64 shrink-0">
              <Sidebar />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar />
              <main className="flex-1 p-6 md:p-8 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
