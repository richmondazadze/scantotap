import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface NavigationPromptModalProps {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export const NavigationPromptModal: React.FC<NavigationPromptModalProps> = ({
  open,
  onSave,
  onDiscard,
  onCancel,
}) => (
  <Dialog open={open} onOpenChange={open => !open && onCancel()}>
    <DialogContent className="max-w-[95vw] sm:max-w-lg p-4 sm:p-6 rounded-2xl">
      <DialogHeader>
        <div className="flex flex-col items-center gap-2 mb-2">
          <span className="bg-gradient-to-br from-scan-blue to-scan-purple rounded-full p-3 mb-1 flex items-center justify-center shadow-lg">
            <AlertTriangle className="text-white w-8 h-8" />
          </span>
          <DialogTitle className="text-center text-lg sm:text-xl font-bold text-scan-blue dark:text-scan-blue-light">Unsaved Changes</DialogTitle>
        </div>
        <DialogDescription className="text-center text-base sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
          You have unsaved changes. Do you want to save before leaving?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-2 mt-2">
        <Button
          variant="default"
          onClick={onSave}
          className="w-full sm:w-auto h-12 text-base font-semibold bg-scan-blue hover:bg-scan-purple text-white border-0"
          style={{ background: 'linear-gradient(90deg, var(--scan-blue, #2563eb), var(--scan-purple, #7c3aed))' }}
        >
          Save Changes
        </Button>
        <Button
          variant="destructive"
          onClick={onDiscard}
          className="w-full sm:w-auto h-12 text-base font-semibold"
        >
          Discard Changes
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto h-12 text-base font-semibold border-scan-blue text-scan-blue dark:text-scan-blue-light"
        >
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
); 