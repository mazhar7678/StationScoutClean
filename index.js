// index.js
// CRITICAL: Import polyfills FIRST before any other imports
// This fixes "Cannot assign to read-only property 'NONE'" error on Hermes
import 'react-native-polyfill-globals/auto';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);