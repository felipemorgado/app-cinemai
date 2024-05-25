# CinemAI

## Sobre o projeto

CinemAI é um aplicativo React Native desenvolvido com Expo, que permite aos usuários explorar atores, filmes e séries, adicionar itens às suas listas de favoritos e assistidos, descobrir novas recomendações através da inteligência artificial e muito mais.

## Recursos

- **Explorar filmes e séries:** Visualize informações detalhadas sobre filmes e séries, incluindo sinopse, elenco, data de lançamento, classificação e gêneros.
- **Favoritos e Assistidos:** Você consegue manter seu histórico de filmes/séries assistidos e favoritos.
- **Pesquisar:** Encontre filmes e séries por título.
- **Perfil do usuário:** Personalize seu perfil com seus gêneros de filmes e séries favoritos, atores favoritos para melhorar a recomendação por Inteligência Artificial.
- **Recomendações:** Descubra novas recomendações com base em seus gostos e preferências através do modelo de linguagem grande Gemini.

## Instalação e execução

**Requisitos:**

- Node.js e npm (ou yarn) instalados.
- Expo CLI instalado: `npm install -g expo-cli` ou `yarn global add expo-cli`

**Clonar o repositório e instalar depedências:**

```bash
 # Clone o repositório:
 git clone https://github.com/felipemorgado/app-cinemai.git

 # Navegue até a pasta do projeto:
 cd cinemai

 # Instale as dependências:
 npm install
 # ou
 yarn install
```

**Pegando as API KEYs:**

Com o node, expo cli e as dependências instaladas, basta abrir a pasta do projeto no VSCode e criar o arquivo `.env.local`. Nesse arquivo você vai colocar as API Key do Firebase, TMDB e do Gemini, igual demostrado no arquivo ja existente `.env.template`.

- Firebase: entre no [site](https://firebase.google.com/?hl=pt) > go to console > criar um projeto > coloque o nome do seu proejto e espere o projeto ser criado > na parte "Comece adicionando o Firebase ao seu aplicativo" escolha Web > coloque o nome > Registrar App > Agora você terá o firebase config para colocar dentro da `.env.local`
  ⠀
- TMDB: entre no [site](https://www.themoviedb.org/) > crie sua conta > clique no seu perfil e va em definições > API > criar > Coloque qualquer coisa no nome e url da aplicação > prossiga com as informações necessarias > Agora pegue a chave da api e coloque dentro da `.env.local` na `API_KEY_TMDB=ColoqueAqui`
  ⠀
- Gemini: entre no [site](https://aistudio.google.com/) > get api key > create api key > create api key in new project > Agora pegue a API KEY e coloque dentro da `.env.local` na `API_KEY_GEMINI=ColoqueAqui`

**Execução do projeto:**

Para executar o aplicativo no celular é necessário o Expo Go e para PC é necessário emulador Android com o Expo Go instalado. Para instalar o expo go ou quiser mais instruções para Emulador basta entrar na [documentação da expo](https://docs.expo.dev/get-started/set-up-your-environment/), escolher o dispositivo(Android ou Emulador Android) e escolher Expo Go independente da escolha do dispositivo!

```bash
# Com a escolha do dispositivo e o Expo Go instalado, rode esse comnando,
# para limpar o cache do expo por causa das alterações feitas na .env.local
# (rode os comandos na pasta do projeto 'ex: G:\ReactNativeProjects\app-cinemai')
npx expo start --clear

# após o comando terminar, você pode parar o servidor apertando CTRL + C
# Agora pode usar esse comando sem o sufixo --clear
npx expo start

# Após aparecer no console as opções para pressionar no conosle,
# basta pressionar a tecla "A"  para rodar o aplicativo no dispositivo
# ou pressionar SHIFT + A se tiver usando mais de 1 dispositivo.
# Pronto agora basta esperar o aplicativo buildar!
```

## Executando o .apk de desenvolvimento

Se você não deseja pegar nenhuma API KEY e apenas rodar o aplicativo(em modo de desenvolvimento) leia atentamente a baixo.
A build que temos do aplicativo é de desenvolvimento, então você obrigatoriamente precisa ter instalado os [requisitos](#instalação-e-execução), clonar o repositório(e instalar as dependencias) e rodar dentro da pasta do projeto os seguintes comandos:

```bash
npx expo start --clear
npx expo start

# obs: se você utiliza internet cabeada no PC e por acaso não conseguiu rodar o aplicativo
# no celular, utilize esse comando npx expo start --tunnel.

# Após aparecer opções para pressionar no conosle,
# basta pressionar a tecla "A"  para rodar o aplicativo no dispositivo
# ou pressionar SHIFT + A se estiver usando mais de 1 dispositivo.
# Pronto agora basta esperar o aplicativo buildar!
```

## Demonstração

<div style="display: flex; flex-wrap: wrap;">
  <p>1.</p>
  <img src="examples/cinemai.png" alt="Tela Home">
  <p>2.</p>
  <img src="examples/cinemai2.png" alt="Tela de pesquisa">
</div>
