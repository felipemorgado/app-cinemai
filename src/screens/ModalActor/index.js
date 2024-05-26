import {
  Modal,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getDatabase, ref, onValue } from "firebase/database";
import useAuth from "../../hooks/useAuth";

import * as S from "./styles";
import { StatusBar } from "expo-status-bar";
import { API_KEY_TMDB } from "@env";

const ModalActor = ({ visible, onClose }) => {
  const [actors, setActors] = useState([]); // Atores
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const db = getDatabase();
    const actorRef = ref(db, `users/${user.uid}/ator`);

    // Escutar as mudanças nos atores
    onValue(actorRef, (snapshot) => {
      const actorIds = snapshot.val();
      if (actorIds) {
        const actorPromises = Object.keys(actorIds).map(async (actorId) => {
          try {
            const actorResponse = await axios.get(
              `https://api.themoviedb.org/3/person/${actorId}`,
              {
                params: {
                  api_key: "0d07f319cd1283cd8c7123ff6731a97a",
                  language: "pt-BR",
                },
              }
            );
            const actorData = actorResponse.data;
            return {
              id: actorId,
              name: actorIds[actorId], // nome do ator armazenado no Firebase
              profile_path: actorData.profile_path,
            };
          } catch (error) {
            console.error("Erro:", error);
            return null; // Retorna null em caso de erro
          }
        });

        Promise.all(actorPromises)
          .then((actorsData) => {
            // Remove os elementos null que podem ter sido retornados em caso de erro
            const validActorsData = actorsData.filter(
              (actor) => actor !== null
            );
            setActors(validActorsData);
          })
          .catch((error) => {
            console.error("Erro em Promise.all:", error);
          });
      } else {
        // Limpa o estado dos atores se não houver atores no Firebase
        setActors([]);
      }
    });
  }, [user]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => {
        navigation.navigate("ActorPage", {
          actorName: item.name,
          actorId: item.id,
        });
        onClose();
      }}
    >
      <View
        style={{
          alignItems: "center",
          width: 100,
          padding: 4,
          margin: 10,
          marginTop: 0,
        }}
      >
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${item.profile_path}`,
          }}
          style={{ width: 100, height: 150 }}
        />
        <Text numberOfLines={2} style={{ color: "white" }}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <S.View>
        <StatusBar style="light" backgroundColor="transparent" />
        <S.ViewContentModal>
          <S.TextTitle>Seus Atores Favoritos</S.TextTitle>
          <FlatList
            data={actors}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
          />
          <TouchableOpacity onPress={onClose}>
            <S.CloseText>Fechar</S.CloseText>
          </TouchableOpacity>
        </S.ViewContentModal>
      </S.View>
    </Modal>
  );
};

export default ModalActor;
