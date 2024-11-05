import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  expandedRows: [],
};

const expandSlice = createSlice({
  name: "expand",
  initialState,
  reducers: {
    toggleExpand: (state, action) => {
      const index = state.expandedRows.indexOf(action.payload);
      if (index === -1) state.expandedRows.push(action.payload);
      else state.expandedRows.splice(index, 1);
    },
    setExpandedRows: (state, action) => {
      state.expandedRows = action.payload;
    },
  },
});

export const { toggleExpand, setExpandedRows } = expandSlice.actions;

export default expandSlice.reducer;
