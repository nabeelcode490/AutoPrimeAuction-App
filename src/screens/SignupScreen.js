import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import Auth function
import { doc, setDoc } from "firebase/firestore"; // Import Database functions
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
import { auth, db } from "../config/firebase"; // Import our configured Firebase

import CustomInput from "../components/CustomInput";
import colors from "../constants/colors";

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // New state to show a loading spinner
  const [loading, setLoading] = useState(false);

  const onRegisterPressed = async () => {
    // 1. Basic Validation
    if (!fullName || !email || !phone || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true); // Start spinning

    try {
      // 2. Create User in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 3. Save Extra Data (Name, Phone) to Firestore Database
      // We use the 'uid' (User ID) from Auth to link the database record
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName,
        email: email,
        phone: phone,
        uid: user.uid,
        createdAt: new Date(),
        role: "buyer", // Default role
      });

      console.log("User Account Created:", user.uid);
      setLoading(false); // Stop spinning

      // 4. Navigate to Verification (or Home)
      // For now, we keep your flow going to Verification
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Verification") },
      ]);
    } catch (error) {
      setLoading(false); // Stop spinning on error
      console.error("Signup Error:", error);

      // Show a friendly error message
      let message = error.message;
      if (message.includes("email-already-in-use")) {
        message = "This email is already registered.";
      } else if (message.includes("weak-password")) {
        message = "Password should be at least 6 characters.";
      }
      Alert.alert("Registration Failed", message);
    }
  };

  const onSignInPressed = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* LOGO SECTION */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/apaHeaderLogo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Bid. Win. Drive.</Text>

        {/* INPUTS */}
        <CustomInput
          iconName="person-outline"
          placeholder="Full name"
          value={fullName}
          setValue={setFullName}
        />

        <CustomInput
          iconName="mail-outline"
          placeholder="Email address"
          value={email}
          setValue={setEmail}
          keyboardType="email-address"
        />

        <CustomInput
          iconName="call-outline"
          placeholder="Phone number"
          value={phone}
          setValue={setPhone}
          keyboardType="phone-pad"
        />

        <CustomInput
          iconName="lock-closed-outline"
          placeholder="Password"
          value={password}
          setValue={setPassword}
          secureTextEntry={true}
        />

        <TouchableOpacity
          style={styles.registerButton}
          onPress={onRegisterPressed}
          disabled={loading} // Disable button while loading
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.registerButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>Or</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.socialText}>Sign Up with</Text>

        <View style={styles.socialContainer}>
          <Ionicons
            name="logo-facebook"
            size={30}
            color="black"
            style={styles.socialIcon}
          />
          <Ionicons
            name="logo-instagram"
            size={30}
            color="black"
            style={styles.socialIcon}
          />
          <Ionicons
            name="logo-youtube"
            size={30}
            color="black"
            style={styles.socialIcon}
          />
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={onSignInPressed}>
            <Text style={styles.signInLink}>Sign In</Text>
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
    paddingTop: 30,
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
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: colors.primary,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.grey,
    opacity: 0.5,
  },
  orText: {
    marginHorizontal: 10,
    color: colors.grey,
  },
  socialText: {
    color: colors.primary,
    marginBottom: 15,
    fontWeight: "600",
  },
  socialContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  socialIcon: {
    marginHorizontal: 10,
  },
  footerContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  footerText: {
    color: colors.grey,
  },
  signInLink: {
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default SignupScreen;
