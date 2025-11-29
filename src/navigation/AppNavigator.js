import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import your screens here
import AuctionsScreen from "../screens/AuctionsScreen"; // The OLD Home (renamed)
import CarDetailsScreen from "../screens/CarDetailsScreen"; // <--- Import
import HomeScreen from "../screens/HomeScreen"; // The NEW Home
import LiveBiddingScreen from "../screens/LiveBiddingScreen"; // <--- Import
import LoginScreen from "../screens/LoginScreen"; // <-- Added
import PriceEvaluationScreen from "../screens/PriceEvaluationScreen";
import SellCarScreen from "../screens/SellCarScreen"; // <--- Import
import SignupScreen from "../screens/SignupScreen"; // <--
import VerificationScreen from "../screens/VerificationScreen"; // <--- 1. Import this
import WelcomeScreen from "../screens/WelcomeScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* headerShown: false hides the top bar that says "WelcomeScreen" */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        {/* 2. Add the Verification Screen here */}
        <Stack.Screen name="Verification" component={VerificationScreen} />
        {/* The New Main Dashboard, This is the screen for Guests/Users*/}
        <Stack.Screen name="Home" component={HomeScreen} />
        {/* The Page for Live/Scheduled Auctions */}
        <Stack.Screen name="Auctions" component={AuctionsScreen} />
        {/* NEW SCREEN- Car Details Screen */}
        <Stack.Screen name="CarDetails" component={CarDetailsScreen} />
        <Stack.Screen name="LiveBidding" component={LiveBiddingScreen} />
        <Stack.Screen name="SellCar" component={SellCarScreen} />

        <Stack.Screen
          name="PriceEvaluation"
          component={PriceEvaluationScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
