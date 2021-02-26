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
  selectId: ({ data: { id } }) => id,
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
  selected: null,
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
    selected: (state, { payload }) => {
      state.selected = payload
    },
    updatePosition: (
      state,
      { payload: { id, entityRangeIndex, position } }
    ) => {
      // Immer to the rescue
      state.entities[id].entityRanges[entityRangeIndex].position = position
    },
    updateTag: (state, { payload: { id, tag } }) => {
      // Immer again
      state.entities[id].data.tag = tag
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

    [fetchContent.fulfilled]: (
      state,
      { meta: { requestId }, payload: { entities, relations } }
    ) => {
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        state.currentRequestId = undefined
        state.loading = 'idle'
        state.error = null
        contentAdapter.setAll(state, entities)
        state.relations = relations
        relations.forEach(({ from, to, type }) => {
          const relation = {
            source: from,
            target: to,
            type,
          }
          state.entities[from].data.outputs.push(relation)
          state.entities[to].data.inputs.push(relation)
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
// common selector functions should be defined here rather than in the callers for memoization
const contentSelectors = contentAdapter.getSelectors()

// combine createAsyncThunk's loading/error states with createEntityAdapter's ids/entities join
// 'entities' in this selector are returned as a sorted array rather than keyed
export const selectContent = ({ content }) => {
  const entities = contentSelectors.selectAll(content)
  const { loading, error, relations, selected } = content
  const loaded = entities.length > 0 && loading === 'idle' && !error
  return { entities, relations, selected, loading, error, loaded }
}

// this will return entities keyed, as they naturally appear in redux
// todo: memoize with reselect
export const selectEntities = ({ content: { entities, relations } }) => ({
  entities,
  relations,
})

export const selectEntityById = id => ({ content }) =>
  contentSelectors.selectById(content, id)

export const selectIds = ({ content }) => contentSelectors.selectIds(content)

const { reducer, actions } = contentSlice
export const {
  clear,
  add,
  update,
  error,
  changes,
  updatePosition,
  selected,
  updateTag,
} = actions

export default reducer
