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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";

// --- DUMMY BID HISTORY DATA ---
const initialBids = [
  { id: "1", user: "Ali Khan", amount: "Rs. 18,10,000", time: "10:45 AM" },
  { id: "2", user: "Usman123", amount: "Rs. 18,05,000", time: "10:44 AM" },
  { id: "3", user: "CarDealer_LHR", amount: "Rs. 18,00,000", time: "10:42 AM" },
  { id: "4", user: "Saad Ahmed", amount: "Rs. 17,90,000", time: "10:40 AM" },
];

const LiveBiddingScreen = ({ route, navigation }) => {
  // Get car data and MODE (view/bid)
  const { item, mode } = route.params || {};

  // Default values if data is missing
  const currentCar = item || {
    name: "Unknown Car",
    model: "N/A",
    price: "Rs. 0",
    image: "https://via.placeholder.com/150",
    inspectionSheet: "https://via.placeholder.com/300x400",
  };

  // --- STATE ---
  const [currentBid, setCurrentBid] = useState(1800000);
  const [bidInput, setBidInput] = useState("");
  const [historyVisible, setHistoryVisible] = useState(false);
  const [bidHistory, setBidHistory] = useState(initialBids);
  const [timeLeft, setTimeLeft] = useState(9900);

  // --- TIMER LOGIC ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}:${
      s < 10 ? "0" + s : s
    }`;
  };

  // --- BIDDING LOGIC ---
  const placeBid = (amount) => {
    const numericAmount = parseInt(amount);
    if (!numericAmount || numericAmount <= currentBid) {
      Alert.alert(
        "Invalid Bid",
        "Your bid must be higher than the current ongoing bid."
      );
      return;
    }
    setCurrentBid(numericAmount);
    const newBid = {
      id: Math.random().toString(),
      user: "You",
      amount: `Rs. ${numericAmount.toLocaleString()}`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setBidHistory([newBid, ...bidHistory]);
    setBidInput("");
    Alert.alert("Success", "Bid Placed Successfully!");
  };

  const handleQuickAdd = (amountToAdd) => {
    const newAmount = currentBid + amountToAdd;
    setBidInput(newAmount.toString());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* --- HEADER --- */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Live Auction</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* --- CAR SUMMARY --- */}
          <View style={styles.carSummaryCard}>
            <Image source={{ uri: currentCar.image }} style={styles.carThumb} />
            <View style={styles.carInfo}>
              <Text style={styles.carLabel}>
                Car: <Text style={styles.carValue}>{currentCar.name}</Text>
              </Text>
              <Text style={styles.carLabel}>
                Model: <Text style={styles.carValue}>{currentCar.model}</Text>
              </Text>
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={16} color="#D32F2F" />
                <Text style={styles.timerText}>
                  Ends in: {formatTime(timeLeft)}
                </Text>
              </View>
            </View>
          </View>

          {/* --- INSPECTION SHEET (Uses dummy data now) --- */}
          <View style={styles.inspectionContainer}>
            <Image
              source={{ uri: currentCar.inspectionSheet }}
              style={styles.inspectionImage}
              resizeMode="contain"
            />

            <TouchableOpacity style={styles.fullSheetLink}>
              <Text style={styles.linkText}>View Full Inspection Sheet</Text>
              <Ionicons name="document-text" size={20} color={colors.black} />
            </TouchableOpacity>

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

          {/* --- LIVE BID DASHBOARD --- */}
          <View style={styles.bidDashboard}>
            <View style={styles.currentBidBar}>
              <View>
                <Text style={styles.bidLabel}>Ongoing Bid</Text>
                <Text style={styles.bidValue}>
                  Rs. {currentBid.toLocaleString()}
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

          {/* --- BID CONTROLS (CONDITIONAL RENDER) --- */}
          {/* ONLY show this section if mode is 'bid' */}
          {mode === "bid" && (
            <>
              <View style={styles.controlsContainer}>
                <Text style={styles.controlLabel}>Increase Price</Text>

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.bidInput}
                    placeholder="Enter Amount"
                    keyboardType="numeric"
                    value={bidInput}
                    onChangeText={setBidInput}
                  />
                  <TouchableOpacity
                    style={styles.plusButton}
                    onPress={() => placeBid(bidInput)}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
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
              </View>

              <TouchableOpacity
                style={styles.placeBidButton}
                onPress={() => placeBid(bidInput)}
              >
                <Text style={styles.placeBidText}>Place Bid</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === "view" && (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: colors.grey, fontStyle: "italic" }}>
                You are in View Only mode. Join the Auction to place bids.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- HISTORY MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyVisible}
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bid History</Text>
              <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={bidHistory}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View>
                    <Text style={styles.historyUser}>{item.user}</Text>
                    <Text style={styles.historyTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.historyAmount}>{item.amount}</Text>
                </View>
              )}
            />
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
    alignItems: "center",
    justifyContent: "space-between",
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
  carLabel: { fontSize: 14, color: colors.grey },
  carValue: { color: colors.black, fontWeight: "bold" },
  timerContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  timerText: {
    color: "#D32F2F",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 14,
  },
  inspectionContainer: { margin: 20, alignItems: "center" },
  inspectionImage: { width: "100%", height: 350, borderRadius: 10 }, // Increased height for document visibility
  fullSheetLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
  },
  linkText: { fontSize: 16, fontWeight: "bold", marginRight: 5 },
  legendContainer: { marginTop: 15, width: "100%" },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  legendItem: { fontSize: 14, color: colors.grey, width: "48%" },
  bold: { fontWeight: "bold", color: colors.black },
  bidDashboard: { marginHorizontal: 20 },
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
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
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
  inputRow: { flexDirection: "row", alignItems: "center" },
  bidInput: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginRight: 10,
  },
  plusButton: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
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
    margin: 20,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  historyUser: { fontWeight: "bold", fontSize: 16 },
  historyTime: { color: colors.grey, fontSize: 12 },
  historyAmount: { color: colors.primary, fontWeight: "bold", fontSize: 16 },
});

export default LiveBiddingScreen;
