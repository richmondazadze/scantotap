import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  showText?: boolean;
  variant?: 'outline' | 'ghost' | 'default';
  size?: 'sm' | 'default' | 'lg';
}

export function LanguageSwitcher({ 
  showText = true, 
  variant = 'outline',
  size = 'default' 
}: LanguageSwitcherProps) {
  const { currentLanguage, supportedLanguages, changeLanguage } = useLanguage();

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Globe className="w-4 h-4" />
          {showText && (
            <span>{currentLang?.nativeName || 'English'}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer ${
              currentLanguage === language.code 
                ? 'bg-scan-blue/10 text-scan-blue' 
                : ''
            }`}
          >
            <span className="font-medium">{language.nativeName}</span>
            <span className="text-sm text-gray-500 ml-2">({language.name})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 