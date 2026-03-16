import { useState } from "react";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import FeaturesSection from "@/components/FeaturesSection";
import BenefitsSection from "@/components/BenefitsSection";
import ProductGrid from "@/components/ProductGrid";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { Mail, Instagram } from "lucide-react";

const Index = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setProfileOpen(true)} />
      <HeroBanner />
      <FeaturesSection />
      <BenefitsSection />

      <div id="colecao">
        <ProductGrid />
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
                Outsee
              </p>
              <p className="mt-2 font-body text-xs leading-relaxed text-muted-foreground">
                Feito com tecnologia de IA + design intuitivo.
              </p>
            </div>

            <div>
              <p className="font-display text-xs font-bold uppercase tracking-widest text-foreground">
                Contato
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <a href="mailto:contato@outsee.com" className="flex items-center gap-2 font-body text-xs text-muted-foreground transition-colors hover:text-accent">
                  <Mail className="h-3 w-3" /> contato@outsee.com
                </a>
                <a href="https://instagram.com/outsee" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-body text-xs text-muted-foreground transition-colors hover:text-accent">
                  <Instagram className="h-3 w-3" /> @outsee
                </a>
              </div>
            </div>

            <div>
              <p className="font-display text-xs font-bold uppercase tracking-widest text-foreground">
                Suporte
              </p>
              <p className="mt-3 font-body text-xs text-muted-foreground">
                Perguntas? Converse conosco.
              </p>
              <a
                href="mailto:suporte@outsee.com"
                className="mt-2 inline-block font-body text-xs text-accent transition-colors hover:text-foreground"
              >
                suporte@outsee.com
              </a>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-6 text-center">
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              © 2026 Outsee — Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <CartSlidePanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default Index;
