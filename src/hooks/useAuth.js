import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebaseConnection";

const AuthContenxt = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoadingInitial(false);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
        console.error("Erro ao deslogar: ", error);
      });
  };

  const memoizedValue = useMemo(() => {
    return { user, setUser, loading, setLoading, logout };
  }, [user, loading]);

  return (
    <AuthContenxt.Provider value={memoizedValue}>
      {!loadingInitial && children}
    </AuthContenxt.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContenxt);
}
