import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.4);
`;

export const ViewContentModal = styled.View`
  height: 72%;
  width: 100%;
  padding: 16px;
  justify-content: center;
  border-radius: 10px;
  background-color: rgba(23, 23, 23, 1);
  border-radius: 8px;
  /* border-width: 2px; */
  /* border-color: white; */
`;

export const Text = styled.Text`
  font-size: 16px;
  color: white;
`;

export const TextTitleFilm = styled.Text`
  font-size: 18px;
  color: white;
  font-weight: bold;
  margin-bottom: 6px;
`;

export const ViewGenFilm = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 4px;
`;

export const TextTitleTv = styled.Text`
  font-size: 18px;
  color: white;
  font-weight: bold;
  margin-bottom: 8px;
  margin-top: 8px;
  border-width: 2px;
  border-left-width: 0;
  border-right-width: 0;
  border-bottom-width: 0;
  border-color: white;
  padding-top: 8px;
`;

export const ViewGenTv = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

export const CloseText = styled.Text`
  font-size: 22px;
  color: white;
  font-weight: bold;
  margin-top: 8px;
  padding: 8px;
  color: #e34040;
`;

// export const `

// `;
