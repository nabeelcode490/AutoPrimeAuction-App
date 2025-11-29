import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"; // <--- Added Image import
import colors from "../constants/colors";

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* TOP SECTION: Logo and Title */}
      <View style={styles.logoContainer}>
        {/* --- NEW LOGO IMAGE --- */}
        <Image
          source={require("../assets/apaHeaderLogo.png")}
          style={styles.logoImage}
          resizeMode="contain" // Keeps the aspect ratio correct
        />

        <Text style={styles.title}>Auto Prime Auction</Text>
        <Text style={styles.subtitle}>Fair Price. Real Time. Trusted.</Text>
      </View>

      {/* BOTTOM SECTION: Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.registerButtonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.guestButtonText}>Explore App as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  // --- NEW LOGO STYLE ---
  logoImage: {
    width: 150, // Adjust this if you want it bigger/smaller
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  buttonContainer: {
    width: "100%",
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    marginBottom: 20,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  guestButton: {
    alignItems: "center",
    padding: 10,
  },
  guestButtonText: {
    color: colors.textLight,
    fontSize: 16,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});

export default WelcomeScreen;
