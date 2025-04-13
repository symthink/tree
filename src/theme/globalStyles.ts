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
  listItemRow: {
    padding: 4,
    paddingStart: 8,
    paddingEnd: 10,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listItemIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemIcon: {
    fontSize: 11,
    marginTop: 6,
    marginRight: 6,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'capitalize',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  
}); 