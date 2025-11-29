import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";

const { width } = Dimensions.get("window");

const CarDetailsScreen = ({ route, navigation }) => {
  // 1. Get the car data passed from Home Screen
  const { item } = route.params;

  // 2. State to handle Image Swapping
  const [activeImage, setActiveImage] = useState(item.image);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- HEADER (Back Arrow & Share) --- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Car Details</Text>
          <TouchableOpacity>
            <Ionicons
              name="share-social-outline"
              size={24}
              color={colors.black}
            />
          </TouchableOpacity>
        </View>

        {/* --- MAIN IMAGE --- */}
        <Image source={{ uri: activeImage }} style={styles.mainImage} />

        {/* --- GALLERY THUMBNAILS --- */}
        <View style={styles.galleryContainer}>
          {item.gallery.map((img, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveImage(img)}
              style={[
                styles.thumbnailWrapper,
                activeImage === img && styles.activeThumbnail, // Highlight selected
              ]}
            >
              <Image source={{ uri: img }} style={styles.thumbnail} />
            </TouchableOpacity>
          ))}
        </View>

        {/* --- CAR INFO SECTION --- */}
        <View style={styles.infoContainer}>
          {/* Title & Rating */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.carTitle}>{item.name}</Text>
              <Text style={styles.carModel}>{item.model}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>{item.rating || "N/A"}/5</Text>
              <Ionicons
                name="star"
                size={18}
                color="#FFD700"
                style={{ marginLeft: 5 }}
              />
            </View>
          </View>

          <Text style={styles.price}>{item.price}</Text>

          {/* Description */}
          <Text style={styles.description}>
            {item.description || "No description provided."}
            <Text style={styles.readMore}> Read more...</Text>
          </Text>

          {/* --- VERIFIED BADGE (Conditional) --- */}
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkbox"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.verifiedText}>Verified by PakWheels</Text>
            </View>
          )}

          {/* --- DETAILS ROW (Icons) --- */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons
                name="speedometer-outline"
                size={24}
                color={colors.black}
              />
              <Text style={styles.detailText}>Contact us</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="car-sport-outline"
                size={24}
                color={colors.black}
              />
              <Text style={styles.detailText}>Car details</Text>
            </View>
            <Text style={styles.seeAllText}>See All</Text>
          </View>

          {/* --- LOCATION ROW --- */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color={colors.black} />
            <Text style={styles.locationText}>
              {item.location || "Pakistan"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* --- FOOTER BUTTON --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => console.log("Buy Now Pressed")}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.black },

  // Images
  mainImage: { width: "100%", height: 220, resizeMode: "cover" },
  galleryContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
  thumbnailWrapper: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: { borderColor: colors.primary }, // Blue border if active
  thumbnail: { width: width * 0.28, height: 70, resizeMode: "cover" },

  // Info
  infoContainer: { padding: 20 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  carTitle: { fontSize: 24, fontWeight: "bold", color: colors.black },
  carModel: { fontSize: 16, color: colors.grey, marginTop: 2 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 16, fontWeight: "bold", color: colors.black },

  price: { fontSize: 18, color: colors.grey, marginBottom: 15 },
  description: {
    fontSize: 14,
    color: colors.grey,
    lineHeight: 22,
    marginBottom: 15,
  },
  readMore: { color: colors.primary, fontWeight: "bold" },

  // Verified Badge
  verifiedBadge: {
    backgroundColor: "#102C57",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  verifiedText: { color: "white", fontWeight: "bold", fontSize: 14 },

  // Details Icons
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailText: { fontSize: 14, color: colors.black, fontWeight: "500" },
  seeAllText: { color: colors.grey, fontSize: 14 },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  locationText: { fontSize: 14, color: colors.black, fontWeight: "500" },

  // Footer
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  buyButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  buyButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default CarDetailsScreen;
