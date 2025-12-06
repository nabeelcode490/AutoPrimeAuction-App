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

// --- CLOUDINARY CONFIG ---
const CLOUD_NAME = "dxydzzqnl";
const UPLOAD_PRESET = "autoprime_upload";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_RAW_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;

// TODO: CHECK YOUR IP ADDRESS! (Ensure this is current)
const API_BASE_URL = "http://192.168.1.23:3000";

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

  const [inspectionSheet, setInspectionSheet] = useState(null); // PDF
  const [inspectionSheetImage, setInspectionSheetImage] = useState(null); // Image
  const [images, setImages] = useState([]); // Car Images

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // --- HANDLERS ---
  const pickCarImages = async () => {
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

  const pickInspectionImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setInspectionSheetImage(result.assets[0].uri);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
      });
      if (!result.canceled) {
        setInspectionSheet(result.assets[0]);
      }
    } catch (err) {
      console.log("Unknown Error: ", err);
    }
  };

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
    // 1. Ultra-Relaxed Validation (Only Title and Price required)
    if (!title || !price) {
      Alert.alert("Missing Info", "Title and Price are mandatory.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Upload Car Images (ONLY If provided)
      const imageUrls = [];
      if (images.length > 0) {
        setStatusMessage("Uploading Car Photos...");
        for (const imageUri of images) {
          const url = await uploadToCloudinary(imageUri, "image");
          imageUrls.push(url);
        }
      }

      // 3. Upload Inspection Files (ONLY If provided)
      let sheetImageUrl = null;
      let sheetPdfUrl = null;

      if (inspectionSheetImage) {
        setStatusMessage("Uploading Inspection Image...");
        sheetImageUrl = await uploadToCloudinary(inspectionSheetImage, "image");
      }

      if (inspectionSheet) {
        setStatusMessage("Uploading PDF...");
        sheetPdfUrl = await uploadToCloudinary(inspectionSheet.uri, "raw");
      }

      // 4. Save to Database
      setStatusMessage("Saving Data...");
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
        inspectionSheetImage: sheetImageUrl, // Can be null
        inspectionSheetPdf: sheetPdfUrl, // Can be null
        userId: "test-user-123",
      };

      const saveResponse = await fetch(`${API_BASE_URL}/api/sell-car`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData),
      });
      const saveResult = await saveResponse.json();

      if (!saveResult.success)
        throw new Error("Failed to save car to database");

      // 5. Call AI
      setStatusMessage("AI Evaluating...");
      const aiResponse = await fetch(`${API_BASE_URL}/api/evaluate-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: Send a default year "2020" if the user left it empty to avoid AI crash
        body: JSON.stringify({
          title,
          year: year || "2020",
          price,
        }),
      });
      const aiResult = await aiResponse.json();

      setIsSubmitting(false);
      setStatusMessage("");

      // 6. Navigate with "HasDocs" Flag
      // We check if BOTH files exist to allow auction scheduling later
      const hasInspectionDocs = !!(sheetImageUrl && sheetPdfUrl);

      navigation.navigate("PriceEvaluation", {
        carId: saveResult.carId,
        estimatedPrice: aiResult.estimated_price || "Processing...",
        minPrice: aiResult.price_range?.min || "N/A",
        maxPrice: aiResult.price_range?.max || "N/A",
        hasInspectionDocs: hasInspectionDocs,
      });
    } catch (error) {
      setIsSubmitting(false);
      setStatusMessage("");
      console.error("Process Error:", error);
      Alert.alert(
        "Error",
        "Something went wrong. Check your internet connection or server."
      );
    }
  };

  // UI Helpers
  const RadioButton = ({ label, value }) => (
    <TouchableOpacity
      style={styles.radioRow}
      onPress={() => setCondition(value)}
    >
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Car Registration</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Title (MANDATORY) */}
        <Text style={styles.label}>
          Title <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Honda City 2021"
          value={title}
          onChangeText={setTitle}
        />

        {/* Condition & Year (OPTIONAL) */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Condition</Text>
            <View style={styles.radioContainer}>
              <RadioButton label="New" value="New" />
              <RadioButton label="Used" value="Used" />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            {/* NO RED STAR HERE */}
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={styles.input}
              placeholder="2021"
              keyboardType="numeric"
              value={year}
              onChangeText={setYear}
            />
          </View>
        </View>

        {/* Brand & Model */}
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

        {/* Features */}
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

        {/* Location & Price (PRICE MANDATORY) */}
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

        {/* --- INSPECTION SECTION (OPTIONAL) --- */}
        <View style={styles.inspectionSection}>
          <Text style={styles.sectionTitle}>Inspection Details</Text>
          <Text style={styles.helperText}>(Mandatory only for Auctions)</Text>

          {/* Upload PDF */}
          <Text style={styles.subLabel}>Upload Inspection Sheet (PDF)</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Text style={styles.uploadButtonText} numberOfLines={1}>
              {inspectionSheet ? inspectionSheet.name : "Upload File"}
            </Text>
            <Ionicons name="document-text" size={20} color={colors.black} />
          </TouchableOpacity>

          {/* Upload Image */}
          <Text style={styles.subLabel}>Upload Inspection Sheet (Image)</Text>
          <TouchableOpacity
            style={styles.imageUploadSection}
            onPress={pickInspectionImage}
          >
            {inspectionSheetImage ? (
              <Image
                source={{ uri: inspectionSheetImage }}
                style={{ width: "100%", height: 150, borderRadius: 8 }}
                resizeMode="contain"
              />
            ) : (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="image-outline" size={30} color={colors.grey} />
                <Text style={styles.imageUploadText}>Tap to upload Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your car..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* Car Images (OPTIONAL) */}
        {/* NO RED STAR HERE */}
        <Text style={[styles.label, { marginTop: 20 }]}>Car Photos</Text>
        <TouchableOpacity
          style={styles.imageUploadSection}
          onPress={pickCarImages}
        >
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

      {/* Footer */}
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
            <View style={{ flexDirection: "row", gap: 10 }}>
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
  subLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    marginTop: 10,
    color: colors.black,
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
    fontSize: 14,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },

  inspectionSection: {
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.primary },
  helperText: { fontSize: 12, color: colors.grey, marginBottom: 10 },

  uploadButton: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadButtonText: { color: colors.grey },

  imageUploadSection: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    minHeight: 60,
    marginTop: 5,
  },
  imageUploadText: {
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 10,
    color: colors.grey,
  },

  textArea: { height: 100, textAlignVertical: "top" },
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
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 50,
  },
  inputIcon: { marginRight: 5 },
  radioContainer: { flexDirection: "row", marginTop: 5 },
  radioRow: { flexDirection: "row", alignItems: "center", marginRight: 20 },
  radioText: { marginLeft: 5, fontSize: 14 },
  featuresGrid: { backgroundColor: "#F9F9F9", padding: 10, borderRadius: 8 },
  column: { flexDirection: "column" },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  checkboxText: { marginLeft: 10, fontSize: 14 },
});

export default SellCarScreen;
