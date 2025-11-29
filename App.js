import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import AppNavigator from "./src/navigation/AppNavigator";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // This is where we usually load fonts or API data
        // For now, we just simulate a 2-second delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Once app is ready, hide the splash screen
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Render nothing while waiting (Splash is still on top)
  }

  return <AppNavigator />;
}
