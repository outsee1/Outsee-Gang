import brandLogo from "@/assets/brand-logo.png";

const HeroBanner = () => {
  return (
    <section className="relative flex h-[60vh] items-center justify-center overflow-hidden border-b border-border bg-secondary">
      <div className="text-center">
        <img src={brandLogo} alt="Outsee" className="mx-auto mb-6 h-32 w-auto" />
        <h1 className="font-display text-4xl font-bold uppercase tracking-[0.25em] text-foreground md:text-6xl">
          Outsee
        </h1>
        <p className="mt-4 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Moda autoral — Fora do circuito
        </p>
        <a
          href="#colecao"
          className="mt-8 inline-block border border-foreground px-8 py-3 font-body text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          Explorar coleção
        </a>
      </div>
    </section>
  );
};

export default HeroBanner;
