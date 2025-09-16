import { apiUrl } from "./Environment";

const ApiUrlConstant = {
  // authentication

  Login:()=>`${apiUrl}/auth/login/`,
  Signup:()=>`${apiUrl}/auth/Signup/`,

  // file 
  sendFileToServer: () => `${apiUrl}/provider/upload/`,
};

export default ApiUrlConstant;
