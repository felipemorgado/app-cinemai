import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(10, 2, 29, 1);
`;

export const ViewHeader = styled.View`
  position: absolute;
  top: 10px;
  left: 0;
  margin-left: 16px;
  margin-top: 40px;
`;

export const TextHeaderTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: white;
`;

export const ViewNotFound = styled.View`
  flex: 1;
  width: 300px;
  justify-content: center;
  align-items: center;
  padding: 16px;
  /* z-index: -2; */
`;

export const TextNotFound = styled.Text`
  color: black;
  font-size: 18px;
  margin-top: 60px;
`;

export const Header = styled.View`
  position: absolute;
  width: 100%;
  top: 10%;
  left: 0;
  align-items: center;
  margin-top: 40px;
  /* margin-bottom: 40px; */
`;

export const HeaderTitle = styled.Text`
  color: white;
  font-size: 26px;
  margin-left: 10px;
  margin-right: 10px;
  font-weight: bold;
`;

export const HeaderSubTitle = styled.Text`
  color: white;
  font-size: 16px;
  margin-left: 10px;
  margin-right: 10px;

  /* font-weight: bold; */
`;

export const CardContainer = styled.View`
  width: 90%;
  max-width: 300px;
  height: 425px;
  margin-top: 90px;
  position: absolute;
  top: 15%;
`;

export const Card = styled.View`
  position: absolute;
  /* background-color: green; */
  width: 100%;
  max-width: 300px;
  height: 450px;
  border-width: 4px;
  border-color: white;
  background-color: white;
`;

export const ImageBackground = styled.ImageBackground`
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 20px;
`;

export const CardTitle = styled.Text`
  width: 100%;
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  bottom: 0;
  padding: 10px;
  color: rgba(10, 2, 29, 1);
  background-color: white;
`;

export const CardMediaType = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: white;
  padding-top: 8px;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 4px;
  background-color: rgba(10, 2, 29, 1);
  align-self: flex-start;
  border-top-right-radius: 0;
  border-bottom-right-radius: 20px;
  border-width: 2px;
  border-color: white;
`;

export const ViewButton = styled.View`
  position: absolute;
  width: 100%;
  max-width: 300px;
  height: 450px;
  border-width: 4px;
  border-color: white;
  background-color: white;
  z-index: -1;
  justify-content: center;
  border-radius: 20px;
  bottom: 150px;
  top: 25%;
`;

export const TouchableOpacity = styled.TouchableOpacity`
  background-color: rgba(10, 2, 29, 1);
  padding: 10px;
  border-radius: 5px;
  align-items: center;
  align-self: center;
  border-radius: 20px;
  height: 385px;
  margin-bottom: 30px;
  justify-content: center;
`;

export const TOpacityText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 26px;
  margin: 10px;
`;

// export const `

// `;
