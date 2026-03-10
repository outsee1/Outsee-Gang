const BrandLogo = () => {
  return (
    <div className="fixed left-0 top-0 z-40 flex h-screen w-16 items-center justify-center">
      <span
        className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-foreground"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
        }}
      >
        Atelier
      </span>
    </div>
  );
};

export default BrandLogo;
