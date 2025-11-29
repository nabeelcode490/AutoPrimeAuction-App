import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../constants/colors";

const { width } = Dimensions.get("window");

const CarCard = ({ item, isLive }) => {
  return (
    <View style={styles.card}>
      {/* CAR IMAGE */}
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* CAR DETAILS */}
      <View style={styles.details}>
        <Text style={styles.title}>{item.name}</Text>

        {/* If it's Scheduled, show the date */}
        {!isLive && <Text style={styles.date}>Start: {item.date}</Text>}

        <Text style={styles.priceLabel}>
          {isLive ? "Current Bid:" : "Opening Bid:"}
          <Text style={styles.priceValue}> {item.price}</Text>
        </Text>

        {/* BUTTONS */}
        {/* If Live, show "Join Auction". If Scheduled, show "Remind Me" */}
        <View style={styles.buttonRow}>
          {isLive ? (
            <>
              <TouchableOpacity style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>View Only</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fillButton}>
                <Text style={styles.fillButtonText}>Join Auction</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.remindButton}>
              <Text style={styles.fillButtonText}>Remind me</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    width: width * 0.85, // Card takes 85% of screen width
    marginRight: 15, // Space between cards when scrolling sideways

    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  details: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 5,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 15,
  },
  priceValue: {
    fontWeight: "bold",
    color: colors.black,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // Button Styles
  outlineButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  outlineButtonText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  fillButton: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  fillButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  remindButton: {
    width: "100%",
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default CarCard;
