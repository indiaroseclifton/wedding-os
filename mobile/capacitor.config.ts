import type { CapacitorConfig } from "@capacitor/cli";

const LIVE = "https://wedding-os-taupe.vercel.app";

const config: CapacitorConfig = {
  appId: "app.weddingos.desk",
  appName: "Vowfolk",
  webDir: "www",
  server: {
    url: LIVE,
    androidScheme: "https",
    hostname: "wedding-os-taupe.vercel.app",
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    backgroundColor: "#f6f5f2",
    scheme: "Vowfolk",
  },
  android: {
    backgroundColor: "#f6f5f2",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: true,
      backgroundColor: "#f6f5f2",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#f6f5f2",
    },
  },
};

export default config;
