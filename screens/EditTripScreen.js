import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function EditTripScreen({ route, navigation }) {
  const { trip } = route.params;

  const [tripName, setTripName] = useState(trip.name);
  const [people, setPeople] = useState(trip.people);
  const [personName, setPersonName] = useState("");

  const scheme = useColorScheme();

  const colors = {
    bg: scheme === "dark" ? "#121212" : "#f2f2f2",
    card: scheme === "dark" ? "#1e1e1e" : "#fff",
    text: scheme === "dark" ? "#fff" : "#000",
    subText: scheme === "dark" ? "#aaa" : "#555",
    primary: "#007AFF",
    danger: "#FF3B30",
    border: scheme === "dark" ? "#333" : "#ddd",
    shadow: scheme === "dark" ? "#000" : "#000",
  };

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
    if (!tripName.trim() || people.length === 0) {
      Alert.alert("Please enter trip name and at least one person");
      return;
    }

    const stored = await AsyncStorage.getItem("trips");
    let trips = stored ? JSON.parse(stored) : [];
    const updatedTrips = trips.map((t) =>
      t.id === trip.id ? { ...t, name: tripName.trim(), people } : t
    );

    await AsyncStorage.setItem("trips", JSON.stringify(updatedTrips));
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Edit Trip</Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="Trip Name"
        placeholderTextColor={colors.subText}
        value={tripName}
        onChangeText={setTripName}
      />

      <View style={styles.row}>
        <TextInput
          style={[
            styles.input,
            {
              flex: 1,
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Person Name"
          placeholderTextColor={colors.subText}
          value={personName}
          onChangeText={setPersonName}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={addPerson}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={people}
        keyExtractor={(p, i) => i.toString()}
        style={{ marginTop: 10 }}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.personRow,
              {
                backgroundColor: colors.card,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={[styles.person, { color: colors.text }]}>• {item}</Text>
            <TouchableOpacity onPress={() => removePerson(index)}>
              <MaterialIcons name="close" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={{ marginTop: 30 }}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={saveTrip}
        >
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.danger, marginTop: 10 },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.saveText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  row: { flexDirection: "row", alignItems: "center" },
  addButton: {
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
    borderRadius: 14,
    marginVertical: 4,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  person: { fontSize: 16 },
  saveButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
