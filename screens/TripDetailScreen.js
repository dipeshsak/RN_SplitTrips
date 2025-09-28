import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { MaterialIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

export default function TripDetailScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [settlements, setSettlements] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const stored = await AsyncStorage.getItem("trips");
      if (stored) {
        const trips = JSON.parse(stored);
        const found = trips.find((t) => t.id === tripId);
        if (found) {
          setTrip(found);
          setSettlements(calculateSettlements(found));
        }
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Calculate who owes whom
  const calculateSettlements = (trip) => {
    if (!trip?.expenses) return [];

    const balances = {};
    trip.people.forEach((p) => (balances[p] = 0));

    trip.expenses.forEach((exp) => {
      const share = exp.amount / exp.splitAmong.length;
      exp.splitAmong.forEach((p) => {
        balances[p] -= share;
        balances[exp.paidBy] += share;
      });
    });

    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([person, amount]) => {
      if (amount < 0) debtors.push({ person, amount: -amount });
      else if (amount > 0) creditors.push({ person, amount });
    });

    const result = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debt = debtors[i];
      const credit = creditors[j];
      const payment = Math.min(debt.amount, credit.amount);

      result.push({ debtor: debt.person, creditor: credit.person, amount: payment });

      debt.amount -= payment;
      credit.amount -= payment;

      if (debt.amount <= 0) i++;
      if (credit.amount <= 0) j++;
    }

    return result;
  };

  const copyAllSettlements = () => {
    if (settlements.length === 0) return;
    const text = settlements
      .map((s) => `${s.debtor} pays ₹${s.amount.toFixed(2)} to ${s.creditor}`)
      .join("\n");
    Clipboard.setStringAsync(text);
    Alert.alert("Copied!", "All settlement info copied to clipboard.");
  };

  const deleteExpense = async (expenseId) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedExpenses = trip.expenses.filter((e) => e.id !== expenseId);
            const stored = await AsyncStorage.getItem("trips");
            let trips = stored ? JSON.parse(stored) : [];
            trips = trips.map((t) =>
              t.id === trip.id ? { ...t, expenses: updatedExpenses } : t
            );
            await AsyncStorage.setItem("trips", JSON.stringify(trips));
            setTrip({ ...trip, expenses: updatedExpenses });
            setSettlements(calculateSettlements({ ...trip, expenses: updatedExpenses }));
          },
        },
      ]
    );
  };

  if (!trip) return <Text style={styles.loading}>Loading...</Text>;

  const renderRightActions = (expenseId) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteExpense(expenseId)}
      >
        <MaterialIcons name="delete" size={28} color="#fff" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={trip.expenses}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>{trip.name}</Text>
            <Text>Members: {trip.people.join(", ")}</Text>

            <Text style={styles.subheading}>Expenses:</Text>
            {trip.expenses.length === 0 && <Text>No expenses yet</Text>}

            <View style={styles.settlementHeader}>
              <Text style={styles.subheading}>Who Pays Whom:</Text>
              {settlements.length > 0 && (
                <TouchableOpacity style={styles.copyAllButton} onPress={copyAllSettlements}>
                  <Text style={styles.copyAllText}>Copy All</Text>
                </TouchableOpacity>
              )}
            </View>

            {settlements.length === 0 ? (
              <Text>All settled</Text>
            ) : (
              settlements.map((s, i) => (
                <View key={i} style={styles.settlementCard}>
                  <Text style={styles.settlementText}>
                    <Text style={styles.debtorText}>{s.debtor}</Text> pays ₹{s.amount.toFixed(2)} to{" "}
                    <Text style={styles.creditorText}>{s.creditor}</Text>
                  </Text>
                </View>
              ))
            )}
          </>
        }
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <View style={styles.expenseCard}>
              <Text style={styles.expenseText}>{item.description}</Text>
              <Text>₹{item.amount} paid by {item.paidBy}</Text>
              <Text style={styles.splitText}>Split among: {item.splitAmong.join(", ")}</Text>
            </View>
          </Swipeable>
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      />

      <TouchableOpacity
        style={styles.addButtonFixed}
        onPress={() => navigation.navigate("AddExpense", { tripId })}
      >
        <Text style={styles.addText}>＋ Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subheading: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  expenseCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
  },
  expenseText: { fontWeight: "bold", fontSize: 16 },
  splitText: { fontSize: 14, color: "#555", marginTop: 4 },
  settlementHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 },
  copyAllButton: { backgroundColor: "#007AFF", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  copyAllText: { color: "#fff", fontWeight: "bold" },
  settlementCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  settlementText: { fontSize: 16 },
  debtorText: { color: "#d9534f", fontWeight: "bold" },
  creditorText: { color: "#28a745", fontWeight: "bold" },
  addButtonFixed: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  loading: { fontSize: 18, padding: 20 },
  deleteButton: {
    backgroundColor: "#d9534f",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    marginVertical: 8,
    borderRadius: 10,
  },
});
