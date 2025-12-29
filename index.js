// POLYFILLS MUST BE FIRST - before any other imports
import { Platform } from 'react-native';

// Only apply native polyfills on mobile platforms
if (Platform.OS !== 'web') {
  require('react-native-get-random-values');
}
import 'react-native-url-polyfill/auto';

// Buffer polyfill for all platforms
import { Buffer } from 'buffer';
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// GESTURE HANDLER MUST BE BEFORE APP CODE
import 'react-native-gesture-handler';

// Hermes compatibility patches
import './src/patches/lokijs-hermes-patch';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
