import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ScrollView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

import { set, ref, getDatabase, get, child, remove } from "firebase/database";
import useAuth from "../../hooks/useAuth";
import { useNavigation } from "@react-navigation/native";

import * as S from "./styles";
import { StatusBar } from "expo-status-bar";

import Toast from "react-native-toast-message";

import { useFocusEffect } from "@react-navigation/native";

const MediaPage = ({ route, navigation }) => {
  const {
    image,
    title,
    description,
    releaseDate,
    voteAverage,
    genres,
    cast,
    id,
    media_type,
  } = route.params;

  const titleLengthThreshold = 28;
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const scrollViewRef = useRef();
  const debounceTimeout = useRef(null);

  useEffect(() => {
    const db = getDatabase();
    const mediaRef = ref(db, `users/${user.uid}/media/${id}`);

    get(mediaRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setIsFavorited(true);
        } else {
          setIsFavorited(false);
        }
      })
      .catch((error) => {
        console.error("Erro ao recuperar dados do Firebase: ", error);
      });
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const watchlistRef = ref(db, `users/${user.uid}/watchlist/${id}`);

    get(watchlistRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setIsInWatchlist(true);
        } else {
          setIsInWatchlist(false);
        }
      })
      .catch((error) => {
        console.error("Erro ao recuperar dados do Firebase: ", error);
      });
  }, []);

  // Use o useFocusEffect para redefinir a posição do ScrollView
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }
    }, [])
  );

  const debouncedHandleHeartIconClick = () => {
    // Limpa o timeout anterior
    clearTimeout(debounceTimeout.current);

    // Define um novo timeout
    debounceTimeout.current = setTimeout(() => {
      handleHeartIconClick();
    }, 500);
  };

  const debouncedHandleCheckIconClick = () => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      handleCheckIconClick();
    }, 500);
  };

  const handleHeartIconClick = () => {
    const db = getDatabase();
    const mediaRef = ref(db, `users/${user.uid}/media/${id}`);

    // Primeiro, verifica se o item já está nos favoritos
    get(mediaRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Se o item já está nos favoritos, remove
          remove(mediaRef)
            .then(() => {
              console.log("Filme/Série removido com sucesso do Firebase!");
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
              console.error("Erro ao remover filme/série do Firebase: ", error);
              Toast.show({
                type: "fav",
                text1: "Error: não foi possível remover dos favoritos!",
                text1Style: {
                  color: "black",
                  fontSize: 20,
                },
                autoHide: true,
                visibilityTime: 2000,
                swipeable: false,
              });
            });
        } else {
          // Se o item não está nos favoritos, verifica o limite e adiciona
          get(ref(db, `users/${user.uid}/media`))
            .then((snapshot) => {
              if (
                snapshot.exists() &&
                Object.keys(snapshot.val()).length >= 10
              ) {
                Alert.alert(
                  "Limite de favoritos atingido!",
                  "Você já atingiu o limite de 10 favoritos."
                );
                return;
              }
              // Se não atingiu o limite, prossegue com a adição
              set(mediaRef, media_type)
                .then(() => {
                  console.log(
                    "Filme/Série adicionado com sucesso ao Firebase!"
                  );
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
                  console.error(
                    "Erro ao adicionar filme/série ao Firebase: ",
                    error
                  );
                  Toast.show({
                    type: "fav",
                    text1: "Error: não foi possível adicionar aos favoritos!",
                    text1Style: {
                      color: "black",
                      fontSize: 20,
                    },
                    autoHide: true,
                    visibilityTime: 2000,
                    swipeable: false,
                  });
                });
            })
            .catch((error) => {
              console.error("Erro ao recuperar dados do Firebase: ", error);
              Toast.show({
                type: "fav",
                text1: "Error: não foi possível recuperar os dados!",
                text1Style: {
                  color: "black",
                  fontSize: 20,
                },
                autoHide: true,
                visibilityTime: 2000,
                swipeable: false,
              });
            });
        }
      })
      .catch((error) => {
        console.error("Erro ao recuperar dados do Firebase: ", error);
        Toast.show({
          type: "fav",
          text1: "Error: não foi possível recuperar os dados!",
          text1Style: {
            color: "black",
            fontSize: 20,
          },
          autoHide: true,
          visibilityTime: 2000,
          swipeable: false,
        });
      });
  };

  const handleCheckIconClick = () => {
    const db = getDatabase();
    const watchlistRef = ref(db, `users/${user.uid}/watchlist/${id}`);

    get(watchlistRef)
      .then((snapshot) => {
        // Verifica se o item já está na watchlist
        if (snapshot.exists()) {
          // Remove o item da watchlist
          remove(watchlistRef)
            .then(() => {
              console.log(
                "Filme/Série removido com sucesso da lista de observação!"
              );
              setIsInWatchlist(false);
              Toast.show({
                type: "watch",
                text1: "Removeu dos assistidos!",
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
              console.error(
                "Erro ao remover filme/série da lista de observação: ",
                error
              );
              Toast.show({
                type: "fav",
                text1: "Error: não foi possível remover dos assistidos!",
                text1Style: {
                  color: "black",
                  fontSize: 20,
                },
                autoHide: true,
                visibilityTime: 2000,
                swipeable: false,
              });
            });
        } else {
          // Verifica o limite antes de adicionar
          get(ref(db, `users/${user.uid}/watchlist`))
            .then((snapshot) => {
              if (
                snapshot.exists() &&
                Object.keys(snapshot.val()).length >= 10
              ) {
                Alert.alert(
                  "Limite de assistidos atingido!",
                  "Você já atingiu o limite de 10 assistidos."
                );
                return;
              }
              // Adiciona o item à watchlist
              set(watchlistRef, media_type)
                .then(() => {
                  console.log(
                    "Filme/Série adicionado com sucesso à lista de observação!"
                  );
                  setIsInWatchlist(true);
                  Toast.show({
                    type: "watch",
                    text1: "Adicionou aos assistidos!",
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
                  console.error(
                    "Erro ao adicionar filme/série à lista de observação: ",
                    error
                  );
                  Toast.show({
                    type: "fav",
                    text1: "Error: não foi possível adicionar aos assistidos!",
                    text1Style: {
                      color: "black",
                      fontSize: 20,
                    },
                    autoHide: true,
                    visibilityTime: 2000,
                    swipeable: false,
                  });
                });
            })
            .catch((error) => {
              console.error("Erro ao recuperar dados do Firebase: ", error);
              Toast.show({
                type: "fav",
                text1: "Error: não foi possível recuperar os dados!",
                text1Style: {
                  color: "black",
                  fontSize: 20,
                },
                autoHide: true,
                visibilityTime: 2000,
                swipeable: false,
              });
            });
        }
      })
      .catch((error) => {
        console.error("Erro ao recuperar dados do Firebase: ", error);
        Toast.show({
          type: "fav",
          text1: "Error: não foi possível recuperar os dados!",
          text1Style: {
            color: "black",
            fontSize: 20,
          },
          autoHide: true,
          visibilityTime: 2000,
          swipeable: false,
        });
      });
  };

  return (
    <S.Container>
      <StatusBar style="light" backgroundColor="rgb(10, 2, 29)" />

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
          onPress={debouncedHandleHeartIconClick} // debounce
          style={{
            marginRight: 8,
            marginTop: 8,
          }}
        />
        <FontAwesome
          name={isInWatchlist ? "check" : "plus"}
          size={isInWatchlist ? 40 : 40}
          color={isInWatchlist ? "green" : "white"}
          onPress={debouncedHandleCheckIconClick} // debounce
          style={{
            marginTop: 16,
            marginRight: 8,
            marginBottom: 8,
          }}
        />
      </S.ViewFavWatch>

      <Image source={{ uri: image }} style={{ width: "100%", height: "45%" }} />
      {title.length <= titleLengthThreshold ? (
        <S.ViewTitleSM>
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 26,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </S.ViewTitleSM>
      ) : (
        <S.ViewTitleLG>
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 26,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </S.ViewTitleLG>
      )}
      <LinearGradient
        colors={["transparent", "rgba(10, 2, 29, 0.4)", "rgba(10, 2, 29, 1)"]}
        style={{
          position: "absolute",
          width: "100%",
          height: "45%",
          zIndex: 0,
        }}
      />
      <ScrollView
        ref={scrollViewRef}
        onLayout={() => {
          scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }}
      >
        <S.ViewContent>
          <S.ViewReleaseRating>
            <S.TextBold>
              Lançamento: {new Date(releaseDate).toLocaleDateString("pt-BR")}
            </S.TextBold>
            <S.TextBold>Rating: {Number(voteAverage).toFixed(1)}</S.TextBold>
          </S.ViewReleaseRating>

          <S.ViewGenres>
            <S.TextBold>Gêneros: {genres.join(", ")}</S.TextBold>
          </S.ViewGenres>

          <S.ViewDesc>
            {description ? (
              <S.TextDesc>{description}</S.TextDesc>
            ) : (
              <S.TextDesc>Não encontramos descrição deste conteúdo</S.TextDesc>
            )}
          </S.ViewDesc>

          <S.ViewCast>
            <S.TextTitleCast>Elenco</S.TextTitleCast>
            {cast.length === 0 ? (
              <S.TextBold
                style={{
                  padding: 16,
                  textAlign: "center",
                  marginBottom: "25%",
                  marginTop: "25%",
                }}
              >
                Não conseguimos encontrar o elenco :/
              </S.TextBold>
            ) : cast.length < 3 ? (
              <View style={{ flexDirection: "row" }}>
                {cast.map((actor, index) => (
                  <View key={index} style={{ marginRight: 26, width: 160 }}>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("ActorPage", {
                          actorName: actor.name,
                          actorId: actor.id,
                        });
                      }}
                    >
                      <Image
                        source={{
                          uri: actor.profile_path
                            ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                            : "https://static.vecteezy.com/system/resources/previews/005/337/799/original/icon-image-not-found-free-vector.jpg",
                        }}
                        style={{ width: 160, height: 200 }}
                      />
                      <S.TextCast numberOfLines={1}>{actor.name}</S.TextCast>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <ScrollView horizontal showsVerticalScrollIndicator={false}>
                {cast.map((actor, index) => (
                  <View
                    key={index}
                    style={{
                      marginRight: 26,
                      width: 160,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("ActorPage", {
                          actorName: actor.name,
                          actorId: actor.id,
                        });
                      }}
                    >
                      <Image
                        source={{
                          uri: actor.profile_path
                            ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                            : "https://static.vecteezy.com/system/resources/previews/005/337/799/original/icon-image-not-found-free-vector.jpg",
                        }}
                        style={{
                          width: 160,
                          height: 200,
                          borderBottomLeftRadius: 20,
                          borderBottomRightRadius: 20,
                          borderWidth: 2,
                          borderColor: "white",
                        }}
                      />
                      <S.TextCast numberOfLines={1}>{actor.name}</S.TextCast>
                    </TouchableOpacity>
                  </View>
                ))}
                {cast.length > 9 && <S.TextLimited>e mais...</S.TextLimited>}
              </ScrollView>
            )}
            <View
              style={{
                borderWidth: 2,
                borderColor: "white",
                width: "100%",
                marginBottom: 30,
              }}
            ></View>
          </S.ViewCast>
        </S.ViewContent>
      </ScrollView>
    </S.Container>
  );
};

export default MediaPage;
