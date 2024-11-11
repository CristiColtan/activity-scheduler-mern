import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedTabs: {},
};

const taskTabsSlice = createSlice({
  name: "taskTabs",
  initialState,
  reducers: {
    setSelectedTabForTask: (state, action) => {
      const { taskID, tabIndex } = action.payload;
      state.selectedTabs[taskID] = tabIndex;
    },
  },
});

export const { setSelectedTabForTask } = taskTabsSlice.actions;

export default taskTabsSlice.reducer;
