import { Clock, Rocket, Settings } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Ganhe mais tempo",
    description: "A IA faz a maior parte do trabalho por você.",
  },
  {
    icon: Rocket,
    title: "Foque no seu negócio",
    description: "Deixe o site no automático enquanto cuida do que importa.",
  },
  {
    icon: Settings,
    title: "Sem dependência de desenvolvedor",
    description: "Tudo editável e ajustável — por você mesmo.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="beneficios" className="border-b border-border py-20">
      <div className="container px-4">
        <p className="text-center font-body text-xs uppercase tracking-[0.3em] text-accent">
          Benefícios
        </p>
        <h2 className="mt-3 text-center font-display text-2xl font-bold uppercase tracking-[0.15em] text-foreground md:text-4xl">
          O que você ganha
        </h2>

        <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-accent">
                <b.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
                {b.title}
              </h3>
              <p className="mt-2 font-body text-xs leading-relaxed text-muted-foreground">
                {b.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="#colecao"
            className="inline-block border-2 border-accent bg-accent px-8 py-3 font-body text-xs uppercase tracking-widest text-accent-foreground transition-all hover:bg-transparent hover:text-accent"
          >
            Comece grátis hoje
          </a>
          <p className="mt-3 font-body text-xs text-muted-foreground">
            Experimente sem compromisso
          </p>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
