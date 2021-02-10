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
    view: (state, { payload }) => ({
      ...state,
      view: {
        ...state.view,
        ...payload,
        exclusiveRelations: payload.relations
          ? false
          : payload.exclusiveRelations || state.view.exclusiveRelations,
      },
    }),
  },
})

const { actions, reducer } = appSlice

export default reducer
export const { toggleMode, toggleLocale, setDimensions, view } = actions
