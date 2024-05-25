import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import Login from "../screens/Login";
import TabNavigator from "./TabNavigator";
import MediaPage from "../screens/MediaPage";
import SearchPage from "../screens/SearchPage";
import ActorPage from "../screens/ActorPage";

import useAuth from "../hooks/useAuth";

const Stack = createStackNavigator();

const StackNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        <>
          <Stack.Group>
            <Stack.Screen name="Home" component={TabNavigator} />
            <Stack.Screen name="MediaPage" component={MediaPage} />
            <Stack.Screen name="SearchPage" component={SearchPage} />
            <Stack.Screen name="ActorPage" component={ActorPage} />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;
