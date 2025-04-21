module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": [
          "EXPO_PUBLIC_SUPABASE_URL",
          "EXPO_PUBLIC_SUPABASE_ANON_KEY",
          "EXPO_PUBLIC_RAZORPAY_KEY_ID",
          "EXPO_PUBLIC_RAZORPAY_KEY_SECRET",
          "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY",
          "EXPO_PUBLIC_APP_ENV"
        ],
        "safe": false,
        "allowUndefined": false
      }],
      [
        "module-resolver",
        {
          "root": ["./"],
          "extensions": [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
          "alias": {
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@utils": "./src/utils",
            "@services": "./src/services",
            "@store": "./src/store",
            "@assets": "./assets"
          }
        }
      ]
    ],
  };
}; 