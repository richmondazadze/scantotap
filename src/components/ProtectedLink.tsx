import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useUnsavedChangesContext } from '@/contexts/UnsavedChangesContext';

interface ProtectedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  children: React.ReactNode;
}

export function ProtectedLink({ to, children, onClick, ...props }: ProtectedLinkProps) {
  const { confirmNavigation } = useUnsavedChangesContext();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }
    
    // Check for unsaved changes and navigate if confirmed
    await confirmNavigation(to);
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
} 