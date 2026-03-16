import { Smartphone, Brain, RefreshCw, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Design responsivo",
    description: "Automaticamente adaptado para celulares e computadores.",
  },
  {
    icon: Brain,
    title: "Sugestões de conteúdo com IA",
    description: "A inteligência artificial gera textos e layouts otimizados para você.",
  },
  {
    icon: RefreshCw,
    title: "Atualizações rápidas",
    description: "Edite e publique mudanças sem complicação, a qualquer momento.",
  },
  {
    icon: BarChart3,
    title: "Integração com ferramentas",
    description: "Google Analytics, SEO e outras ferramentas populares integradas.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="funcionalidades" className="border-b border-border py-20">
      <div className="container px-4">
        <p className="text-center font-body text-xs uppercase tracking-[0.3em] text-accent">
          Funcionalidades
        </p>
        <h2 className="mt-3 text-center font-display text-2xl font-bold uppercase tracking-[0.15em] text-foreground md:text-4xl">
          Tudo que você precisa
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center font-body text-sm text-muted-foreground">
          Uma plataforma que usa IA para criar sites com design profissional e conteúdo otimizado — sem programação.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group border border-border bg-card p-6 transition-colors hover:border-accent"
            >
              <f.icon className="mb-4 h-6 w-6 text-accent" />
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 font-body text-xs leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
