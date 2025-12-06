import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";

const PriceEvaluationScreen = ({ navigation, route }) => {
  const {
    carId,
    estimatedPrice = "Processing...",
    minPrice = "N/A",
    maxPrice = "N/A",
    // Default to false if we came here from an old flow, but usually SellCar passes it
    hasInspectionDocs = false,
  } = route.params || {};

  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [auctionModalVisible, setAuctionModalVisible] = useState(false);
  const [userAskingPrice, setUserAskingPrice] = useState("");

  const handleAction = (type) => {
    // 1. Basic Price Validation
    if (!userAskingPrice.trim()) {
      Alert.alert("Price Required", "Please enter your desired asking price.");
      return;
    }

    // 2. LOGIC: Auction Requirement Check
    if (type === "auction") {
      if (!hasInspectionDocs) {
        // THE ALERT YOU REQUESTED
        Alert.alert(
          "Documents Missing",
          "You must provide image and pdf to schedule for auction. Without providing those you can only list car for sale.",
          [
            { text: "OK", style: "cancel" },
            {
              text: "List for Sale Instead",
              onPress: () => setSaleModalVisible(true),
            },
          ]
        );
        return;
      }
      // If docs exist, proceed to success modal
      setAuctionModalVisible(true);
    }
    // 3. Sale Logic (Always allowed)
    else if (type === "sale") {
      setSaleModalVisible(true);
    }
  };

  const finalizeSubmission = () => {
    // Navigate home after success
    setSaleModalVisible(false);
    setAuctionModalVisible(false);
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <Ionicons name="menu-outline" size={30} color={colors.black} />
            </TouchableOpacity>
            <Image
              source={require("../assets/apaHeaderLogo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={{ width: 30 }} />
          </View>

          {/* Success Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.successTitle}>
              Car Registered Successfully!
            </Text>
            <Text style={styles.successSubtitle}>
              Our AI has evaluated your vehicle.
            </Text>
            <View style={styles.iconWrapper}>
              <Ionicons name="lock-closed" size={80} color={colors.primary} />
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark-circle" size={40} color="#fff" />
              </View>
            </View>
          </View>

          {/* Price Card */}
          <View style={styles.priceCard}>
            <Text style={styles.rangeTitle}>Estimated Market Price</Text>
            <Text style={styles.bigPrice}>{estimatedPrice}</Text>

            <View style={styles.barContainer}>
              <View style={styles.greenBar} />
              <View style={styles.yellowBar} />
            </View>

            <View style={styles.rangeRow}>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.rangeLabel}>Min</Text>
                <Text style={styles.rangeValue}>{minPrice}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.rangeLabel}>Max</Text>
                <Text style={styles.rangeValue}>{maxPrice}</Text>
              </View>
            </View>
          </View>

          {/* User Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Set Your Asking Price:</Text>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.currencyPrefix}>PKR</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Enter amount"
                value={userAskingPrice}
                onChangeText={setUserAskingPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <Text style={styles.actionTitle}>What would you like to do?</Text>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction("sale")}
            >
              <Text style={styles.actionButtonText}>List Car for Sale</Text>
            </TouchableOpacity>
            <Text style={styles.orText}>or</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction("auction")}
            >
              <Text style={styles.actionButtonText}>Schedule for Auction</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- MODAL 1: LIST FOR SALE SUCCESS --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={saleModalVisible}
        onRequestClose={() => setSaleModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSaleModalVisible(false)}
        >
          <View style={styles.popupContainer}>
            <View style={styles.popupIconCircle}>
              <Ionicons name="bag-check" size={40} color={colors.primary} />
            </View>
            <Text style={styles.popupTitle}>Listed for Sale!</Text>
            <Text style={styles.popupText}>
              Your car is now visible in the marketplace.
            </Text>
            <TouchableOpacity
              onPress={finalizeSubmission}
              style={styles.thankYouButton}
            >
              <Text style={styles.thankYouText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- MODAL 2: SCHEDULE AUCTION SUCCESS --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={auctionModalVisible}
        onRequestClose={() => setAuctionModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAuctionModalVisible(false)}
        >
          <View style={styles.popupContainer}>
            <View style={styles.popupIconCircle}>
              <Ionicons name="time" size={40} color={colors.primary} />
            </View>
            <Text style={styles.popupTitle}>Submitted for Review</Text>
            <Text style={styles.popupText}>
              Our team will verify your inspection sheet and schedule the
              auction.
            </Text>
            <TouchableOpacity
              onPress={finalizeSubmission}
              style={styles.thankYouButton}
            >
              <Text style={styles.thankYouText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerLogo: { width: 80, height: 40 },
  messageContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  successSubtitle: {
    fontSize: 14,
    color: colors.grey,
    textAlign: "center",
    marginBottom: 20,
  },
  iconWrapper: { position: "relative", marginTop: 10 },
  checkBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 2,
    borderWidth: 3,
    borderColor: "#fff",
  },

  priceCard: {
    backgroundColor: "#F5F5F5",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  rangeTitle: { fontSize: 14, color: colors.grey, marginBottom: 5 },
  bigPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
  },
  barContainer: {
    flexDirection: "row",
    width: "100%",
    height: 8,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 10,
  },
  greenBar: { flex: 2, backgroundColor: "#76C839" },
  yellowBar: { flex: 1, backgroundColor: "#F4D03F" },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  rangeLabel: { fontSize: 12, color: colors.grey },
  rangeValue: { fontSize: 16, fontWeight: "bold", color: colors.black },

  inputSection: { marginHorizontal: 20, marginTop: 30, marginBottom: 20 },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 10,
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginRight: 10,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.black,
    fontWeight: "500",
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 10,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  orText: { color: colors.grey, fontSize: 16 },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: "85%",
    backgroundColor: "#E8F4F8",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    elevation: 10,
  },
  popupIconCircle: {
    backgroundColor: "#fff",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 5,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: colors.black,
  },
  popupText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
    lineHeight: 22,
  },
  thankYouButton: { marginTop: 10 },
  thankYouText: { fontSize: 18, fontWeight: "bold", color: colors.black },
});

export default PriceEvaluationScreen;
