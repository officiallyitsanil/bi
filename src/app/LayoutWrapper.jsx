"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LayoutWrapper = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default LayoutWrapper;
