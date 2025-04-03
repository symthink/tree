// Setup React Native Web
import './setupReactNative';

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { CardContainer } from '../../src/components/CardContainer';
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
  const [mockData] = useState<SymthinkDocument>(createMockData());
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

  return (
    <ThemeProvider>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <section style={{ marginBottom: '10px' }}>
          <UserAgentInfo />
          
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            width: '375px',
            height: '667px',
            maxWidth: '100%',
            padding: '20px',
            backgroundColor: '#fff',
            margin: '0 auto',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            overflowY: 'auto'
          }}>
            <CardContainer 
              data={selectedItem || mockData} 
              canEdit={true}
              notify={notifyRef.current}
              onItemAction={handleItemAction}
              onDocAction={handleDocAction}
            />
          </div>
          
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
        </section>
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