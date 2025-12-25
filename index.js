// index.js
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Global error handler to suppress Hermes "NONE" property errors
if (Platform.OS !== 'web') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    // Suppress the Hermes read-only property error from WatermelonDB
    if (error?.message?.includes('NONE') || error?.message?.includes('read-only property')) {
      console.log('[App] Suppressed Hermes event emitter warning');
      return;
    }
    // Pass other errors to the original handler
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });

  // Also handle unhandled promise rejections
  const promiseRejectionHandler = (id, rejection) => {
    if (rejection?.message?.includes('NONE') || rejection?.message?.includes('read-only property')) {
      console.log('[App] Suppressed Hermes promise rejection warning');
      return;
    }
  };
  
  if (global.HermesInternal) {
    global.HermesInternal.enablePromiseRejectionTracker?.({
      allRejections: true,
      onUnhandled: promiseRejectionHandler,
    });
  }
}

registerRootComponent(App);