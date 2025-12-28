import { Ionicons } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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
import { auth, db } from "../config/firebase";

import CustomInput from "../components/CustomInput";
import colors from "../constants/colors";

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // --- 1. SMART PHONE INPUT HANDLER (Auto-Hyphen) ---
  const handlePhoneChange = (text) => {
    // Remove any non-numeric characters for processing
    let cleaned = text.replace(/[^0-9]/g, "");

    // Enforce "03" start constraint (optional: strictly prevent typing if not 03)
    // For now, we allow typing but will validate it on submit.

    // Auto-insert hyphen after 4th digit
    if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 4) + "-" + cleaned.slice(4);
    }

    // Limit total length (03xx-xxxxxxx is 12 chars)
    if (cleaned.length > 12) {
      cleaned = cleaned.slice(0, 12);
    }

    setPhone(cleaned);
  };

  // --- 2. SMART NAME INPUT HANDLER (No Numbers) ---
  const handleNameChange = (text) => {
    // Regex: Only allow Letters (a-z, A-Z) and Spaces
    if (/^[a-zA-Z\s]*$/.test(text)) {
      setFullName(text);
    }
    // If text contains numbers/symbols, we just ignore the input (don't update state)
  };

  const onRegisterPressed = async () => {
    // --- 3. STRICT VALIDATIONS ---

    // Check Empty Fields
    if (!fullName || !email || !phone || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // Check Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address (e.g. ali@gmail.com)."
      );
      return;
    }

    // Check Phone Format (Must be 03xx-xxxxxxx)
    // Logic: Must start with '03', have a hyphen at index 4, and be 12 chars long
    const phoneRegex = /^03\d{2}-\d{7}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert(
        "Invalid Phone",
        "Phone number must start with '03' and follow the format 03xx-xxxxxxx."
      );
      return;
    }

    // Check Password Length
    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long."
      );
      return;
    }

    setLoading(true);

    try {
      // Create User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(), // Trim extra spaces
        email: email.toLowerCase(), // Save as lowercase
        phone: phone,
        uid: user.uid,
        createdAt: new Date(),
        role: "buyer",
      });

      // Send Verification Email
      await sendEmailVerification(user);

      setLoading(false);

      // Navigate
      Alert.alert(
        "Account Created",
        "Please check your email to verify your account.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("EmailVerification", { email: email }),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error("Signup Error:", error);

      let message = error.message;
      if (message.includes("email-already-in-use")) {
        message = "This email is already registered.";
      }
      Alert.alert("Registration Failed", message);
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

        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Bid. Win. Drive.</Text>

        {/* FULL NAME - With Number Blocking */}
        <CustomInput
          iconName="person-outline"
          placeholder="Full name"
          value={fullName}
          setValue={handleNameChange} // Use our smart handler
        />

        {/* EMAIL - Auto Lowercase & Email Keyboard */}
        <CustomInput
          iconName="mail-outline"
          placeholder="Email address"
          value={email}
          setValue={setEmail}
          keyboardType="email-address"
          autoCapitalize="none" // <--- Prevents auto-capitalization
        />

        {/* PHONE - With Masking & Placeholder */}
        <CustomInput
          iconName="call-outline"
          placeholder="Phone No (03xx-1234567)"
          value={phone}
          setValue={handlePhoneChange} // Use our smart handler
          keyboardType="phone-pad"
          maxLength={12} // Hard limit length
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
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.registerButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* ... (Rest of UI: Dividers, Social Icons, Footer) remains same ... */}
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
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9F9F9" },
  scrollContainer: { padding: 20, alignItems: "center", paddingTop: 30 },
  logoContainer: { alignItems: "center", marginBottom: 20 },
  logoImage: { width: 120, height: 80, marginBottom: 10 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 5,
  },
  subtitle: { fontSize: 14, color: colors.grey, marginBottom: 20 },
  registerButton: {
    backgroundColor: colors.primary,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  registerButtonText: { color: colors.white, fontSize: 18, fontWeight: "bold" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    marginVertical: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.grey, opacity: 0.5 },
  orText: { marginHorizontal: 10, color: colors.grey },
  socialText: { color: colors.primary, marginBottom: 15, fontWeight: "600" },
  socialContainer: { flexDirection: "row", marginBottom: 20 },
  socialIcon: { marginHorizontal: 10 },
  footerContainer: { flexDirection: "row", marginBottom: 20 },
  footerText: { color: colors.grey },
  signInLink: { color: colors.primary, fontWeight: "bold" },
});

export default SignupScreen;
