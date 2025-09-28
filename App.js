import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import TripsScreen from "./screens/TripsScreen";
import AddTrip from "./screens/AddTripScreen";
import TripDetailScreen from "./screens/TripDetailScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import 'react-native-gesture-handler';
import EditTripScreen from "./screens/EditTripScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Trips" component={TripsScreen} />
        <Stack.Screen name="AddTrip" component={AddTrip} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="EditTrip" component={EditTripScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
