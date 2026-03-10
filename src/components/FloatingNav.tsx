import { motion } from "framer-motion";

interface FloatingNavProps {
  onSearchClick: () => void;
  onProfileClick: () => void;
}

const FloatingNav = ({ onSearchClick, onProfileClick }: FloatingNavProps) => {
  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
      <motion.button
        onClick={onSearchClick}
        className="flex h-20 w-20 items-center justify-center rounded-full border border-foreground bg-transparent font-body text-xs font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-accent hover:text-accent"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Busca
      </motion.button>
      <motion.button
        onClick={onProfileClick}
        className="flex h-20 w-20 items-center justify-center rounded-full border border-foreground bg-transparent font-body text-xs font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-accent hover:text-accent"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Perfil
      </motion.button>
    </div>
  );
};

export default FloatingNav;
