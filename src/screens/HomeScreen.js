import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged, signOut } from "firebase/auth"; // Import auth methods
import { useEffect, useState } from "react";
import {
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
import { auth } from "../config/firebase"; // Import auth instance
import colors from "../constants/colors";
import { forSaleCars } from "../data/carData";

const { width, height } = Dimensions.get("window");

// --- DUMMY NEWS DATA ---
const newsData = [
  {
    id: "1",
    title: "PAPS 2025 Event Recap: Pakistan’s Auto Industry Goes Electric",
    date: "Nov 18, 2025",
    image:
      "https://images.unsplash.com/photo-1569836576017-c9935922d24a?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "2",
    title: "Deepal Flexes EV Power with K50 and E07 Reveals",
    date: "Nov 14, 2025",
    image:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "3",
    title: "Deepal E07 Price Out! Pakistan Gets Its First E-Transformer",
    date: "Nov 14, 2025",
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=300&q=80",
  },
];

const HomeScreen = ({ navigation }) => {
  const [visibleCarsCount, setVisibleCarsCount] = useState(6);

  // --- MENU & FILTER STATE ---
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [locationInput, setLocationInput] = useState("");

  // --- USER AUTH STATE ---
  const [user, setUser] = useState(null);

  // Check Login Status on Load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe; // Cleanup listener
  }, []);

  const [displayedCars, setDisplayedCars] = useState(forSaleCars);

  // --- FILTER LOGIC ---
  const applyFilters = () => {
    let filtered = forSaleCars;
    if (selectedTab !== "All")
      filtered = filtered.filter((car) => car.condition === selectedTab);
    if (selectedBrand !== "All")
      filtered = filtered.filter((car) => car.brand === selectedBrand);
    if (locationInput.trim() !== "") {
      filtered = filtered.filter(
        (car) =>
          car.location &&
          car.location.toLowerCase().includes(locationInput.toLowerCase())
      );
    }
    setDisplayedCars(filtered);
    setModalVisible(false);
  };

  const handleSeeMore = () => {
    setVisibleCarsCount((prev) => prev + 2);
  };

  // --- HANDLER: Inspection Request ---
  const handleInspectionRequest = () => {
    setMenuVisible(false);
    // Placeholder for backend
    Alert.alert(
      "Thank You!",
      "Our team will contact you soon to confirm your car's inspection and will link you to our representative."
    );
  };

  // --- HANDLER: Logout ---
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            setMenuVisible(false);
            // Reset to Welcome Screen to prevent back navigation
            navigation.reset({
              index: 0,
              routes: [{ name: "Welcome" }],
            });
          } catch (error) {
            console.error("Logout Error:", error);
          }
        },
      },
    ]);
  };

  // --- RENDER HELPERS ---
  const featuredCars = displayedCars.filter((car) => car.isFeatured);
  const regularCars = displayedCars.filter((car) => !car.isFeatured);

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => navigation.navigate("CarDetails", { item })}
    >
      <View style={styles.ribbonContainer}>
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>Featured</Text>
        </View>
      </View>
      <Image source={{ uri: item.image }} style={styles.featuredImage} />
      <View style={styles.featuredDetails}>
        <Text style={styles.featuredTitle}>{item.name}</Text>
        <Text style={styles.featuredModel}>{item.model}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => navigation.navigate("CarDetails", { item })}
    >
      <View style={styles.heartIconContainer}>
        <Ionicons name="heart-outline" size={20} color={colors.black} />
      </View>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <View style={styles.gridDetails}>
        <Text style={styles.gridTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.gridPrice}>{item.price}</Text>
        <Text style={styles.gridLocation}>
          📍 {item.location} • {item.condition}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderNewsItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.newsItem}>
      <Image source={{ uri: item.image }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={3}>
          {item.title}
        </Text>
        <Text style={styles.newsDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  // --- MENU ITEM COMPONENT ---
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
      <ScrollView showsVerticalScrollIndicator={false}>
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

          {/* --- RIGHT SIDE HEADER LOGIC --- */}
          {user ? (
            <TouchableOpacity>
              <Ionicons
                name="notifications-outline"
                size={28}
                color={colors.primary}
              />
            </TouchableOpacity>
          ) : (
            // GUEST MODE: Show "Sign In"
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
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="options-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* AUCTIONS BANNER */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Auctions</Text>
          <Text style={styles.sectionSubtitle}>View ongoing auctions.</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Auctions")}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
              }}
              style={styles.auctionBanner}
            />
            <View style={styles.gavelOverlay}>
              <Text style={styles.gavelText}>🔨 Live Bidding</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* LISTINGS */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Listings</Text>
          <Text style={styles.sectionSubtitle}>Browse cars for buying.</Text>
        </View>

        <FlatList
          horizontal
          data={featuredCars}
          renderItem={renderFeaturedItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          snapToInterval={width * 0.9}
          decelerationRate="fast"
        />

        <View style={styles.gridContainer}>
          {regularCars.length > 0 ? (
            regularCars.slice(0, visibleCarsCount).map((item) => (
              <View key={item.id} style={styles.gridWrapper}>
                {renderGridItem({ item })}
              </View>
            ))
          ) : (
            <Text style={{ marginLeft: 10, color: colors.grey }}>
              No cars match your filter.
            </Text>
          )}
        </View>

        {visibleCarsCount < regularCars.length && (
          <TouchableOpacity
            style={styles.seeMoreButton}
            onPress={handleSeeMore}
          >
            <Text style={styles.seeMoreText}>See More</Text>
            <Ionicons name="chevron-down" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* NEWS SECTION */}
        <View style={styles.newsSection}>
          <View style={styles.newsHeader}>
            <Text style={styles.sectionTitle}>Latest News</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {newsData.map((item) => renderNewsItem(item))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerTitle}>Auto Prime Auction</Text>
            <Text style={styles.footerTagline}>
              Fair Price. Real Time. Trusted.
            </Text>
            <Text style={styles.copyright}>
              © 2025 Auto Prime Auction. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* --- SIDE MENU MODAL --- */}
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
            {/* Close/Header Icon */}
            <View style={styles.menuHeader}>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={30} color={colors.black} />
              </TouchableOpacity>
              <Text style={styles.menuTitle}>Menu</Text>
            </View>

            <View style={styles.menuItemsContainer}>
              <MenuItem
                icon="home-outline"
                label="Home"
                onPress={() => {
                  setMenuVisible(false);
                }}
                isBold
              />
              <MenuItem
                icon="gavel-outline"
                label="Auctions"
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Auctions");
                }}
                isBold
              />
              <MenuItem
                icon="list-outline"
                label="Listings"
                onPress={() => {
                  setMenuVisible(false);
                }}
                isBold
              />
              <MenuItem
                icon="add-circle-outline"
                label="Post Ad"
                onPress={() => {
                  setMenuVisible(false);
                }}
                isBold
              />
              <MenuItem
                icon="person-outline"
                label="Profile"
                onPress={() => {
                  if (user) {
                    // Logic: User is Logged In -> Go to Profile
                    setMenuVisible(false);
                    navigation.navigate("Profile");
                  } else {
                    // Logic: User is Guest -> Prompt to Login
                    Alert.alert(
                      "Login Required",
                      "Please login to view your profile and manage your listings.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Login",
                          onPress: () => {
                            setMenuVisible(false);
                            navigation.navigate("Login");
                          },
                        },
                      ]
                    );
                  }
                }}
                isBold
              />

              <MenuItem
                icon="checkbox-outline"
                label="Get Your Car Inspected"
                onPress={handleInspectionRequest}
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
            </View>

            <View style={styles.menuBottomContainer}>
              <MenuItem
                icon="thumbs-up-outline"
                label="Feedback"
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Feedback"); // <--- Linked
                }}
              />
              <MenuItem
                icon="mail-outline"
                label="Contact Us"
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("ContactUs"); // <--- Linked
                }}
              />

              {/* --- LOGOUT BUTTON (Only if User is Logged In) --- */}
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

      {/* --- FILTER POPUP MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.tabContainer}>
              {["All", "New", "Used"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabButton,
                    selectedTab === tab && styles.activeTabButton,
                  ]}
                  onPress={() => setSelectedTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      selectedTab === tab && styles.activeTabText,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() =>
                  setSelectedBrand(selectedBrand === "All" ? "Toyota" : "All")
                }
              >
                <Text style={styles.dropdownText}>
                  {selectedBrand === "All" ? "Brand" : selectedBrand}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.grey} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>Model</Text>
                <Ionicons name="chevron-down" size={20} color={colors.grey} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.black}
                style={{ marginRight: 10 }}
              />
              <TextInput
                placeholder="Location (e.g. Lahore)"
                value={locationInput}
                onChangeText={setLocationInput}
                style={{ flex: 1 }}
              />
            </View>
            <Text style={styles.label}>Price Range</Text>
            <Text style={styles.priceLabel}>Rs. 0 - Rs. 3,00,00,000</Text>
            <View style={styles.sliderBar}>
              <View style={styles.sliderActiveBar} />
              <View style={[styles.thumb, { left: 0 }]} />
              <View style={[styles.thumb, { right: 0 }]} />
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={applyFilters}>
              <Text style={styles.modalButtonText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.black} />
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

  // --- SIGN IN HEADER STYLES ---
  signInHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
  },
  signInHeaderText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },

  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginRight: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: colors.text },
  filterButton: { padding: 10 },

  sectionContainer: { paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: colors.black },
  sectionSubtitle: { fontSize: 14, color: colors.grey, marginBottom: 10 },

  auctionBanner: { width: "100%", height: 150, borderRadius: 15 },
  gavelOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 8,
    borderRadius: 5,
  },
  gavelText: { color: "#fff", fontWeight: "bold" },

  carouselContent: { paddingLeft: 20, paddingRight: 20, marginBottom: 20 },
  featuredCard: {
    width: width * 0.85,
    marginRight: 15,
    borderRadius: 15,
    overflow: "hidden",
  },
  featuredImage: { width: "100%", height: 180, borderRadius: 15 },
  featuredDetails: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  featuredTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  featuredModel: { color: "#fff", fontSize: 14 },

  ribbonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
    width: 100,
    height: 100,
    zIndex: 10,
  },
  ribbon: {
    backgroundColor: colors.primary,
    transform: [{ rotate: "-45deg" }, { translateX: -30 }, { translateY: -5 }],
    paddingVertical: 5,
    width: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  ribbonText: { color: "#fff", fontWeight: "bold", fontSize: 12 },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
  },
  gridWrapper: { width: "50%", padding: 5 },
  gridCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 5,
  },
  gridImage: { width: "100%", height: 100, borderRadius: 10, marginBottom: 10 },
  gridTitle: { fontWeight: "bold", fontSize: 14, color: colors.black },
  gridPrice: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "bold",
    marginTop: 2,
  },
  gridLocation: { fontSize: 10, color: colors.grey, marginTop: 2 },
  heartIconContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 5,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 10,
    padding: 2,
  },

  seeMoreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginBottom: 10,
  },
  seeMoreText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 5,
  },

  newsSection: { paddingHorizontal: 20, marginTop: 10, marginBottom: 30 },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewAllText: { color: colors.primary, fontWeight: "bold" },
  newsItem: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  newsImage: { width: 100, height: 70, borderRadius: 8 },
  newsContent: { flex: 1, marginLeft: 10, justifyContent: "center" },
  newsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
  },
  newsDate: { fontSize: 12, color: colors.grey },
  footer: {
    backgroundColor: colors.primary,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  footerContent: { alignItems: "center" },
  footerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  footerTagline: { color: "#ccc", fontSize: 14, marginBottom: 20 },
  copyright: { color: "#aaa", fontSize: 12 },

  // --- MODAL COMMON ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#EAF4F8",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  closeIcon: { position: "absolute", top: 10, right: 10, padding: 5 },

  // --- FILTER STYLES ---
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  tabButton: { flex: 1, alignItems: "center", paddingVertical: 10 },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    marginBottom: -2,
  },
  tabText: { fontSize: 16, fontWeight: "bold", color: "#aaa" },
  activeTabText: { color: colors.primary },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  dropdown: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: { color: colors.grey },
  inputWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: { alignSelf: "flex-start", fontWeight: "bold", marginBottom: 5 },
  priceLabel: {
    alignSelf: "flex-start",
    color: colors.grey,
    fontSize: 12,
    marginBottom: 10,
  },
  sliderBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    marginBottom: 30,
    position: "relative",
    marginTop: 10,
  },
  sliderActiveBar: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    position: "absolute",
    top: -8,
  },
  modalButton: {
    backgroundColor: colors.primary,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // --- MENU DRAWER STYLES ---
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

  // --- BUTTON STYLES ---
  registerAuctionButton: {
    marginTop: 15,
    backgroundColor: colors.primary, // Navy Blue
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30, // Pill shape
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  sellCarButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
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
  // --- LOGOUT BUTTON ---
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 18,
    color: "#D32F2F", // Red Color
    fontWeight: "bold",
  },
});

export default HomeScreen;
