import axios from "axios";
import { store } from "../Redux/Store";
import { apiUrl } from "../Utils/Environment";
import showToast from "../Shared/Utils/ToastNotification";
import {
  hideLoader,
  showLoader,
} from "../Shared/Slice/LoaderSlice";
import { decryptData, encryptData } from "../Utils/Encryption";
import { userlogout } from "../Shared/Slice/AuthSlice";

const axiosInstance = axios.create({
  baseURL: apiUrl,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const authToken = state?.auth?.user?.token?.access;

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // if (config.data && typeof config.data === "object") {
    //   const encrypted = encryptData(config.data);
    //   config.data = {
    //     payload: encrypted,
    //   };
    // }

    if (config.loaderKey !== false) {
      store.dispatch(showLoader(config.loaderKey || true));
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config.loaderKey !== false) {
      store.dispatch(hideLoader(response.config.loaderKey || true));
    }

    // ✅ Decrypt if payload exists
    if (response?.data?.payload) {
      // const decrypted = decryptData(response.data.payload);
      if (response?.data?.payload) {
        return response?.data?.payload;
      } else {
        console.error("❌ Failed to decrypt response payload.");
        return Promise.reject(new Error("Failed to decrypt response"));
      }
    }

    return response.data;
  },
  (error) => {
    const { response } = error;

    // ✅ Decrypt payload even in error response
    if (response?.data?.payload) {
      const decrypted = decryptData(response.data.payload);
      if (decrypted) {
        error.response.data = decrypted; // override encrypted with decrypted
      } else {
        console.error("❌ Failed to decrypt error response payload.");
      }
    }

    if (
      response?.status === 401 &&
      (response.statusText === "Unauthorized" ||
        response.data?.message === "Unauthorized")
    ) {
      showToast("error", "Unauthorized or session expired. Logging out...");
      store.dispatch(userlogout());
    }

    if (error.config?.loaderKey !== false) {
      store.dispatch(hideLoader(error.config.loaderKey || true));
    }

    return Promise.reject(error);
  }
);

export { axiosInstance };
