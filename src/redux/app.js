import { createSlice } from '@reduxjs/toolkit'

const appSlice = createSlice({
  name: 'app',
  initialState: {
    mode: 'light',
    locale: 'en',
    window: {},
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
  },
})

const { actions, reducer } = appSlice

export default reducer
export const { toggleMode, toggleLocale, setDimensions } = actions
