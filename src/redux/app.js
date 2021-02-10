import { createSlice } from '@reduxjs/toolkit'

const appSlice = createSlice({
  name: 'app',
  initialState: {
    mode: 'light',
    locale: 'en',
    window: {},
    view: { tags: true },
  },
  reducers: {
    toggleMode: state => ({
      ...state,
      mode: state.mode === 'light' ? 'dark' : 'light',
    }),
    toggleLocale: state => ({
      ...state,
      locale: state.locale === 'en' ? 'he' : 'en',
    }),
    setDimensions: (state, { payload: { height, width } }) => ({
      ...state,
      window: {
        height,
        width,
      },
    }),
    toggleTags: state => ({
      ...state,
      view: {
        ...state.view,
        tags: !state.view.tags,
      },
    }),
  },
})

const { actions, reducer } = appSlice

export default reducer
export const { toggleMode, toggleLocale, setDimensions, toggleTags } = actions
