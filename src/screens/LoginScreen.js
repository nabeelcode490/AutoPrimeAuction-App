import { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"; // <--- Added Image
import CustomInput from "../components/CustomInput";
import colors from "../constants/colors";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onLoginPressed = () => {
    console.log("Login with:", username, password);
    navigation.navigate("Home");
  };

  const onSignUpPressed = () => {
    navigation.navigate("Signup");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* LOGO SECTION */}
        <View style={styles.logoContainer}>
          {/* --- REPLACED ICON WITH IMAGE --- */}
          <Image
            source={require("../assets/apaHeaderLogo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          {/* Removed the "APA" text here because the logo has it */}
        </View>

        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Welcome to Auto Prime Auction</Text>

        <CustomInput
          iconName="person-outline"
          placeholder="Username"
          value={username}
          setValue={setUsername}
        />

        <CustomInput
          iconName="lock-closed-outline"
          placeholder="Password"
          value={password}
          setValue={setPassword}
          secureTextEntry={true}
        />

        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={onLoginPressed}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onSignUpPressed}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
    paddingTop: 50,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20, // Reduced slightly since image is taller
  },
  // --- NEW LOGO STYLE ---
  logoImage: {
    width: 120, // Slightly smaller for Login screen
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 30,
  },
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 15,
  },
  forgotPasswordText: {
    color: colors.black,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: colors.primary,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  footerContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  footerText: {
    color: colors.grey,
  },
  signUpLink: {
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default LoginScreen;
