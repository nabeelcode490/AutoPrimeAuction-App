import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import colors from "../constants/colors";

const CustomInput = ({
  iconName,
  placeholder,
  value,
  setValue,
  secureTextEntry,
  rightIcon, // <--- New Prop: Name of the right icon (e.g., "eye")
  onRightIconPress, // <--- New Prop: What happens when clicked
  ...props
}) => {
  return (
    <View style={styles.container}>
      {/* LEFT ICON */}
      <Ionicons
        name={iconName}
        size={24}
        color={colors.grey}
        style={styles.icon}
      />

      {/* TEXT INPUT */}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={colors.grey}
        {...props}
      />

      {/* RIGHT ICON (The Eye) - Only renders if 'rightIcon' is provided */}
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
          <Ionicons name={rightIcon} size={24} color={colors.grey} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    width: "100%",
    borderColor: "#E8E8E8",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1, // Takes up remaining space
    marginLeft: 10,
    fontSize: 16,
    color: colors.black,
  },
  icon: {
    marginRight: 5,
  },
  rightIcon: {
    marginLeft: 10, // Spacing from text
  },
});

export default CustomInput;
