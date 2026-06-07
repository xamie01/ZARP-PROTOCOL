import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastNotification from "@/components/ToastNotification";
import Home from "@/pages/Home";
import Registry from "@/pages/Registry";
import Wrap from "@/pages/Wrap";
import Decrypt from "@/pages/Decrypt";
import Faucet from "@/pages/Faucet";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/wrap" element={<Wrap />} />
          <Route path="/decrypt" element={<Decrypt />} />
          <Route path="/faucet" element={<Faucet />} />
        </Routes>
      </main>
      <Footer />
      <ToastNotification />
      {/* Noise Texture Overlay */}
      <div className="noise-overlay" />
    </>
  );
}
