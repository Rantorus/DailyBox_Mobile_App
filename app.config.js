module.exports = {
  expo: {
    name: "DailyBox",
    scheme: "your-app-scheme",
    slug: "DailyBox",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.rantorus.DailyBox",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-calendar",
        {
          "calendarPermission": "DailyBox needs to access your calendar to sync your reminders."
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "DailyBox needs microphone access to record voice notes for your boxes."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "DailyBox needs access to your location to attach locations to your boxes."
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "DailyBox uses Face ID to securely unlock your private application."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "DailyBox needs access to your photo library to let you attach photos to your boxes.",
          "cameraPermission": "DailyBox needs access to your camera to let you take and attach photos to your boxes."
        }
      ],
      [
        "expo-secure-store"
      ]
    ]
  }
};