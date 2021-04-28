import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
  // current,
} from '@reduxjs/toolkit'

import feedbackApi from '../api/feedbackApi'

const feedbackAdapter = createEntityAdapter({})

export const postFeedback = createAsyncThunk(
  'feedback/post',
  async (data, { rejectWithValue }) => {
    try {
      const feedbackRecord = await feedbackApi(data)
      return { feedbackRecord }
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// * reducers / actions
const initialState = feedbackAdapter.getInitialState({
  loading: 'idle',
  issues: [],
})

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clear: () => initialState,
    add: feedbackAdapter.addOne,
    update: feedbackAdapter.updateOne,
    error: (state, { payload: error }) => ({ ...state, error }),
  },
  extraReducers: {
    [postFeedback.pending]: (state, { meta: { requestId } }) => {
      if (state.loading === 'idle') {
        state.currentRequestId = requestId
        state.loading = 'pending'
        state.error = null
      }
    },

    [postFeedback.fulfilled]: (state, { meta: { requestId }, payload }) => {
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        try {
          state.currentRequestId = undefined
          state.loading = 'idle'
          state.error = null
        } catch (error) {
          console.log('error: ', error)
        }
      }
    },

    [postFeedback.rejected]: (state, { meta: { requestId }, payload }) => {
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        state.currentRequestId = undefined
        state.loading = 'idle'
        state.error = payload
      }
    },
  },
})

const { reducer, actions } = feedbackSlice
export const { clear, add, update, error } = actions

export default reducer
