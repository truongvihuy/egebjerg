import { createSlice } from '@reduxjs/toolkit';

const cacheSlice = createSlice({
  name: 'cache',
  initialState: {
    brandList: null,
    categoryList: null,
    tagList: null,
    storeList: null,
    settingList: null
  },
  reducers: {
    setConfigCache: (state, action) => {
      state.brandList = action.payload.brand_list;
      state.tagList = action.payload.tag_list;
      state.categoryList = action.payload.category_list;
      state.storeList = action.payload.store_list;
      state.settingList = action.payload.setting_list;
    },
  }
});

export const { setConfigCache } = cacheSlice.actions;

export default cacheSlice.reducer;
