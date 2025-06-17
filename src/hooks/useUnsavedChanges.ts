import { useEffect } from 'react';
import { useBeforeUnload } from 'react-router-dom';
import React from 'react';
import { useUnsavedChangesContext } from '@/contexts/UnsavedChangesContext';

export function useUnsavedChanges(
  hasUnsavedChanges: boolean,
  message: string = 'You have unsaved changes that will be lost if you continue. Are you sure you want to leave this page?'
) {
  const { setHasUnsavedChanges, setMessage } = useUnsavedChangesContext();

  // Update the context state when local state changes
  useEffect(() => {
    setHasUnsavedChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges, setHasUnsavedChanges]);

  // Update the context message when local message changes
  useEffect(() => {
    setMessage(message);
  }, [message, setMessage]);

  // Handle browser navigation (refresh, back button, tab close) - only for browser events
  useBeforeUnload(
    React.useCallback(() => {
      return hasUnsavedChanges ? 'You have unsaved changes. Are you sure you want to leave?' : undefined;
    }, [hasUnsavedChanges])
  );
} 