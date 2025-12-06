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

// TODO: REPLACE WITH YOUR TEST CAR ID (THE ONE YOU SEEDED)
const MY_TEST_CAR_ID = "x6gH4LVO9jzEvc3PddwI";

const AuctionsScreen = ({ navigation }) => {
  const currentLiveCar = liveAuctions[0];

  const [modalVisible, setModalVisible] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userAccessCode, setUserAccessCode] = useState(null); // Store the user's correct code

  // --- JOIN LOGIC ---
  const handleJoinAuction = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login Required", "Please login to join the auction.");
      return;
    }

    setLoading(true);

    try {
      // 1. Check if user has a request
      const q = query(
        collection(db, "auction_requests"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No request found -> Send to Registration
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
          // User is approved! Save their code and show modal.
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
    // Check if input matches the code from Firestore
    if (accessCodeInput === userAccessCode) {
      setModalVisible(false);
      setAccessCodeInput("");

      // Navigate to the Live Car (using your seeded ID)
      navigation.navigate("LiveBidding", {
        item: { id: MY_TEST_CAR_ID },
        mode: "bid",
      });
    } else {
      Alert.alert("Access Denied", "Incorrect Access Code.");
    }
  };

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
          </TouchableOpacity>
        </View>

        {/* LIVE NOW SECTION */}
        <View style={styles.sectionHeader}>
          <View style={styles.liveIndicatorRow}>
            <View style={styles.pulsingDot} />
            <Text style={styles.sectionTitle}>Live Now</Text>
          </View>
        </View>

        {/* DUMMY UI FOR DEMO (Clicking Join triggers logic) */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: currentLiveCar.image }}
            style={styles.heroImage}
          />
          <View style={styles.heroDetails}>
            <Text style={styles.heroTitle}>{currentLiveCar.name}</Text>
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

        {/* OTHER LISTS ... (Keep your existing FlatLists here) */}
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
    padding: 20,
  },
  headerLogo: { width: 80, height: 40 },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 10 },
  liveIndicatorRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  heroContainer: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 5,
  },
  heroImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  heroDetails: { padding: 15 },
  heroTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  buttonRow: { flexDirection: "row", gap: 10 },
  outlineButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineButtonText: { color: colors.primary, fontWeight: "bold" },
  fillButton: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  fillButtonText: { color: "#fff", fontWeight: "bold" },
  // Modal Styles
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
