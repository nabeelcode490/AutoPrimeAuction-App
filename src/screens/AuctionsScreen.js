import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CarCard from "../components/CarCard";
import { auth, db } from "../config/firebase";
import colors from "../constants/colors";
import { liveAuctions, scheduledAuctions } from "../data/carData";

const AuctionsScreen = ({ navigation }) => {
  const currentLiveCar = liveAuctions[0];
  const upNextCars = liveAuctions.slice(1);

  // --- STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [correctAccessCode, setCorrectAccessCode] = useState(null);

  // --- JOIN AUCTION LOGIC ---
  const handleJoinAuction = async (carItem) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login Required", "Please login to join the auction.");
      return;
    }

    setLoading(true);

    try {
      // Check Global Request Status
      const q = query(
        collection(db, "auction_requests"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setLoading(false);
        navigation.navigate("AuctionRegistration");
      } else {
        const requestData = querySnapshot.docs[0].data();
        setLoading(false);

        if (requestData.status === "pending") {
          Alert.alert(
            "Verification Pending",
            "We are verifying your security deposit. Please check your WhatsApp."
          );
        } else if (requestData.status === "approved") {
          setCorrectAccessCode(requestData.accessCode);
          setModalVisible(true);
        } else {
          Alert.alert(
            "Status",
            "Your request status is: " + requestData.status
          );
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Check Status Error:", error);
      Alert.alert("Error", "Could not verify status. Check internet.");
    }
  };

  const verifyCode = () => {
    if (accessCodeInput === correctAccessCode) {
      setModalVisible(false);
      setAccessCodeInput("");
      // PASSING MODE: "bid"
      navigation.navigate("LiveBidding", { item: currentLiveCar, mode: "bid" });
    } else {
      Alert.alert("Access Denied", "Incorrect Access Code.");
    }
  };

  const renderUpNextItem = ({ item }) => (
    <TouchableOpacity
      style={styles.upNextCard}
      onPress={() => navigation.navigate("CarDetails", { item })}
    >
      <View style={styles.upNextImageContainer}>
        <Image source={{ uri: item.image }} style={styles.upNextImage} />
        <View style={styles.queueBadge}>
          <Text style={styles.queueText}>Next</Text>
        </View>
      </View>
      <View style={styles.upNextDetails}>
        <Text style={styles.upNextTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.upNextPrice}>Est: {item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
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
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* LIVE NOW SECTION */}
        <View style={styles.sectionHeader}>
          <View style={styles.liveIndicatorRow}>
            <View style={styles.pulsingDot} />
            <Text style={styles.sectionTitle}>Live Now</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Happening in Lahore Center</Text>
        </View>

        {currentLiveCar ? (
          <View style={styles.heroContainer}>
            <View style={styles.heroImageWrapper}>
              <Image
                source={{ uri: currentLiveCar.image }}
                style={styles.heroImage}
              />
              <View style={styles.liveBadge}>
                <Ionicons name="radio" size={14} color="#fff" />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.heroDetails}>
              <View style={styles.titlePriceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle} numberOfLines={1}>
                    {currentLiveCar.name}
                  </Text>
                  <Text style={styles.heroModel}>{currentLiveCar.model}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.heroLabel}>Current Bid</Text>
                  <Text style={styles.heroPrice}>{currentLiveCar.price}</Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                {/* VIEW ONLY BUTTON: PASSES MODE="view" */}
                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={() =>
                    navigation.navigate("LiveBidding", {
                      item: currentLiveCar,
                      mode: "view",
                    })
                  }
                >
                  <Text style={styles.outlineButtonText}>View Only</Text>
                </TouchableOpacity>

                {/* JOIN BUTTON */}
                <TouchableOpacity
                  style={styles.fillButton}
                  onPress={() => handleJoinAuction(currentLiveCar)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.fillButtonText}>Join Auction</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.noAuctionText}>No Live Auction in progress.</Text>
        )}

        {/* UP NEXT SECTION */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          <Text style={styles.sectionSubtitle}>Coming to stage soon</Text>
        </View>

        <FlatList
          horizontal
          data={upNextCars}
          renderItem={renderUpNextItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        {/* SCHEDULED AUCTIONS */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Auction Schedule</Text>
          <Text style={styles.sectionSubtitle}>Upcoming Events</Text>
        </View>

        <FlatList
          horizontal
          data={scheduledAuctions}
          renderItem={({ item }) => <CarCard item={item} isLive={false} />}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* ACCESS CODE MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Access Code</Text>
            <Text style={styles.modalSubtitle}>
              Please enter the code sent to your WhatsApp.
            </Text>

            <TextInput
              style={styles.codeInput}
              placeholder="e.g. 7860"
              keyboardType="numeric"
              value={accessCodeInput}
              onChangeText={setAccessCodeInput}
            />

            <TouchableOpacity style={styles.modalButton} onPress={verifyCode}>
              <Text style={styles.modalButtonText}>Enter Auction</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    marginRight: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  filterButton: { padding: 10 },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.black },
  sectionSubtitle: { fontSize: 12, color: colors.grey },
  liveIndicatorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pulsingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "red" },
  heroContainer: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  heroImageWrapper: { position: "relative" },
  heroImage: { width: "100%", height: 150, resizeMode: "cover" },
  liveBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(231, 76, 60, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 10 },
  heroDetails: { padding: 12 },
  titlePriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  heroTitle: { fontSize: 18, fontWeight: "bold", color: colors.black },
  heroModel: { fontSize: 14, color: colors.grey, marginTop: 2 },
  heroLabel: { fontSize: 10, color: colors.textLight, marginBottom: 0 },
  heroPrice: { fontSize: 16, fontWeight: "bold", color: colors.primary },
  buttonRow: { flexDirection: "row", gap: 10 },
  outlineButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  fillButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  fillButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  listContent: { paddingLeft: 20, paddingRight: 5 },
  upNextCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    paddingBottom: 8,
  },
  upNextImageContainer: { position: "relative" },
  upNextImage: {
    width: "100%",
    height: 90,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 6,
  },
  queueBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  queueText: { color: "#fff", fontSize: 8, fontWeight: "bold" },
  upNextDetails: { paddingHorizontal: 8 },
  upNextTitle: { fontSize: 13, fontWeight: "bold", color: colors.black },
  upNextPrice: { fontSize: 11, color: colors.grey, marginTop: 1 },
  noAuctionText: { marginLeft: 20, color: colors.grey, fontStyle: "italic" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalSubtitle: {
    fontSize: 14,
    color: colors.grey,
    textAlign: "center",
    marginBottom: 20,
  },
  codeInput: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
    fontSize: 24,
    textAlign: "center",
    marginBottom: 25,
    padding: 10,
    letterSpacing: 5,
  },
  modalButton: {
    backgroundColor: colors.primary,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  closeButton: { padding: 10 },
  closeButtonText: { color: colors.grey, fontWeight: "600" },
});

export default AuctionsScreen;
