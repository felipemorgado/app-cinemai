import { View, Keyboard, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";

import * as S from "./styles";

import useAuth from "../../hooks/useAuth";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../services/firebaseConnection";

import { getDatabase, ref, set } from "firebase/database";
import { TextInput } from "react-native-gesture-handler";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { StatusBar } from "expo-status-bar";

const Login = () => {
  const [type, setType] = useState(1); //1 signIn 2 signUp

  const { loading, setLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorMessagePass, setErrorMessagePass] = useState(null);
  const [errorMessageName, setErrorMessageName] = useState(null);

  const [nameInputBorderColor, setNameInputBorderColor] = useState(
    S.textInputBorderColor
  );
  const [emailInputBorderColor, setEmailInputBorderColor] = useState(
    S.textInputBorderColor
  );
  const [passwordInputBorderColor, setPasswordInputBorderColor] = useState(
    S.textInputBorderColor
  );

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setErrorMessage(null); // Limpe a mensagem de erro
    setErrorMessagePass(null);
    setErrorMessageName(null);
    setNameInputBorderColor(S.textInputBorderColor);
    setEmailInputBorderColor(S.textInputBorderColor);
    setPasswordInputBorderColor(S.textInputBorderColor);
  }, [type]);

  const signIn = () => {
    Keyboard.dismiss();
    setLoading(false);
    signInWithEmailAndPassword(auth, email, password)
      .then(({ user }) => {
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        if (error.code === "auth/invalid-email") {
          setErrorMessage("E-mail inválido.");
          setEmailInputBorderColor("red"); // Define a borda do TextInput de email como vermelha
        } else if (error.code === "auth/missing-password") {
          setErrorMessagePass("Digite uma senha!");
          setPasswordInputBorderColor("red"); // Define a borda do TextInput de senha como vermelha
        } else if (error.code === "auth/invalid-credential") {
          setErrorMessage("E-mail ou senha incorretos!");
          setEmailInputBorderColor("red"); // Define a borda do TextInput de email como vermelha
        } else {
          console.log(error);
        }
      });
  };

  const signUp = () => {
    Keyboard.dismiss();
    const validEmails = ["@gmail.com", "@hotmail.com", "@outlook.com"];
    if (!validEmails.some((domain) => email.endsWith(domain))) {
      setErrorMessage(
        "E-mail inválido! Use @gmail.com, @hotmail.com ou @outlook.com."
      );
      setEmailInputBorderColor("red"); // Define a borda do TextInput de email como vermelha
      return;
    }

    // Validação do nome
    if (name.trim() === "" || name.length > 30) {
      setErrorMessageName(
        "O nome deve ter no mínimo 1 e no máximo 30 caracteres!"
      );
      setNameInputBorderColor("red"); // Define a borda do TextInput de nome como vermelha
      return;
    }

    setLoading(false);
    createUserWithEmailAndPassword(auth, email, password)
      .then(({ user }) => {
        updateProfile(user, { displayName: name });
        // Cria um novo nó no Realtime Database para o usuário
        const db = getDatabase();
        set(ref(db, "users/" + user.uid), {
          nome: name,
          genero: "",
          ator: "",
        });
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
        if (error.code === "auth/invalid-email") {
          setErrorMessage("E-mail inválido.");
          setEmailInputBorderColor("red"); // Define a borda do TextInput de email como vermelha
        } else if (error.code === "auth/missing-password") {
          setErrorMessagePass("Digite uma senha!");
          setPasswordInputBorderColor("red"); // Define a borda do TextInput de senha como vermelha
        } else if (error.code === "auth/weak-password") {
          setErrorMessagePass("A senha deve ter pelo menos 6 caracteres!");
          setPasswordInputBorderColor("red"); // Define a borda do TextInput de senha como vermelha
        } else if (error.code === "auth/email-already-in-use") {
          setErrorMessage("Esse e-mail já está sendo usado!");
          setEmailInputBorderColor("red"); // Define a borda do TextInput de email como vermelha
        } else {
          console.log(error);
        }
      });
  };

  const handleNameFocus = () => {
    setErrorMessageName(null);
    setNameInputBorderColor(S.textInputBorderColor);
  };

  const handleEmailFocus = () => {
    setErrorMessage(null);
    setEmailInputBorderColor(S.textInputBorderColor);
  };

  const handlePasswordFocus = () => {
    setErrorMessagePass(null);
    setPasswordInputBorderColor(S.textInputBorderColor);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <S.Container>
        <S.LoadingText>Loading...</S.LoadingText>
      </S.Container>
    );
  }

  return (
    <S.ViewContainer>
      <StatusBar style="light" backgroundColor="rgb(10, 2, 29)" />
      {type === 1 ? (
        <S.Container>
          <S.ViewHeader>
            <S.TextHeaderTitle>CinemAI</S.TextHeaderTitle>
          </S.ViewHeader>
          <S.SubTitle>Acesso à sua conta</S.SubTitle>
          <S.View>
            <S.Text>E-mail</S.Text>
            <TextInput
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => setEmail(text)}
              onFocus={handleEmailFocus}
              style={[
                styles.textInput,
                { borderColor: emailInputBorderColor, width: "100%" },
              ]}
            />

            {errorMessage && <S.ErrorText>{errorMessage}</S.ErrorText>}
            <S.Text>Senha</S.Text>
            <View
              style={{
                flexDirection: "row",
                width: "100%",
              }}
            >
              <TextInput
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => setPassword(text)}
                onFocus={handlePasswordFocus}
                style={[
                  styles.textInput,
                  {
                    borderColor: passwordInputBorderColor,
                    width: "85%",
                    borderRightWidth: 0,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                ]}
              />
              <View
                style={{
                  flex: 1,
                  backgroundColor: "black",
                  justifyContent: "center",
                  borderTopRightRadius: 8,
                  borderBottomRightRadius: 8,
                }}
              >
                <FontAwesome
                  name={showPassword ? "eye-slash" : "eye"} // Altera o ícone
                  size={25}
                  color="white"
                  style={{
                    marginBottom: 2,
                    alignSelf: "center",
                  }}
                  onPress={toggleShowPassword}
                />
              </View>
            </View>
            {errorMessagePass && <S.ErrorText>{errorMessagePass}</S.ErrorText>}
            <S.TouchableOpacity onPress={signIn}>
              <S.TouchableOpacityText>Entrar</S.TouchableOpacityText>
            </S.TouchableOpacity>
            <S.TouchableOpacitySwitch onPress={() => setType(2)}>
              <S.TOSwitchText>Não tem uma conta?</S.TOSwitchText>
            </S.TouchableOpacitySwitch>
          </S.View>
        </S.Container>
      ) : (
        <S.Container>
          <S.ViewHeader>
            <S.TextHeaderTitle>CinemAI</S.TextHeaderTitle>
          </S.ViewHeader>
          <S.SubTitle>Criar uma nova conta</S.SubTitle>
          <S.View>
            <S.Text>Nome</S.Text>
            <S.TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              onFocus={handleNameFocus}
              style={[
                styles.textInput,
                { borderColor: nameInputBorderColor, width: "100%" },
              ]}
            />
            {errorMessageName && <S.ErrorText>{errorMessageName}</S.ErrorText>}
            <S.Text>E-mail</S.Text>
            <TextInput
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => setEmail(text)}
              onFocus={handleEmailFocus}
              style={[
                styles.textInput,
                { borderColor: emailInputBorderColor, width: "100%" },
              ]}
            />
            {errorMessage && <S.ErrorText>{errorMessage}</S.ErrorText>}
            <S.Text>Senha</S.Text>
            <View
              style={{
                flexDirection: "row",
                width: "100%",
              }}
            >
              <TextInput
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => setPassword(text)}
                onFocus={handlePasswordFocus}
                style={[
                  styles.textInput,
                  {
                    borderColor: passwordInputBorderColor,
                    width: "85%",
                    borderRightWidth: 0,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                ]}
              />
              <View
                style={{
                  flex: 1,
                  backgroundColor: "black",
                  justifyContent: "center",
                  borderTopRightRadius: 8,
                  borderBottomRightRadius: 8,
                }}
              >
                <FontAwesome
                  name={showPassword ? "eye-slash" : "eye"} // Altera o ícone
                  size={25}
                  color="white"
                  style={{
                    marginBottom: 2,
                    alignSelf: "center",
                  }}
                  onPress={toggleShowPassword}
                />
              </View>
            </View>
            {errorMessagePass && <S.ErrorText>{errorMessagePass}</S.ErrorText>}
            <S.TouchableOpacity onPress={signUp}>
              <S.TouchableOpacityText>Cadastrar</S.TouchableOpacityText>
            </S.TouchableOpacity>
            <S.TouchableOpacitySwitch onPress={() => setType(1)}>
              <S.TOSwitchText>Já tem uma conta?</S.TOSwitchText>
            </S.TouchableOpacitySwitch>
          </S.View>
        </S.Container>
      )}
    </S.ViewContainer>
  );
};

const styles = StyleSheet.create({
  // Estilos para as bordas dos TextInputs
  textInputBorderColor: "gray", // Cor da borda normal
  redBorderColor: "red", // Cor da borda de erro
  textInput: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#d1d5db",
    width: "100%",
    fontSize: 14,
    lineHeight: 20,
    color: "black",
    backgroundColor: "#f9fafb",
  },
});

export default Login;
