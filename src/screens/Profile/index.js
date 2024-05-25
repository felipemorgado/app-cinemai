import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState, useRef } from "react";

import axios from "axios";
import * as S from "./styles";

import { getDatabase, ref, onValue } from "firebase/database";
import useAuth from "../../hooks/useAuth";

import ModalGen from "../ModalGen";
import ModalActor from "../ModalActor";
import ModalMedia from "../ModalMedia";

import Ionicons from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { API_KEY_TMDB } from "@env";

const PageIndicator = ({ selected }) => {
  return (
    <View
      style={{
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: selected ? "black" : "gray",
        margin: 8,
      }}
    />
  );
};

const Profile = () => {
  const { user, logout } = useAuth();
  const [nome, setNome] = useState("");
  const [generos, setGeneros] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalActorVisible, setModalActorVisible] = useState(false);
  const [atores, setAtores] = useState([]);
  const [modalMediaVisible, setModalMediaVisible] = useState(false);
  const [mediaFav, setMediaFav] = useState([]);

  const colors = ["#0C0443", "#0A0334", "#060221", "black"];
  const textColors = ["white", "white", "white", "white"];
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const userRef = ref(db, "users/" + user.uid);
      onValue(userRef, async (snapshot) => {
        setNome(snapshot.val().nome);
        setGeneros(snapshot.val().genero || {}); // Se 'genero' for undefined, definir 'generos' como um objeto vazio

        const actorIds = snapshot.val().ator || {};
        const actorDetails = await Promise.all(
          Object.keys(actorIds).map(fetchActorDetails)
        );
        setAtores(actorDetails);

        onValue(ref(db, `users/${user.uid}/media`), async (snapshot) => {
          const mediaData = snapshot.val() || {};
          const mediaPromises = Object.keys(mediaData).map(async (mediaId) => {
            try {
              let mediaDetailsResponse;
              // Buscar os detalhes do filme/série com o ID:
              if (mediaData[mediaId] === "movie") {
                mediaDetailsResponse = await axios.get(
                  `https://api.themoviedb.org/3/movie/${mediaId}?api_key=${API_KEY_TMDB}&language=pt-BR`
                );
              } else if (mediaData[mediaId] === "tv") {
                mediaDetailsResponse = await axios.get(
                  `https://api.themoviedb.org/3/tv/${mediaId}?api_key=${API_KEY_TMDB}&language=pt-BR`
                );
              }
              // Verificar se a resposta foi bem-sucedida
              if (mediaDetailsResponse.status === 200) {
                return {
                  id: mediaId,
                  title_pt_BR:
                    mediaDetailsResponse.data.title ||
                    mediaDetailsResponse.data.name,
                  title:
                    mediaDetailsResponse.data.title ||
                    mediaDetailsResponse.data.name,
                  poster_path: mediaDetailsResponse.data.poster_path,
                };
              } else {
                // Se a resposta não foi bem sucedida, retornar null
                console.warn(
                  `Erro ao buscar detalhes do conteúdo com ID ${mediaId}: ${mediaDetailsResponse.statusText}`
                );
                return null;
              }
            } catch (error) {
              // Se ocorreu um erro, retornar null
              console.warn(`Erro ao buscar detalhes do conteúdo: ${error}`);
              return null;
            }
          });
          const mediaDetails = await Promise.all(mediaPromises);
          // Filtrar os resultados que não são nulos (não encontraram o título):
          setMediaFav(mediaDetails.filter((media) => media !== null));
        });
      });
    }
  }, [user]);

  async function fetchActorDetails(actorId) {
    const response = await axios.get(
      `https://api.themoviedb.org/3/person/${actorId}?api_key=${API_KEY_TMDB}`
    );
    return response.data;
  }

  if (!user) {
    return null;
  }
  // Criar uma lista de gêneros de filmes a partir do objeto 'generos'
  const movieGenresList = Object.keys(generos.movie || {})
    .filter((key) => generos.movie[key])
    .map((genre, index) => (
      <S.ViewGenre key={index}>
        <S.TextGen>{genre}</S.TextGen>
      </S.ViewGenre>
    ));
  // Criar uma lista de gêneros de séries a partir do objeto 'generos'
  const tvGenresList = Object.keys(generos.tv || {})
    .filter((key) => generos.tv[key])
    .map((genre, index) => (
      <S.ViewGenre key={index}>
        <S.TextGen>{genre}</S.TextGen>
      </S.ViewGenre>
    ));

  const actorList = atores.slice(0, 4).map((actor, index) => (
    <View key={index} style={{ width: 110 }}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${actor.profile_path}` }}
        style={{
          width: 100,
          height: 150,
          borderRadius: 4,
        }}
      />
      <Text
        numberOfLines={2}
        style={{ flexWrap: "wrap", color: "white", alignSelf: "flex-start" }}
      >
        {actor.name}
      </Text>
    </View>
  ));

  const mediaList = mediaFav.slice(0, 4).map((media, index) => (
    <View key={index} style={{ width: 100, marginEnd: 10 }}>
      <Image
        source={{
          uri: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
        }}
        style={{
          width: 100,
          height: 150,
          borderRadius: 4,
        }}
      />
      <Text
        numberOfLines={2}
        style={{ flexWrap: "wrap", color: "white", alignSelf: "flex-start" }}
      >
        {media.title_pt_BR ? media.title_pt_BR : media.title}
      </Text>
    </View>
  ));

  return (
    <S.Container>
      <ScrollView stickyHeaderIndices={[0]}>
        <S.ViewHeader>
          <S.TextHeaderLogo>CinemAI</S.TextHeaderLogo>
          <S.TouchableOpacity onPress={logout}>
            <S.ViewHeaderContent>
              <Ionicons
                name="exit-outline"
                size={40}
                color="white"
                style={{
                  transform: [{ scaleX: -1 }],
                  alignSelf: "flex-start",
                }}
              />
            </S.ViewHeaderContent>
          </S.TouchableOpacity>
        </S.ViewHeader>

        <Image
          source={{
            uri: `https://cdn-icons-png.freepik.com/512/11911/11911355.png?ga=GA1.1.755741616.1716252958`,
          }}
          style={{
            width: 200,
            height: 200,
            backgroundColor: "white",
            borderRadius: 100,
            alignSelf: "center",
            marginBottom: 16,
          }}
        />
        <S.TextAccountName numberOfLines={2}>
          Bem vindo {nome}!
        </S.TextAccountName>
        <View>
          <S.TextGenTitle>Gêneros Favoritos</S.TextGenTitle>
        </View>
        <S.ViewGen>
          {movieGenresList.length > 0 || tvGenresList.length > 0 ? (
            <>
              <S.TextGenFilm>Filmes:</S.TextGenFilm>
              <S.TouchableOpacity onPress={() => setModalVisible(true)}>
                <S.ViewGenresContainer>
                  {movieGenresList.length > 0 && <>{movieGenresList}</>}
                  {tvGenresList.length > 0 && <>{tvGenresList}</>}
                </S.ViewGenresContainer>
              </S.TouchableOpacity>
              <S.TextGenTv>Séries:</S.TextGenTv>
            </>
          ) : (
            <S.TouchableOpacity onPress={() => setModalVisible(true)}>
              <S.ViewGenresContainer>
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                    padding: 16,
                  }}
                >
                  Clique aqui para adicionar
                </Text>
              </S.ViewGenresContainer>
            </S.TouchableOpacity>
          )}
        </S.ViewGen>
        {!movieGenresList.length || !tvGenresList.length ? (
          <S.TextGenSubtitle>
            (Escolha seus gêneros favoritos para melhorar nossa lista de
            recomendação!)
          </S.TextGenSubtitle>
        ) : null}
        <S.TouchableOpacity onPress={() => setModalActorVisible(true)}>
          <S.TextActorTitle>Atores Favoritos</S.TextActorTitle>
          <S.ViewActor style={{ flexDirection: "row" }}>
            {actorList.length > 0 ? (
              <>{actorList}</>
            ) : (
              <S.TouchableOpacity
                onPress={() => navigation.navigate("HomeTab")}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                    padding: 8,
                  }}
                >
                  Adicione atores atráves da página do Filme/Série
                </Text>
              </S.TouchableOpacity>
            )}
          </S.ViewActor>
        </S.TouchableOpacity>
        {!actorList.length ? (
          <S.TextActorSubtitle>
            (Não se preocupe caso não tenha um ator favorito! A lista de
            recomendação não irá ser afetada.)
          </S.TextActorSubtitle>
        ) : null}
        <S.TouchableOpacity onPress={() => setModalMediaVisible(true)}>
          <S.TextFavTitle>Filmes/Séries Favoritos</S.TextFavTitle>
          <S.ViewFav style={{ flexDirection: "row" }}>
            {mediaList.length > 0 ? (
              <>{mediaList}</>
            ) : (
              <S.TouchableOpacity
                onPress={() => navigation.navigate("HomeTab")}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                    padding: 8,
                  }}
                >
                  Adicione Filmes/Séries atráves da página Home
                </Text>
              </S.TouchableOpacity>
            )}
          </S.ViewFav>
        </S.TouchableOpacity>
        {!mediaFav.length ? (
          <S.TextFavSubtitle>
            (Escolha seus filmes ou séries favoritos para melhorar nossa lista
            de recomendação!)
          </S.TextFavSubtitle>
        ) : null}

        <ModalGen
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
        <ModalActor
          visible={modalActorVisible}
          onClose={() => setModalActorVisible(false)}
        />
        <ModalMedia
          visible={modalMediaVisible}
          onClose={() => setModalMediaVisible(false)}
        />
      </ScrollView>
    </S.Container>
  );
};

export default Profile;
