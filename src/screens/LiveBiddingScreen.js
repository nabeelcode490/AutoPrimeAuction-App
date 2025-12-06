import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
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
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import colors from "../constants/colors";

// TODO: Ensure this matches your laptop IP
const BACKEND_URL = "http://192.168.1.23:3000";

const LiveBiddingScreen = ({ route, navigation }) => {
  const { item, mode } = route.params || {};
  const carId = item?.id || item?.carId;
  const initialPrice = item?.price
    ? String(item.price).replace(/[^0-9]/g, "")
    : "0";

  const [carData, setCarData] = useState(item || {});
  const [currentBid, setCurrentBid] = useState(Number(initialPrice));
  const [bidInput, setBidInput] = useState("");
  const [bidHistory, setBidHistory] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState("Waiting...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!carId) return;

    const unsubCar = onSnapshot(doc(db, "cars", carId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCarData(data);
        if (data.currentBid) setCurrentBid(Number(data.currentBid));
        else if (data.auctionParams?.basePrice)
          setCurrentBid(Number(data.auctionParams.basePrice));

        // Timer Logic
        if (data.auctionParams?.endTime) {
          const end = data.auctionParams.endTime.toDate
            ? data.auctionParams.endTime.toDate()
            : new Date(data.auctionParams.endTime);
          const now = new Date();
          const diff = Math.floor((end - now) / 1000);
          if (diff > 0) {
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            setTimeLeft(`${h}h ${m}m ${s}s`);
          } else {
            setTimeLeft("Auction Ended");
          }
        }
      }
    });

    const historyRef = collection(db, "cars", carId, "bidHistory");
    const q = query(historyRef, orderBy("timestamp", "desc"), limit(10));
    const unsubHistory = onSnapshot(q, (snapshot) => {
      const bids = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().timestamp?.toDate
          ? doc.data().timestamp.toDate().toLocaleTimeString()
          : "Just now",
      }));
      setBidHistory(bids);
    });

    return () => {
      unsubCar();
      unsubHistory();
    };
  }, [carId]);

  const handlePlaceBid = async (amount) => {
    if (!auth.currentUser) {
      Alert.alert("Access Denied", "Please log in.");
      return;
    }
    if (!amount) {
      Alert.alert("Error", "Enter amount.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/place-bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId,
          userId: auth.currentUser.uid,
          bidAmount: amount,
        }),
      });
      const result = await response.json();
      setLoading(false);
      if (result.success) {
        Alert.alert("Success", "Bid Placed!");
        setBidInput("");
      } else {
        Alert.alert("Bid Failed", result.message);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Connection failed.");
    }
  };

  const handleQuickAdd = (add) =>
    setBidInput((Number(currentBid) + add).toString());

  // Determine Image Source
  // Priority: 1. Database Image, 2. Passed Param, 3. Placeholder
  const sheetImage = carData?.inspectionSheetImage
    ? { uri: carData.inspectionSheetImage }
    : {
        uri: "https://via.placeholder.com/400x300.png?text=No+Inspection+Image",
      };

  const carImage =
    carData?.images && carData.images.length > 0
      ? { uri: carData.images[0] }
      : { uri: "https://via.placeholder.com/150" };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Live Auction</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Car Summary */}
          <View style={styles.carSummaryCard}>
            <Image source={carImage} style={styles.carThumb} />
            <View style={styles.carInfo}>
              <Text style={styles.carLabel}>
                {carData?.title || "Loading..."}
              </Text>
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={16} color="#D32F2F" />
                <Text style={styles.timerText}>{timeLeft}</Text>
              </View>
            </View>
          </View>

          {/* --- CENTER INSPECTION SHEET --- */}
          <View style={styles.inspectionContainer}>
            <Text style={styles.sectionTitle}>Inspection Report</Text>

            {/* The Image */}
            <TouchableOpacity
              onPress={() => setZoomVisible(true)}
              style={styles.imageWrapper}
            >
              <Image
                source={sheetImage}
                style={styles.inspectionImage}
                resizeMode="contain"
              />
              <View style={styles.zoomHint}>
                <Ionicons name="scan" size={16} color="#fff" />
                <Text style={styles.zoomText}>Tap to Zoom</Text>
              </View>
            </TouchableOpacity>

            {/* The PDF Link */}
            <TouchableOpacity
              style={styles.pdfLink}
              onPress={() =>
                carData.inspectionSheetPdf
                  ? Linking.openURL(carData.inspectionSheetPdf)
                  : Alert.alert("Info", "PDF not available")
              }
            >
              <Text style={styles.pdfText}>View Full Inspection Sheet</Text>
              <Ionicons name="document-text" size={20} color={colors.black} />
            </TouchableOpacity>

            {/* The Legend (Restored) */}
            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                <Text style={styles.legendItem}>
                  <Text style={styles.bold}>A1:</Text> Small Scratch
                </Text>
                <Text style={styles.legendItem}>
                  <Text style={styles.bold}>U1:</Text> Small Dent
                </Text>
              </View>
              <View style={styles.legendRow}>
                <Text style={styles.legendItem}>
                  <Text style={styles.bold}>A2:</Text> Scratch
                </Text>
                <Text style={styles.legendItem}>
                  <Text style={styles.bold}>P:</Text> Paint Marked
                </Text>
              </View>
            </View>
          </View>

          {/* Current Bid */}
          <View style={styles.bidDashboard}>
            <View style={styles.currentBidBar}>
              <View>
                <Text style={styles.bidLabel}>Ongoing Bid</Text>
                <Text style={styles.bidValue}>
                  Rs. {isNaN(currentBid) ? "0" : currentBid.toLocaleString()}
                </Text>
              </View>
              <View style={styles.clockCircle}>
                <Ionicons name="stopwatch" size={24} color={colors.primary} />
              </View>
            </View>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => setHistoryVisible(true)}
            >
              <Text style={styles.historyButtonText}>
                View Bid History ({bidHistory.length})
              </Text>
              <Ionicons name="chevron-up" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Controls */}
          {mode === "bid" ? (
            <View style={styles.controlsContainer}>
              <Text style={styles.controlLabel}>Increase Price</Text>
              <View style={styles.inputRow}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", marginRight: 5 }}
                >
                  Rs.
                </Text>
                <TextInput
                  style={styles.bidInput}
                  placeholder="Enter Amount"
                  keyboardType="numeric"
                  value={bidInput}
                  onChangeText={setBidInput}
                />
              </View>
              <View style={styles.quickChipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => handleQuickAdd(10000)}
                >
                  <Text style={styles.chipText}>+10k</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => handleQuickAdd(25000)}
                >
                  <Text style={styles.chipText}>+25k</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => handleQuickAdd(50000)}
                >
                  <Text style={styles.chipText}>+50k</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.placeBidButton,
                  loading && { backgroundColor: colors.grey },
                ]}
                onPress={() => handlePlaceBid(bidInput)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.placeBidText}>Place Bid</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <Text
              style={{ textAlign: "center", padding: 20, color: colors.grey }}
            >
              You are in View Only mode.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODALS */}
      <Modal
        visible={historyVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bid History</Text>
            <FlatList
              data={bidHistory}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <Text style={styles.historyUser}>
                    {item.userId ? item.userId.slice(0, 5) : "User"}...
                  </Text>
                  <Text style={styles.historyTime}>{item.time}</Text>
                  <Text style={styles.historyAmount}>
                    Rs. {item.amount.toLocaleString()}
                  </Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setHistoryVisible(false)}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={zoomVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "black",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            style={styles.closeZoom}
            onPress={() => setZoomVisible(false)}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
          <Image
            source={sheetImage}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
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
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.black },
  carSummaryCard: {
    flexDirection: "row",
    padding: 15,
    marginHorizontal: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  carThumb: { width: 80, height: 60, borderRadius: 8, marginRight: 15 },
  carInfo: { flex: 1 },
  carLabel: { fontSize: 16, fontWeight: "bold", color: colors.black },
  timerContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  timerText: {
    color: "#D32F2F",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 14,
  },

  // INSPECTION STYLES (CENTERED)
  inspectionContainer: { margin: 20, alignItems: "center" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.black,
    alignSelf: "flex-start",
  }, // Align title left
  imageWrapper: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#eee",
  },
  inspectionImage: { width: "100%", height: "100%" },
  zoomHint: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    padding: 5,
    borderRadius: 5,
  },
  zoomText: { color: "#fff", fontSize: 12, marginLeft: 5 },

  pdfLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    paddingBottom: 2,
  },
  pdfText: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
    color: colors.black,
  },

  // LEGEND STYLES
  legendContainer: { marginTop: 15, width: "100%" },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  legendItem: { fontSize: 14, color: colors.grey, width: "48%" },
  bold: { fontWeight: "bold", color: colors.black },

  bidDashboard: { marginHorizontal: 20, marginTop: 10 },
  currentBidBar: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bidLabel: { color: "#BDC3C7", fontSize: 14 },
  bidValue: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 5 },
  clockCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  historyButton: {
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  historyButtonText: {
    color: colors.primary,
    fontWeight: "600",
    marginRight: 5,
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: "#EAF4F8",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
  },
  controlLabel: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  bidInput: { flex: 1, paddingVertical: 15, fontSize: 18, fontWeight: "bold" },
  quickChipsRow: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
  },
  chip: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  chipText: { color: colors.primary, fontWeight: "bold" },
  placeBidButton: {
    backgroundColor: colors.primary,
    marginTop: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  placeBidText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "50%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  historyUser: { fontWeight: "bold", fontSize: 14 },
  historyTime: { color: colors.grey, fontSize: 12 },
  historyAmount: { color: colors.primary, fontWeight: "bold" },
  closeButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  closeZoom: { position: "absolute", top: 40, right: 20, zIndex: 10 },
});

export default LiveBiddingScreen;
