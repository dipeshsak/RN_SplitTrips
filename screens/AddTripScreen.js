import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function AddTripScreen({ navigation }) {
  const [tripName, setTripName] = useState("");
  const [people, setPeople] = useState([]);
  const [personName, setPersonName] = useState("");

  const addPerson = () => {
    if (personName.trim()) {
      setPeople([...people, personName.trim()]);
      setPersonName("");
    }
  };

  const removePerson = (index) => {
    const updated = people.filter((_, i) => i !== index);
    setPeople(updated);
  };

  const saveTrip = async () => {
    if (!tripName.trim() || people.length === 0) return;

    const stored = await AsyncStorage.getItem("trips");
    const trips = stored ? JSON.parse(stored) : [];
    const newTrips = [
      ...trips,
      { id: Date.now().toString(), name: tripName.trim(), people, expenses: [] },
    ];
    await AsyncStorage.setItem("trips", JSON.stringify(newTrips));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create New Trip</Text>

      <TextInput
        style={styles.input}
        placeholder="Trip Name"
        value={tripName}
        onChangeText={setTripName}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Person Name"
          value={personName}
          onChangeText={setPersonName}
        />
        <TouchableOpacity style={styles.addButton} onPress={addPerson}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={people}
        keyExtractor={(p, i) => i.toString()}
        style={{ marginTop: 10 }}
        renderItem={({ item, index }) => (
          <View style={styles.personRow}>
            <Text style={styles.person}>• {item}</Text>
            <TouchableOpacity onPress={() => removePerson(index)}>
              <MaterialIcons name="close" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={{ marginTop: 30 }}>
        <TouchableOpacity style={styles.saveButton} onPress={saveTrip}>
          <Text style={styles.saveText}>Save Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: "#FF3B30", marginTop: 10 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.saveText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  row: { flexDirection: "row", alignItems: "center" },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  personRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginVertical: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  person: { fontSize: 16 },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
