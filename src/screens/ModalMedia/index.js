import { Modal, Text, View, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getDatabase, ref, onValue } from "firebase/database";
import useAuth from "../../hooks/useAuth";

import * as S from "./styles";
import { StatusBar } from "expo-status-bar";
import { FlatList } from "react-native-gesture-handler";
import { API_KEY_TMDB } from "@env";

const ModalMedia = ({ visible, onClose }) => {
  const [mediaFav, setMediaFav] = useState([]);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const mediaRef = ref(db, `users/${user.uid}/media`);
      onValue(mediaRef, async (snapshot) => {
        const mediaData = snapshot.val() || {};
        const mediaPromises = Object.keys(mediaData).map(async (mediaId) => {
          try {
            let mediaDetailsResponse;
            // Busca detalhes do conteúdo
            if (mediaData[mediaId] === "movie") {
              mediaDetailsResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${mediaId}?api_key=${API_KEY_TMDB}&language=pt-BR`
              );
            } else if (mediaData[mediaId] === "tv") {
              mediaDetailsResponse = await axios.get(
                `https://api.themoviedb.org/3/tv/${mediaId}?api_key=${API_KEY_TMDB}&language=pt-BR`
              );
            }

            // Verifica se a resposta foi bem-sucedida
            if (mediaDetailsResponse.status === 200) {
              // Busca os créditos
              try {
                const creditsResponse = await axios.get(
                  `https://api.themoviedb.org/3/${mediaData[mediaId]}/${mediaId}/credits?api_key=${API_KEY_TMDB}`
                );

                return {
                  ...mediaDetailsResponse.data,
                  id: mediaId,
                  title_pt_BR:
                    mediaDetailsResponse.data.title ||
                    mediaDetailsResponse.data.name,
                  poster_path: mediaDetailsResponse.data.poster_path,
                  cast: creditsResponse.data.cast || [], // Adiciona o elenco ao objeto
                };
              } catch (error) {
                console.error("Erro ao buscar os créditos:", error);
                return {
                  ...mediaDetailsResponse.data,
                  id: mediaId,
                  title_pt_BR:
                    mediaDetailsResponse.data.title ||
                    mediaDetailsResponse.data.name,
                  poster_path: mediaDetailsResponse.data.poster_path,
                  cast: [], // Define um elenco vazio em caso de erro
                };
              }
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
        // Filtra os resultados que não são nulos (não encontraram o título):
        setMediaFav(mediaDetails.filter((media) => media !== null));
      });
    }
  }, [user]);

  const handleMediaPress = (media) => {
    //limitar os atores
    const limitedCast = media.cast.slice(0, 11);
    navigation.navigate("MediaPage", {
      image: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
      title: media.title_pt_BR || media.title,
      description: media.overview,
      releaseDate: media.release_date || media.first_air_date,
      voteAverage: media.vote_average,
      genres: media.genres.map((genre) => genre.name),
      cast: limitedCast || [],
      id: media.id,
      media_type: media.media_type, // tipo de mídia (filme ou série)
    });
    onClose();
  };

  const renderItem = ({ item }) => (
    <S.MediaItem key={item.id}>
      <TouchableOpacity onPress={() => handleMediaPress(item)}>
        <View
          style={{
            width: 100,
            padding: 4,
            margin: 10,
            marginTop: 0,
          }}
        >
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            }}
            style={{ width: 100, height: 150 }}
          />
          <Text numberOfLines={2} style={{ color: "white" }}>
            {item.title_pt_BR ? item.title_pt_BR : item.title}
          </Text>
        </View>
      </TouchableOpacity>
    </S.MediaItem>
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
          <S.TextTitle>Seus Filmes/Séries Favoritos</S.TextTitle>
          <FlatList
            data={mediaFav}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            horizontal={false} // Desabilita o scroll horizontal
          />

          <TouchableOpacity onPress={onClose}>
            <S.CloseText>Fechar</S.CloseText>
          </TouchableOpacity>
        </S.ViewContentModal>
      </S.View>
    </Modal>
  );
};

export default ModalMedia;
