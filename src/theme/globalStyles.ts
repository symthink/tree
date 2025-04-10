import { StyleSheet } from 'react-native';

// Define the font family string with fallbacks
const fontFamily = 'Sympunk, Comfortaa, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const globalStyles = StyleSheet.create({
  text: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
  },
  heading: {
    fontFamily,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subheading: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  small: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
  },
  icon: {
    fontFamily: 'Sympunk, Comfortaa, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 24,
  },
  // Add more global styles as needed
}); 