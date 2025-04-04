// Setup React Native Web
import './setupReactNative';

import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { SymthinkTree } from '../../src';
import { SymthinkDocument, ISymthinkDocument } from '../../src/core/symthink.class';
import { Subject } from 'rxjs';
import data from './mock-data.json';

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

  // const [mockData] = useState<SymthinkDocument>(() => {
  //   console.log('Creating mock data with: ', data);
  //   const std = new SymthinkDocument();
  //   std.load(data as unknown as ISymthinkDocument);
  //   console.log('Mock data created:', std);
  //   return std;
  // });

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [canEdit, setCanEdit] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
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
      <div style={{
        maxWidth: '900px',
        padding: '16px',
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>

        <UserAgentInfo />

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setCanEdit(!canEdit)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: canEdit ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {canEdit ? 'Disable Editing' : 'Enable Editing'}
          </button>
        </div>
        <hr />
        <div style={{
          width: '375px',
          padding: '0',
          margin: '0 auto',
        }}>
          {(canEdit && canGoBack) && (
            <div style={{
              padding: '16px'
            }}>
              <button
                onClick={() => setCanGoBack(true)}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ← Back
              </button>
            </div>
          )}
              <SymthinkTree 
                initialData={data as unknown as ISymthinkDocument}
                canEdit={canEdit}
                canGoBack={canGoBack}
                onBackComplete={() => {
                  console.log('Back complete');
                  setCanGoBack(false);
                }}
              />
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

// Use React 18's createRoot instead of React 17's render
const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 