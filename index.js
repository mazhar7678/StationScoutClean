// THIS MUST BE THE VERY FIRST IMPORT
import './src/patches/lokijs-hermes-patch';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
