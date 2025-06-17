import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Save, X } from 'lucide-react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export function UnsavedChangesDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Unsaved Changes",
  description = "You have unsaved changes that will be lost if you continue. Are you sure you want to leave this page?"
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="m-4 w-[calc(100vw-2rem)] max-w-md sm:max-w-lg mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-scan-blue/10 to-scan-purple/10 dark:from-scan-blue/20 dark:to-scan-purple/20 flex items-center justify-center border border-scan-blue/20 dark:border-scan-blue/30">
              <AlertTriangle className="w-5 h-5 text-scan-blue dark:text-scan-blue-light" />
            </div>
            <span className="bg-gradient-to-r from-scan-blue to-scan-purple bg-clip-text text-transparent font-semibold">
              {title}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <div className="p-4 bg-gradient-to-r from-scan-blue/5 to-scan-purple/5 dark:from-scan-blue/10 dark:to-scan-purple/10 border border-scan-blue/20 dark:border-scan-blue/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Save className="w-5 h-5 text-scan-blue dark:text-scan-blue-light mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-scan-blue dark:text-scan-blue-light mb-1">
                  Don't lose your work
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Consider saving your changes before navigating away to preserve your progress.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                  💡 <strong>Tip:</strong> Use the "Save Profile" button at the bottom of the page to save your changes
                </p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          <AlertDialogCancel 
            onClick={onCancel}
            className="w-full sm:w-auto order-2 sm:order-1 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4 mr-2" />
            Stay on Page
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-scan-blue to-scan-purple hover:from-scan-blue/90 hover:to-scan-purple/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Leave Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 