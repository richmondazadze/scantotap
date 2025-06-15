import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpgradePromptProps {
  title: string;
  description: string;
  feature: string;
  onClose?: () => void;
  variant?: 'modal' | 'inline' | 'banner';
  showCloseButton?: boolean;
}

export const UpgradePrompt = ({ 
  title, 
  description, 
  feature, 
  onClose, 
  variant = 'inline',
  showCloseButton = false 
}: UpgradePromptProps) => {
  const content = (
    <Card className={`relative overflow-hidden ${
      variant === 'banner' ? 'border-l-4 border-l-scan-blue' : ''
    }`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-scan-blue/5 via-scan-purple/5 to-transparent" />
      
      {/* Close button */}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}

      <CardHeader className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-scan-blue to-scan-purple flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <Badge className="bg-gradient-to-r from-orange-400 to-pink-500 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Pro Feature
          </Badge>
        </div>
        <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative pt-0">
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-scan-blue/10 to-scan-purple/10 rounded-xl border border-scan-blue/20">
            <h4 className="font-semibold text-scan-blue mb-2">🚀 Unlock with Pro:</h4>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
              <li>• Unlimited links and features</li>
              <li>• Premium card designs</li>
              <li>• Advanced analytics (coming soon)</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={`/pricing?source=upgrade&feature=${feature}`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-scan-blue to-scan-purple hover:from-scan-blue-dark hover:to-scan-purple/90 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/pricing" className="flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full sm:w-auto">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (variant === 'modal') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          {content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={variant === 'banner' ? 'mb-6' : ''}
    >
      {content}
    </motion.div>
  );
}; 