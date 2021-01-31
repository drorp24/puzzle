import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
  // current,
} from '@reduxjs/toolkit'

import { getContent } from '../api/fakeEditorApi'

const contentAdapter = createEntityAdapter({
  selectId: entry => entry.id,
  sortComparer: (a, b) =>
    Number(b.data?.userData?.score) - Number(a.data?.userData?.score),
})

export const fetchContent = createAsyncThunk(
  'content/fetch',
  async (callback, thunkAPI) => {
    try {
      const rawContent = await getContent()
      if (!rawContent) throw new Error('No rawContent returned')
      if (rawContent.error)
        throw new Error(rawContent.error?.message?.toString())
      callback(rawContent)
      return rawContent.entityMap
    } catch (error) {
      return thunkAPI.rejectWithValue(error.toString())
    }
  }
)

const initialState = contentAdapter.getInitialState({
  loading: 'idle',
})

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clear: () => initialState,
    add: (state, entity) => {
      contentAdapter.addOne(state, entity)
    },
  },
  extraReducers: {
    [fetchContent.pending]: (state, { meta: { requestId } }) => {
      if (state.loading === 'idle') {
        state.currentRequestId = requestId
        state.loading = 'pending'
        state.error = null
      }
    },

    [fetchContent.fulfilled]: (state, { meta: { requestId }, payload }) => {
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        state.currentRequestId = undefined
        state.loading = 'idle'
        state.error = null
        contentAdapter.setAll(state, payload)
      }
    },

    [fetchContent.rejected]: (state, { meta: { requestId }, payload }) => {
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        state.currentRequestId = undefined
        state.loading = 'idle'
        state.error = payload
      }
    },
  },
})

const { reducer, actions } = contentSlice
export const { clear, add } = actions

export default reducer
