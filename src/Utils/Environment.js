const environments = {
  local: {
    url: "http://0.0.0.0:8003", // set you local url here
  },
  staging: {
    url: "", // Set your staging URL here
  },
  production: {
    url: "", // Set your production URL here
  },
};

const currentEnv = process.env.REACT_APP_ENV || "local"; // Default to local if not set

export const apiUrl = environments[currentEnv].url;
