import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import Toast from "react-native-toast-message";

import { AuthProvider } from "./src/hooks/useAuth";
import { View, Text } from "./src/screens/Login/styles";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useEffect } from "react";
import React from "react";

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <StackNavigator />
        <Toast
          config={{
            fav: (internalState) => (
              <View
                style={{
                  marginTop: 50,
                  width: "90%",
                  backgroundColor: "white",
                  borderRadius: 20,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignContent: "center",
                  borderWidth: 2,
                  borderColor: "black",
                }}
              >
                <FontAwesome
                  name="heart"
                  size={30}
                  color="red"
                  style={{ marginRight: 10 }}
                />
                <Text style={{ color: "black", fontSize: 20 }}>
                  {internalState.text1}
                </Text>
              </View>
            ),
            watch: (internalState) => (
              <View
                style={{
                  marginTop: 50,
                  width: "90%",
                  backgroundColor: "white",
                  borderRadius: 20,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignContent: "center",
                  borderWidth: 2,
                  borderColor: "black",
                }}
              >
                <FontAwesome
                  name="check"
                  size={30}
                  color="green"
                  style={{ marginRight: 10 }}
                />
                <Text style={{ color: "black", fontSize: 20, marginBottom: 1 }}>
                  {internalState.text1}
                </Text>
              </View>
            ),
            error: (internalState) => (
              <View
                style={{
                  marginTop: 50,
                  width: "90%",
                  backgroundColor: "white",
                  borderRadius: 20,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignContent: "center",
                  borderWidth: 2,
                  borderColor: "black",
                }}
              >
                <Text style={{ color: "black", fontSize: 20 }}>
                  {internalState.text1}
                </Text>
              </View>
            ),
            loading: (internalState) => (
              <View
                style={{
                  marginTop: 50,
                  width: "90%",
                  backgroundColor: "white",
                  borderRadius: 20,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignContent: "center",
                  borderWidth: 2,
                  borderColor: "black",
                }}
              >
                <Text style={{ color: "black", fontSize: 20 }}>
                  {internalState.text1}
                </Text>
              </View>
            ),
          }}
        />
      </AuthProvider>
    </NavigationContainer>
  );
}
