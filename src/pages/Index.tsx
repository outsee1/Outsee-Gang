import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";
import FloatingNav from "@/components/FloatingNav";
import VaultOverlay from "@/components/VaultOverlay";
import SearchContent from "@/components/SearchContent";
import AuthContent from "@/components/AuthContent";
import ProductSlide from "@/components/ProductSlide";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

const products = [
  { image: product1, name: "Sobretudo Noir", category: "Outerwear", price: "R$ 2.890" },
  { image: product2, name: "Blazer Marfim", category: "Tailoring", price: "R$ 2.290" },
  { image: product3, name: "Calça Estrutura", category: "Bottoms", price: "R$ 1.190" },
  { image: product4, name: "Tricot Grafite", category: "Knitwear", price: "R$ 890" },
  { image: product5, name: "Camisa Assimétrica", category: "Shirts", price: "R$ 990" },
];

type OverlayType = "search" | "profile" | null;

const Index = () => {
  const [overlay, setOverlay] = useState<OverlayType>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Convert vertical wheel to horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (overlay) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [overlay]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <BrandLogo />

      {/* Intro section + horizontal product gallery */}
      <div ref={scrollRef} className="horizontal-scroll">
        {/* Hero / Intro */}
        <div className="scroll-section flex h-screen w-screen flex-shrink-0 items-center justify-center pl-16">
          <motion.div
            className="max-w-xl text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <h1 className="font-display text-5xl uppercase tracking-[0.2em] text-foreground md:text-7xl">
              Atelier
            </h1>
            <p className="mt-6 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Arquivo de Modelagem
            </p>
            <motion.div
              className="mx-auto mt-12 h-px w-16 bg-accent"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ duration: 0.8, delay: 1 }}
            />
            <p className="mt-8 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Role para explorar →
            </p>
          </motion.div>
        </div>

        {/* Product slides */}
        {products.map((product, i) => (
          <ProductSlide key={i} {...product} index={i} />
        ))}
      </div>

      <FloatingNav
        onSearchClick={() => setOverlay("search")}
        onProfileClick={() => setOverlay("profile")}
      />

      {/* Vault overlays */}
      <VaultOverlay isOpen={overlay === "search"} onClose={() => setOverlay(null)}>
        <SearchContent />
      </VaultOverlay>

      <VaultOverlay isOpen={overlay === "profile"} onClose={() => setOverlay(null)}>
        <AuthContent />
      </VaultOverlay>
    </div>
  );
};

export default Index;
