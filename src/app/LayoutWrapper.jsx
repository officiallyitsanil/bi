"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { usePathname } from "next/navigation";

const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();
  const isMapPage = pathname === "/";

  return (
    <div className={isMapPage ? "flex flex-col h-screen overflow-hidden" : ""}>
      <Header />
      {isMapPage ? (
        <main className="flex-1 min-h-0 relative">
          {children}
        </main>
      ) : (
        children
      )}
      <Footer />
    </div>
  );
};

export default LayoutWrapper;
