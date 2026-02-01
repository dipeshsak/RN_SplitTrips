import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { MaterialIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

export default function TripDetailScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState("");
  
  const scheme = useColorScheme(); //  Detects 'light' or 'dark'

  const colors = {
    bg: scheme === "dark" ? "#121212" : "#f2f2f2",
    card: scheme === "dark" ? "#1e1e1e" : "#fff",
    text: scheme === "dark" ? "#fff" : "#000",
    subText: scheme === "dark" ? "#aaa" : "#555",
    primary: "#007AFF",
    success: "#22C55E",
    danger: "#d9534f",
    border: scheme === "dark" ? "#333" : "#ddd",
  };

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

    useEffect(() => {
  const loadCurrencySymbol = async () => {
    try {
      const stored = await AsyncStorage.getItem("currency");
      if (stored) {
        const currency = JSON.parse(stored); // stored currency object
        setCurrencySymbol(currency.symbol || ""); // only symbol
      }
    } catch (err) {
      console.log("Error loading currency symbol:", err);
    }
  };

  loadCurrencySymbol();
}, []);

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
    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debt = debtors[i];
      const credit = creditors[j];
      const payment = Math.min(debt.amount, credit.amount);
      result.push({
        debtor: debt.person,
        creditor: credit.person,
        amount: payment,
      });
      debt.amount -= payment;
      credit.amount -= payment;
      if (debt.amount <= 0) i++;
      if (credit.amount <= 0) j++;
    }
    return result;
  };

  const generateTripText = () => {
    if (!trip) return "";
    let text = `Trip: ${trip.name}\nMembers: ${trip.people.join(", ")}\n\nExpenses:\n`;

    if (trip.expenses.length === 0) {
      text += "No expenses yet\n";
    } else {
      trip.expenses.forEach((e, i) => {
        text += `${i + 1}. ${e.description} - ${currencySymbol} ${e.amount} paid by ${
          e.paidBy
        } (Split: ${e.splitAmong.join(", ")})\n`;
      });
    }

    text += "\nSettlements:\n";
    if (settlements.length === 0) {
      text += "All settled\n";
    } else {
      settlements.forEach((s, i) => {
        text += `${i + 1}. ${s.debtor} pays ${currencySymbol} ${s.amount.toFixed(2)} to ${s.creditor}\n`;
      });
    }

    return text;
  };

  const copyAllSettlements = () => {
    const text = generateTripText();
    Clipboard.setStringAsync(text);
    Alert.alert("Copied!", "All trip details copied to clipboard.");
  };

  const shareTripDetails = async () => {
    try {
      const text = generateTripText();
      await Share.share({ message: text });
    } catch (error) {
      Alert.alert("Error", "Unable to share trip details");
    }
  };

  const deleteExpense = async (expenseId) => {
    Alert.alert("Delete Expense", "Are you sure you want to delete this expense?", [
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
    ]);
  };

  if (!trip)
    return <Text style={[styles.loading, { color: colors.text }]}>Loading...</Text>;

  const renderRightActions = (expenseId) => (
    <View style={{ flexDirection: "row", marginLeft:10 }}>
      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: colors.success }]}
        onPress={() => navigation.navigate("AddExpense", { tripId, expenseId })}
      >
        <MaterialIcons name="edit" size={26} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: colors.danger }]}
        onPress={() => deleteExpense(expenseId)}
      >
        <MaterialIcons name="delete" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <FlatList
        data={trip.expenses}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={
          <>
            <Text style={[styles.heading, { color: colors.text }]}>{trip.name}</Text>
            <Text style={{ color: colors.subText,marginBottom:20 }}>
              Members: {trip.people.join(", ")}
            </Text>
            <Text style={[styles.subheading, { color: colors.text }]}>Expenses:</Text>
            {trip.expenses.length === 0 && (
              <Text style={{ color: colors.subText }}>No expenses yet</Text>
            )}

            {settlements.length === 0 ? <View><Text></Text></View> :<View style={styles.settlementHeader}>
              <Text style={[styles.subheading, { color: colors.text }]}>
                Who Pays Whom:
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={[styles.copyAllButton, { backgroundColor: colors.primary }]}
                  onPress={copyAllSettlements}
                >
                  <MaterialIcons name="content-copy" size={18} color={colors.card} />
                  <Text style={styles.copyAllText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.shareButton, { backgroundColor: colors.success }]}
                  onPress={shareTripDetails}
                >
                  <MaterialIcons name="share" size={18} color={colors.card} />
                  <Text style={styles.copyAllText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
           }

            {settlements.length === 0 ? (
              <Text style={{ color: colors.subText }}></Text>
            ) : (
              settlements.map((s, i) => (
                <View
                  key={i}
                  style={[
                    styles.settlementCard,
                    { backgroundColor: colors.card, borderLeftColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.settlementText, { color: colors.text }]}>
                    <Text style={{ color: colors.danger, fontWeight: "bold" }}>
                      {s.debtor}
                    </Text>{" "}
                    pays {currencySymbol} {s.amount.toFixed(2)} to{" "}
                    <Text style={{ color: colors.success, fontWeight: "bold" }}>
                      {s.creditor}
                    </Text>
                  </Text>
                </View>
              ))
            )}
          </>
        }
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <View
              style={[
                styles.expenseCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.expenseText, { color: colors.text }]}>
                {item.description}
              </Text>
              <Text style={{ color: colors.subText }}>
                {currencySymbol} {item.amount} paid by {item.paidBy}
              </Text>
              <Text style={[styles.splitText, { color: colors.subText }]}>
                Split among: {item.splitAmong.join(", ")}
              </Text>
            </View>
          </Swipeable>
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      />

      <TouchableOpacity
        style={[styles.addButtonFixed, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate("AddExpense", { tripId })}
      >
        <Text style={styles.addText}>＋ Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subheading: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  expenseCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  expenseText: { fontWeight: "bold", fontSize: 16 },
  splitText: { fontSize: 14, marginTop: 4 },
  settlementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10
  },
  copyAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems:"center",
    flexDirection:"row",
    gap:5
  },
  shareButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems:"center",
    flexDirection:"row",
    gap:5
  },
  copyAllText: { color: "#fff", fontWeight: "bold" },
  settlementCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  settlementText: { fontSize: 16 },
  addButtonFixed: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  loading: { fontSize: 18, padding: 20 },
  editButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    marginVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    marginVertical: 10,
    borderRadius: 10,
  },
});
