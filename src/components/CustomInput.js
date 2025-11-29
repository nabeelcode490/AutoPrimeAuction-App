import { Ionicons } from "@expo/vector-icons"; // Built-in Expo icons
import { StyleSheet, TextInput, View } from "react-native";
import colors from "../constants/colors";

const CustomInput = ({
  iconName,
  placeholder,
  value,
  setValue,
  secureTextEntry = false, // Default is false (for normal text)
  keyboardType = "default", // Default keyboard
}) => {
  return (
    <View style={styles.container}>
      {/* The Icon on the left */}
      <Ionicons
        name={iconName}
        size={24}
        color={colors.grey}
        style={styles.icon}
      />

      {/* The Typing Area */}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.grey}
        value={value}
        onChangeText={setValue}
        secureTextEntry={secureTextEntry} // Hides text if true (for passwords)
        keyboardType={keyboardType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    width: "100%",
    borderColor: "#E8E8E8", // Very light grey border
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15, // Space inside left/right
    paddingVertical: 12, // Space inside top/bottom
    marginVertical: 10, // Space between different inputs
    flexDirection: "row", // Aligns Icon and Text side-by-side
    alignItems: "center",

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Shadow for Android
    elevation: 2,
  },
  icon: {
    marginRight: 10, // Space between icon and text
  },
  input: {
    flex: 1, // Takes up remaining space
    color: colors.text,
    fontSize: 16,
  },
});

export default CustomInput;
