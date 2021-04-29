import { createSlice } from '@reduxjs/toolkit'

const appSlice = createSlice({
  name: 'app',
  initialState: {
    mode: 'light',
    locale: 'he',
    drawerOpen: false,
    window: {},
    view: { editor: true, tags: true, relations: false },
    editor: {},
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
    toggleDrawer: state => ({
      ...state,
      drawerOpen: !state.drawerOpen,
    }),
    setDimensions: (state, { payload: { height, width } }) => ({
      ...state,
      window: {
        height,
        width,
      },
    }),
    setAppProp: (state, { payload }) => ({
      ...state,
      ...payload,
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
    toggleExclusiveRelations: (state, { payload: { id } }) => ({
      ...state,
      view: {
        ...state.view,
        exclusiveRelations: !state.view.exclusiveRelations,
      },
    }),
    hide: (state, { payload }) => ({
      ...state,
      hide: {
        ...state.hide,
        ...payload,
      },
    }),
  },
})

const { actions, reducer } = appSlice

export default reducer
export const {
  toggleMode,
  toggleLocale,
  toggleDrawer,
  toggleExclusiveRelations,
  setDimensions,
  view,
  view: setView,
  hide,
  setAppProp,
} = actions
