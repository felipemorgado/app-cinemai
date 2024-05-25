import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Loading = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgb(10, 2, 29)",
      }}
    >
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
};

export default Loading;
