import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CarCard from "../components/CarCard"; // Import our new card
import colors from "../constants/colors";
import { liveAuctions, scheduledAuctions } from "../data/carData"; // Import dummy data

const AuctionsScreen = ({ navigation }) => {
  // Renders the list of cars
  const renderCarItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        if (item.status === "Live") {
          // If it's a live auction, go to the Bidding Room
          navigation.navigate("LiveBidding", { item });
        } else {
          // If it's just a scheduled one, maybe just show details or an alert
          alert("This auction starts on " + item.date);
        }
      }}
    >
      <CarCard item={item} isLive={item.status === "Live"} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <TouchableOpacity>
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
            {/* Notification Dot */}
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* --- SEARCH BAR --- */}
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

        {/* --- SECTION 1: LIVE AUCTION --- */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Live Auction</Text>
            <Text style={styles.sectionSubtitle}>
              {liveAuctions.length} Cars for Sale
            </Text>
          </View>
          {/* Navigation Arrows (Visual only for now) */}
          <Ionicons name="arrow-forward" size={24} color={colors.black} />
        </View>

        {/* Horizontal List of Live Cars */}
        <FlatList
          horizontal
          data={liveAuctions}
          renderItem={(item) => renderCarItem(item, true)} // true = isLive
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        {/* --- SECTION 2: AUCTION SCHEDULE --- */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Auction Schedule</Text>
            <Text style={styles.sectionSubtitle}>Start Date & Time</Text>
          </View>
        </View>

        {/* Horizontal List of Scheduled Cars */}
        <FlatList
          horizontal
          data={scheduledAuctions}
          renderItem={(item) => renderCarItem(item, false)} // false = Not Live
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        {/* Extra padding at bottom for scrolling */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerLogo: {
    width: 80,
    height: 40,
  },
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
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    padding: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.black,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.grey,
    marginTop: 2,
  },
  listContent: {
    paddingLeft: 20, // Starts the list with some left padding
    paddingRight: 5,
  },
});

export default AuctionsScreen;
