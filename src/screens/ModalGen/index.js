// ModalGen > index.js
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import * as S from "./styles";

import axios from "axios";

import { get, getDatabase, ref, remove, set, update } from "firebase/database";
import useAuth from "../../hooks/useAuth";
import { StatusBar } from "expo-status-bar";
import { API_KEY_TMDB } from "@env";

const ModalGen = ({ visible, onClose }) => {
  const [movieGenres, setMovieGenres] = useState([]); // Gêneros de filmes
  const [tvGenres, setTvGenres] = useState([]); // Gêneros de séries
  const [selectedGenres, setSelectedGenres] = useState({ movie: {}, tv: {} });
  const [selectedGenreNames, setSelectedGenreNames] = useState({
    movie: {},
    tv: {},
  });
  const [movieGenreCount, setMovieGenreCount] = useState(0); // Contador de gêneros de filmes
  const [tvGenreCount, setTvGenreCount] = useState(0); // Contador de gêneros de séries

  const { user } = useAuth();

  useEffect(() => {
    const getGenres = async () => {
      try {
        // gêneros de filmes
        const movieResponse = await axios.get(
          "https://api.themoviedb.org/3/genre/movie/list",
          {
            params: {
              api_key: API_KEY_TMDB,
              language: "pt-BR",
            },
          }
        );
        setMovieGenres(movieResponse.data.genres);

        // gêneros de séries (TV)
        const tvResponse = await axios.get(
          "https://api.themoviedb.org/3/genre/tv/list",
          {
            params: {
              api_key: API_KEY_TMDB,
              language: "pt-BR",
            },
          }
        );
        setTvGenres(tvResponse.data.genres);
      } catch (error) {
        console.error("Erro:", error);
      }
    };
    getGenres();
  }, []);

  useEffect(() => {
    const fetchSelectedGenres = async () => {
      // referência para o banco de dados do Firebase
      const db = getDatabase();

      // Buscar os gêneros selecionados do Firebase
      const snapshot = await get(ref(db, `users/${user.uid}/genero`));

      if (snapshot.exists()) {
        const selectedGenresInDb = snapshot.val();
        const newSelectedGenres = { movie: {}, tv: {} };
        const newSelectedGenreNames = { movie: {}, tv: {} };

        // Preencher os estados selectedGenres e selectedGenreNames com os valores buscados
        for (const type in selectedGenresInDb) {
          for (const genreName in selectedGenresInDb[type]) {
            const genre = (type === "movie" ? movieGenres : tvGenres).find(
              (genre) => genre.name === genreName
            );
            if (genre) {
              const genreId = genre.id;
              newSelectedGenres[type][genreId] = true;
              newSelectedGenreNames[type][genreId] = genreName;
            }
          }
        }

        setSelectedGenres(newSelectedGenres);
        setSelectedGenreNames(newSelectedGenreNames);
        // Atualize os contadores de gênero
        setMovieGenreCount(Object.keys(newSelectedGenres.movie).length);
        setTvGenreCount(Object.keys(newSelectedGenres.tv).length);
      }
    };

    fetchSelectedGenres();
  }, [user, movieGenres, tvGenres]);

  const handleGenreSelection = (genreId, genreName, type) => {
    if (selectedGenres[type][genreId]) {
      // Se o item já está nos gêneros, remove
      setSelectedGenres((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [genreId]: false, // Definir o gênero como false no objeto selectedGenres
        },
      }));

      // Atualizar o contador IMEDIATAMENTE após remover o gênero
      if (type === "movie") {
        setMovieGenreCount(movieGenreCount - 1);
      } else if (type === "tv") {
        setTvGenreCount(tvGenreCount - 1);
      }

      // Remover o gênero do Firebase
      const db = getDatabase();
      remove(ref(db, `users/${user.uid}/genero/${type}/${genreName}`));

      // Sair da função após remover
      return;
    }

    // Se o item não está nos gêneros, verifica o limite
    if (
      (type === "movie" && movieGenreCount >= 10) ||
      (type === "tv" && tvGenreCount >= 10)
    ) {
      Alert.alert("Limite atingido!", "Você atingiu o limite de 10 gêneros.");
      return; // Sai da função se o limite for atingido
    }

    // Se não atingiu o limite, prossegue com a adição
    setSelectedGenres((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [genreId]: true,
      },
    }));

    // Atualiza os contadores IMEDIATAMENTE após adicionar o gênero
    if (type === "movie") {
      setMovieGenreCount(movieGenreCount + 1);
    } else if (type === "tv") {
      setTvGenreCount(tvGenreCount + 1);
    }

    setSelectedGenreNames((prevNames) => ({
      ...prevNames,
      [type]: {
        ...prevNames[type],
        [genreId]: genreName,
      },
    }));
  };

  useEffect(() => {
    // Verifica se há algum gênero selecionado
    if (
      Object.keys(selectedGenres.movie).length > 0 ||
      Object.keys(selectedGenres.tv).length > 0
    ) {
      // referência para o banco de dados do Firebase
      const db = getDatabase();

      // Criar um objeto com os gêneros selecionados
      const selectedMovieGenresInDb = {};
      const selectedTvGenresInDb = {};

      Object.keys(selectedGenres.movie).forEach((genreId) => {
        const genreName = selectedGenreNames.movie[genreId];
        if (selectedGenres.movie[genreId]) {
          selectedMovieGenresInDb[genreName] = true;
        }
      });

      Object.keys(selectedGenres.tv).forEach((genreId) => {
        const genreName = selectedGenreNames.tv[genreId];
        if (selectedGenres.tv[genreId]) {
          selectedTvGenresInDb[genreName] = true;
        }
      });

      // Atualizar o Firebase com todos os gêneros selecionados de uma vez
      if (Object.keys(selectedMovieGenresInDb).length > 0) {
        set(ref(db, `users/${user.uid}/genero/movie`), selectedMovieGenresInDb);
      }
      if (Object.keys(selectedTvGenresInDb).length > 0) {
        set(ref(db, `users/${user.uid}/genero/tv`), selectedTvGenresInDb);
      }
    }
  }, [selectedGenres, selectedGenreNames, user]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <S.Container>
        <StatusBar style="light" backgroundColor="transparent" />
        <S.ViewContentModal>
          <S.TextTitleFilm>Selecione os gêneros de filme</S.TextTitleFilm>
          <ScrollView>
            <S.ViewGenFilm>
              {movieGenres.map((genre) => (
                <TouchableOpacity
                  key={genre.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={() =>
                    handleGenreSelection(genre.id, genre.name, "movie")
                  }
                >
                  <Switch
                    style={{ opacity: 0 }} // torna o Switch invisível
                    value={selectedGenres.movie[genre.id] || false}
                    onValueChange={() =>
                      handleGenreSelection(genre.id, genre.name, "movie")
                    }
                  />
                  <View
                    style={{
                      backgroundColor: selectedGenres.movie[genre.id]
                        ? "white"
                        : "transparent",
                      marginLeft: -30,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: "white",
                      paddingTop: 4,
                      paddingBottom: 6,
                      paddingLeft: 16,
                      paddingRight: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: selectedGenres.movie[genre.id]
                          ? "black"
                          : "white",
                        fontWeight: "bold",
                      }}
                    >
                      {genre.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </S.ViewGenFilm>
          </ScrollView>
          <S.TextTitleTv>Selecione os gêneros de série</S.TextTitleTv>
          <ScrollView>
            <S.ViewGenTv>
              {tvGenres.map((genre) => (
                <TouchableOpacity
                  key={genre.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 10,
                  }}
                  onPress={() =>
                    handleGenreSelection(genre.id, genre.name, "tv")
                  }
                >
                  <Switch
                    style={{ opacity: 0 }} // torna o Switch invisível
                    value={selectedGenres.tv[genre.id] || false}
                    onValueChange={() =>
                      handleGenreSelection(genre.id, genre.name, "tv")
                    }
                  />
                  <View
                    style={{
                      backgroundColor: selectedGenres.tv[genre.id]
                        ? "white"
                        : "transparent",
                      marginLeft: -30,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: "white",
                      paddingTop: 4,
                      paddingBottom: 6,
                      paddingLeft: 16,
                      paddingRight: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: selectedGenres.tv[genre.id] ? "black" : "white",
                        fontWeight: "bold",
                      }}
                    >
                      {genre.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </S.ViewGenTv>
          </ScrollView>

          <TouchableOpacity onPress={onClose}>
            <S.CloseText>Fechar</S.CloseText>
          </TouchableOpacity>
        </S.ViewContentModal>
      </S.Container>
    </Modal>
  );
};

export default ModalGen;
