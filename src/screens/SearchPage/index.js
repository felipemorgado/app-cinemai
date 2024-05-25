import React, { useState, useEffect, useRef } from "react";
import { TouchableOpacity } from "react-native";
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";
import * as S from "./styles";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import { API_KEY_TMDB } from "@env";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const SearchPage = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const debouncedSearchTerm = useDebounce(query, 500);
  const textInputRef = useRef(null);

  useEffect(() => {
    textInputRef.current.focus();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      axios
        .get("https://api.themoviedb.org/3/search/multi", {
          params: {
            api_key: API_KEY_TMDB,
            language: "pt-BR",
            query: debouncedSearchTerm,
          },
        })
        .then((response) => {
          setResults(response.data.results);
        });
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  const handlePressItem = (item) => {
    // Verificar se o item é um filme ou uma série de TV
    const isMovie = item.media_type === "movie";

    const url = `https://api.themoviedb.org/3/${isMovie ? "movie" : "tv"}/${
      item.id
    }/credits`;

    axios
      .get(url, {
        params: {
          api_key: API_KEY_TMDB,
        },
      })
      .then((response) => {
        const cast = response.data.cast.slice(0, 10);

        // Obter a lista de gêneros para filmes
        axios
          .get("https://api.themoviedb.org/3/genre/movie/list", {
            params: {
              api_key: API_KEY_TMDB,
              language: "pt-BR",
            },
          })
          .then((response) => {
            const genreMap = {};
            response.data.genres.forEach((genre) => {
              genreMap[genre.id] = genre.name;
            });

            // Obter a lista de gêneros para séries de TV
            axios
              .get("https://api.themoviedb.org/3/genre/tv/list", {
                params: {
                  api_key: API_KEY_TMDB,
                  language: "pt-BR",
                },
              })
              .then((response) => {
                response.data.genres.forEach((genre) => {
                  genreMap[genre.id] = genre.name;
                });

                // Mapear os IDs dos gêneros para seus respectivos nomes
                const genreNames = item.genre_ids.map((id) => genreMap[id]);

                // Navegar para a MediaPage com os dados do elenco e os nomes dos gêneros
                navigation.navigate("MediaPage", {
                  image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                  title: item.title || item.name,
                  description: item.overview,
                  releaseDate: item.release_date || item.first_air_date,
                  voteAverage: item.vote_average,
                  genres: genreNames,
                  cast: cast,
                });
              });
          });
      })
      .catch((error) => {
        console.error("Erro ao recuperar dados do elenco: ", error);
      });
  };

  return (
    <S.Container>
      <S.ViewBackIcon>
        <EvilIcons
          name="chevron-left"
          size={50}
          color="white"
          onPress={() => navigation.goBack()}
        />
      </S.ViewBackIcon>
      <S.ViewSearchContainer>
        <EvilIcons
          name="search"
          size={30}
          color="black"
          style={{
            marginRight: 5,
            marginBottom: 6,
            textAlign: "center",
            justifyContent: "center",
          }}
        />
        <S.TextInput
          ref={textInputRef}
          autoFocus={true}
          value={query}
          onChangeText={setQuery}
          placeholder="Pesquisar..."
          focusable
        />
      </S.ViewSearchContainer>
      <ScrollView>
        <S.TextTitleContent>Filmes e séries</S.TextTitleContent>
        <S.ViewContentContainer>
          {results.map(
            (item) =>
              item.poster_path && (
                <S.ViewItem key={item.id}>
                  <TouchableOpacity onPress={() => handlePressItem(item)}>
                    <S.Image
                      source={{
                        uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                      }}
                    />
                  </TouchableOpacity>
                </S.ViewItem>
              )
          )}
        </S.ViewContentContainer>
      </ScrollView>
    </S.Container>
  );
};

export default SearchPage;
