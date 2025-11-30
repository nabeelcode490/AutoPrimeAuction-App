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
    estimatedPrice = "26.3 Lac",
    minPrice = "26.3 Lac",
    maxPrice = "29.8 Lac",
  } = route.params || {};

  // --- STATE ---
  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [auctionModalVisible, setAuctionModalVisible] = useState(false);

  // New State for User's Input
  const [userAskingPrice, setUserAskingPrice] = useState("");

  // --- VALIDATION HANDLER ---
  const handleAction = (type) => {
    // 1. Validation: Check if user entered a price
    if (!userAskingPrice.trim()) {
      Alert.alert(
        "Price Required",
        "Please enter your desired asking price before proceeding."
      );
      return;
    }

    // 2. Open the appropriate modal
    if (type === "sale") {
      setSaleModalVisible(true);
    } else {
      setAuctionModalVisible(true);
    }
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
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <Ionicons name="menu-outline" size={30} color={colors.black} />
            </TouchableOpacity>
            <Image
              source={require("../assets/apaHeaderLogo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <TouchableOpacity>
              <Ionicons
                name="notifications-outline"
                size={28}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* SEARCH BAR (Visual Only) */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.grey}
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search for your car..."
                placeholderTextColor={colors.grey}
                style={styles.searchInput}
                editable={false}
              />
              <Ionicons
                name="options-outline"
                size={24}
                color={colors.primary}
              />
            </View>
          </View>

          {/* SUCCESS MESSAGE */}
          <View style={styles.messageContainer}>
            <Text style={styles.successTitle}>
              Your car has been successfully registered!
            </Text>
            <Text style={styles.successSubtitle}>
              We have saved all your car details.
            </Text>

            {/* Lock Icon Illustration */}
            <View style={styles.iconWrapper}>
              <Ionicons name="lock-closed" size={80} color={colors.primary} />
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark-circle" size={40} color="#fff" />
              </View>
            </View>
          </View>

          {/* --- NEW PRICE RANGE CARD --- */}
          <View style={styles.priceCard}>
            <Text style={styles.rangeTitle}>Recommended Price Range</Text>

            {/* Visual Color Bar */}
            <View style={styles.barContainer}>
              <View style={styles.greenBar} />
              <View style={styles.yellowBar} />
            </View>

            {/* Min/Max Labels */}
            <View style={styles.rangeRow}>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.rangeLabel}>Min</Text>
                <Text style={styles.rangeValue}>PKR {minPrice}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.rangeLabel}>Max</Text>
                <Text style={styles.rangeValue}>PKR {maxPrice}</Text>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.disclaimer}>
              *Prices can vary depending on the condition
            </Text>
          </View>

          {/* --- USER INPUT SECTION --- */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Set Your Asking Price:</Text>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.currencyPrefix}>PKR</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Enter amount"
                value={userAskingPrice}
                onChangeText={setUserAskingPrice}
                keyboardType="numeric" // CHANGED: Numeric keypad
              />
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <Text style={styles.actionTitle}>Would you like to:</Text>

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

      {/* ================================================= */}
      {/* --- MODAL 1: LIST FOR SALE CONFIRMATION --- */}
      {/* ================================================= */}
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
            <View style={{ alignItems: "center", marginTop: -40 }}>
              <View style={styles.popupIconCircle}>
                <Ionicons name="bag-check" size={40} color={colors.primary} />
              </View>
            </View>

            <Text style={styles.popupTitle}>
              Your selected price has been recorded.
            </Text>
            <Text style={styles.popupText}>
              Listing in progress. Your car will appear shortly.
            </Text>

            <TouchableOpacity
              onPress={() => setSaleModalVisible(false)}
              style={styles.thankYouButton}
            >
              <Text style={styles.thankYouText}>Thank you!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================================================= */}
      {/* --- MODAL 2: AUCTION SCHEDULE CONFIRMATION --- */}
      {/* ================================================= */}
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
            <View style={{ alignItems: "center", marginTop: -40 }}>
              <View style={styles.popupIconCircle}>
                <Ionicons name="time" size={40} color={colors.primary} />
              </View>
            </View>

            <Text style={styles.popupTitle}>
              Your selected price has been recorded.
            </Text>
            <Text style={styles.popupText}>
              Our team will contact you shortly via SMS on your registered
              number to share your auction schedule.
            </Text>

            <TouchableOpacity
              onPress={() => setAuctionModalVisible(false)}
              style={styles.thankYouButton}
            >
              <Text style={styles.thankYouText}>Thank you!</Text>
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

  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: colors.text },

  messageContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
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

  // --- NEW PRICE CARD STYLES ---
  priceCard: {
    backgroundColor: "#F5F5F5",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginTop: 10,
  },
  rangeTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.black,
  },
  barContainer: {
    flexDirection: "row",
    width: "100%",
    height: 10,
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
    marginBottom: 10,
  },
  rangeLabel: { fontSize: 12, color: colors.grey, textAlign: "center" },
  rangeValue: { fontSize: 16, fontWeight: "bold", color: colors.black },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#D0D0D0",
    marginVertical: 10,
  },
  disclaimer: { fontSize: 12, color: colors.grey, fontStyle: "italic" },

  // --- NEW INPUT SECTION STYLES ---
  inputSection: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
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

  // --- ACTION BUTTONS ---
  actionTitle: {
    fontSize: 18,
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

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: "85%",
    backgroundColor: "#E8F4F8", // CHANGED: Very Light Blue for better contrast
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
  thankYouButton: {
    marginTop: 10,
  },
  thankYouText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.black,
  },
});

export default PriceEvaluationScreen;
