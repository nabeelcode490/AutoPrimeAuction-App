import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"; // <--- Removed SafeAreaView from here
import { SafeAreaView } from "react-native-safe-area-context"; // <--- Added the "Smart" SafeAreaView
import colors from "../constants/colors";

const VerificationScreen = ({ navigation }) => {
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [code3, setCode3] = useState("");
  const [code4, setCode4] = useState("");

  const onVerifyPressed = () => {
    console.log("Verifying code...");
    navigation.navigate("Home");
  };

  const onResendPressed = () => {
    console.log("Resend Code Pressed");
  };

  const onBackPressed = () => {
    navigation.goBack();
  };

  return (
    // This SafeAreaView automatically detects your Android Status Bar height
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER: Back Arrow and Share Icon */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPressed}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons
            name="share-social-outline"
            size={24}
            color={colors.black}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* LOGO */}
        <Image
          source={require("../assets/apaHeaderLogo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />

        {/* TITLE & SUBTITLE */}
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          Please enter the code sent to your phone number.
        </Text>

        {/* PHONE ICON ILLUSTRATION */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="chatbox-ellipses-outline"
            size={80}
            color={colors.primary}
          />
          <View style={styles.checkBadge}>
            <Ionicons
              name="checkmark-circle"
              size={30}
              color={colors.primary}
            />
          </View>
        </View>

        {/* 4-DIGIT INPUT BOXES */}
        <View style={styles.codeContainer}>
          <TextInput
            style={styles.codeInput}
            maxLength={1}
            keyboardType="numeric"
            value={code1}
            onChangeText={setCode1}
          />
          <TextInput
            style={styles.codeInput}
            maxLength={1}
            keyboardType="numeric"
            value={code2}
            onChangeText={setCode2}
          />
          <TextInput
            style={styles.codeInput}
            maxLength={1}
            keyboardType="numeric"
            value={code3}
            onChangeText={setCode3}
          />
          <TextInput
            style={styles.codeInput}
            maxLength={1}
            keyboardType="numeric"
            value={code4}
            onChangeText={setCode4}
          />
        </View>

        {/* VERIFY BUTTON */}
        <TouchableOpacity style={styles.verifyButton} onPress={onVerifyPressed}>
          <Text style={styles.verifyButtonText}>Verify</Text>
        </TouchableOpacity>

        {/* RESEND LINK */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={onResendPressed}>
            <Text style={styles.resendLink}>Resend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    // No extra padding needed here, the component handles it!
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10, // Just a tiny bit of extra breathing room below the status bar
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  logoImage: {
    width: 120,
    height: 80,
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
    position: "relative",
  },
  checkBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 15,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 30,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 15,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#FAFAFA",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  resendContainer: {
    flexDirection: "row",
  },
  resendText: {
    color: colors.textLight,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default VerificationScreen;
