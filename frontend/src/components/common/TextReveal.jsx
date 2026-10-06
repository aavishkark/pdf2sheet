import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * TextReveal replicates the premium sliding text animation from Kage.
 * It uses an invisible overflow-hidden mask and slides the text up from beneath it.
 */
export default function TextReveal({ children, className, delay = 0 }) {
  return (
    <span className={cn("block overflow-hidden", className)}>
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{
          duration: 1.05,
          ease: [0.16, 1, 0.3, 1], // Premium cubic-bezier ease-out curve
          delay: delay,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
