import { QrCode } from "lucide-react";

export default function Scan2TapLogo() {
  return (
    <div className="flex items-center space-x-3 sm:space-x-4">
      <div className="relative">
        {/* Blue-to-purple gradient background matching hero */}
        <div className="absolute inset-0 rounded-xl blur-[6px] opacity-90 transition-colors duration-300"
          style={{
            background:
              'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
          }}
        />
        <div className="absolute inset-0 rounded-xl blur-[6px] opacity-80 transition-colors duration-300 dark:opacity-90 dark:block hidden"
          style={{
            background:
              'linear-gradient(90deg, #111827 0%, #6366F1 100%)',
          }}
        />
        <img
          src="/logo.png"
          alt="Scan2Tap Logo"
          className="h-10 sm:h-12 w-auto max-w-[180px] object-contain drop-shadow-md relative z-10"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}