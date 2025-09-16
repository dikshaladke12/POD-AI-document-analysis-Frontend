import { axiosInstance } from "../../Interceptors/axiosInterceptor";
import ApiUrlConstant from "../../Utils/UrlConstants";

const Service = {
  Login: (data) => {
    return axiosInstance.post(ApiUrlConstant.Login(), data);
  },
  Signup: (data) => {
    return axiosInstance.post(ApiUrlConstant.Signup(), data);
  },
};

export default Service;

