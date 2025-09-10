import { axiosInstance } from "../../Interceptors/axiosInterceptor";
import ApiUrlConstant from "../../Utils/UrlConstants";

const Service = {
  uploadData: (data) => {
    return axiosInstance.post(ApiUrlConstant.sendFileToServer(), data);
  },
};

export default Service;
