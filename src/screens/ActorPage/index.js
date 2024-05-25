import React, { useEffect, useState, useRef } from "react";
import { View, Image, FlatList, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import * as S from "./styles";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ScrollView } from "react-native-gesture-handler";
import { MotiView } from "moti";
import Toast from "react-native-toast-message";

import { set, ref, getDatabase, remove, onValue } from "firebase/database";
import useAuth from "../../hooks/useAuth";
import { Skeleton } from "moti/skeleton";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { API_KEY_TMDB } from "@env";

const ActorPage = ({ route, navigation }) => {
  const { actorName, actorId } = route.params;
  const [actorDetails, setActorDetails] = useState(null);
  const [knownFor, setKnownFor] = useState([]);
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef();
  const [actorCount, setActorCount] = useState(0); // Contador de atores

  useEffect(() => {
    setIsLoading(true);

    const db = getDatabase();
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/search/person?api_key=${API_KEY_TMDB}&query=${actorId}&language=pt-BR`
        );
        const actor = response.data.results[0];

        // Buscar detalhes do ator em português ou inglês
        let detailsResponse = await axios.get(
          `https://api.themoviedb.org/3/person/${actorId}?api_key=${API_KEY_TMDB}&language=pt-BR`
        );

        if (!detailsResponse.data.biography) {
          detailsResponse = await axios.get(
            `https://api.themoviedb.org/3/person/${actorId}?api_key=${API_KEY_TMDB}&language=en-US`
          );
        }

        setActorDetails(detailsResponse.data);

        // Buscar créditos do ator
        const creditsResponse = await axios.get(
          `https://api.themoviedb.org/3/person/${actorId}/combined_credits?api_key=${API_KEY_TMDB}&language=pt-BR`
        );
        setKnownFor(creditsResponse.data.cast.slice(0, 8));

        // Verificar se o ator está favoritado
        const actorRef = ref(db, `users/${user.uid}/ator/${actorId}`);
        onValue(actorRef, (snapshot) => {
          setIsFavorited(snapshot.exists());
        });

        // Monitorar alterações no nó "ator"
        const actorRefCount = ref(db, `users/${user.uid}/ator`);
        onValue(actorRefCount, (snapshot) => {
          const data = snapshot.val();
          setActorCount(data ? Object.keys(data).length : 0);
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [actorName]);

  // redefinir a posição do ScrollView
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }
    }, [])
  );

  // Debounce para o botão de favorito
  const debounceTimeout = useRef(null);
  const handleFavorite = () => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      const db = getDatabase();
      const actorRef = ref(db, `users/${user.uid}/ator/${actorDetails.id}`);

      if (isFavorited) {
        // Se o ator já está na lista de favoritos, remove
        remove(actorRef)
          .then(() => {
            setIsFavorited(false);
            Toast.show({
              type: "fav",
              text1: "Removeu dos favoritos!",
              text1Style: {
                color: "black",
                fontSize: 20,
              },
              autoHide: true,
              visibilityTime: 2000,
              swipeable: false,
            });
          })
          .catch((error) => {
            console.error("Erro ao remover ator do Firebase: ", error);
          });
      } else {
        // Verifica se o limite de favoritos foi atingido antes de adicionar
        if (actorCount >= 10) {
          Alert.alert(
            "Limite de atores atingido!",
            "Você já adicionou o limite máximo de 10 atores."
          );
          return;
        }

        // Se o ator não está na lista de favoritos, adicione
        set(actorRef, actorDetails.name)
          .then(() => {
            setIsFavorited(true);
            Toast.show({
              type: "fav",
              text1: "Adicionou aos favoritos!",
              text1Style: {
                color: "black",
                fontSize: 20,
              },
              autoHide: true,
              visibilityTime: 2000,
              swipeable: false,
            });
          })
          .catch((error) => {
            console.error("Erro ao adicionar ator ao Firebase: ", error);
          });
      }
    }, 500);
  };

  // Calcular a idade do ator
  let age = "Unknown";
  if (actorDetails && actorDetails.birthday) {
    const birthDate = new Date(actorDetails.birthday);
    const currentYear = new Date().getFullYear();
    age = birthDate ? currentYear - birthDate.getFullYear() : "Unknown";
  }

  // Formate a data de nascimento para o formato dia/mês/ano
  let formattedBirthDate = "Unknown";
  if (actorDetails && actorDetails.birthday) {
    formattedBirthDate = new Date(actorDetails.birthday).toLocaleDateString(
      "pt-BR"
    );
  }

  const gender =
    actorDetails && actorDetails.gender === 1 ? "Feminino" : "Masculino";

  const handlePressItem = (item) => {
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

                const genreNames = item.genre_ids.map((id) => genreMap[id]);

                navigation.navigate("MediaPage", {
                  image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                  title: item.title || item.name,
                  description: item.overview,
                  releaseDate: item.release_date || item.first_air_date,
                  voteAverage: item.vote_average,
                  genres: genreNames,
                  cast: cast,
                  isLoading: isLoading,
                });
              });
          });
      })
      .catch((error) => {
        console.error("Erro ao recuperar dados do elenco: ", error);
      });
  };

  return (
    <MotiView
      style={{ flex: 1 }}
      transition={{
        type: "timing",
      }}
    >
      <S.Container>
        <StatusBar style="light" backgroundColor="rgb(10, 2, 29)" />
        <ScrollView ref={scrollViewRef}>
          <S.ViewContent>
            <S.ViewIcons>
              <S.ViewBackIcon>
                <EvilIcons
                  name="chevron-left"
                  size={60}
                  color="white"
                  onPress={() => navigation.goBack()}
                />
              </S.ViewBackIcon>
              <S.ViewFavWatch>
                <FontAwesome
                  name="heart"
                  size={40}
                  color={isFavorited ? "red" : "white"}
                  style={{
                    marginRight: 8,
                    marginTop: 8,
                  }}
                  onPress={handleFavorite}
                />
              </S.ViewFavWatch>
            </S.ViewIcons>
            <S.ViewActorProfile>
              {isLoading ? (
                <Skeleton
                  width={250}
                  height={250}
                  radius={200}
                  colorMode="light"
                />
              ) : actorDetails && actorDetails.profile_path ? (
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w500${actorDetails.profile_path}`,
                  }}
                  style={{
                    width: 250,
                    height: 250,
                    borderRadius: 200,
                    borderWidth: 2,
                    borderColor: "white",
                    marginBottom: 16,
                  }}
                />
              ) : (
                <Image
                  resizeMode="center"
                  source={{
                    uri: `https://cdn2.iconfinder.com/data/icons/delivery-and-logistic/64/Not_found_the_recipient-no_found-person-user-search-searching-4-512.png`,
                  }}
                  style={{
                    width: 250,
                    height: 250,
                    borderRadius: 200,
                    borderWidth: 2,
                    borderColor: "white",
                    marginBottom: 16,
                    backgroundColor: "white",
                  }}
                />
              )}
              <S.TextActorName>
                {isLoading ? (
                  <Skeleton
                    width={150}
                    height={30}
                    radius={10}
                    colorMode="light"
                  />
                ) : (
                  actorDetails.name
                )}
              </S.TextActorName>
              <S.TextTemplateActor>
                {isLoading ? (
                  <Skeleton
                    width={100}
                    height={20}
                    radius={10}
                    colorMode="light"
                  />
                ) : (
                  actorDetails.place_of_birth
                )}
              </S.TextTemplateActor>
            </S.ViewActorProfile>
            <S.ViewContentProps>
              {isLoading ? (
                <Skeleton
                  width={120}
                  height={45}
                  radius={20}
                  colorMode="light"
                />
              ) : (
                <S.ViewContentPropsTemplate style={{ marginLeft: 16 }}>
                  <S.TextTemplateTitleProp>Gênero</S.TextTemplateTitleProp>
                  <S.TextTemplateActorProp>
                    {gender !== "Unknown" ? gender : "??"}
                  </S.TextTemplateActorProp>
                </S.ViewContentPropsTemplate>
              )}
              {isLoading ? (
                <Skeleton
                  width={120}
                  height={45}
                  radius={20}
                  colorMode="light"
                />
              ) : (
                <S.ViewContentPropsTemplate style={{ marginRight: 12 }}>
                  <S.TextTemplateTitleProp>Nascimento</S.TextTemplateTitleProp>
                  <S.TextTemplateActorProp>
                    {formattedBirthDate !== "Unknown"
                      ? formattedBirthDate
                      : "??"}
                  </S.TextTemplateActorProp>
                </S.ViewContentPropsTemplate>
              )}

              {isLoading ? (
                <Skeleton
                  width={80}
                  height={45}
                  radius={20}
                  colorMode="light"
                />
              ) : (
                <S.ViewContentPropsTemplate style={{ marginRight: 16 }}>
                  <S.TextTemplateTitleProp>Idade</S.TextTemplateTitleProp>
                  <S.TextTemplateActorProp>
                    {age !== "Unknown" ? age : "??"}
                  </S.TextTemplateActorProp>
                </S.ViewContentPropsTemplate>
              )}
            </S.ViewContentProps>

            {isLoading ? (
              <Skeleton width={"100%"} height={300} colorMode="light" />
            ) : (
              <S.ViewBiography>
                <S.TextBiographyTitle>Biografia</S.TextBiographyTitle>
                {actorDetails.biography ? (
                  <S.TextBiography>{actorDetails.biography}</S.TextBiography>
                ) : (
                  <S.TextBiography>
                    Não conseguimos encontramos essa biografia :/
                  </S.TextBiography>
                )}
              </S.ViewBiography>
            )}

            <S.ViewKnowFor>
              <S.TextKnowForTitle>Conhecido(a) por:</S.TextKnowForTitle>
              {isLoading ? (
                <Skeleton width={"100%"} height={150} colorMode="light" />
              ) : knownFor.length <= 3 ? (
                <View style={{ flexDirection: "row" }}>
                  {knownFor.map(
                    (item) =>
                      item.poster_path && (
                        <TouchableOpacity
                          key={item.credit_id}
                          onPress={() => handlePressItem(item)}
                        >
                          <View style={{ marginRight: 16, width: 100 }}>
                            <Image
                              source={{
                                uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                              }}
                              style={{
                                width: 100,
                                height: 150,
                                borderRadius: 8,
                              }}
                            />
                            <S.TextKnowForName>
                              {item.title || item.name}
                            </S.TextKnowForName>
                          </View>
                        </TouchableOpacity>
                      )
                  )}
                </View>
              ) : (
                <FlatList
                  data={knownFor}
                  horizontal
                  keyExtractor={(item) => item.credit_id}
                  windowSize={51}
                  renderItem={({ item }) =>
                    item.poster_path ? (
                      <TouchableOpacity onPress={() => handlePressItem(item)}>
                        <View style={{ marginRight: 16, width: 100 }}>
                          <Image
                            source={{
                              uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                            }}
                            style={{ width: 100, height: 150, borderRadius: 8 }}
                          />
                          <S.TextKnowForName>
                            {item.title || item.name}
                          </S.TextKnowForName>
                        </View>
                      </TouchableOpacity>
                    ) : null
                  }
                />
              )}
            </S.ViewKnowFor>
          </S.ViewContent>
        </ScrollView>
      </S.Container>
    </MotiView>
  );
};

export default ActorPage;
