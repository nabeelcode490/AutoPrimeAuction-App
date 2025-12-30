import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
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
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../config/firebase";
import colors from "../constants/colors";

const AuctionsScreen = ({ navigation }) => {
  // --- STATE ---
  const [user, setUser] = useState(null);

  // Data State
  const [activeEvent, setActiveEvent] = useState(null); // The Event currently happening
  const [upcomingEvents, setUpcomingEvents] = useState([]); // Future Events
  const [liveCars, setLiveCars] = useState([]); // Cars inside the Active Event
  const [loading, setLoading] = useState(true);

  // Menu State
  const [menuVisible, setMenuVisible] = useState(false);

  // --- 1. AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // --- 2. EVENTS LISTENER (The Brain) ---
  useEffect(() => {
    // Listen to ALL events
    const q = query(
      collection(db, "auction_events"),
      orderBy("startTime", "asc")
    );

    const unsubscribeEvents = onSnapshot(
      q,
      (snapshot) => {
        const allEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const now = new Date();
        let foundActive = null;
        let future = [];

        allEvents.forEach((event) => {
          // Safe conversion of Firestore Timestamp to JS Date
          const start = event.startTime?.toDate
            ? event.startTime.toDate()
            : new Date(event.startTime);
          const end = event.endTime?.toDate
            ? event.endTime.toDate()
            : new Date(event.endTime);

          // LOGIC: Is it Live? (Start Time passed, End Time not passed) OR manually set to 'active'
          const isLiveTime = now >= start && now <= end;

          if (event.status === "active" || isLiveTime) {
            // If we haven't found an active event yet, take this one
            if (!foundActive) foundActive = event;
          } else if (now < start || event.status === "upcoming") {
            future.push({ ...event, startObj: start }); // Keep startObj for formatting
          }
        });

        setActiveEvent(foundActive);
        setUpcomingEvents(future);

        // If no active event, stop loading here (because the 2nd useEffect won't run)
        if (!foundActive) setLoading(false);
      },
      (err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      }
    );

    return () => unsubscribeEvents();
  }, []);

  // --- 3. CARS LISTENER (Dependent on Active Event) ---
  useEffect(() => {
    if (!activeEvent) {
      setLiveCars([]);
      return;
    }

    // Fetch cars ONLY for the active event, ordered by queue_index (1st, 2nd, 3rd...)
    const q = query(
      collection(db, "cars"),
      where("eventId", "==", activeEvent.id),
      where("status", "==", "approved") // Only approved cars show up
    );

    const unsubscribeCars = onSnapshot(
      q,
      (snapshot) => {
        const cars = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort in JS to be safe (ensure queue_index 1 is first)
        cars.sort((a, b) => (a.queue_index || 99) - (b.queue_index || 99));

        setLiveCars(cars);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching live cars:", err);
        setLoading(false);
      }
    );

    return () => unsubscribeCars();
  }, [activeEvent]);

  // --- HANDLERS ---
  const handleJoinAuction = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to join the auction.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }
    // Navigate to Live Bidding with the first car in the list
    if (liveCars.length > 0) {
      navigation.navigate("LiveBidding", {
        item: { id: liveCars[0].id }, // Pass the ID for fetching full details there
        mode: "bid",
      });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setMenuVisible(false);
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  // --- RENDER HELPERS ---

  // 1. FORMAT DATE Helper
  const formatEventDate = (dateObj) => {
    if (!dateObj) return "Coming Soon";
    // Returns format like "June 20, 3:00 PM"
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // 2. UP NEXT Item (Horizontal List)
  const renderUpNextItem = ({ item }) => (
    <View style={styles.upNextCard}>
      <View style={styles.nextBadge}>
        <Text style={styles.nextBadgeText}>Next</Text>
      </View>
      <Image
        source={{
          uri:
            item.images && item.images.length > 0
              ? item.images[0]
              : "https://via.placeholder.com/150",
        }}
        style={styles.upNextImage}
      />
      <View style={styles.upNextContent}>
        <Text style={styles.upNextTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.upNextSubtitle}>
          Est:{" "}
          {item.price ? `PKR ${parseInt(item.price).toLocaleString()}` : "N/A"}
        </Text>
      </View>
    </View>
  );

  // 3. SCHEDULE Item (Vertical List - The UI you wanted restored)
  const renderScheduleItem = (event) => (
    <View key={event.id} style={styles.scheduleCard}>
      <Image
        source={{ uri: event.image || "https://via.placeholder.com/400" }}
        style={styles.scheduleImage}
      />
      <View style={styles.scheduleContent}>
        <Text style={styles.scheduleTitle}>{event.title}</Text>
        <Text style={styles.scheduleDate}>
          Start: {formatEventDate(event.startObj)}
        </Text>
        <Text style={styles.scheduleCount}>{event.carCount} Cars Listed</Text>
        <TouchableOpacity
          style={styles.remindButton}
          onPress={() =>
            Alert.alert("Reminder", "Calendar integration coming soon!")
          }
        >
          <Text style={styles.remindButtonText}>Remind me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const MenuItem = ({ icon, label, onPress, isBold }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={24}
        color={colors.primary}
        style={{ marginRight: 15 }}
      />
      <Text style={[styles.menuText, isBold && styles.menuTextBold]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu-outline" size={30} color={colors.black} />
          </TouchableOpacity>
          <Image
            source={require("../assets/apaHeaderLogo.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          {user ? (
            <TouchableOpacity>
              <Ionicons
                name="notifications-outline"
                size={28}
                color={colors.primary}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInHeaderButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.signInHeaderText}>Sign In</Text>
              <Ionicons
                name="log-in-outline"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 50 }}
          />
        ) : (
          <>
            {/* ================= SECTION 1: LIVE NOW ================= */}
            <View style={[styles.sectionHeader, { marginTop: 10 }]}>
              {activeEvent && <View style={styles.pulsingDot} />}
              <Text style={styles.sectionTitle}>
                {activeEvent ? "Live Now" : "No Live Auctions"}
              </Text>
            </View>
            <Text style={styles.locationSubText}>
              {activeEvent
                ? `Event: ${activeEvent.title}`
                : "Check the schedule below"}
            </Text>

            {/* LIVE CARD (Shows only if we have an active event AND cars in it) */}
            {activeEvent && liveCars.length > 0 ? (
              <View style={styles.liveCard}>
                <Image
                  source={{
                    uri:
                      liveCars[0].images && liveCars[0].images.length > 0
                        ? liveCars[0].images[0]
                        : "https://via.placeholder.com/400",
                  }}
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
                    <View style={{ flex: 1 }}>
                      <Text style={styles.liveCarName} numberOfLines={1}>
                        {liveCars[0].title}
                      </Text>
                      <Text style={styles.liveCarModel}>
                        {liveCars[0].year} | {liveCars[0].brand}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.currentBidLabel}>Current Bid</Text>
                      <Text style={styles.currentBidValue}>
                        {liveCars[0].currentBid
                          ? liveCars[0].currentBid.toLocaleString()
                          : liveCars[0].auctionParams?.basePrice?.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.outlineButton}
                      onPress={() =>
                        navigation.navigate("LiveBidding", {
                          item: { id: liveCars[0].id },
                          mode: "view",
                        })
                      }
                    >
                      <Text style={styles.outlineButtonText}>View Only</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.fillButton}
                      onPress={handleJoinAuction}
                    >
                      <Text style={styles.fillButtonText}>Join Auction</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              // EMPTY STATE (Polite Message)
              <View style={styles.emptyStateContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={50}
                  color={colors.grey}
                />
                <Text style={styles.emptyStateText}>
                  Nothing on stage right now.
                </Text>
                <Text style={styles.emptyStateSubText}>
                  Browse the scheduled events below.
                </Text>
              </View>
            )}

            {/* ================= SECTION 2: UP NEXT (Inside the Live Event) ================= */}
            {activeEvent && liveCars.length > 1 && (
              <>
                <View style={[styles.sectionHeader, { marginTop: 25 }]}>
                  <Text style={styles.sectionTitle}>Up Next in Queue</Text>
                </View>
                <Text style={styles.locationSubText}>Coming to stage soon</Text>

                <FlatList
                  data={liveCars.slice(1)} // Skip the first one (it's on stage)
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderUpNextItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 10,
                  }}
                />
              </>
            )}

            {/* ================= SECTION 3: AUCTION SCHEDULE (Upcoming Events) ================= */}
            <View style={[styles.sectionHeader, { marginTop: 25 }]}>
              <Text style={styles.sectionTitle}>Auction Schedule</Text>
            </View>
            <Text style={styles.locationSubText}>Upcoming Events</Text>

            <View style={styles.scheduleList}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => renderScheduleItem(event))
              ) : (
                <Text
                  style={{
                    marginLeft: 20,
                    color: colors.grey,
                    fontStyle: "italic",
                    marginBottom: 20,
                  }}
                >
                  No upcoming events scheduled yet.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* --- SIDE MENU (Unchanged Logic, just ensuring it's here) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.menuDrawer}
            onPress={() => {}}
          >
            <View style={styles.menuHeader}>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={30} color={colors.black} />
              </TouchableOpacity>
              <Text style={styles.menuTitle}>Menu</Text>
            </View>
            <ScrollView style={styles.menuItemsContainer}>
              <MenuItem
                icon="home-outline"
                label="Home"
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Home");
                }}
                isBold
              />
              <MenuItem
                icon="gavel-outline"
                label="Auctions"
                onPress={() => setMenuVisible(false)}
                isBold
              />
              <MenuItem
                icon="list-outline"
                label="Listings"
                onPress={() => setMenuVisible(false)}
                isBold
              />
              <MenuItem
                icon="person-outline"
                label="Profile"
                onPress={() => {
                  if (user) {
                    setMenuVisible(false);
                    navigation.navigate("Profile");
                  } else {
                    Alert.alert("Login Required", "Please login.");
                  }
                }}
                isBold
              />
              <TouchableOpacity
                style={styles.registerAuctionButton}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("AuctionRegistration");
                }}
              >
                <Text style={styles.sellCarText}>Register for Auction</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sellCarButton}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("SellCar");
                }}
              >
                <Ionicons name="car-sport" size={22} color="#fff" />
                <Text style={styles.sellCarText}>Sell Your Car</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
            <View style={styles.menuBottomContainer}>
              <MenuItem
                icon="thumbs-up-outline"
                label="Feedback"
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Feedback");
                }}
              />
              <MenuItem
                icon="mail-outline"
                label="Contact Us"
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("ContactUs");
                }}
              />
              {user && (
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={24}
                    color="#D32F2F"
                    style={{ marginRight: 15 }}
                  />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
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
  signInHeaderButton: { flexDirection: "row", alignItems: "center", gap: 5 },
  signInHeaderText: { color: colors.primary, fontWeight: "bold", fontSize: 16 },
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

  // Live Card
  liveCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
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
    backgroundColor: "#E74C3C",
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

  // Up Next Card
  upNextCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
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
    height: 100,
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

  // SCHEDULE CARD STYLES (Restored)
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

  // Empty State
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#f9f9f9",
    margin: 20,
    borderRadius: 10,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.grey,
    marginTop: 10,
  },
  emptyStateSubText: { fontSize: 14, color: colors.grey },

  // Menu Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
  },
  menuDrawer: {
    width: "75%",
    backgroundColor: "#F0F8FF",
    height: "100%",
    padding: 25,
    paddingTop: 50,
  },
  menuHeader: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  menuTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginLeft: 15,
  },
  menuItemsContainer: { marginTop: 10, flex: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  menuText: { fontSize: 18, color: colors.primary, fontWeight: "500" },
  menuTextBold: { fontWeight: "bold" },
  registerAuctionButton: {
    marginTop: 15,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 5,
  },
  sellCarButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 5,
  },
  sellCarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  menuBottomContainer: {
    borderTopWidth: 1,
    borderTopColor: "#BDC3C7",
    paddingTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 10,
  },
  logoutText: { fontSize: 18, color: "#D32F2F", fontWeight: "bold" },
});

export default AuctionsScreen;
