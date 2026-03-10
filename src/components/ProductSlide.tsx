import { motion } from "framer-motion";

interface ProductSlideProps {
  image: string;
  name: string;
  category: string;
  price: string;
  index: number;
}

const ProductSlide = ({ image, name, category, price, index }: ProductSlideProps) => {
  return (
    <div className="scroll-section flex h-screen w-screen flex-shrink-0 items-center justify-center pl-16">
      <div className="flex h-full w-full items-center gap-16 px-12 md:px-24">
        {/* Product image */}
        <motion.div
          className="relative h-[75vh] w-auto flex-shrink-0"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <img
            src={image}
            alt={name}
            className="h-full w-auto object-contain"
            loading="lazy"
          />
        </motion.div>

        {/* Product info */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {category}
          </span>
          <h2 className="font-display text-3xl uppercase tracking-[0.15em] text-foreground md:text-5xl">
            {name}
          </h2>
          <span className="font-body text-lg font-light text-foreground">
            {price}
          </span>
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Peça {String(index + 1).padStart(2, "0")}
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductSlide;
