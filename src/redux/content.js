import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
  // current,
} from '@reduxjs/toolkit'

import { getContent } from '../api/fakeEditorApi'
import { createEntitiesFromContent } from '../../src/editor/entities'

// * normalization
const contentAdapter = createEntityAdapter({
  selectId: entry => entry.entityKey,
  sortComparer: (a, b) =>
    Number(b.data?.userData?.score) - Number(a.data?.userData?.score),
})

// * thunk
export const fetchContent = createAsyncThunk(
  'content/fetch',
  async ({ convertContent, showContent }, thunkAPI) => {
    try {
      const rawContent = await getContent()
      if (!rawContent) throw new Error('No rawContent returned')
      if (rawContent.error)
        throw new Error(rawContent.error.message?.toString())
      const content = convertContent(rawContent)
      showContent(content)
      const entities = createEntitiesFromContent(content)
      return entities
    } catch (error) {
      return thunkAPI.rejectWithValue(error.toString())
    }
  }
)

// * reducers / actions
const initialState = contentAdapter.getInitialState({
  loading: 'idle',
  changes: 0,
})

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clear: () => initialState,
    add: contentAdapter.addOne,
    update: contentAdapter.updateOne,
    error: (state, { payload }) => ({ ...state, error: payload }),
    changes: state => ({ ...state, changes: state.changes + 1 }),
  },
  extraReducers: {
    [fetchContent.pending]: (state, { meta: { requestId } }) => {
      if (state.loading === 'idle') {
        state.currentRequestId = requestId
        state.loading = 'pending'
        state.error = null
      }
    },

    [fetchContent.fulfilled]: (
      state,
      { meta: { requestId }, payload: entities }
    ) => {
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        state.currentRequestId = undefined
        state.loading = 'idle'
        state.error = null
        contentAdapter.setAll(state, entities)
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

// * memoized selectors (reselect)
const contentSelectors = contentAdapter.getSelectors()

// combine createAsyncThunk's loading/error states with createEntityAdapter's ids/entities join
export const selectContent = ({ content }) => {
  const entities = contentSelectors.selectAll(content)
  const { loading, error } = content
  const loaded = entities.length > 0 && loading === 'idle' && !error
  return { entities, loading, error, loaded }
}
export const selectEntityById = id => ({ content }) =>
  contentSelectors.selectById(content, id)

const { reducer, actions } = contentSlice
export const { clear, add, update, error, changes } = actions

export default reducer
