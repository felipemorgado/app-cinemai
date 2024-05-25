import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
  flex: 1;
  background-color: black;
`;

// div icons

export const ViewBackIcon = styled.View`
  background-color: rgba(10, 2, 29, 1);
  margin-top: 70px;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  border-radius: 20px;
  margin-left: 8px;
  padding-bottom: 12px;
`;

export const ViewFavWatch = styled.View`
  background-color: rgba(10, 2, 29, 1);
  margin-top: 66px;
  position: absolute;
  top: 0;
  align-self: flex-end;
  z-index: 1;
  border-radius: 20px 0 0 20px;
  padding-left: 8px;
`;

// div title

export const ViewTitleSM = styled.View`
  position: absolute;
  top: 39%;
  align-self: flex-start;
  z-index: 1;
  justify-content: center;
  padding: 0 10px;
`;

export const ViewTitleLG = styled.View`
  position: absolute;
  top: 36%;
  align-self: flex-start;
  z-index: 1;
  justify-content: center;
  padding: 0 10px;
`;

// div content

export const ViewContent = styled.View`
  /* background-color: #1f1f1f; */
  background-color: rgba(10, 2, 29, 1);
`;

export const ViewReleaseRating = styled.View`
  margin-top: 8px;
  flex-direction: row;
  justify-content: space-evenly;
  flex-wrap: wrap;
`;

export const TextBold = styled.Text`
  color: rgb(163 163 163);
  font-size: 15px;
  font-weight: bold;
`;

export const TextDesc = styled.Text`
  color: rgb(163 163 163);
  font-size: 14px;
`;

export const TextTitleCast = styled.Text`
  color: black;
  background-color: white;
  font-size: 22px;
  /* margin-bottom: 8px; */
  border-radius: 20px 20px 0px 0px;
  padding: 6px;
  font-weight: bold;
`;

export const TextCast = styled.Text`
  color: white;
  font-size: 18px;
  margin-top: 8px;
  margin-bottom: 8px;
  align-self: center;
`;

export const TextLimited = styled.Text`
  color: white;
  font-size: 20px;
  align-self: center;
  margin-right: 16px;
`;

export const ViewGenres = styled.View`
  margin-top: 16px;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  margin-right: 8px;
  margin-left: 8px;
`;

export const ViewDesc = styled.View`
  margin-top: 16px;
  flex-direction: row;
  justify-content: flex-start;
  margin-right: 16px;
  margin-left: 16px;
`;

export const ViewCast = styled.View`
  margin-top: 16px;
  margin-bottom: 20px;
  margin-left: 16px;
`;

// export const `

// `;
