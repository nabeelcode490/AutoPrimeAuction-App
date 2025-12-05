import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";

// --- CONFIGURATION ---
const CLOUD_NAME = "dxydzzqnl";
const UPLOAD_PRESET = "autoprime_upload";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_RAW_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;

// TODO: CHECK YOUR IP ADDRESS!
const API_BASE_URL = "http://192.168.1.39:3000";

const SellCarScreen = ({ navigation }) => {
  // --- FORM STATE ---
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState("New");
  const [year, setYear] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [features, setFeatures] = useState({
    ac: false,
    cruise: false,
    bluetooth: false,
    sensors: false,
  });

  const [inspectionSheet, setInspectionSheet] = useState(null);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(""); // To show "Uploading...", "Analyzing..."

  // --- HANDLERS ---

  const pickImage = async () => {
    if (images.length >= 4) {
      Alert.alert("Limit Reached", "You can only upload up to 4 images.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });
      if (!result.canceled) {
        setInspectionSheet(result.assets[0]);
      }
    } catch (err) {
      console.log("Unknown Error: ", err);
    }
  };

  // --- CLOUDINARY UPLOAD HELPER ---
  const uploadToCloudinary = async (fileUri, type = "image") => {
    const data = new FormData();
    let filename = fileUri.split("/").pop();
    let match = /\.(\w+)$/.exec(filename);
    let fileType = match ? `image/${match[1]}` : `image`;
    if (type === "raw") fileType = "application/pdf";

    // @ts-ignore
    data.append("file", { uri: fileUri, name: filename, type: fileType });
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);

    const url = type === "raw" ? CLOUDINARY_RAW_URL : CLOUDINARY_URL;

    try {
      let response = await fetch(url, {
        method: "POST",
        body: data,
        headers: { "content-type": "multipart/form-data" },
      });
      let responseData = await response.json();
      if (responseData.secure_url) return responseData.secure_url;
      else throw new Error("Upload failed");
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  };

  // --- MAIN SUBMIT HANDLER ---
  const handleSubmit = async () => {
    if (!title || !price || !year || images.length === 0) {
      Alert.alert(
        "Missing Info",
        "Please fill required fields and upload images."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload Images
      setStatusMessage("Uploading Images...");
      const imageUrls = [];
      for (const imageUri of images) {
        const url = await uploadToCloudinary(imageUri, "image");
        imageUrls.push(url);
      }

      let docUrl = null;
      if (inspectionSheet) {
        setStatusMessage("Uploading Document...");
        docUrl = await uploadToCloudinary(inspectionSheet.uri, "raw");
      }

      // 2. Save to Database (Node.js -> Firestore)
      setStatusMessage("Saving Car Details...");
      const carData = {
        title,
        condition,
        year,
        brand,
        model,
        price,
        location,
        description,
        features,
        images: imageUrls,
        inspectionSheet: docUrl,
        userId: "test-user-123", // In real app: auth.currentUser.uid
      };

      const saveResponse = await fetch(`${API_BASE_URL}/api/sell-car`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData),
      });
      const saveResult = await saveResponse.json();

      if (!saveResult.success)
        throw new Error("Failed to save car to database");

      // 3. Call AI for Price Evaluation
      setStatusMessage("AI is Evaluating Price...");
      // We send the 'year' and 'price' to our Node backend, which asks Python
      const aiResponse = await fetch(`${API_BASE_URL}/api/evaluate-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          year: year,
          price: price,
        }),
      });

      const aiResult = await aiResponse.json();
      console.log("AI Result:", aiResult);

      setIsSubmitting(false);
      setStatusMessage("");

      // 4. Navigate with Real AI Data
      navigation.navigate("PriceEvaluation", {
        carId: saveResult.carId,
        // Fallback to "N/A" if AI fails, but it should work if Python is running
        estimatedPrice: aiResult.estimated_price || "Processing...",
        minPrice: aiResult.price_range?.min || "N/A",
        maxPrice: aiResult.price_range?.max || "N/A",
      });
    } catch (error) {
      setIsSubmitting(false);
      setStatusMessage("");
      console.error("Process Error:", error);
      Alert.alert(
        "Error",
        "Something went wrong. Ensure both Node and Python servers are running."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Car Registration</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* TITLE */}
        <Text style={styles.label}>
          Title <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Honda City 2021"
          value={title}
          onChangeText={setTitle}
        />

        {/* CONDITION & YEAR */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Condition</Text>
            <View style={styles.radioContainer}>
              <RadioButton
                label="New"
                value="New"
                condition={condition}
                setCondition={setCondition}
              />
              <RadioButton
                label="Used"
                value="Used"
                condition={condition}
                setCondition={setCondition}
              />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.label}>
              Year <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="2021"
              keyboardType="numeric"
              value={year}
              onChangeText={setYear}
            />
          </View>
        </View>

        {/* BRAND & MODEL */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              placeholder="Toyota"
              value={brand}
              onChangeText={setBrand}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              placeholder="Corolla"
              value={model}
              onChangeText={setModel}
            />
          </View>
        </View>

        {/* FEATURES */}
        <Text style={styles.label}>Features</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.column}>
            <Checkbox
              label="Air Conditioner"
              isChecked={features.ac}
              onToggle={() => setFeatures({ ...features, ac: !features.ac })}
            />
            <Checkbox
              label="Bluetooth"
              isChecked={features.bluetooth}
              onToggle={() =>
                setFeatures({ ...features, bluetooth: !features.bluetooth })
              }
            />
          </View>
          <View style={styles.column}>
            <Checkbox
              label="Cruise Control"
              isChecked={features.cruise}
              onToggle={() =>
                setFeatures({ ...features, cruise: !features.cruise })
              }
            />
            <Checkbox
              label="Front Parking Sensor"
              isChecked={features.sensors}
              onToggle={() =>
                setFeatures({ ...features, sensors: !features.sensors })
              }
            />
          </View>
        </View>

        {/* LOCATION & PRICE */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.grey}
                style={styles.inputIcon}
              />
              <TextInput
                style={{ flex: 1 }}
                placeholder="Lahore"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>
              Price (PKR) <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="2500000"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        {/* INSPECTION SHEET */}
        <Text style={styles.label}>Upload Inspection Sheet (PDF)</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
          <Text style={styles.uploadButtonText}>
            {inspectionSheet ? inspectionSheet.name : "Upload File"}
          </Text>
          <Ionicons name="document-text" size={20} color={colors.black} />
        </TouchableOpacity>

        {/* DESCRIPTION */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* IMAGE UPLOAD */}
        <Text style={styles.label}>
          Car Images <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TouchableOpacity style={styles.imageUploadSection} onPress={pickImage}>
          <Ionicons name="camera" size={24} color={colors.black} />
          <Text style={styles.imageUploadText}>
            Upload images ({images.length}/4)
          </Text>
        </TouchableOpacity>

        <View style={styles.imagesPreviewRow}>
          {images.map((uri, index) => (
            <View key={index} style={styles.previewWrapper}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeIcon}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* BOTTOM BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && { backgroundColor: colors.grey },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <ActivityIndicator color="#fff" />
              <Text style={{ color: "#fff" }}>{statusMessage}</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Get Price Evaluated</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Sub-components
const RadioButton = ({ label, value, condition, setCondition }) => (
  <TouchableOpacity style={styles.radioRow} onPress={() => setCondition(value)}>
    <Ionicons
      name={condition === value ? "radio-button-on" : "radio-button-off"}
      size={24}
      color={condition === value ? colors.primary : colors.grey}
    />
    <Text style={styles.radioText}>{label}</Text>
  </TouchableOpacity>
);

const Checkbox = ({ label, isChecked, onToggle }) => (
  <TouchableOpacity style={styles.checkboxRow} onPress={onToggle}>
    <Ionicons
      name={isChecked ? "checkbox" : "square-outline"}
      size={24}
      color={isChecked ? colors.primary : colors.black}
    />
    <Text style={styles.checkboxText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  contentContainer: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.black },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
    color: colors.black,
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
    fontSize: 14,
    color: colors.text,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  radioContainer: { flexDirection: "row", marginTop: 5 },
  radioRow: { flexDirection: "row", alignItems: "center", marginRight: 20 },
  radioText: { marginLeft: 5, fontSize: 14 },
  featuresGrid: { backgroundColor: "#F9F9F9", padding: 10, borderRadius: 8 },
  column: { flexDirection: "column" },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  checkboxText: { marginLeft: 10, fontSize: 14 },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 50,
  },
  inputIcon: { marginRight: 5 },
  uploadButton: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadButtonText: { color: colors.grey },
  textArea: { height: 100, textAlignVertical: "top" },
  imageUploadSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
  },
  imageUploadText: { fontWeight: "bold", fontSize: 16 },
  imagesPreviewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10,
  },
  previewWrapper: { position: "relative" },
  previewImage: { width: 70, height: 70, borderRadius: 8 },
  removeIcon: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "white",
    borderRadius: 10,
  },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#eee" },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default SellCarScreen;
