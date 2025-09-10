import { apiUrl } from "./Environment";

const ApiUrlConstant = {
  sendFileToServer: () => `${apiUrl}/provider/upload/`,
};

export default ApiUrlConstant;
