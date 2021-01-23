import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
  current,
} from '@reduxjs/toolkit'

import { getContent } from '../api/fakeEditorApi'

const contentAdapter = createEntityAdapter({
  selectId: entry => {
    console.log('entry: ', entry)
    return entry.key
  },
  sortComparer: false, // maintain sort order following any CRUD operation
})

export const fetchContent = createAsyncThunk(
  'content/fetch',
  async (_, thunkAPI) => {
    try {
      const data = await getContent()
      console.log('data: ', data)
      if (!data) throw new Error('No data returned')
      if (data.error) throw new Error(data.error?.message?.toString())
      return data.blocks
    } catch (error) {
      return thunkAPI.rejectWithValue(error.toString())
    }
  }
)

const initialState = {
  currentRequestId: undefined,
  loading: 'idle',
  error: null,
  data: null,
}

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {},
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
        // state.data = payload
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
// export const { logout } = actions

export default reducer
