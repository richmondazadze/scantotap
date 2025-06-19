import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, RefreshCw, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import AIService, { type BioSuggestion } from '@/services/aiService';
import Loading from '@/components/ui/loading';

interface BioEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBio: string;
  title: string;
  name?: string;
  onBioSelect: (bio: string) => void;
}

export default function BioEnhancementModal({
  isOpen,
  onClose,
  currentBio,
  title,
  name,
  onBioSelect
}: BioEnhancementModalProps) {
  const [suggestions, setSuggestions] = useState<BioSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'professional' | 'creative' | 'casual' | 'technical'>('professional');

  const styles = [
    { id: 'professional', label: 'Professional', icon: '💼', description: 'Formal and business-focused' },
    { id: 'creative', label: 'Creative', icon: '🎨', description: 'Artistic and innovative' },
    { id: 'casual', label: 'Casual', icon: '😊', description: 'Friendly and approachable' },
    { id: 'technical', label: 'Technical', icon: '⚡', description: 'Skill and expertise focused' }
  ];

  const generateSuggestions = async (style?: string) => {
    if (!currentBio.trim() && !title.trim()) {
      toast.error("Please enter some bio content first");
      return;
    }

    setLoading(true);
    try {
      const styleToUse = style || selectedStyle;
      
      // If user has bio content, enhance it. Otherwise generate from title.
      const result = currentBio.trim() 
        ? await AIService.enhanceBio({ currentBio, title, name, style: styleToUse as 'professional' | 'creative' | 'casual' | 'technical' })
        : await AIService.generateBio(title, name, styleToUse);

      if (result.success && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
        toast.success(`Generated ${result.suggestions.length} suggestions!`);
      } else {
        toast.error("Failed to generate suggestions. Please try again.");
      }
    } catch (error) {
      console.error('Bio generation error:', error);
      toast.error("Failed to generate suggestions. Please try again.");
    }
    setLoading(false);
  };

  const handleStyleChange = (style: 'professional' | 'creative' | 'casual' | 'technical') => {
    setSelectedStyle(style);
    if (suggestions.length > 0) {
      generateSuggestions(style);
    }
  };

  const handleBioSelect = (bio: string) => {
    onBioSelect(bio);
    toast.success("Bio updated!");
    onClose();
  };

  // Auto-generate on open only if there's content
  React.useEffect(() => {
    if (isOpen && suggestions.length === 0 && (currentBio.trim() || title.trim())) {
      // Default to professional style, let user choose their preferred style
      setSelectedStyle('professional');
      generateSuggestions('professional');
    }
  }, [isOpen, currentBio, title]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto mx-1 w-[calc(100%-2rem)] sm:w-full sm:mx-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">Generate Your Bio with AI</span>
          </DialogTitle>
          <DialogDescription>
            Create engaging, professional bio suggestions using AI. Choose your style and get multiple options to pick from.
          </DialogDescription>
        </DialogHeader>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
            <div className="text-center space-y-4">
              <Loading size="md" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generating Bio Suggestions
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our AI is crafting personalized bios for you...
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Current Bio */}
          {currentBio && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">Current Bio:</h3>
              <p className="text-sm">{currentBio}</p>
            </div>
          )}

          {/* Style Selection */}
          <div>
            <h3 className="font-semibold mb-3">Choose Style:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id as any)}
                  disabled={loading}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedStyle === style.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{style.icon}</span>
                    <span className="font-medium">{style.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-3">
            <Button
              onClick={() => generateSuggestions()}
              disabled={loading || (!currentBio.trim() && !title.trim())}
              className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="flex items-center">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loading size="sm" />
                    Generating...
                  </div>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    <span className="font-bold">✨ Generate</span>
                  </>
                )}
              </span>
            </Button>
            {suggestions.length > 0 && (
              <Button
                variant="outline"
                onClick={() => generateSuggestions()}
                disabled={loading}
                className="border-2 border-purple-300 hover:border-purple-500 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !loading && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">✨ AI Suggestions:</span>
              </h3>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 transition-colors cursor-pointer group"
                  onClick={() => handleBioSelect(suggestion.text)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">{suggestion.text}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.style}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {suggestion.text.length}/100 chars
                        </span>
                      </div>
                      {suggestion.reasoning && (
                        <p className="text-xs text-gray-400 mt-1">{suggestion.reasoning}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBioSelect(suggestion.text);
                      }}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {!loading && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Tips:</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Keep it under 100 characters for maximum impact</li>
                <li>• Use action words and show your personality</li>
                <li>• Focus on what makes you unique</li>
                <li>• You can always edit the generated bio</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 