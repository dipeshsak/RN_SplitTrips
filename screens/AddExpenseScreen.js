import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";

export default function AddExpenseScreen({ route, navigation }) {
  const { tripId, expenseId } = route.params || {};
  const [trip, setTrip] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitAmong, setSplitAmong] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState("");

  const scheme = useColorScheme();

  const colors = {
    bg: scheme === "dark" ? "#121212" : "#f2f2f2",
    card: scheme === "dark" ? "#1e1e1e" : "#fff",
    text: scheme === "dark" ? "#fff" : "#000",
    subText: scheme === "dark" ? "#aaa" : "#555",
    primary: "#007AFF",
    success: "#22C55E",
    danger: "#d9534f",
    border: scheme === "dark" ? "#333" : "#ddd",
    highlight: scheme === "dark" ? "#263238" : "#e6f0ff",
  };

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

          if (expenseId) {
            const exp = found.expenses.find((e) => e.id === expenseId);
            if (exp) {
              setEditingExpense(exp);
              setDescription(exp.description);
              setAmount(exp.amount.toString());
              setPaidBy(exp.paidBy);
              setSplitAmong(exp.splitAmong);
              calculateSettlements(exp.splitAmong, exp.amount, exp.paidBy);
            }
          }
        }
      }
    };
    loadTrip();
  }, [tripId]);

  useEffect(() => {
    const loadCurrencySymbol = async () => {
      try {
        const stored = await AsyncStorage.getItem("currency");
        if (stored) {
          const currency = JSON.parse(stored);
          setCurrencySymbol(currency.symbol || "");
        }
      } catch (err) {
        console.log("Error loading currency symbol:", err);
      }
    };
    loadCurrencySymbol();
  }, []);

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
      .map((p) => `${p} owes ${payer} ${currencySymbol} ${share.toFixed(2)}`);
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
        let updatedExpenses;
        if (expenseId) {
          updatedExpenses = t.expenses.map((e) =>
            e.id === expenseId
              ? { ...e, description, amount: parseFloat(amount), paidBy, splitAmong }
              : e
          );
        } else {
          const newExp = {
            id: Date.now().toString(),
            description,
            amount: parseFloat(amount),
            paidBy,
            splitAmong,
          };
          updatedExpenses = t.expenses ? [...t.expenses, newExp] : [newExp];
        }
        return { ...t, expenses: updatedExpenses };
      }
      return t;
    });

    await AsyncStorage.setItem("trips", JSON.stringify(updatedTrips));
    navigation.goBack();
  };

  if (!trip)
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <Text style={[styles.loading, { color: colors.text }]}>Loading...</Text>
      </View>
    );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <Text style={[styles.label, { color: colors.text }]}>
        {expenseId ? "Edit Expense" : "Add New Expense"}
      </Text>

      <Text style={[styles.subLabel, { color: colors.text }]}>Description</Text>
      <TextInput
        placeholder="e.g. Lunch"
        placeholderTextColor={colors.subText}
        value={description}
        onChangeText={setDescription}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
      />

      <Text style={[styles.subLabel, { color: colors.text }]}>Amount</Text>
      <TextInput
        placeholder="e.g. 500"
        placeholderTextColor={colors.subText}
        value={amount}
        onChangeText={handleAmountChange}
        keyboardType="numeric"
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
      />

      <Text style={[styles.subLabel, { color: colors.text }]}>Paid By</Text>
      <View
        style={[
          styles.pickerContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Picker
          selectedValue={paidBy}
          onValueChange={handlePaidByChange}
          dropdownIconColor={colors.text}
          style={{ color: colors.text }}
        >
          {trip.people.map((person, index) => (
            <Picker.Item key={index} label={person} value={person} />
          ))}
        </Picker>
      </View>

      <Text style={[styles.subLabel, { color: colors.text }]}>Split Among</Text>
      <View style={styles.checkboxContainer}>
        {trip.people.map((person, index) => (
          <View key={index} style={styles.checkboxRow}>
            <Checkbox
              value={splitAmong.includes(person)}
              onValueChange={() => toggleSplit(person)}
              color={splitAmong.includes(person) ? colors.primary : undefined}
            />
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              {person}
            </Text>
          </View>
        ))}
      </View>

      {settlements.length > 0 && (
        <View
          style={[
            styles.settlementContainer,
            { backgroundColor: colors.highlight },
          ]}
        >
          <Text style={[styles.label, { color: colors.text }]}>Settlement:</Text>
          {settlements.map((s, i) => (
            <Text key={i} style={[styles.settlementText, { color: colors.text }]}>
              {s}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title={expenseId ? "Save Changes" : "Save Expense"}
          onPress={saveExpense}
          color={colors.primary}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 80 },
  label: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subLabel: { fontSize: 16, fontWeight: "600", marginTop: 15, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  checkboxContainer: { marginTop: 10 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  checkboxLabel: { marginLeft: 8, fontSize: 16 },
  buttonContainer: { marginTop: 30, borderRadius: 8, overflow: "hidden" },
  settlementContainer: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
  },
  settlementText: { fontSize: 16, marginVertical: 2 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { fontSize: 18 },
});
