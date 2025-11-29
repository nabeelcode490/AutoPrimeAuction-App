import { Ionicons } from "@expo/vector-icons";
import {
  Image,
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
  // We receive dummy data passed from the previous screen
  // If no data is passed, we fall back to these defaults
  const {
    estimatedPrice = "26.3 Lac",
    minPrice = "26.3 Lac",
    maxPrice = "29.8 Lac",
  } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* --- HEADER (Same as Home to match design) --- */}
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

        {/* --- SEARCH BAR (Visual Only) --- */}
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
              editable={false} // Disabled for this screen
            />
            <Ionicons name="options-outline" size={24} color={colors.primary} />
          </View>
        </View>

        {/* --- SUCCESS MESSAGE --- */}
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

        {/* --- PRICE CARD --- */}
        <View style={styles.priceCard}>
          <Text style={styles.mainPrice}>PKR {estimatedPrice}*</Text>
          <Text style={styles.priceLabel}>Recommended Price</Text>

          {/* Visual Color Bar (Green to Yellow simulation) */}
          <View style={styles.barContainer}>
            <View style={styles.greenBar} />
            <View style={styles.yellowBar} />
          </View>

          <View style={styles.rangeRow}>
            <View>
              <Text style={styles.rangeLabel}>Min</Text>
              <Text style={styles.rangeValue}>PKR {minPrice}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.rangeLabel}>Max</Text>
              <Text style={styles.rangeValue}>PKR {maxPrice}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.disclaimer}>
            *Prices can vary depending on the condition
          </Text>
        </View>

        {/* --- UPDATE PRICE LINK --- */}
        <View style={styles.updateContainer}>
          <Text style={styles.updateTitle}>Want to update your car price?</Text>
          <TouchableOpacity style={styles.updateLink}>
            <Ionicons name="pricetag" size={20} color={colors.black} />
            <Text style={styles.updateLinkText}>Update Price</Text>
          </TouchableOpacity>
        </View>

        {/* --- ACTION BUTTONS --- */}
        <Text style={styles.actionTitle}>What would you like to do now?</Text>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              alert("This will publish your car to the Listings feed.")
            }
          >
            <Text style={styles.actionButtonText}>List Car for Sale</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              alert("This will schedule your car for the Auction.")
            }
          >
            <Text style={styles.actionButtonText}>Schedule for Auction</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginBottom: 30,
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

  // PRICE CARD
  priceCard: {
    backgroundColor: "#F5F5F5",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  mainPrice: { fontSize: 28, fontWeight: "bold", color: colors.black },
  priceLabel: { fontSize: 14, color: colors.grey, marginBottom: 15 },

  barContainer: {
    flexDirection: "row",
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  greenBar: { flex: 2, backgroundColor: "#76C839" }, // Green part
  yellowBar: { flex: 1, backgroundColor: "#F4D03F" }, // Yellow part

  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  rangeLabel: { fontSize: 12, color: colors.grey },
  rangeValue: { fontSize: 16, fontWeight: "bold", color: colors.black },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ddd",
    marginBottom: 10,
  },
  disclaimer: { fontSize: 12, color: colors.grey, fontStyle: "italic" },

  // UPDATE LINK
  updateContainer: { marginHorizontal: 20, marginTop: 20, marginBottom: 30 },
  updateTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  updateLink: { flexDirection: "row", alignItems: "center" },
  updateLinkText: {
    fontSize: 16,
    marginLeft: 10,
    textDecorationLine: "underline",
  },

  // ACTIONS
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
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1, // Take equal width
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  orText: { color: colors.grey, fontSize: 16 },
});

export default PriceEvaluationScreen;
