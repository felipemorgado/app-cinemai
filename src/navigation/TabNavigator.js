import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import Profile from "../screens/Profile";
import ListIA from "../screens/ListIA";

import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="HomeTab"
        component={Home}
        options={{
          // tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: "white",
          tabBarStyle: {
            backgroundColor: "black",
          },
          tabBarShowLabel: false,
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => {
            return <Feather name="home" color={color} size={size} />;
          },
        }}
      />

      <Tab.Screen
        name="ListIATab"
        component={ListIA}
        options={{
          tabBarActiveTintColor: "white",
          tabBarStyle: {
            backgroundColor: "black",
          },
          tabBarShowLabel: false,
          headerShown: false,
          tabBarLabel: "ListIA",
          tabBarIcon: ({ color, size }) => {
            return (
              <MaterialCommunityIcons
                name="lightning-bolt"
                color={color}
                size={size}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{
          tabBarActiveTintColor: "white",
          tabBarStyle: {
            backgroundColor: "black",
          },
          tabBarShowLabel: false,
          headerShown: false,
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="person" color={color} size={size} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
