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
      // To record data issues in redux, and separate them from failures,
      // adapting to redux' requirement to record only serializable data
      // the following error handling should be taken:
      //
      // ? Real failures
      // Real failures, such as when data is corrupted or non available, reach realEditorApi's catch clause.
      //
      // 1. throw an error object literal instead of Error instance
      //    redux can store only serializable data, so if error is to be stored there,
      //    it needs to sit in ab object literal instead of an Error instance.
      //    This is true whether the thrower is realEditorApi or this function.
      //
      // ? Issues
      // These are data discrepancies that are expected to be part of the data;
      // I want redux to record them too, in order to explain system behavior and enable later handling.
      //
      // 2. Issues aren't supposed to stop the flow or render the app unusuable.
      //    Instead they are appended to the data as a kind of meta data, inside an 'issues' key,
      //    then included in the payload to be recorded in the [fetchContent.fulfilled] reducer.
      //
      // Real failures are recorded in redux' content.error key and reported to the user with a snackbar;
      // Issues are recorded in content.issues and aren't reported.
      //
      const rawContent = await realEditorApi(file)

      // safeguard only; if api returns no data then it throws, reaching the catch below
      if (!rawContent)
        // eslint-disable-next-line no-throw-literal
        throw {
          api: 'contentApi',
          field: 'file',
          value: file,
          issue: 'Invalid file',
        }

      const content = convertContent(rawContent)
      showContent(content)

      const entities = createEntitiesFromContent(content)
      const { relations, issues } = rawContent

      return { entities, relations, issues }
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
  file: null,
  refresh: 0,
  issues: [],
})

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clear: () => initialState,
    add: contentAdapter.addOne,
    update: contentAdapter.updateOne,
    error: (state, { payload: error }) => ({ ...state, error }),
    notified: state => ({
      ...state,
      error: { ...state.error, notified: true },
    }),
    changes: state => ({ ...state, changes: state.changes + 1 }),
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
    positionShifted: (
      state,
      { payload: { id, entityRangeIndex, shifted } }
    ) => {
      // Immer
      const position =
        state.entities[id]?.entityRanges[entityRangeIndex]?.position
      if (position)
        state.entities[id].entityRanges[entityRangeIndex].position = {
          ...position,
          shifted,
        }
    },
    updateFeedback: (
      state,
      { payload: { entity_id, entity_location_id, feedback } }
    ) => {
      // Immer again
      if (!state.entities[entity_id]?.data?.geoLocation?.properties) {
        const message = 'Error recording feedback in store'
        console.error('message')
        state.issues.push({ entity_id, entity_location_id, feedback, message })
        return
      }
      state.entities[entity_id].data.geoLocation.properties = {
        entity_location_id,
        feedback,
      }
    },
    setFile: (state, { payload: { file } }) => {
      return file === state.file
        ? { ...state, refresh: state.refresh + 1 }
        : {
            ...state,
            file,
          }
    },
    requestRefresh: state => ({ ...state, refresh: state.refresh + 1 }),
    addIssue: (state, { payload }) => ({
      ...state,
      issues: [...state.issues, payload],
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
      { meta: { requestId }, payload: { entities, relations, issues } }
    ) => {
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        try {
          state.currentRequestId = undefined
          state.loading = 'idle'
          state.error = null
          if (issues) state.issues = issues
          contentAdapter.setAll(state, entities)
          state.relations = relations
          relations.forEach(({ from, to, type }) => {
            const relation = {
              source: from,
              target: to,
              type,
            }
            if (state.entities[from]) {
              state.entities[from].data.outputs.push(relation)
            } else {
              const issue = {
                data: 'relations',
                field: 'from',
                value: from,
                issue: 'No entity with that id',
              }
              state.issues.push(issue)
              console.error(`relations issue: no entity with id ${from}`)
            }
            if (state.entities[to]) {
              state.entities[to].data.inputs.push(relation)
            } else {
              const issue = {
                data: 'relations',
                field: 'to',
                value: to,
                issue: 'No entity with that id',
              }
              state.issues.push(issue)
              console.error(`relations issue: no entity with id ${to}`)
            }
          })
        } catch (error) {
          console.log('error: ', error)
        }
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
  const { loading, error, selectedId, relations, file, refresh } = content
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
    file,
    doc_id: file,
    refresh,
  }
}

// this will return entities keyed, as they naturally appear in redux
// todo: memoize with reselect
export const selectEntities = ({
  content: { entities, relations, selectedId },
}) => ({
  entities,
  relations,
  selectedId,
})

export const selectEntityById =
  id =>
  ({ content }) =>
    contentSelectors.selectById(content, id)

export const selectIds = ({ content }) => contentSelectors.selectIds(content)

export const selectSelectedId = ({ content: { selectedId } }) => selectedId
export const selectShowId = ({ content: { show } }) => show

export const selectSelectedEntity = ({ content }) => {
  const { selectedId } = content
  if (!selectedId) return null

  const selectedE = selectEntityById(selectedId)({ content })
  if (!selectedE?.data?.geoLocation) return null
  const id = selectedId

  const {
    type: entityType,
    data: {
      geoLocation: {
        geometry: { type, coordinates },
        properties: { details },
      },
    },
  } = selectedE
  return { id, type, coordinates, details, entityType }
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
  notified,
  changes,
  updatePosition,
  positionShifted,
  select,
  selected,
  show,
  updateTag,
  setFile,
  requestRefresh,
  addIssue,
  updateFeedback,
} = actions

export default reducer
