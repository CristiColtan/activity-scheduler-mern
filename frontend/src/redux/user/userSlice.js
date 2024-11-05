import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
  sidebarOpen: false,
  selectedAdminTasksTab: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setOpenSidebar: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    signOutUserStart: (state) => {
      state.loading = true;
    },
    signOutUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    signOutUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateUserStart: (state) => {
      state.loading = true;
    },
    updateUserSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedTab: (state, action) => {
      state.selectedAdminTasksTab = action.payload;
    },
  },
});

export const {
  signInStart,
  signInFailure,
  signInSuccess,
  setOpenSidebar,
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  updateUserStart,
  updateUserFailure,
  updateUserSuccess,
  setSelectedTab,
} = userSlice.actions;

export default userSlice.reducer;
