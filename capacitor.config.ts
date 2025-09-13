
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bedtales.app',
  appName: 'BedTales',
  webDir: 'dist',
  // FIX: The 'bundledWebRuntime' property was removed in Capacitor 4 and is no longer a valid option.
  server: {
    // For local development with live reload
    // On a physical device, you might need to set the url to your computer's IP
    // url: 'http://192.168.1.10:5173',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#0c0a1a", // Matches the Cosmic Night theme background
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#e0e0e0", // A light color for good contrast
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
