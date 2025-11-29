import { Ionicons } from "@expo/vector-icons";
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

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const onRegisterPressed = () => {
    navigation.navigate("Verification");
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
          {/* --- REPLACED ICON WITH IMAGE --- */}
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
        >
          <Text style={styles.registerButtonText}>Sign Up</Text>
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
  // --- NEW LOGO STYLE ---
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
