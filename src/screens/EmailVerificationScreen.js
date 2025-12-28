import { Ionicons } from "@expo/vector-icons";
import { reload, sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../config/firebase";
import colors from "../constants/colors";

const EmailVerificationScreen = ({ navigation, route }) => {
  const email = route.params?.email || "your email";
  const [loading, setLoading] = useState(false);

  const checkVerification = async () => {
    setLoading(true);
    try {
      // 1. Reload User to get latest status
      await auth.currentUser.reload();

      // 2. Check if verified
      if (auth.currentUser.emailVerified) {
        setLoading(false);
        Alert.alert("Success", "Email Verified!", [
          { text: "Continue", onPress: () => navigation.navigate("Home") },
        ]);
      } else {
        setLoading(false);
        Alert.alert(
          "Not Verified",
          "Please click the link in your email first."
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", error.message);
    }
  };

  const resendEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      Alert.alert("Sent", "Verification link sent again!");
    } catch (error) {
      Alert.alert("Error", "Please wait before resending.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* Same Logo as your App */}
        <Image
          source={require("../assets/apaHeaderLogo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Text style={styles.title}>Check your Email</Text>
        <Text style={styles.subtitle}>
          We sent a verification link to:{"\n"}
          <Text style={{ fontWeight: "bold", color: colors.primary }}>
            {email}
          </Text>
        </Text>

        {/* Email Icon instead of Chat Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="mail-unread-outline"
            size={80}
            color={colors.primary}
          />
          <View style={styles.checkBadge}>
            <Ionicons name="alert-circle" size={30} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.instruction}>
          Click the link in your email, then come back here and press the button
          below.
        </Text>

        {/* The New "Check" Button */}
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={checkVerification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>I Have Verified</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>No email received? </Text>
          <TouchableOpacity onPress={resendEmail}>
            <Text style={styles.resendLink}>Resend Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, marginTop: 10 },
  contentContainer: { padding: 20, alignItems: "center" },
  logoImage: { width: 120, height: 80, marginTop: 20, marginBottom: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  iconContainer: { marginBottom: 30, position: "relative" },
  checkBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 15,
  },
  instruction: {
    textAlign: "center",
    color: colors.grey,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  verifyButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  resendContainer: { flexDirection: "row" },
  resendText: { color: colors.grey },
  resendLink: { color: colors.primary, fontWeight: "bold" },
});

export default EmailVerificationScreen;
