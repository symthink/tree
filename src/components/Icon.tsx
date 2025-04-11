import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface IconProps {
  name: string;
  size: number;
  color: string;
}

// Web implementation using Material Icons from Google Fonts
const WebIcon: React.FC<IconProps> = ({ name, size, color }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Check if Material Icons font is loaded
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

  // Convert hyphenated names to underscore format for Material Icons
  const iconName = name.replace(/-/g, '_');
  
  return (
    <span
      className="material-icons"
      style={{
        fontSize: size,
        color: color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      {iconName}
    </span>
  );
};

// Native implementation using react-native-vector-icons
const NativeIcon: React.FC<IconProps> = ({ name, size, color }) => {
  const MaterialIcons = require('react-native-vector-icons/MaterialIcons').default;
  return <MaterialIcons name={name} size={size} color={color} />;
};

export const Icon: React.FC<IconProps> = (props) => {
  return Platform.OS === 'web' ? <WebIcon {...props} /> : <NativeIcon {...props} />;
}; 