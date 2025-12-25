// GESTURE HANDLER MUST BE THE ABSOLUTE FIRST IMPORT
import 'react-native-gesture-handler';

// Hermes compatibility patches second
import './src/patches/lokijs-hermes-patch';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
