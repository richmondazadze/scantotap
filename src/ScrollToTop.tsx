import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll position when pathname changes
    window.scrollTo(0, 0);
    
    // Enable scrolling on the body
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    
    // Remove any existing scroll locks
    document.body.style.position = 'static';
    document.body.style.top = 'auto';
  }, [pathname]);

  return null;
};

export default ScrollToTop; 