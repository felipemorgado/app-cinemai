// index_home.js
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import axios from "axios";

import * as S from "./styles";
import { ScrollView } from "react-native-gesture-handler";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import Loading from "../Loading";

import { getDatabase, ref, onValue } from "firebase/database";
import useAuth from "../../hooks/useAuth";
import { API_KEY_TMDB } from "@env";

const Home = ({ navigation }) => {
  const [trendingMoviesAndSeries, setTrendingMoviesAndSeries] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [genres, setGenres] = useState([]);

  const [trendingPage, setTrendingPage] = useState(1);
  const [popularMoviesPage, setPopularMoviesPage] = useState(1);
  const [popularSeriesPage, setPopularSeriesPage] = useState(1);

  const [trendingLoading, setTrendingLoading] = useState(false);
  const [popularMoviesLoading, setPopularMoviesLoading] = useState(false);
  const [popularSeriesLoading, setPopularSeriesLoading] = useState(false);

  const [maxPages, setMaxPages] = useState(4);
  const [isScrollingBackwards, setIsScrollingBackwards] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [watchlist, setWatchlist] = useState([]);
  const { user } = useAuth();

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  const loadNextPage = (setPage, page) => {
    if (!isLoading && page < maxPages) {
      setIsLoading(true);
      setPage(page + 1);
    }
  };

  const loadPreviousPage = (setPage, page, setLoading) => {
    if (page > 1) {
      // setLoading(true);
      setPage(page - 1);
    }
  };

  const debouncedLoadNextPage = debounce(loadNextPage, 300);
  const debouncedLoadPreviousPage = debounce(loadPreviousPage, 300);

  useEffect(() => {
    if (
      isInitialLoad &&
      trendingPage === 1 &&
      popularMoviesPage === 1 &&
      popularSeriesPage === 1
    ) {
      setIsDataLoading(true);
      setIsInitialLoad(false);
    }

    const apiCalls = [];

    apiCalls.push(
      axios.get("https://api.themoviedb.org/3/genre/movie/list", {
        params: {
          api_key: API_KEY_TMDB,
          language: "pt-BR",
        },
      }),
      axios.get("https://api.themoviedb.org/3/trending/all/day", {
        params: {
          api_key: API_KEY_TMDB,
          language: "pt-BR",
          page: trendingPage,
        },
      }),
      axios.get("https://api.themoviedb.org/3/discover/movie", {
        params: {
          api_key: API_KEY_TMDB,
          language: "pt-BR",
          sort_by: "popularity.desc",
          page: popularMoviesPage,
        },
      }),
      axios.get("https://api.themoviedb.org/3/discover/tv", {
        params: {
          api_key: API_KEY_TMDB,
          language: "pt-BR",
          sort_by: "popularity.desc",
          page: popularSeriesPage,
        },
      })
    );

    Promise.all(apiCalls)
      .then((responses) => {
        const genreMap = {};
        responses[0].data.genres.forEach((genre) => {
          genreMap[genre.id] = genre.name;
        });

        setTrendingMoviesAndSeries((prevMoviesAndSeries) => {
          const existingIds = new Set(
            prevMoviesAndSeries.map((item) => item.id)
          );
          const newResults = responses[1].data.results.filter(
            (item) => !existingIds.has(item.id)
          );
          const newResultsWithGenres = newResults.map((item) => ({
            ...item,
            genres: item.genre_ids.map((id) => genreMap[id]).filter(Boolean),
          }));

          return [...prevMoviesAndSeries, ...newResultsWithGenres];
        });

        const movies = responses[2].data.results;
        movies.forEach((movie) => {
          movie.media_type = "movie";
          movie.genres = movie.genre_ids
            .map((id) => genreMap[id])
            .filter(Boolean);
        });
        setPopularMovies((prevMovies) => {
          const existingIds = new Set(prevMovies.map((item) => item.id));
          const newResults = movies.filter((item) => !existingIds.has(item.id));
          return [...prevMovies, ...newResults];
        });

        const series = responses[3].data.results;
        series.forEach((serie) => {
          serie.media_type = "tv";
          serie.genres = serie.genre_ids
            .map((id) => genreMap[id])
            .filter(Boolean);
        });
        setPopularSeries((prevSeries) => {
          const existingIds = new Set(prevSeries.map((item) => item.id));
          const newResults = series.filter((item) => !existingIds.has(item.id));
          return [...prevSeries, ...newResults];
        });

        setIsDataLoading(false);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [trendingPage, popularMoviesPage, popularSeriesPage]);

  // Carrega a watchlist do Firebase com os detalhes dos itens
  useEffect(() => {
    const db = getDatabase();
    const watchlistRef = ref(db, `users/${user.uid}/watchlist`);

    const offFunction = onValue(watchlistRef, (snapshot) => {
      const data = snapshot.val() || {}; // Lidando com casos onde data é null ou undefined

      // Criando um array de promessas para buscar os detalhes de cada item
      const watchlistPromises = Object.entries(data).map(
        async ([itemId, mediaType]) => {
          try {
            const response = await axios.get(
              `https://api.themoviedb.org/3/${mediaType}/${itemId}`,
              {
                params: {
                  api_key: API_KEY_TMDB,
                  language: "pt-BR",
                },
              }
            );

            // Buscando os dados do elenco
            const castResponse = await axios.get(
              `https://api.themoviedb.org/3/${mediaType}/${itemId}/credits`,
              {
                params: {
                  api_key: API_KEY_TMDB,
                },
              }
            );
            const cast = castResponse.data.cast.slice(0, 10);

            // Retornando um objeto com os detalhes do item
            return { id: itemId, mediaType, ...response.data, cast };
          } catch (error) {
            console.error(
              "Erro ao buscar detalhes do item da watchlist:",
              error
            );
            return null; // Retornando null em caso de erro para ser filtrado depois
          }
        }
      );

      // Usando Promise.all para esperar todas as promessas serem resolvidas
      Promise.all(watchlistPromises)
        .then((watchlistItems) => {
          // Filtrando os itens nulos que podem ter sido retornados em caso de erro
          // e atualizando o estado
          setWatchlist(watchlistItems.filter(Boolean));
        })
        .catch((error) => {
          console.error("Erro ao buscar itens da watchlist:", error);
        });
    });

    // Removendo o listener quando o componente for desmontado
    return () => offFunction();
  }, []); // Executando o efeito apenas uma vez quando o componente é montado

  const renderItem = ({ item }) => {
    if (
      item.poster_path &&
      (item.original_language === "pt" || item.original_language === "en")
    ) {
      const itemGenres = item.genres
        ? item.genres.map((genre) => genre).filter(Boolean)
        : [];

      return (
        <View
          key={item.media_type + item.id}
          style={{ width: 100, marginRight: 10 }}
        >
          <TouchableOpacity
            onPress={() => {
              axios
                .get(
                  `https://api.themoviedb.org/3/${item.media_type}/${item.id}/credits`,
                  {
                    params: {
                      api_key: API_KEY_TMDB,
                    },
                  }
                )
                .then((response) => {
                  const cast = response.data.cast.slice(0, 10);
                  navigation.navigate("MediaPage", {
                    image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                    title: item.title || item.name,
                    description:
                      item.overview ||
                      "Não encontramos a descrição deste conteúdo.",
                    releaseDate: item.release_date || item.first_air_date,
                    voteAverage: item.vote_average,
                    genres: itemGenres,
                    cast: cast,
                    id: item.id,
                    media_type: item.media_type,
                  });
                });
            }}
          >
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
              }}
              style={{ width: 100, height: 150 }}
            />
            <Text
              numberOfLines={2}
              style={{ flexWrap: "wrap", color: "white", fontWeight: "bold" }}
            >
              {item.title || item.name}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderWatchlistItem = useCallback(({ item }) => {
    if (item.poster_path) {
      return (
        <View key={item.id} style={{ width: 140, marginRight: 10 }}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("MediaPage", {
                image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                title: item.title || item.name,
                description:
                  item.overview ||
                  "Não encontramos a descrição deste conteúdo.",
                releaseDate: item.release_date || item.first_air_date,
                voteAverage: item.vote_average,
                genres: item.genres
                  ? item.genres.map((genre) => genre.name)
                  : [],
                id: item.id,
                media_type: item.mediaType,
                cast: item.cast,
              });
            }}
          >
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
              }}
              style={{ width: 130, height: 180 }}
            />
            <Text
              numberOfLines={2}
              style={{
                flexWrap: "wrap",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {item.title || item.name}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, []);

  return (
    <S.Container>
      <StatusBar style="light" backgroundColor="rgb(10, 2, 29)" />
      {isDataLoading ? (
        <View style={{ height: "100%", width: "100%" }}>
          <Loading />
        </View>
      ) : (
        <>
          <S.ViewHeader>
            <S.TextHeaderTitle>CinemAI</S.TextHeaderTitle>
            <EvilIcons
              name="search"
              size={34}
              color={"white"}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                marginTop: -2,
              }}
              onPress={() => navigation.navigate("SearchPage")}
            />
          </S.ViewHeader>
          <ScrollView>
            {watchlist.length > 0 && (
              <>
                <S.TextitleSection>Já Assistiu</S.TextitleSection>
                {watchlist.length < 3 ? (
                  <S.ViewWatchlist>
                    {watchlist.map((item, index) => (
                      <View
                        key={item.id}
                        style={{ width: 140, marginRight: 10 }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate("MediaPage", {
                              image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                              title: item.title || item.name,
                              description:
                                item.overview ||
                                "Não encontramos a descrição deste conteúdo.",
                              releaseDate:
                                item.release_date || item.first_air_date,
                              voteAverage: item.vote_average,
                              genres: item.genres
                                ? item.genres.map((genre) => genre.name)
                                : [],
                              id: item.id,
                              media_type: item.mediaType,
                              cast: item.cast,
                            });
                          }}
                        >
                          <Image
                            source={{
                              uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                            }}
                            style={{ width: 130, height: 180 }}
                          />
                          <Text
                            numberOfLines={2}
                            style={{
                              flexWrap: "wrap",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {item.title || item.name}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </S.ViewWatchlist>
                ) : (
                  <S.ViewWatchlist>
                    <FlatList
                      horizontal
                      data={watchlist}
                      renderItem={renderWatchlistItem}
                      keyExtractor={(item) => item.id.toString()}
                      windowSize={21}
                      showsHorizontalScrollIndicator={false}
                    />
                  </S.ViewWatchlist>
                )}
              </>
            )}

            <S.TextitleSection>Tendências</S.TextitleSection>
            {trendingMoviesAndSeries.length > 0 && (
              <S.ViewTrending>
                <FlatList
                  horizontal
                  data={trendingMoviesAndSeries}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                  windowSize={21}
                  showsHorizontalScrollIndicator={false}
                  style={{ flex: 1 }}
                  onEndReached={() => {
                    if (!isScrollingBackwards) {
                      debouncedLoadNextPage(setTrendingPage, trendingPage);
                    } else {
                      debouncedLoadPreviousPage(setTrendingPage, trendingPage);
                    }
                  }}
                  onScroll={({ nativeEvent }) => {
                    if (nativeEvent.contentOffset.x < 0) {
                      setIsScrollingBackwards(true);
                    } else {
                      setIsScrollingBackwards(false);
                    }
                  }}
                />
              </S.ViewTrending>
            )}

            <S.TextitleSection>Filmes Mais Populares</S.TextitleSection>
            {popularMovies.length > 0 && (
              <S.ViewPopularFilm>
                <FlatList
                  horizontal
                  data={popularMovies}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                  windowSize={21}
                  showsHorizontalScrollIndicator={false}
                  style={{ flex: 1 }}
                  onEndReached={() => {
                    if (!isScrollingBackwards) {
                      debouncedLoadNextPage(
                        setPopularMoviesPage,
                        popularMoviesPage
                      );
                    } else {
                      debouncedLoadPreviousPage(
                        setPopularMoviesPage,
                        popularMoviesPage
                      );
                    }
                  }}
                  onScroll={({ nativeEvent }) => {
                    if (nativeEvent.contentOffset.x < 0) {
                      setIsScrollingBackwards(true);
                    } else {
                      setIsScrollingBackwards(false);
                    }
                  }}
                />
              </S.ViewPopularFilm>
            )}

            <S.TextitleSection>Séries Mais Populares</S.TextitleSection>
            {popularSeries.length > 0 && (
              <S.ViewPopularTv>
                <FlatList
                  horizontal
                  data={popularSeries}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                  windowSize={21}
                  showsHorizontalScrollIndicator={false}
                  style={{ flex: 1 }}
                  onEndReached={() => {
                    if (!isScrollingBackwards) {
                      debouncedLoadNextPage(
                        setPopularSeriesPage,
                        popularSeriesPage
                      );
                    } else {
                      debouncedLoadPreviousPage(
                        setPopularSeriesPage,
                        popularSeriesPage
                      );
                    }
                  }}
                  onScroll={({ nativeEvent }) => {
                    if (nativeEvent.contentOffset.x < 0) {
                      setIsScrollingBackwards(true);
                    } else {
                      setIsScrollingBackwards(false);
                    }
                  }}
                />
              </S.ViewPopularTv>
            )}
          </ScrollView>
        </>
      )}
    </S.Container>
  );
};

export default Home;
