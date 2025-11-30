import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
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

const ContactUsScreen = ({ navigation }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --- ACTIONS ---
  const handleCall = () => Linking.openURL("tel:+923001234567");
  const handleEmail = () => Linking.openURL("mailto:support@autoprime.com");
  const handleWhatsApp = () => Linking.openURL("https://wa.me/923001234567");

  // --- SEND MESSAGE LOGIC ---
  const handleSendMessage = async () => {
    if (!subject || !message) {
      Alert.alert("Missing Info", "Please enter a subject and message.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;

      await addDoc(collection(db, "contact_messages"), {
        userId: user ? user.uid : "GUEST",
        userEmail: user ? user.email : "Anonymous",
        subject: subject,
        message: message,
        createdAt: new Date(),
        status: "unread",
      });

      setLoading(false);
      setSubject("");
      setMessage("");
      Alert.alert(
        "Message Sent",
        "Our support team will get back to you shortly."
      );
    } catch (error) {
      setLoading(false);
      console.error("Contact Error:", error);
      Alert.alert("Error", "Failed to send message.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* CONTACT CARDS */}
        <Text style={styles.sectionTitle}>Get in touch</Text>
        <View style={styles.cardsRow}>
          <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
            <View style={[styles.iconCircle, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="call" size={24} color="#1E88E5" />
            </View>
            <Text style={styles.cardLabel}>Call Us</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <View style={[styles.iconCircle, { backgroundColor: "#FBE9E7" }]}>
              <Ionicons name="mail" size={24} color="#D84315" />
            </View>
            <Text style={styles.cardLabel}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
            <View style={[styles.iconCircle, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#43A047" />
            </View>
            <Text style={styles.cardLabel}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* MESSAGE FORM */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
          Send a Message
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Ionicons
              name="text-outline"
              size={20}
              color={colors.grey}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={[styles.inputGroup, styles.textAreaGroup]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Type your message here..."
              multiline
              numberOfLines={5}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.sendButtonText}>Send Message</Text>
                <Ionicons
                  name="send"
                  size={18}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  container: { padding: 25 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 15,
  },

  cardsRow: { flexDirection: "row", justifyContent: "space-between" },
  contactCard: {
    width: "30%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardLabel: { fontSize: 12, fontWeight: "600", color: colors.grey },

  formContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: colors.black, fontSize: 16 },

  textAreaGroup: { height: 120, alignItems: "flex-start", paddingVertical: 10 },
  textArea: { height: "100%" },

  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  sendButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default ContactUsScreen;
