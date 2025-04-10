// This file should be imported by the consuming application's entry point
// to ensure fonts are loaded for web platforms

/**
 * Loads the custom fonts for web platforms
 * @returns void
 */
const loadWebFonts = (): void => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');    
    style.textContent = `
@import url('https://symthink.org/assets/Sympunk.css');
@import url('https://fonts.googleapis.com/css2?family=Comfortaa');
`;
    
    document.head.appendChild(style);
  }
};

export default loadWebFonts; 