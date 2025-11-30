import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

const FeedbackScreen = ({ navigation }) => {
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);

  // --- SUBMIT LOGIC ---
  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;

      await addDoc(collection(db, "feedbacks"), {
        userId: user ? user.uid : "GUEST",
        userEmail: user ? user.email : "Anonymous",
        rating: rating,
        message: feedbackText,
        createdAt: new Date(),
      });

      setLoading(false);
      Alert.alert("Thank You!", "We appreciate your feedback.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setLoading(false);
      console.error("Feedback Error:", error);
      Alert.alert("Error", "Could not submit feedback. Please try again.");
    }
  };

  // --- STAR COMPONENT ---
  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={40}
            color={i <= rating ? "#FFD700" : colors.grey}
            style={{ marginHorizontal: 5 }}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.iconWrapper}>
            <Ionicons
              name="chatbubbles-outline"
              size={80}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>Rate your experience</Text>
          <Text style={styles.subtitle}>
            Are you enjoying the Auto Prime Auction app?
          </Text>

          {/* STARS */}
          {renderStars()}

          {/* TEXT INPUT */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Tell us what can be improved..."
              placeholderTextColor={colors.grey}
              multiline
              numberOfLines={6}
              value={feedbackText}
              onChangeText={setFeedbackText}
              textAlignVertical="top"
            />
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.black },
  container: { padding: 25, alignItems: "center" },

  iconWrapper: {
    backgroundColor: "#F0F8FF",
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey,
    textAlign: "center",
    marginBottom: 20,
  },

  starContainer: { flexDirection: "row", marginBottom: 30 },

  inputContainer: {
    width: "100%",
    backgroundColor: "#FAFAFA",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 30,
  },
  textInput: {
    height: 120,
    fontSize: 16,
    color: colors.black,
  },

  submitButton: {
    backgroundColor: colors.primary,
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default FeedbackScreen;
