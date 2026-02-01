import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

// Offline currency data
const currencies = [
  { country: "Afghanistan", currency: "Afghani", code: "AFN", symbol: "؋" },
  { country: "Albania", currency: "Lek", code: "ALL", symbol: "L" },
  { country: "Algeria", currency: "Algerian Dinar", code: "DZD", symbol: "د.ج" },
  { country: "Andorra", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Angola", currency: "Kwanza", code: "AOA", symbol: "Kz" },
  { country: "Antigua and Barbuda", currency: "East Caribbean Dollar", code: "XCD", symbol: "$" },
  { country: "Argentina", currency: "Argentine Peso", code: "ARS", symbol: "$" },
  { country: "Armenia", currency: "Dram", code: "AMD", symbol: "֏" },
  { country: "Australia", currency: "Australian Dollar", code: "AUD", symbol: "$" },
  { country: "Austria", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Azerbaijan", currency: "Manat", code: "AZN", symbol: "₼" },
  { country: "Bahamas", currency: "Bahamian Dollar", code: "BSD", symbol: "$" },
  { country: "Bahrain", currency: "Bahraini Dinar", code: "BHD", symbol: "د.ب" },
  { country: "Bangladesh", currency: "Taka", code: "BDT", symbol: "৳" },
  { country: "Barbados", currency: "Barbadian Dollar", code: "BBD", symbol: "$" },
  { country: "Belarus", currency: "Belarusian Ruble", code: "BYN", symbol: "Br" },
  { country: "Belgium", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Belize", currency: "Belize Dollar", code: "BZD", symbol: "$" },
  { country: "Benin", currency: "West African CFA franc", code: "XOF", symbol: "₣" },
  { country: "Bhutan", currency: "Ngultrum", code: "BTN", symbol: "Nu." },
  { country: "Bolivia", currency: "Boliviano", code: "BOB", symbol: "Bs" },
  { country: "Bosnia and Herzegovina", currency: "Convertible Mark", code: "BAM", symbol: "KM" },
  { country: "Botswana", currency: "Pula", code: "BWP", symbol: "P" },
  { country: "Brazil", currency: "Brazilian Real", code: "BRL", symbol: "R$" },
  { country: "Brunei", currency: "Brunei Dollar", code: "BND", symbol: "$" },
  { country: "Bulgaria", currency: "Bulgarian Lev", code: "BGN", symbol: "лв" },
  { country: "Burkina Faso", currency: "West African CFA franc", code: "XOF", symbol: "₣" },
  { country: "Burundi", currency: "Burundian Franc", code: "BIF", symbol: "Fr" },
  { country: "Cambodia", currency: "Riel", code: "KHR", symbol: "៛" },
  { country: "Cameroon", currency: "Central African CFA franc", code: "XAF", symbol: "₣" },
  { country: "Canada", currency: "Canadian Dollar", code: "CAD", symbol: "$" },
  { country: "Cape Verde", currency: "Cape Verdean Escudo", code: "CVE", symbol: "$" },
  { country: "Cayman Islands", currency: "Cayman Islands Dollar", code: "KYD", symbol: "$" },
  { country: "Central African Republic", currency: "Central African CFA franc", code: "XAF", symbol: "₣" },
  { country: "Chad", currency: "Central African CFA franc", code: "XAF", symbol: "₣" },
  { country: "Chile", currency: "Chilean Peso", code: "CLP", symbol: "$" },
  { country: "China", currency: "Yuan Renminbi", code: "CNY", symbol: "¥" },
  { country: "Colombia", currency: "Colombian Peso", code: "COP", symbol: "$" },
  { country: "Comoros", currency: "Comorian Franc", code: "KMF", symbol: "CF" },
  { country: "Congo (Brazzaville)", currency: "Central African CFA franc", code: "XAF", symbol: "₣" },
  { country: "Congo (Kinshasa)", currency: "Congolese Franc", code: "CDF", symbol: "₣" },
  { country: "Costa Rica", currency: "Costa Rican Colón", code: "CRC", symbol: "₡" },
  { country: "Croatia", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Cuba", currency: "Cuban Peso", code: "CUP", symbol: "$" },
  { country: "Cyprus", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Czech Republic", currency: "Czech Koruna", code: "CZK", symbol: "Kč" },
  { country: "Denmark", currency: "Danish Krone", code: "DKK", symbol: "kr" },
  { country: "Djibouti", currency: "Djiboutian Franc", code: "DJF", symbol: "Fdj" },
  { country: "Dominica", currency: "East Caribbean Dollar", code: "XCD", symbol: "$" },
  { country: "Dominican Republic", currency: "Dominican Peso", code: "DOP", symbol: "$" },
  { country: "East Timor", currency: "United States Dollar", code: "USD", symbol: "$" },
  { country: "Ecuador", currency: "United States Dollar", code: "USD", symbol: "$" },
  { country: "Egypt", currency: "Egyptian Pound", code: "EGP", symbol: "ج.م" },
  { country: "El Salvador", currency: "United States Dollar", code: "USD", symbol: "$" },
  { country: "Equatorial Guinea", currency: "Central African CFA franc", code: "XAF", symbol: "₣" },
  { country: "Eritrea", currency: "Nakfa", code: "ERN", symbol: "Nfk" },
  { country: "Estonia", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Eswatini", currency: "Lilangeni", code: "SZL", symbol: "E" },
  { country: "Ethiopia", currency: "Birr", code: "ETB", symbol: "Br" },
  { country: "Fiji", currency: "Fijian Dollar", code: "FJD", symbol: "$" },
  { country: "Finland", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "France", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Gabon", currency: "Central African CFA franc", code: "XAF", symbol: "₣" },
  { country: "Gambia", currency: "Dalasi", code: "GMD", symbol: "D" },
  { country: "Georgia", currency: "Lari", code: "GEL", symbol: "₾" },
  { country: "Germany", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Ghana", currency: "Ghanaian Cedi", code: "GHS", symbol: "₵" },
  { country: "Greece", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Grenada", currency: "East Caribbean Dollar", code: "XCD", symbol: "$" },
  { country: "Guatemala", currency: "Quetzal", code: "GTQ", symbol: "Q" },
  { country: "Guinea", currency: "Guinean Franc", code: "GNF", symbol: "Fr" },
  { country: "Guinea-Bissau", currency: "West African CFA franc", code: "XOF", symbol: "₣" },
  { country: "Guyana", currency: "Guyanese Dollar", code: "GYD", symbol: "$" },
  { country: "Haiti", currency: "Gourde", code: "HTG", symbol: "G" },
  { country: "Honduras", currency: "Lempira", code: "HNL", symbol: "L" },
  { country: "Hong Kong", currency: "Hong Kong Dollar", code: "HKD", symbol: "HK$" },
  { country: "Hungary", currency: "Forint", code: "HUF", symbol: "Ft" },
  { country: "Iceland", currency: "Icelandic Króna", code: "ISK", symbol: "kr" },
  { country: "India", currency: "Indian Rupee", code: "INR", symbol: "₹" },
  { country: "Indonesia", currency: "Rupiah", code: "IDR", symbol: "Rp" },
  { country: "Iran", currency: "Iranian Rial", code: "IRR", symbol: "﷼" },
  { country: "Iraq", currency: "Iraqi Dinar", code: "IQD", symbol: "ع.د" },
  { country: "Ireland", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Israel", currency: "New Israeli Shekel", code: "ILS", symbol: "₪" },
  { country: "Italy", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Jamaica", currency: "Jamaican Dollar", code: "JMD", symbol: "J$" },
  { country: "Japan", currency: "Yen", code: "JPY", symbol: "¥" },
  { country: "Jordan", currency: "Jordanian Dinar", code: "JOD", symbol: "د.ا" },
  { country: "Kazakhstan", currency: "Tenge", code: "KZT", symbol: "₸" },
  { country: "Kenya", currency: "Kenyan Shilling", code: "KES", symbol: "Sh" },
  { country: "Kiribati", currency: "Australian Dollar", code: "AUD", symbol: "$" },
  { country: "Kosovo", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Kuwait", currency: "Kuwaiti Dinar", code: "KWD", symbol: "د.ك" },
  { country: "Kyrgyzstan", currency: "Som", code: "KGS", symbol: "с" },
  { country: "Laos", currency: "Kip", code: "LAK", symbol: "₭" },
  { country: "Latvia", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Lebanon", currency: "Lebanese Pound", code: "LBP", symbol: "ل.ل" },
  { country: "Lesotho", currency: "Loti", code: "LSL", symbol: "L" },
  { country: "Liberia", currency: "Liberian Dollar", code: "LRD", symbol: "$" },
  { country: "Libya", currency: "Libyan Dinar", code: "LYD", symbol: "ل.د" },
  { country: "Liechtenstein", currency: "Swiss Franc", code: "CHF", symbol: "CHF" },
  { country: "Lithuania", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Luxembourg", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Madagascar", currency: "Malagasy Ariary", code: "MGA", symbol: "Ar" },
  { country: "Malawi", currency: "Kwacha", code: "MWK", symbol: "MK" },
  { country: "Malaysia", currency: "Malaysian Ringgit", code: "MYR", symbol: "RM" },
  { country: "Maldives", currency: "Rufiyaa", code: "MVR", symbol: "Rf" },
  { country: "Mali", currency: "West African CFA franc", code: "XOF", symbol: "₣" },
  { country: "Malta", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Marshall Islands", currency: "United States Dollar", code: "USD", symbol: "$" },
  { country: "Mauritania", currency: "Ouguiya", code: "MRU", symbol: "UM" },
  { country: "Mauritius", currency: "Mauritian Rupee", code: "MUR", symbol: "₨" },
  { country: "Mexico", currency: "Mexican Peso", code: "MXN", symbol: "$" },
  { country: "Micronesia", currency: "United States Dollar", code: "USD", symbol: "$" },
  { country: "Moldova", currency: "Leu", code: "MDL", symbol: "L" },
  { country: "Monaco", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Mongolia", currency: "Tugrik", code: "MNT", symbol: "₮" },
  { country: "Montenegro", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Morocco", currency: "Moroccan Dirham", code: "MAD", symbol: "د.م." },
  { country: "Mozambique", currency: "Metical", code: "MZN", symbol: "MT" },
  { country: "Myanmar", currency: "Kyat", code: "MMK", symbol: "Ks" },
  { country: "Namibia", currency: "Namibian Dollar", code: "NAD", symbol: "$" },
  { country: "Nauru", currency: "Australian Dollar", code: "AUD", symbol: "$" },
  { country: "Nepal", currency: "Nepalese Rupee", code: "NPR", symbol: "₨" },
  { country: "Netherlands", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "New Zealand", currency: "New Zealand Dollar", code: "NZD", symbol: "$" },
  { country: "Nicaragua", currency: "Córdoba", code: "NIO", symbol: "C$" },
  { country: "Niger", currency: "West African CFA franc", code: "XOF", symbol: "₣" },
  { country: "Nigeria", currency: "Naira", code: "NGN", symbol: "₦" },
  { country: "North Korea", currency: "North Korean Won", code: "KPW", symbol: "₩" },
  { country: "North Macedonia", currency: "Denar", code: "MKD", symbol: "ден" },
  { country: "Norway", currency: "Norwegian Krone", code: "NOK", symbol: "kr" },
  { country: "Oman", currency: "Omani Rial", code: "OMR", symbol: "ر.ع" },
  { country: "Pakistan", currency: "Pakistani Rupee", code: "PKR", symbol: "₨" },
  { country: "Palau", currency: "United States Dollar", code: "USD", symbol: "$" },
  { country: "Palestine", currency: "Israeli Shekel", code: "ILS", symbol: "₪" },
  { country: "Panama", currency: "Balboa / United States Dollar", code: "PAB / USD", symbol: "B/." },
  { country: "Papua New Guinea", currency: "Kina", code: "PGK", symbol: "K" },
  { country: "Paraguay", currency: "Guarani", code: "PYG", symbol: "₲" },
  { country: "Peru", currency: "Sol", code: "PEN", symbol: "S/." },
  { country: "Philippines", currency: "Philippine Peso", code: "PHP", symbol: "₱" },
  { country: "Poland", currency: "Zloty", code: "PLN", symbol: "zł" },
  { country: "Portugal", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Qatar", currency: "Qatari Riyal", code: "QAR", symbol: "ر.ق" },
  { country: "Romania", currency: "Romanian Leu", code: "RON", symbol: "lei" },
  { country: "Russia", currency: "Russian Ruble", code: "RUB", symbol: "₽" },
  { country: "Rwanda", currency: "Rwandan Franc", code: "RWF", symbol: "Fr" },
  { country: "Saint Kitts and Nevis", currency: "East Caribbean Dollar", code: "XCD", symbol: "$" },
  { country: "Saint Lucia", currency: "East Caribbean Dollar", code: "XCD", symbol: "$" },
  { country: "Saint Vincent and the Grenadines", currency: "East Caribbean Dollar", code: "XCD", symbol: "$" },
  { country: "Samoa", currency: "Tala", code: "WST", symbol: "T" },
  { country: "San Marino", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Sao Tome and Principe", currency: "Dobra", code: "STN", symbol: "Db" },
  { country: "Saudi Arabia", currency: "Saudi Riyal", code: "SAR", symbol: "ر.س" },
  { country: "Senegal", currency: "West African CFA franc", code: "XOF", symbol: "₣" },
  { country: "Serbia", currency: "Serbian Dinar", code: "RSD", symbol: "дин." },
  { country: "Seychelles", currency: "Seychellois Rupee", code: "SCR", symbol: "₨" },
  { country: "Sierra Leone", currency: "Leone", code: "SLL", symbol: "Le" },
  { country: "Singapore", currency: "Singapore Dollar", code: "SGD", symbol: "$" },
  { country: "Slovakia", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Slovenia", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Solomon Islands", currency: "Solomon Islands Dollar", code: "SBD", symbol: "$" },
  { country: "Somalia", currency: "Somali Shilling", code: "SOS", symbol: "Sh" },
  { country: "South Africa", currency: "Rand", code: "ZAR", symbol: "R" },
  { country: "South Korea", currency: "Won", code: "KRW", symbol: "₩" },
  { country: "South Sudan", currency: "South Sudanese Pound", code: "SSP", symbol: "£" },
  { country: "Spain", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Sri Lanka", currency: "Sri Lankan Rupee", code: "LKR", symbol: "₨" },
  { country: "Sudan", currency: "Sudanese Pound", code: "SDG", symbol: "£" },
  { country: "Suriname", currency: "Surinamese Dollar", code: "SRD", symbol: "$" },
  { country: "Sweden", currency: "Swedish Krona", code: "SEK", symbol: "kr" },
  { country: "Switzerland", currency: "Swiss Franc", code: "CHF", symbol: "CHF" },
  { country: "Syria", currency: "Syrian Pound", code: "SYP", symbol: "£" },
  { country: "Taiwan", currency: "New Taiwan Dollar", code: "TWD", symbol: "NT$" },
  { country: "Tajikistan", currency: "Somoni", code: "TJS", symbol: "ЅМ" },
  { country: "Tanzania", currency: "Tanzanian Shilling", code: "TZS", symbol: "Sh" },
  { country: "Thailand", currency: "Baht", code: "THB", symbol: "฿" },
  { country: "Togo", currency: "West African CFA franc", code: "XOF", symbol: "₣" },
  { country: "Tonga", currency: "Paʻanga", code: "TOP", symbol: "T$" },
  { country: "Trinidad and Tobago", currency: "Trinidad and Tobago Dollar", code: "TTD", symbol: "$" },
  { country: "Tunisia", currency: "Tunisian Dinar", code: "TND", symbol: "د.ت" },
  { country: "Turkey", currency: "Turkish Lira", code: "TRY", symbol: "₺" },
  { country: "Turkmenistan", currency: "Turkmenistan Manat", code: "TMT", symbol: "m" },
  { country: "Tuvalu", currency: "Australian Dollar", code: "AUD", symbol: "$" },
  { country: "Uganda", currency: "Ugandan Shilling", code: "UGX", symbol: "Sh" },
  { country: "Ukraine", currency: "Hryvnia", code: "UAH", symbol: "₴" },
  { country: "United Arab Emirates", currency: "UAE Dirham", code: "AED", symbol: "د.إ" },
  { country: "United Kingdom", currency: "Pound Sterling", code: "GBP", symbol: "£" },
  { country: "United States", currency: "US Dollar", code: "USD", symbol: "$" },
  { country: "Uruguay", currency: "Uruguayan Peso", code: "UYU", symbol: "$" },
  { country: "Uzbekistan", currency: "Uzbekistani Som", code: "UZS", symbol: "сўм" },
  { country: "Vanuatu", currency: "Vatu", code: "VUV", symbol: "VT" },
  { country: "Vatican City", currency: "Euro", code: "EUR", symbol: "€" },
  { country: "Venezuela", currency: "Venezuelan Bolívar", code: "VES", symbol: "Bs.S" },
  { country: "Vietnam", currency: "Dong", code: "VND", symbol: "₫" },
  { country: "Yemen", currency: "Yemeni Rial", code: "YER", symbol: "﷼" },
  { country: "Zambia", currency: "Zambian Kwacha", code: "ZMW", symbol: "ZK" },
  { country: "Zimbabwe", currency: "Zimbabwe Dollar", code: "ZWL", symbol: "$" }
];

export default function AddTripScreen({ navigation }) {
  const [tripName, setTripName] = useState("");
  const [people, setPeople] = useState([]);
  const [personName, setPersonName] = useState("");
  const [currency, setCurrency] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const scheme = useColorScheme(); // Detect dark/light

  const colors = {
    bg: scheme === "dark" ? "#121212" : "#f2f2f2",
    card: scheme === "dark" ? "#1e1e1e" : "#fff",
    inputBg: scheme === "dark" ? "#1a1a1a" : "#fff",
    text: scheme === "dark" ? "#fff" : "#000",
    subText: scheme === "dark" ? "#aaa" : "#555",
    primary: "#007AFF",
    danger: "#FF3B30",
    border: scheme === "dark" ? "#333" : "#ccc",
    shadow: scheme === "dark" ? "#000" : "#aaa",
    overlay: "rgba(0,0,0,0.5)",
  };

  const addPerson = () => {
    if (personName.trim()) {
      setPeople([...people, personName.trim()]);
      setPersonName("");
    }
  };

  const removePerson = (index) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  const saveTrip = async () => {
    if (!tripName.trim()) return alert("Please enter a trip name.");
    if (people.length < 2) return alert("Add at least two people.");
    if (!currency) return alert("Please select a currency.");

    const stored = await AsyncStorage.getItem("trips");
    const trips = stored ? JSON.parse(stored) : [];

    const newTrips = [
      ...trips,
      {
        id: Date.now().toString(),
        name: tripName.trim(),
        people,
        currency: currency.code,
        expenses: [],
      },
    ];

    await AsyncStorage.setItem("trips", JSON.stringify(newTrips));
    await AsyncStorage.setItem("currency", JSON.stringify(currency));
    navigation.goBack();
  };

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.country.toLowerCase().includes(searchText.toLowerCase()) ||
      c.currency.toLowerCase().includes(searchText.toLowerCase()) ||
      c.symbol.includes(searchText)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.heading, { color: colors.text }]}>
        Create New Trip
      </Text>

      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
        ]}
        placeholder="Trip Name"
        placeholderTextColor={colors.subText}
        value={tripName}
        onChangeText={setTripName}
      />

      {/* Currency Selector */}
      <Text style={[styles.label, { color: colors.text }]}>Select Currency</Text>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          { backgroundColor: colors.inputBg, borderColor: colors.border },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.dropdownText, { color: colors.text }]}>
          {currency
            ? `${currency.symbol} ${currency.currency} (${currency.country})`
            : "Select Currency"}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>

      {/* Currency Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[
                styles.searchInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="Search country/currency/symbol"
              placeholderTextColor={colors.subText}
              value={searchText}
              onChangeText={setSearchText}
            />
            <ScrollView>
              {filteredCurrencies.map((item) => (
                <TouchableOpacity
                  key={item.country}
                  style={[
                    styles.modalItem,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    setCurrency(item);
                    setModalVisible(false);
                    setSearchText("");
                  }}
                >
                  <Text style={[styles.modalText, { color: colors.text }]}>
                    {item.symbol} {item.currency} ({item.country})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add People */}
      <View style={styles.row}>
        <TextInput
          style={[
            styles.input,
            { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
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
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.person, { color: colors.text }]}>• {item}</Text>
            <TouchableOpacity onPress={() => removePerson(index)}>
              <MaterialIcons name="close" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Save / Cancel Buttons */}
      <View style={{ marginTop: 30 }}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={saveTrip}
        >
          <Text style={styles.saveText}>Save Trip</Text>
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
    borderWidth: 1,
  },
  person: { fontSize: 16 },
  saveButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  label: { fontSize: 16, marginBottom: 6, fontWeight: "600" },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 15,
  },
  dropdownText: { fontSize: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    borderRadius: 14,
    maxHeight: 400,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    margin: 10,
    fontSize: 16,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  modalText: { fontSize: 16 },
});
