import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../config/firebase"; // Ready for real data
import colors from "../constants/colors";

// --- DUMMY DATA FOR UI VISUALIZATION ---
const myListingsData = [
  {
    id: "101",
    name: "Honda City 1.5",
    price: "PKR 55,00,000",
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "102",
    name: "Toyota Yaris",
    price: "PKR 48,00,000",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1623962470690-48a3d205a2a1?auto=format&fit=crop&w=400&q=80",
  },
];

const myAuctionsData = [
  {
    id: "201",
    name: "Ford Mustang 1969",
    price: "Current Bid: 18 Lac",
    status: "Live Now",
    image:
      "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=400&q=80",
  },
];

const historyData = [
  {
    id: "301",
    name: "Suzuki Swift GLX",
    price: "Bought for: 41.5 Lac",
    status: "Completed",
    date: "12 May 2025",
    image:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80",
  },
];

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Listings"); // Tabs: Listings, Auctions, History

  // Get current user (or fallback for UI testing)
  const user = auth.currentUser || {
    displayName: "Muhammad Nabeel",
    email: "nabeel@example.com",
    phoneNumber: "+92 300 1234567",
    // We will fetch CNIC from Firestore later using the UID
    cnic: "35202-1234567-1",
  };

  // --- RENDER COMPONENT: PROFILE CARD ---
  const renderProfileHeader = () => (
    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {user.displayName ? user.displayName.charAt(0) : "U"}
        </Text>
      </View>
      <Text style={styles.userName}>{user.displayName || "User Name"}</Text>
      <Text style={styles.userEmail}>{user.email}</Text>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="call-outline" size={16} color={colors.grey} />
          <Text style={styles.detailText}>{user.phoneNumber || "N/A"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="card-outline" size={16} color={colors.grey} />
          <Text style={styles.detailText}>{user.cnic || "CNIC N/A"}</Text>
        </View>
      </View>
    </View>
  );

  // --- RENDER COMPONENT: LIST ITEM ---
  const renderCarItem = ({ item }) => {
    // Dynamic Status Color
    let statusColor = colors.primary;
    if (item.status === "Pending") statusColor = "#F39C12"; // Orange
    if (item.status === "Live Now") statusColor = "#E74C3C"; // Red
    if (item.status === "Completed") statusColor = "#27AE60"; // Green

    return (
      <View style={styles.itemCard}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.itemPrice}>{item.price}</Text>
          {item.date && <Text style={styles.itemDate}>Date: {item.date}</Text>}
        </View>
      </View>
    );
  };

  // --- CONTENT SWITCHER ---
  const getDataForTab = () => {
    switch (activeTab) {
      case "Listings":
        return myListingsData;
      case "Auctions":
        return myAuctionsData;
      case "History":
        return historyData;
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. User Info Card */}
        {renderProfileHeader()}

        {/* 2. Custom Tab Selector */}
        <View style={styles.tabContainer}>
          {["Listings", "Auctions", "History"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. The List Data */}
        <View style={styles.listContainer}>
          {getDataForTab().length > 0 ? (
            <FlatList
              data={getDataForTab()}
              renderItem={renderCarItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false} // Let parent ScrollView handle scrolling
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="folder-open-outline"
                size={40}
                color={colors.grey}
              />
              <Text style={styles.emptyText}>No records found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9F9F9" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.black },

  // Profile Card
  profileCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 32, color: "#fff", fontWeight: "bold" },
  userName: { fontSize: 22, fontWeight: "bold", color: colors.black },
  userEmail: { fontSize: 14, color: colors.grey, marginBottom: 15 },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 10,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  detailText: { fontSize: 14, color: colors.textLight, fontWeight: "500" },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 4,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#fff",
    elevation: 2,
  },
  tabText: { fontSize: 14, color: colors.grey, fontWeight: "600" },
  activeTabText: { color: colors.primary, fontWeight: "bold" },

  // List Items
  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    elevation: 1,
  },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemDetails: { flex: 1, marginLeft: 12, justifyContent: "center" },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: { fontSize: 16, fontWeight: "bold", color: colors.black },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: { fontSize: 10, color: "#fff", fontWeight: "bold" },
  itemPrice: { fontSize: 14, color: colors.grey, marginBottom: 2 },
  itemDate: { fontSize: 12, color: colors.grey, fontStyle: "italic" },

  emptyState: { alignItems: "center", marginTop: 40 },
  emptyText: { color: colors.grey, marginTop: 10 },
});

export default ProfileScreen;
