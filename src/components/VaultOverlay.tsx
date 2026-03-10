import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface VaultOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const VaultOverlay = ({ isOpen, onClose, children }: VaultOverlayProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Dark background behind the vault doors */}
          <motion.div
            className="absolute inset-0 bg-vault"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-full w-full items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="w-full max-w-md px-8"
              >
                {children}
              </motion.div>
            </div>

            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute right-8 top-8 font-body text-sm uppercase tracking-[0.2em] text-vault-foreground transition-opacity hover:opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6 }}
            >
              Fechar
            </motion.button>
          </motion.div>

          {/* Left vault door */}
          <motion.div
            className="absolute left-0 top-0 h-full w-1/2 bg-background"
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            exit={{ x: 0 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Right vault door */}
          <motion.div
            className="absolute right-0 top-0 h-full w-1/2 bg-background"
            initial={{ x: 0 }}
            animate={{ x: "100%" }}
            exit={{ x: 0 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default VaultOverlay;
