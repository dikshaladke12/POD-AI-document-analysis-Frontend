import { apiUrl } from "./Environment";

const ApiUrlConstant = {
  // authentication
  Login:()=>`${apiUrl}/auth/login/`,

  // file 
  sendFileToServer: () => `${apiUrl}/provider/upload/`,
};

export default ApiUrlConstant;
