import { createSlice } from "@reduxjs/toolkit";

const loaderSlice = createSlice({
  name: "loader",
  initialState: {
    global: false, // default = not loading
  },
  reducers: {
    showLoader: (state) => {
      state.global = true;
    },
    hideLoader: (state) => {
      state.global = false;
    },
  },
});

export const { showLoader, hideLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
