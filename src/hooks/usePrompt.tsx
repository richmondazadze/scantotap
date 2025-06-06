import { useEffect, useContext } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export function usePrompt(when: boolean, message: string) {
  const { navigator } = useContext(NavigationContext);

  useEffect(() => {
    if (!when) return;
    const originalPush = navigator.push;
    const originalReplace = navigator.replace;

    function confirmAndNavigate(method: any) {
      return function (...args: any[]) {
        if (window.confirm(message)) {
          return method.apply(navigator, args);
        }
        // Block navigation
        return;
      };
    }

    navigator.push = confirmAndNavigate(originalPush);
    navigator.replace = confirmAndNavigate(originalReplace);

    return () => {
      navigator.push = originalPush;
      navigator.replace = originalReplace;
    };
  }, [when, message, navigator]);
} 