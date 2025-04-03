// Setup React Native Web
import './setupReactNative';

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { CardContainer, NavigationCardDeck } from '../../src';
import { createMockData } from './mockData';
import { SymthinkDocument } from '../../src/core/symthink';
import { Subject } from 'rxjs';

// User Agent display component
const UserAgentInfo = () => {
  return (
    <div style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
      <p>Current User Agent: {navigator.userAgent}</p>
    </div>
  );
};

const App = () => {
  console.log('App rendering');
  
  const [mockData] = useState<SymthinkDocument>(() => {
    console.log('Creating mock data');
    const data = createMockData();
    console.log('Mock data created:', data);
    return data;
  });
  
  const [useCardDeckNavigation, setUseCardDeckNavigation] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const notifyRef = useRef<Subject<string>>(new Subject<string>());
  
  useEffect(() => {
    // Cleanup function to complete and unsubscribe from the Subject
    return () => {
      notifyRef.current.complete();
    };
  }, []);

  const handleItemAction = (action: { action: string; value: any; domrect?: DOMRect; pointerEvent?: any }) => {
    console.log('Item action:', action);
    if (action.action === 'support-clicked') {
      setSelectedItem(action.value);
    }
  };
  
  const handleDocAction = (action: { action: string; value: any }) => {
    console.log('Doc action:', action);
    if (action.action === 'go-back') {
      setSelectedItem(null);
    }
  };

  const renderStandardNavigation = () => {
    console.log('Rendering standard navigation');
    return (
      <>
        <CardContainer 
          data={selectedItem || mockData} 
          canEdit={true}
          notify={notifyRef.current}
          onItemAction={handleItemAction}
          onDocAction={handleDocAction}
        />
        
        {selectedItem && (
          <button 
            onClick={() => setSelectedItem(null)}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Main Document
          </button>
        )}
      </>
    );
  };

  const renderCardDeckNavigation = () => {
    console.log('Rendering card deck navigation with mockData:', mockData);
    if (!mockData) {
      console.error('No mock data available!');
      return <div>Error: No data available</div>;
    }
    
    return (
      <div style={{ height: '100%', position: 'relative' }}>
        <NavigationCardDeck 
          initialData={mockData}
          canEdit={true}
        />
      </div>
    );
  };

  return (
    <ThemeProvider>
      <div style={{ 
        padding: '20px', 
        maxWidth: '900px', 
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        <header style={{ marginBottom: '20px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            color: '#333', 
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Symthink Card Deck Navigation Demo
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#666', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Demonstrates a card-based navigation system for the Symthink document tree
          </p>
        </header>
        
        <UserAgentInfo />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: '20px' 
        }}>
          <button
            onClick={() => setUseCardDeckNavigation(!useCardDeckNavigation)}
            style={{
              padding: '10px 20px',
              backgroundColor: useCardDeckNavigation ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'background-color 0.3s'
            }}
          >
            {useCardDeckNavigation ? 'Using Card Deck Navigation ✓' : 'Switch to Card Deck Navigation'}
          </button>
        </div>
        
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '12px', 
          width: '375px',
          height: '667px',
          maxWidth: '100%',
          padding: '0',
          backgroundColor: '#fff',
          margin: '0 auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            padding: '20px',
            height: '100%',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}>
            {useCardDeckNavigation 
              ? renderCardDeckNavigation()
              : renderStandardNavigation()
            }
          </div>
        </div>
        
        <footer style={{ 
          marginTop: '30px', 
          textAlign: 'center',
          color: '#888',
          fontSize: '14px'
        }}>
          <p>Tap on support items to navigate through the document tree</p>
        </footer>
      </div>
    </ThemeProvider>
  );
};

// Use React 17's render method instead of React 18's createRoot
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
); 