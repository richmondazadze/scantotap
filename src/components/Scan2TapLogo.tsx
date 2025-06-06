import { QrCode } from "lucide-react";
import { motion } from "framer-motion";

interface Scan2TapLogoProps {
  compact?: boolean;
}

export default function Scan2TapLogo({ compact = false }: Scan2TapLogoProps) {
  return (
    <div className={`flex items-center ${compact ? 'space-x-1' : 'space-x-3 sm:space-x-4'}`}>
      <div className="relative">
        {/* Stable Glow for Light Mode (no scale animation) */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1.15, 1] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
          className="absolute inset-0 z-0 rounded-xl pointer-events-none dark:hidden"
          style={{
            background: "radial-gradient(circle at 75% 25%, #3B82F6 0%, #8B5CF6 100%)",
            filter: "blur(48px)",
            opacity: 1,
            willChange: "opacity"
          }}
        />
        {/* No glow in dark mode (hidden) */}
        <img
          src="/logo.png"
          alt="Scan2Tap Logo"
          className={`${
            compact 
              ? 'h-6 sm:h-8 w-auto max-w-[120px]' 
              : 'h-10 sm:h-12 w-auto max-w-[180px]'
          } object-contain drop-shadow-md relative z-10`}
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}