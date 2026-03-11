import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Checkout from "./pages/Checkout.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/produto/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/carrinho" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
