import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
  // current,
} from '@reduxjs/toolkit'

// import { getFakeHebContent } from '../api/fakeEditorApiHeb'
import { createEntitiesFromContent } from '../../src/editor/entities'
import realEditorApi from '../api/realEditorApi'

// * normalization
const contentAdapter = createEntityAdapter({
  selectId: ({ data: { id } }) => id,
  sortComparer: (a, b) => Number(b.data?.score) - Number(a.data?.score),
})

// * thunk
export const fetchContent = createAsyncThunk(
  'content/fetch',
  async ({ file, convertContent, showContent }, thunkAPI) => {
    try {
      // ! error handling
      // redux-toolkit's 'rejectWithValue' dispatches a '.../.../reject' action and populates its paylod with its argument.
      // That calls for a different error handling than the typical one:
      //
      // 1. realEditorApi catch caluse doesn't throw back to its caller;
      //    if it did, rejectwithValue would pass an unserializable value in the payload, which redux can't cope with.
      // 2. rejectWithValue's argument is a plain object literal rather than an instance of Error (= no 'new Error');
      //    Thus it can be kept in redux and serve to report and resolve data discrepancies.
      const rawContent = await realEditorApi(file)

      if (!rawContent)
        // eslint-disable-next-line no-throw-literal
        throw { id: null, field: 'file', value: file, issue: 'Invalid file' }
      if (rawContent.errors.length) throw rawContent.errors

      const content = convertContent(rawContent)
      showContent(content)

      const entities = createEntitiesFromContent(content)
      const { relations } = rawContent

      return { entities, relations }
    } catch (error) {
      return thunkAPI.rejectWithValue(error)
    }
  }
)

// * reducers / actions
const initialState = contentAdapter.getInitialState({
  loading: 'idle',
  changes: 0,
  selectedId: null,
  file: 'doc_0',
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
      // selected is deprecated; use 'select'
      state.selectedId = payload
    },
    select: (state, { payload }) => {
      state.selectedId = payload
    },
    show: (state, { payload }) => {
      state.show = payload
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
    setFile: (state, { payload }) => ({
      ...state,
      ...payload,
    }),
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

// ToDo: replace all other selectors with this single one
// The code is simpler and the penalty small (sorting the entities once even if not requested)
// since the resulting selector object is memoized (using reselect).

// combine all aspects of entities:
// - createEntityAdapter's memoized sorted entities
// - keyed entities
// - createAsyncThunk's loading/error states as well as my own 'loaded' state
// - selected Id and entity
export const selectContent = ({ content }) => {
  const entities = contentSelectors.selectAll(content)
  const sortedEntities = entities // 'entities' key is deprecated; use 'sortedEntities'
  const keyedEntities = content.entities
  const ids = contentSelectors.selectIds(content)
  const { loading, error, selectedId, relations } = content
  const selectedEntity = keyedEntities[selectedId]
  const isLoading = loading === 'pending'
  const loaded = sortedEntities.length > 0 && loading === 'idle' && !error
  return {
    entities,
    sortedEntities,
    keyedEntities,
    ids,
    selectedId,
    selectedEntity,
    loading,
    isLoading,
    loaded,
    error,
    relations,
  }
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

export const selectSelectedId = ({ content: { selected } }) => selected
export const selectShowId = ({ content: { show } }) => show

export const selectSelectedEntity = ({ content }) => {
  const { selected } = content
  if (!selected) return null

  const selectedE = selectEntityById(selected)({ content })
  if (!selectedE?.data?.geoLocation) return null
  const id = selected

  const {
    data: {
      geoLocation: {
        geometry: { type, coordinates },
      },
    },
  } = selectedE
  return { id, type, coordinates }
}

export const selectShowEntity = ({ content }) => {
  const { show } = content
  if (!show) return null

  const showE = selectEntityById(show)({ content })
  if (!showE?.data?.geoLocation) return null
  const id = show

  const {
    data: {
      name,
      geoLocation: {
        geometry: { type, coordinates },
      },
    },
  } = showE
  return { id, type, coordinates, name }
}

const { reducer, actions } = contentSlice
export const {
  clear,
  add,
  update,
  error,
  changes,
  updatePosition,
  selected,
  show,
  updateTag,
  setFile,
} = actions

export default reducer
