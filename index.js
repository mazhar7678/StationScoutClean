// ============================================
// HERMES COMPATIBILITY PATCH - Must run first!
// This patches Object.freeze before any React Native modules load
// ============================================

const originalFreeze = Object.freeze;
Object.freeze = function(obj) {
  if (obj && typeof obj === 'object') {
    try {
      const keys = Object.keys(obj);
      if (
        keys.includes('NONE') && 
        keys.includes('BUBBLE') && 
        keys.includes('CAPTURE')
      ) {
        return obj;
      }
    } catch (e) {
      // Ignore errors during key enumeration
    }
  }
  return originalFreeze.call(Object, obj);
};

// ============================================
// Now load modules using require (after patch)
// ============================================
const { registerRootComponent } = require('expo');
const { Platform } = require('react-native');
const App = require('./App').default;

// Additional error suppression
if (Platform.OS !== 'web') {
  try {
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      const message = error?.message || '';
      if (
        message.includes('NONE') || 
        message.includes('BUBBLE') ||
        message.includes('CAPTURE') ||
        message.includes('read-only property')
      ) {
        console.warn('[App] Suppressed Hermes compatibility warning');
        return;
      }
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  } catch (e) {
    // ErrorUtils might not be available
  }
}

registerRootComponent(App);
