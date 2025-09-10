import { createSlice } from "@reduxjs/toolkit";

export const loginSlice = createSlice({
  name: "login",
  initialState: {
    isLoggedIn: false,
    user: {},
  },
  reducers: {
    userlogin(state, action) {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    userlogout(state) {
      state.isLoggedIn = false;
      state.user = {};
    },
  },
});

export const { userlogin, userlogout } = loginSlice.actions;
export default loginSlice.reducer;
