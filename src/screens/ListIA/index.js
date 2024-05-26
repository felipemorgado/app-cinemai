import { View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState, useMemo } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import TinderCard from "react-tinder-card";

import * as S from "./styles";
import { useNavigation } from "@react-navigation/native";
import { Skeleton } from "moti/skeleton";
import { API_KEY_GEMINI, API_KEY_TMDB } from "@env";

const ListIA = () => {
  const [media, setMedia] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const { user } = useAuth();
  const [movieRecommendations, setMovieRecommendations] = useState([]);
  const [seriesRecommendations, setSeriesRecommendations] = useState([]);
  const [lastDirection, setLastDirection] = useState();
  const [swipedCards, setSwipedCards] = useState([]);
  const [recommendationsFetched, setRecommendationsFetched] = useState(false);
  const [showAgainButton, setShowAgainButton] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showNoRecommendationsMessage, setShowNoRecommendationsMessage] =
    useState(true);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [genres, setGenres] = useState({});
  const childRefs = useMemo(
    () =>
      Array(movieRecommendations.length + seriesRecommendations.length)
        .fill(0)
        .map((i) => React.createRef()),
    [movieRecommendations, seriesRecommendations]
  );

  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const mediaRef = ref(db, `users/${user.uid}/media`);
      const watchlistRef = ref(db, `users/${user.uid}/watchlist`); // Referência para a watchlist
      const genresRef = ref(db, `users/${user.uid}/genero`);

      // Listener para 'media'
      onValue(mediaRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const mediaArray = Object.values(data);
          setMedia(mediaArray);
        }
      });

      // Listener para 'watchlist'
      onValue(watchlistRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const watchlistArray = Object.values(data);
          setWatchlist(watchlistArray);
        }
      });

      // Listener para 'genero'
      onValue(genresRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGenres(data);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    setTimeout(() => {
      setIsButtonDisabled(false);
      setIsLoading(false);
    }, 10000);
  }, []);

  async function getRecommendations(media, watchlist, genres, type) {
    // Adiciona watchlist como parâmetro
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAt8zJUMTG7h1IqVCmc9TwpFLDLhmmEHR8`;

    // Crie uma string com os filmes e séries da watchlist
    const watchlistString =
      watchlist.length > 0 ? `, e já assisti: ${watchlist.join(", ")}` : "";

    let genresString = "";
    if (Object.keys(genres).length > 0) {
      const favoriteGenres = [];
      for (const mediaType in genres) {
        for (const genre in genres[mediaType]) {
          if (genres[mediaType][genre]) {
            favoriteGenres.push(genre);
          }
        }
      }
      if (favoriteGenres.length > 0) {
        genresString = `, e gosto dos seguintes gêneros: ${favoriteGenres.join(
          ", "
        )}`;
      }
    }

    const data = {
      contents: [
        {
          parts: [
            {
              text: `Dado que gosto dos seguintes filmes e séries: ${media.join(
                ", "
              )}${watchlistString}${genresString}. Que outros ${type} você recomendaria? Apenas fale o titulo e somente 10 ${type} e só os que estiverem no site TMDB e não repita filmes e séries e nem titulos parecidos! **Não repita o ${type} mesmo se o título em outro idioma for diferente!**`,
            },
          ],
        },
      ],
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await axios.post(url, data, config);
      if (response.data.candidates && response.data.candidates.length > 0) {
        const rawRecommendations =
          response.data.candidates[0].content.parts[0].text.trim();
        const recommendations = rawRecommendations.split("\n").map((title) => {
          title = title.replace(/^\d+\.\s*/, "").trim();
          title = title.replace(/^\s*\[.*\]\s*/, "").trim();
          return title;
        });
        const uniqueRecommendations = Array.from(new Set(recommendations));
        return uniqueRecommendations;
      }
    } catch (error) {
      console.error("Erro ao chamar a API Gemini:", error);
    }

    return null;
  }

  function processTitle(title) {
    title = title.replace(/^(Filme:|Série:)\s*/, "");
    title = title.replace(/\s*\(.*\)\s*/, "");
    return title;
  }

  async function searchTMDB(title) {
    // Verificando se o título já existe nas listas de recomendações
    // if (
    //   movieRecommendations.find((movie) => movie.title === title) ||
    //   seriesRecommendations.find((serie) => serie.name === title)
    // ) {
    //   return; // Título já existe, não adiciona
    // }

    const url = `https://api.themoviedb.org/3/search/multi?api_key=0d07f319cd1283cd8c7123ff6731a97a&language=pt-BR&query=${encodeURIComponent(
      title
    )}`;
    // console.log("URL de pesquisa TMDB:", url);
    try {
      const response = await axios.get(url);
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];

        // Verifica se o ID já existe nas listas de recomendações
        if (
          movieRecommendations.some((movie) => movie.id === result.id) ||
          seriesRecommendations.some((serie) => serie.id === result.id)
        ) {
          return; // ID já existe, não adiciona
        }

        const mediaDetails = await getMediaDetails(
          result.id,
          result.media_type
        );

        if (result.media_type === "movie") {
          setMovieRecommendations((oldRecommendations) => [
            ...oldRecommendations,
            {
              ...result,
              ...mediaDetails,
            },
          ]);
        } else if (result.media_type === "tv") {
          setSeriesRecommendations((oldRecommendations) => [
            ...oldRecommendations,
            {
              ...result,
              ...mediaDetails,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Erro ao chamar a API TMDB:", error);
    }
    return null;
  }

  async function getMediaDetails(mediaId, mediaType) {
    const url = `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=0d07f319cd1283cd8c7123ff6731a97a&language=pt-BR&append_to_response=credits`;
    try {
      const response = await axios.get(url);
      // Verifica se a resposta contém um poster
      if (response.data.poster_path) {
        const cast = response.data.credits.cast.slice(0, 10).map((actor) => ({
          name: actor.name,
          profile_path: actor.profile_path,
          id: actor.id,
        }));

        const genres = response.data.genres.map((genre) => genre.name);

        return { cast, genres };
      } else {
        return null; // Nenhum poster encontrado
      }
    } catch (error) {
      console.error("Erro ao obter detalhes da mídia:", error);
      return { cast: [], genres: [] };
    }
  }

  const swiped = (direction, item) => {
    // console.log(
    //   "removing: " + (item.title || item.name) + " to the " + direction
    // );
    setLastDirection(direction);

    if (direction === "right") {
      navigation.navigate("MediaPage", {
        image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        title: item.title || item.name,
        description: item.overview,
        releaseDate: item.release_date || item.first_air_date,
        voteAverage: item.vote_average,
        genres: item.genres,
        cast: item.cast,
        id: item.id.toString(),
        media_type: item.media_type,
      });
    }

    setSwipedCards((prevSwipedCards) => [
      ...prevSwipedCards,
      item.title || item.name,
    ]);
    setMovieRecommendations((oldRecommendations) =>
      oldRecommendations.filter(
        (movie) => movie.title !== (item.title || item.name)
      )
    );
    setSeriesRecommendations((oldRecommendations) =>
      oldRecommendations.filter(
        (serie) => serie.name !== (item.title || item.name)
      )
    );
  };

  const outOfFrame = (name) => {
    // console.log(name + " left the screen!");
  };

  const swipe = (dir) => {
    const cardsLeft = [...movieRecommendations, ...seriesRecommendations];
    if (cardsLeft.length) {
      const toBeRemoved =
        cardsLeft[cardsLeft.length - 1].title ||
        cardsLeft[cardsLeft.length - 1].name;
      const index = cardsLeft
        .map((item) => item.title || item.name)
        .indexOf(toBeRemoved);
      childRefs[index].current.swipe(dir);
    }
  };

  const fetchMoreRecommendations = () => {
    setSwipedCards([]);
    setMovieRecommendations([]);
    setSeriesRecommendations([]);
    setRecommendationsFetched(false); // Reseta o estado para permitir novas buscas
    setIsLoading(true); // Define isLoading como true ao iniciar a busca
    setIsButtonDisabled(true); // Desabilita o botão ao iniciar a busca
    setTimeout(() => {
      setIsButtonDisabled(false); // Habilita o botão após 1 segundo
      setIsLoading(false); // Define isLoading como false após o carregamento
    }, 7000); // Ajuste o tempo de espera conforme necessário
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!recommendationsFetched && media.length > 0) {
        getRecommendations(media, watchlist, genres, "filme").then((titles) => {
          if (titles) {
            console.log("Recomendações da Gemini para filme:", titles);
            titles.forEach((title) => {
              searchTMDB(title);
            });
          }
        });

        getRecommendations(media, watchlist, genres, "série").then((titles) => {
          if (titles) {
            console.log("Recomendações da Gemini para série:", titles);
            titles.forEach((title) => {
              searchTMDB(title);
            });
          }
        });
        setRecommendationsFetched(true);
        setShowAgainButton(true);
        setShowNoRecommendationsMessage(false);
      }
    }, [media, watchlist, genres, recommendationsFetched])
  );

  return (
    <S.Container>
      <S.ViewHeader>
        <S.TextHeaderTitle>CinemAI</S.TextHeaderTitle>
      </S.ViewHeader>
      <S.Header>
        <S.HeaderTitle>Recomendações para você!</S.HeaderTitle>
        <S.HeaderSubTitle>(por inteligência artificial!)</S.HeaderSubTitle>
      </S.Header>

      {showNoRecommendationsMessage ? (
        <S.ViewNotFound>
          <S.TextNotFound>
            Adicione algum Filme/Série aos favoritos para conseguir gerar
            recomendações!
          </S.TextNotFound>
        </S.ViewNotFound>
      ) : isLoading ? ( // Adiciona a verificação de isLoading
        <Skeleton width={"90%"} height={590} colorMode="light" />
      ) : (
        <S.CardContainer>
          <View>
            {[...movieRecommendations, ...seriesRecommendations]
              .filter((item) => !swipedCards.includes(item.title || item.name))
              // Filtra itens que possuem poster
              .filter((item) => item.poster_path !== null)
              .map((item, index) => (
                <TinderCard
                  ref={childRefs[index]}
                  key={item.title || item.name}
                  onSwipe={(dir) => swiped(dir, item)}
                  onCardLeftScreen={() => outOfFrame(item.title || item.name)}
                  preventSwipe={["up", "down"]}
                  swipeThreshold={2}
                >
                  <S.Card style={{ borderRadius: 20 }}>
                    <S.ImageBackground
                      source={{
                        uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                      }}
                    >
                      <S.CardTitle numberOfLines={2}>
                        {item.title || item.name}
                      </S.CardTitle>
                      <S.CardMediaType>
                        {item.media_type === "movie" ? "Filme" : "Série"}
                      </S.CardMediaType>
                    </S.ImageBackground>
                  </S.Card>
                </TinderCard>
              ))}
          </View>
        </S.CardContainer>
      )}

      <S.ViewButton>
        {showAgainButton && !isButtonDisabled && (
          <S.TouchableOpacity
            onPress={fetchMoreRecommendations}
            disabled={isButtonDisabled} // Desabilita o botão se isButtonDisabled for true
          >
            <S.TOpacityText>Clique para gerar novamente!</S.TOpacityText>
          </S.TouchableOpacity>
        )}
      </S.ViewButton>
    </S.Container>
  );
};

export default ListIA;
