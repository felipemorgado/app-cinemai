import styled from "styled-components/native";

export const View = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const ViewContentModal = styled.View`
  width: 100%;
  padding: 20px;
  height: 72%;
  justify-content: center;
  border-radius: 10px;
  background-color: rgba(23, 23, 23, 1);
`;

export const TextTitle = styled.Text`
  font-size: 18px;
  color: white;
  font-weight: bold;
  margin-bottom: 6px;
  padding-bottom: 4px;
`;

export const Text = styled.Text`
  font-size: 16px;
`;

export const CloseText = styled.Text`
  font-size: 22px;
  color: white;
  font-weight: bold;
  margin-top: 8px;
  padding: 8px;
  color: #e34040;
`;
