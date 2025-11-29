import { StyleSheet, Text, View } from "react-native";

const TestScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Auto Prime Auction is Running!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "blue",
  },
});

export default TestScreen;
