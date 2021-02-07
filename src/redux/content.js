import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
  // current,
} from '@reduxjs/toolkit'

import { getContent } from '../api/fakeEditorApi'
import { createEntitiesFromContent } from '../../src/editor/entities'

// * normalization
// redux keys entities using two types of keys:
// - Entities included in the rawContent api are keyed by their original key.
//   That enables them to be directly accessed when the relations graph (keyed by id) is traversed,
//   when a point on the map is clicked, and any place that requires retrieving and/or updaing an entity
// - Newly created entities, however, are keyed by their ad-hoc generated entityKey.
//   Such entities do not have any original key
export const entityId = ({ entityKey, data: { id } }) => id || entityKey

const contentAdapter = createEntityAdapter({
  selectId: entityId,
  sortComparer: (a, b) => Number(b.data?.score) - Number(a.data?.score),
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
      const { relations } = rawContent

      return { entities, relations }
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
    error: (state, { payload: error }) => ({ ...state, error }),
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
      { meta: { requestId }, payload: { entities, relations } }
    ) => {
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        state.currentRequestId = undefined
        state.loading = 'idle'
        state.error = null
        contentAdapter.setAll(state, entities)
        relations.forEach(({ from, to, type }) => {
          state.entities[from].data.outputs =
            state.entities[from].data.outputs || []
          state.entities[to].data.inputs = state.entities[to].data.inputs || []
          state.entities[from].data.outputs.push({ target: to, type })
          state.entities[to].data.inputs.push({ source: from, type })
        })
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
