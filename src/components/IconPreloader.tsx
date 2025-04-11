import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SYMTHINK_ICONS } from '../constants/icons';

interface IconPreloaderProps {
  icons?: string[];  // Make icons optional since we have defaults
}

export const IconPreloader: React.FC<IconPreloaderProps> = ({ 
  icons = SYMTHINK_ICONS 
}) => {
  const [isFontLoaded, setIsFontLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setIsFontLoaded(true);
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
        setIsFontLoaded(true);
      } else {
        setTimeout(checkFontLoaded, 100);
      }
    };
    
    checkFontLoaded();
  }, []);

  // No need to preload on native platforms
  if (Platform.OS !== 'web') {
    return null;
  }

  // Don't render icons until font is loaded
  if (!isFontLoaded) {
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