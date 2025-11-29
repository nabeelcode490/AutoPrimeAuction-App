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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";

const SellCarScreen = ({ navigation }) => {
  // --- FORM STATE ---
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState("New"); // Default 'New'
  const [year, setYear] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Features State (Simple Checkbox Logic)
  const [features, setFeatures] = useState({
    ac: false,
    cruise: false,
    bluetooth: false,
    sensors: false,
  });

  // Files State
  const [inspectionSheet, setInspectionSheet] = useState(null);
  const [images, setImages] = useState([]);

  // --- HANDLERS ---

  // 1. Pick Images (Max 4)
  const pickImage = async () => {
    if (images.length >= 4) {
      Alert.alert("Limit Reached", "You can only upload up to 4 images.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // 2. Pick Document (PDF/Images)
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"], // Allow PDFs or Images
      });

      if (result.canceled === false) {
        setInspectionSheet(result.assets[0]);
      }
    } catch (err) {
      console.log("Unknown Error: ", err);
    }
  };

  // 3. Submit Form
  const handleSubmit = () => {
    if (!price.trim()) {
      Alert.alert("Missing Info", "Price is mandatory.");
      return;
    }
    Alert.alert("Processing", "Our AI is evaluating your car...", [
      {
        text: "See Results",
        onPress: () => {
          // Navigate to the new screen and pass Dummy Data
          navigation.navigate("PriceEvaluation", {
            estimatedPrice: "26.3 Lac",
            minPrice: "26.3 Lac",
            maxPrice: "29.8 Lac",
          });
        },
      },
    ]);
  };

  // --- CUSTOM UI COMPONENTS ---

  // Custom Radio Button (New/Used)
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

  // Custom Checkbox
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
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Car Registration</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* TITLE */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter title"
          value={title}
          onChangeText={setTitle}
        />

        {/* CONDITION & YEAR ROW */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Condition</Text>
            <View style={styles.radioContainer}>
              <RadioButton label="New" value="New" />
              <RadioButton label="Used" value="Used" />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Year"
              keyboardType="numeric"
              value={year}
              onChangeText={setYear}
            />
          </View>
        </View>

        {/* BRAND & MODEL ROW (Text Inputs now) */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Toyota"
              value={brand}
              onChangeText={setBrand}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Corolla"
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

        {/* LOCATION & PRICE ROW */}
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
                placeholder="Search Location"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>
              Price <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Price"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        {/* INSPECTION SHEET UPLOAD */}
        <Text style={styles.label}>Upload Inspection Sheet</Text>
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
          placeholder="Write description about your car"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* IMAGE UPLOAD SECTION */}
        <TouchableOpacity style={styles.imageUploadSection} onPress={pickImage}>
          <Ionicons name="camera" size={24} color={colors.black} />
          <Text style={styles.imageUploadText}>
            Upload images ({images.length}/4)
          </Text>
        </TouchableOpacity>

        {/* Selected Images Preview */}
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
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Get Price Evaluated</Text>
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
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
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
