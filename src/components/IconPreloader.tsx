import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface IconPreloaderProps {
  icons: string[];
}

export const IconPreloader: React.FC<IconPreloaderProps> = ({ icons }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setIsLoaded(true);
      return;
    }

    const checkFontLoaded = () => {
      const span = document.createElement('span');
      span.className = 'material-icons';
      span.style.visibility = 'hidden';
      span.textContent = 'check';
      document.body.appendChild(span);
      
      const isLoaded = window.getComputedStyle(span).fontFamily.includes('Material Icons');
      document.body.removeChild(span);
      
      if (isLoaded) {
        setIsLoaded(true);
      } else {
        setTimeout(checkFontLoaded, 100);
      }
    };
    
    checkFontLoaded();
  }, []);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <div style={{ display: 'none' }}>
      {icons.map((icon) => (
        <span
          key={icon}
          className="material-icons"
          style={{
            visibility: 'hidden',
            fontSize: '1px',
          }}
        >
          {icon.replace(/-/g, '_')}
        </span>
      ))}
    </div>
  );
}; 