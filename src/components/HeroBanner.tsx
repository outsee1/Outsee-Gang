import brandLogo from "@/assets/brand-logo.png";
import { Sparkles, Zap, Globe } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden border-b border-border bg-secondary">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative z-10 container px-4 py-16 text-center">
        <img src={brandLogo} alt="Outsee" className="mx-auto mb-8 h-20 w-auto" />

        <h1 className="font-display text-3xl font-bold uppercase tracking-[0.15em] text-foreground md:text-5xl lg:text-6xl leading-tight">
          Seu site profissional<br />
          <span className="text-accent">sem complicação</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl font-body text-sm text-muted-foreground md:text-base leading-relaxed">
          Crie, otimize e publique com ajuda de IA — sem código, sem stress.
          <br className="hidden md:block" />
          Um site criado em minutos com inteligência artificial — simples, rápido e personalizado.
        </p>

        {/* Subtítulos */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-2 border border-border px-4 py-2">
            <Sparkles className="h-3 w-3 text-accent" />
            Sem programação
          </span>
          <span className="flex items-center gap-2 border border-border px-4 py-2">
            <Zap className="h-3 w-3 text-accent" />
            Templates + IA
          </span>
          <span className="flex items-center gap-2 border border-border px-4 py-2">
            <Globe className="h-3 w-3 text-accent" />
            Design responsivo
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#funcionalidades"
            className="inline-block border-2 border-accent bg-accent px-8 py-3 font-body text-xs uppercase tracking-widest text-accent-foreground transition-all hover:bg-transparent hover:text-accent"
          >
            Começar agora
          </a>
          <a
            href="#beneficios"
            className="inline-block border border-foreground px-8 py-3 font-body text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Ver como funciona
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
