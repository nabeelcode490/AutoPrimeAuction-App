import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebase";

import CustomInput from "../components/CustomInput";
import colors from "../constants/colors";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1. New State for Visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLoginPressed = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      console.log("Logged in successfully:", userCredential.user.email);
      setLoading(false);
      navigation.navigate("Home");
    } catch (error) {
      setLoading(false);
      console.error("Login Error:", error.code);

      let message = "Something went wrong.";
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        message = "Invalid email or password.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Try again later.";
      } else if (error.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      }

      Alert.alert("Login Failed", message);
    }
  };

  const onForgotPasswordPressed = async () => {
    if (!email) {
      Alert.alert(
        "Missing Email",
        "Please enter your email address first so we can send you a reset link."
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "Email Sent",
        "A password reset link has been sent to your email."
      );
    } catch (error) {
      console.error("Forgot Password Error:", error.code);
      let message = error.message;
      if (error.code === "auth/user-not-found") {
        message = "No user found with this email.";
      } else if (error.code === "auth/invalid-email") {
        message = "That email address looks invalid.";
      }
      Alert.alert("Error", message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/apaHeaderLogo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Welcome to Auto Prime Auction</Text>

        <CustomInput
          iconName="mail-outline"
          placeholder="Email"
          value={email}
          setValue={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* 2. Updated Password Field with Eye Icon Logic */}
        <CustomInput
          iconName="lock-closed-outline"
          placeholder="Password"
          value={password}
          setValue={setPassword}
          // If visible is TRUE, secureTextEntry is FALSE (show text)
          secureTextEntry={!isPasswordVisible}
          // Icon changes based on state
          rightIcon={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
          // Toggle the state when clicked
          onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
        />

        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={onForgotPasswordPressed}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={onLoginPressed}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Do not have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
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
    marginBottom: 20,
  },
  logoImage: {
    width: 120,
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
