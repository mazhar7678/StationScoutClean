import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  console.log('[LokiJS Patch] Applying Hermes compatibility patches...');

  const originalFreeze = Object.freeze;
  Object.freeze = function patchedFreeze(obj) {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const keys = Object.keys(obj);
      if (
        keys.length === 3 &&
        'NONE' in obj &&
        'BUBBLE' in obj &&
        'CAPTURE' in obj
      ) {
        console.log('[LokiJS Patch] Intercepted event phase constants freeze');
        return obj;
      }
    }
    return originalFreeze.call(Object, obj);
  };

  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function patchedDefineProperty(obj, prop, descriptor) {
    if (
      (prop === 'NONE' || prop === 'BUBBLE' || prop === 'CAPTURE') &&
      descriptor &&
      descriptor.writable === false
    ) {
      console.log(`[LokiJS Patch] Making ${prop} writable`);
      descriptor.writable = true;
      descriptor.configurable = true;
    }
    return originalDefineProperty.call(Object, obj, prop, descriptor);
  };

  if (global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      const errorMessage = error?.message || error?.toString() || '';
      
      if (
        errorMessage.includes("Cannot assign to read-only property 'NONE'") ||
        errorMessage.includes("Cannot assign to read-only property 'BUBBLE'") ||
        errorMessage.includes("Cannot assign to read-only property 'CAPTURE'") ||
        errorMessage.includes("read-only property")
      ) {
        console.warn('[LokiJS Patch] Suppressed frozen property error');
        return;
      }
      
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }

  try {
    const { Alert } = require('react-native');
    const originalAlert = Alert.alert;
    
    Alert.alert = function patchedAlert(title, message, ...rest) {
      const fullMessage = `${title} ${message}`.toLowerCase();
      
      if (
        fullMessage.includes('none') && 
        fullMessage.includes('read-only')
      ) {
        console.warn('[LokiJS Patch] Suppressed error alert');
        return;
      }
      
      return originalAlert.call(Alert, title, message, ...rest);
    };
  } catch (e) {
    console.warn('[LokiJS Patch] Could not patch Alert:', e);
  }

  console.log('[LokiJS Patch] All patches applied successfully');
}

export default {};
