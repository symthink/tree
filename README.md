# My Shared Component

A shared React component library intended for both React Native (via react-native-web) and React Web projects.

## Installation

```bash
npm install my-shared-component
# or
yarn add my-shared-component
```

## Font Loading

The library includes custom fonts (Comfortaa and Sympunk) that are loaded differently depending on the platform.

### Web Platform

For web applications, the fonts are automatically loaded from their respective CDNs:
- Comfortaa from Google Fonts
- Sympunk from symthink.org

No additional setup is required for web platforms.

### React Native

For React Native applications, the fonts are bundled with the library and loaded through the React Native asset system. No additional setup is required.

## Usage

```jsx
import React from 'react';
import { FullPageComponent, ThemeProvider } from 'my-shared-component';

const App = () => {
  return (
    <ThemeProvider initialTheme="light">
      <FullPageComponent title="My Awesome Component" />
    </ThemeProvider>
  );
};

export default App;
```

## Theming

The library supports two themes out of the box: `light` and `dark`. You can use the `useTheme` hook to access and toggle the current theme.

```jsx
import React from 'react';
import { useTheme } from 'my-shared-component';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
};
```

## Components

- `FullPageComponent`: A full-page component that demonstrates the theme capabilities
- `SubComponentA`: A reusable sub-component
- `SubComponentB`: Another reusable sub-component

## SymthinkTree Navigation

```mermaid
graph TD
    A[SymthinkTree] --> B[NavigationProvider]
    B --> C[CardDeckNavigator]
    
    C --> D[Navigation State]
    D --> D1[navigationStack]
    D --> D2[currentItem]
    D --> D3[pushItem/popItem]
    
    C --> E[Animated Elements]
    E --> E1[animatedItems Map]
    E --> E2[sharedElement]
    
    C --> F[Card Rendering]
    F --> F1[Visible Cards]
    F --> F2[Back Button]
    
    G[User Interaction] --> G1[support-clicked]
    G1 --> H[navigateForward]
    H --> H1[Current card slides left]
    H --> H2[Shared element animates]
    H --> H3[New card fades in from right]
    
    I[Back Navigation] --> J[navigateBack]
    J --> J1[Current card slides right]
    J --> J2[Previous card slides in from left]
```

## License

MIT 