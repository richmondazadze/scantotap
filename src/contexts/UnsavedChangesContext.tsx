import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnsavedChangesDialog } from '@/components/UnsavedChangesDialog';

interface UnsavedChangesContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
  confirmNavigation: (to: string) => Promise<boolean>;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState('You have unsaved changes that will be lost if you continue. Are you sure you want to leave this page?');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const navigate = useNavigate();

  const confirmNavigation = useCallback(async (to: string): Promise<boolean> => {
    if (!hasUnsavedChanges) {
      navigate(to);
      return true;
    }

    // Show custom dialog instead of browser confirm
    setPendingNavigation(to);
    setIsDialogOpen(true);
    
    // Return a promise that resolves when dialog is closed
    return new Promise((resolve) => {
      // This will be resolved by handleConfirm or handleCancel
      window.unsavedChangesPromiseResolve = resolve;
    });
  }, [hasUnsavedChanges, navigate]);

  const handleConfirm = useCallback(() => {
    setIsDialogOpen(false);
    setHasUnsavedChanges(false); // Reset the state
    
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
    
    // Resolve the promise
    if (window.unsavedChangesPromiseResolve) {
      window.unsavedChangesPromiseResolve(true);
      window.unsavedChangesPromiseResolve = undefined;
    }
  }, [navigate, pendingNavigation]);

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false);
    setPendingNavigation(null);
    
    // Resolve the promise
    if (window.unsavedChangesPromiseResolve) {
      window.unsavedChangesPromiseResolve(false);
      window.unsavedChangesPromiseResolve = undefined;
    }
  }, []);

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        setHasUnsavedChanges,
        message,
        setMessage,
        confirmNavigation,
      }}
    >
      {children}
      
      {/* Custom Dialog */}
      <UnsavedChangesDialog
        isOpen={isDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        description={message}
      />
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChangesContext() {
  const context = useContext(UnsavedChangesContext);
  if (context === undefined) {
    throw new Error('useUnsavedChangesContext must be used within an UnsavedChangesProvider');
  }
  return context;
}

// Extend window interface for promise resolution
declare global {
  interface Window {
    unsavedChangesPromiseResolve?: (value: boolean) => void;
  }
} 