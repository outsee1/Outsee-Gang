import { useState } from "react";
import { motion } from "framer-motion";

const SearchContent = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="text-center">
      <h2 className="font-display mb-12 text-2xl uppercase tracking-[0.3em] text-vault-foreground">
        Busca
      </h2>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O que você procura?"
          className="w-full border-b border-vault-foreground bg-transparent pb-4 font-body text-3xl font-light text-vault-foreground placeholder:text-vault-foreground/30 focus:outline-none"
          autoFocus
        />
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-vault-foreground"
          initial={{ width: "0%" }}
          animate={{ width: query ? "100%" : "0%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {query && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 font-body text-sm text-vault-foreground/50"
        >
          Pressione Enter para buscar "{query}"
        </motion.p>
      )}
    </div>
  );
};

export default SearchContent;
