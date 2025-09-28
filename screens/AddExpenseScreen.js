import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";

export default function AddExpenseScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitAmong, setSplitAmong] = useState([]);
  const [settlements, setSettlements] = useState([]);

  useEffect(() => {
    const loadTrip = async () => {
      const stored = await AsyncStorage.getItem("trips");
      if (stored) {
        const trips = JSON.parse(stored);
        const found = trips.find((t) => t.id === tripId);
        if (found) {
          setTrip(found);
          setPaidBy(found.people[0]);
          setSplitAmong([...found.people]);
        }
      }
    };
    loadTrip();
  }, [tripId]);

  const toggleSplit = (person) => {
    let updated;
    if (splitAmong.includes(person)) {
      updated = splitAmong.filter((p) => p !== person);
    } else {
      updated = [...splitAmong, person];
    }
    setSplitAmong(updated);
    calculateSettlements(updated, amount, paidBy);
  };

  const handleAmountChange = (val) => {
    setAmount(val);
    calculateSettlements(splitAmong, val, paidBy);
  };

  const handlePaidByChange = (val) => {
    setPaidBy(val);
    calculateSettlements(splitAmong, amount, val);
  };

  const calculateSettlements = (splitArr, amt, payer) => {
    const parsedAmt = parseFloat(amt);
    if (!splitArr.length || !parsedAmt || !payer) {
      setSettlements([]);
      return;
    }
    const share = parsedAmt / splitArr.length;
    const result = splitArr
      .filter((p) => p !== payer)
      .map((p) => `${p} owes ${payer} ₹${share.toFixed(2)}`);
    setSettlements(result);
  };

  const saveExpense = async () => {
    if (!description.trim() || !amount || splitAmong.length === 0) {
      alert("Please enter details and select at least one member");
      return;
    }

    const stored = await AsyncStorage.getItem("trips");
    let trips = stored ? JSON.parse(stored) : [];

    let updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        const newExp = {
          id: Date.now().toString(),
          description,
          amount: parseFloat(amount),
          paidBy,
          splitAmong,
        };
        t.expenses = t.expenses ? [...t.expenses, newExp] : [newExp];
      }
      return t;
    });

    await AsyncStorage.setItem("trips", JSON.stringify(updatedTrips));
    navigation.goBack();
  };

  if (!trip) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Expense Description</Text>
      <TextInput
        placeholder="e.g. Lunch"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <Text style={styles.label}>Amount</Text>
      <TextInput
        placeholder="e.g. 500"
        value={amount}
        onChangeText={handleAmountChange}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Paid By</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={paidBy} onValueChange={handlePaidByChange}>
          {trip.people.map((person, index) => (
            <Picker.Item key={index} label={person} value={person} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Split Among</Text>
      <View style={styles.checkboxContainer}>
        {trip.people.map((person, index) => (
          <View key={index} style={styles.checkboxRow}>
            <Checkbox
              value={splitAmong.includes(person)}
              onValueChange={() => toggleSplit(person)}
              color={splitAmong.includes(person) ? "#007AFF" : undefined}
            />
            <Text style={styles.checkboxLabel}>{person}</Text>
          </View>
        ))}
      </View>

      {settlements.length > 0 && (
        <View style={styles.settlementContainer}>
          <Text style={styles.label}>Settlement:</Text>
          {settlements.map((s, i) => (
            <Text key={i} style={styles.settlementText}>
              {s}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Save Expense" onPress={saveExpense} color="#007AFF" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5, marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  checkboxContainer: { marginTop: 10 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  checkboxLabel: { marginLeft: 8, fontSize: 16 },
  buttonContainer: { marginTop: 30, borderRadius: 8, overflow: "hidden" },
  settlementContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#e6f0ff",
    borderRadius: 10,
  },
  settlementText: { fontSize: 16, marginVertical: 2 },
  loading: { fontSize: 18, padding: 20 },
});
