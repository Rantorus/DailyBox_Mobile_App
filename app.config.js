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
          "calendarPermission": "The app needs to access your calendar."
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "Uygulamanın ses kaydedebilmesi için mikrofona erişmesi gerekiyor."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Uygulamanın haritada yerinizi gösterebilmesi için konumunuza erişmesi gerekiyor."
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Uygulamaya hızlı giriş için Face ID kullanmak istiyor."
        }
      ],
      [
        "expo-secure-store"
      ]
    ]
  }
};