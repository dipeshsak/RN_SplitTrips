import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Swipeable } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";

export default function TripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const stored = await AsyncStorage.getItem("trips");
      if (stored) {
        const tripsArray = JSON.parse(stored);
        const sortedTrips = tripsArray.sort((a, b) => b.id - a.id);
        setTrips(sortedTrips);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const addTrip = () => navigation.navigate("AddTrip");

  const deleteTrip = async (id) => {
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete this trip?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedTrips = trips.filter((t) => t.id !== id);
            setTrips(updatedTrips);
            await AsyncStorage.setItem("trips", JSON.stringify(updatedTrips));
          },
        },
      ]
    );
  };

  const editTrip = (trip) => {
    navigation.navigate("EditTrip", { trip });
  };

  const renderRightActions = (progress, dragX, item) => {
    const scale = dragX.interpolate({
      inputRange: [-150, 0],
      outputRange: [1, 0.8],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeContainer}>
        <TouchableOpacity onPress={() => editTrip(item)}>
          <Animated.View style={[styles.swipeButton, { backgroundColor: "#FFA500", transform: [{ scale }] }]}>
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.swipeButtonText}>Edit</Text>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteTrip(item.id)}>
          <Animated.View style={[styles.swipeButton, { backgroundColor: "#FF3B30", transform: [{ scale }] }]}>
            <MaterialIcons name="delete" size={20} color="#fff" />
            <Text style={styles.swipeButtonText}>Delete</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTrip = ({ item }) => {
    const date = new Date(parseInt(item.id));
    const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();

    return (
      <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}>
        <TouchableOpacity
          style={styles.tripCard}
          onPress={() => navigation.navigate("TripDetail", { tripId: item.id })}
        >
          <Text style={styles.tripName}>{item.name}</Text>
          <Text style={styles.tripInfo}>👥 {item.people.join(", ")}</Text>
          <Text style={styles.tripDate}>📅 {formattedDate}</Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Trips</Text>
      {trips.length === 0 ? (
        <Text style={styles.noTrips}>No trips yet. Add one!</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(t) => t.id}
          renderItem={renderTrip}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={addTrip}>
        <Text style={styles.addText}>＋ Add Trip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  noTrips: { fontSize: 16, textAlign: "center", marginTop: 50, color: "#555" },
  tripCard: {
    backgroundColor: "#fff",
    padding: 18,
    marginVertical: 8,
    borderRadius: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  tripName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  tripInfo: { fontSize: 14, color: "#555", marginBottom: 2 },
  tripDate: { fontSize: 12, color: "#888" },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
    elevation: 5,
  },
  addText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  swipeContainer: { flexDirection: "row", marginVertical: 8 },
  swipeButton: {
    width: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    flexDirection: "row",
    paddingVertical: 12,
  },
  swipeButtonText: { color: "#fff", fontWeight: "bold", marginLeft: 4, fontSize: 12 },
});
