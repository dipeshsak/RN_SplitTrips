import React from "react";
import { StatusBar, useColorScheme } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import "react-native-gesture-handler";

import TripsScreen from "./screens/TripsScreen";
import AddTrip from "./screens/AddTripScreen";
import TripDetailScreen from "./screens/TripDetailScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import EditTripScreen from "./screens/EditTripScreen";

const Stack = createStackNavigator();

export default function App() {
  const scheme = useColorScheme(); // 'light' or 'dark'

  const MyLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f9f9f9",
      primary: "#2563EB",
      text: "#000",
    },
  };

  const MyDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: "#000",
      primary: "#3B82F6",
      text: "#fff",
    },
  };

  return (
    <NavigationContainer theme={scheme === "dark" ? MyDarkTheme : MyLightTheme}>
      <StatusBar
        backgroundColor={scheme === "dark" ? "#000" : "#2563EB"}
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: scheme === "dark" ? "#3B82F6" : "#2563EB",
          },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="Trips" component={TripsScreen} options={{ title: "My Trips" }} />
        <Stack.Screen name="AddTrip" component={AddTrip} options={{ title: "Add New Trip" }} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: "Trip Details" }} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: "Add Expense" }}/>
        <Stack.Screen name="EditTrip" component={EditTripScreen}  options={{ title: "Edit Trip" }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
