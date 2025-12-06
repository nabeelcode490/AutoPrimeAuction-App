import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../components/CustomInput";
import { auth, db } from "../config/firebase";
import colors from "../constants/colors";

const AuctionRegistrationScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [cnic, setCnic] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onSubmitPressed = async () => {
    if (!fullName || !cnic || !whatsapp) {
      Alert.alert("Missing Info", "Please fill all fields.");
      return;
    }
    // In a real app, you would upload the image to Cloudinary first.
    // For now, we will just save the text data to keep it simple for the demo.

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "auction_requests"), {
        userId: user.uid,
        userName: fullName,
        cnic: cnic,
        whatsapp: whatsapp,
        status: "pending", // Default status
        accessCode: null, // Admin will set this later
        createdAt: new Date(),
      });

      setLoading(false);
      Alert.alert(
        "Request Submitted",
        "Your request is pending approval. You will receive an Access Code once approved.",
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Error", "Could not submit request.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auction Registration</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subText}>
          To join our Live Bidding Events, please verify your identity.
        </Text>

        <CustomInput
          iconName="person-outline"
          placeholder="Full Name"
          value={fullName}
          setValue={setFullName}
        />
        <CustomInput
          iconName="card-outline"
          placeholder="CNIC"
          value={cnic}
          setValue={setCnic}
          keyboardType="numeric"
        />
        <CustomInput
          iconName="logo-whatsapp"
          placeholder="WhatsApp Number"
          value={whatsapp}
          setValue={setWhatsapp}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Upload Payment Screenshot</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons
                name="cloud-upload-outline"
                size={40}
                color={colors.grey}
              />
              <Text style={styles.placeholderText}>Tap to Upload</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={onSubmitPressed}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.black },
  subText: { fontSize: 14, color: colors.grey, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 15, marginBottom: 10 },
  imagePicker: {
    height: 150,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholder: { alignItems: "center" },
  placeholderText: { color: colors.grey, marginTop: 5 },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default AuctionRegistrationScreen;
