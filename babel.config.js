module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        
        // This is the correct place for the module-resolver plugin
        [
          'module-resolver',
          {
            root: ['./src'],
            extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
            alias: {
              '@': './src',
            },
          },
        ],
  
        'react-native-reanimated/plugin',
      ],
    };
  };