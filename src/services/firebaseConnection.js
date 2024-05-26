// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, EmailAuthProvider } from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBs2R68Yxa88iDIpWhTnz7Ho4Ml4aOEt_g",
  authDomain: "app-filmes-test-73c7a.firebaseapp.com",
  projectId: "app-filmes-test-73c7a",
  storageBucket: "app-filmes-test-73c7a.appspot.com",
  messagingSenderId: "367808959131",
  appId: "1:367808959131:web:a551a84de4689750882c3e",
};

// Initialize Firebase
let app, auth;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    console.log("Error initializing app: " + error);
  }
} else {
  app = getApp();
  auth = getAuth(app);
}

const provider = new EmailAuthProvider();

export { app, auth, provider };
