// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/hooks': './src/hooks',
          '@/services': './src/services',
          '@/store': './src/store',
          '@/utils': './src/utils',
          '@/types': './src/types',
          '@/assets': './src/assets',
          '@/navigation': './src/navigation',
          '@/constants': './src/constants',
        },
      }],
      'react-native-reanimated/plugin',
      '@tamagui/babel-plugin',
    ],
  };
};