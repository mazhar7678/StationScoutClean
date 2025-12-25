// index.js

// ============================================
// HERMES COMPATIBILITY PATCH - Must be first!
// ============================================
import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  const originalFreeze = Object.freeze;
  Object.freeze = function(obj) {
    if (obj && typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (
        keys.includes('NONE') && 
        keys.includes('BUBBLE') && 
        keys.includes('CAPTURE') &&
        keys.length === 3
      ) {
        return obj;
      }
    }
    return originalFreeze.call(Object, obj);
  };
}

// Global error handler to suppress Hermes "NONE" property errors
if (Platform.OS !== 'web') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    const message = error?.message || '';
    if (
      message.includes('NONE') || 
      message.includes('BUBBLE') ||
      message.includes('CAPTURE') ||
      message.includes('read-only property') ||
      message.includes('initializeJSI')
    ) {
      console.warn('[App] Suppressed Hermes/JSI compatibility warning');
      return;
    }
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });

  if (global.HermesInternal) {
    global.HermesInternal.enablePromiseRejectionTracker?.({
      allRejections: true,
      onUnhandled: (id, rejection) => {
        const message = rejection?.message || '';
        if (
          message.includes('NONE') || 
          message.includes('read-only property') ||
          message.includes('initializeJSI')
        ) {
          return;
        }
      },
    });
  }
}

// ============================================
// Normal app initialization
// ============================================
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
