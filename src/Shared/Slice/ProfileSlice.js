import { createSlice } from "@reduxjs/toolkit";

export const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: null, // Stores profile data (name, email, etc.)
  },
  reducers: {
    setProfile(state, action) {
      state.user = action.payload; // Set profile data
    },
    clearProfile(state) {
      state.user = null; // Clear profile data
    },
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
