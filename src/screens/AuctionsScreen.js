import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { auth, db } from "../config/firebase";
import colors from "../constants/colors";
// Import data
import { liveAuctions, scheduledAuctions } from "../data/carData";

const { width } = Dimensions.get("window");

// TODO: REPLACE WITH YOUR TEST CAR ID
const MY_TEST_CAR_ID = "x6gH4LVO9jzEvc3PddwI";

const AuctionsScreen = ({ navigation }) => {
  // 1. Separate the "On Stage" car from the "Up Next" cars
  const currentLiveCar = liveAuctions[0];
  const upNextCars = liveAuctions.slice(1); // All cars except the first one

  const [modalVisible, setModalVisible] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userAccessCode, setUserAccessCode] = useState(null);

  // --- JOIN LOGIC (UNCHANGED) ---
  const handleJoinAuction = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Login Required", "Please login to join the auction.");
      return;
    }
    setLoading(true);
    try {
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
            "Pending",
            "Your registration is under review. Please wait for approval."
          );
        } else if (requestData.status === "approved") {
          setUserAccessCode(requestData.accessCode);
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
      Alert.alert("Error", "Could not verify status.");
    }
  };

  const verifyCode = () => {
    if (accessCodeInput === userAccessCode) {
      setModalVisible(false);
      setAccessCodeInput("");
      navigation.navigate("LiveBidding", {
        item: { id: MY_TEST_CAR_ID },
        mode: "bid",
      });
    } else {
      Alert.alert("Access Denied", "Incorrect Access Code.");
    }
  };

  // --- RENDER HELPERS ---

  // 1. Up Next Card (Small horizontal cards)
  const renderUpNextItem = ({ item }) => (
    <View style={styles.upNextCard}>
      <View style={styles.nextBadge}>
        <Text style={styles.nextBadgeText}>Next</Text>
      </View>
      <Image source={{ uri: item.image }} style={styles.upNextImage} />
      <View style={styles.upNextContent}>
        <Text style={styles.upNextTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.upNextSubtitle}>Est: {item.price}</Text>
      </View>
    </View>
  );

  // 2. Schedule Card (Wide vertical cards)
  const renderScheduleItem = (item) => (
    <View key={item.id} style={styles.scheduleCard}>
      <Image source={{ uri: item.image }} style={styles.scheduleImage} />
      <View style={styles.scheduleContent}>
        <Text style={styles.scheduleTitle}>{item.title}</Text>
        <Text style={styles.scheduleDate}>Start: {item.date}</Text>
        <Text style={styles.scheduleCount}>{item.carCount} Cars Listed</Text>
        <TouchableOpacity style={styles.remindButton}>
          <Text style={styles.remindButtonText}>Remind me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
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

        {/* --- SEARCH BAR (Optional, mimicking your screenshot) --- */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={{ marginRight: 8 }}
          />
          <TextInput placeholder="Search for your car..." style={{ flex: 1 }} />
          <Ionicons name="options-outline" size={24} color={colors.primary} />
        </View>

        {/* --- SECTION 1: LIVE NOW --- */}
        <View style={styles.sectionHeader}>
          <View style={styles.pulsingDot} />
          <Text style={styles.sectionTitle}>Live Now</Text>
        </View>
        <Text style={styles.locationSubText}>Happening in Lahore Center</Text>

        {/* BIG LIVE CARD */}
        <View style={styles.liveCard}>
          <Image
            source={{ uri: currentLiveCar.image }}
            style={styles.liveImage}
          />

          <View style={styles.liveBadge}>
            <Ionicons
              name="radio-outline"
              size={16}
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>

          <View style={styles.liveContent}>
            <View style={styles.liveRow}>
              <View>
                <Text style={styles.liveCarName}>{currentLiveCar.name}</Text>
                <Text style={styles.liveCarModel}>{currentLiveCar.model}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.currentBidLabel}>Current Bid</Text>
                <Text style={styles.currentBidValue}>
                  {currentLiveCar.currentBid}
                </Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() =>
                  navigation.navigate("LiveBidding", {
                    item: { id: MY_TEST_CAR_ID },
                    mode: "view",
                  })
                }
              >
                <Text style={styles.outlineButtonText}>View Only</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.fillButton}
                onPress={handleJoinAuction}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.fillButtonText}>Join Auction</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- SECTION 2: UP NEXT --- */}
        <View style={[styles.sectionHeader, { marginTop: 25 }]}>
          <Text style={styles.sectionTitle}>Up Next</Text>
        </View>
        <Text style={styles.locationSubText}>Coming to stage soon</Text>

        <FlatList
          data={upNextCars}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderUpNextItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
        />

        {/* --- SECTION 3: AUCTION SCHEDULE --- */}
        <View style={[styles.sectionHeader, { marginTop: 25 }]}>
          <Text style={styles.sectionTitle}>Auction Schedule</Text>
        </View>
        <Text style={styles.locationSubText}>Upcoming Events</Text>

        <View style={styles.scheduleList}>
          {scheduledAuctions.map((item) => renderScheduleItem(item))}
        </View>
      </ScrollView>

      {/* ACCESS CODE MODAL (UNCHANGED) */}
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
              Enter the code provided by Admin.
            </Text>
            <TextInput
              style={styles.codeInput}
              placeholder="e.g. 1234"
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

  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  // Titles
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: colors.black },
  locationSubText: {
    fontSize: 13,
    color: colors.grey,
    marginLeft: 20,
    marginBottom: 10,
  },

  // --- LIVE CARD STYLES ---
  liveCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    // Heavy Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 5,
  },
  liveImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  liveBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#E74C3C", // Red
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  liveBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  liveContent: { padding: 15 },
  liveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  liveCarName: { fontSize: 18, fontWeight: "bold", color: colors.black },
  liveCarModel: { fontSize: 14, color: colors.grey },
  currentBidLabel: { fontSize: 12, color: colors.grey },
  currentBidValue: { fontSize: 18, fontWeight: "bold", color: colors.primary },

  buttonRow: { flexDirection: "row", gap: 10 },
  outlineButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineButtonText: { color: colors.primary, fontWeight: "bold" },
  fillButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  fillButtonText: { color: "#fff", fontWeight: "bold" },

  // --- UP NEXT CARD STYLES ---
  upNextCard: {
    width: 140,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10, // room for shadow
  },
  nextBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nextBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  upNextImage: {
    width: "100%",
    height: 90,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  upNextContent: { padding: 10 },
  upNextTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 2,
  },
  upNextSubtitle: { fontSize: 12, color: colors.grey },

  // --- SCHEDULE CARD STYLES ---
  scheduleList: { paddingHorizontal: 20 },
  scheduleCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: "hidden",
  },
  scheduleImage: { width: "100%", height: 140 },
  scheduleContent: { padding: 15 },
  scheduleTitle: { fontSize: 18, fontWeight: "bold", color: colors.black },
  scheduleDate: { fontSize: 14, color: colors.grey, marginVertical: 4 },
  scheduleCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
  },
  remindButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  remindButtonText: { color: "#fff", fontWeight: "bold" },

  // --- MODAL STYLES (Existing) ---
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
  modalSubtitle: { fontSize: 14, color: colors.grey, marginBottom: 20 },
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
