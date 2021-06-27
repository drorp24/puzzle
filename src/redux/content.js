import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
  // current,
} from '@reduxjs/toolkit'

import {find, filter, map, flatten, flow} from "lodash/fp"

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
  selectedLocationId: null,
  file: null,
  refresh: 0,
  issues: [],
  selectedLocs: [],
  selectedLocIdOnMap: null
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
    select: (state, { payload: id }) => {
      state.selectedId = id
      const alreadySelected = find((tmp_loc) => tmp_loc.parId === id ,state.selectedLocs)
      let selectedLocs = []
      if(!alreadySelected){
        const entity = find(ent => ent.data.id === id, Object.values(state.entities))
        selectedLocs = [...state.selectedLocs, ...map(loc => ({parId: id, locId: loc.properties.entity_location_id}), Object.values(entity.data.geoLocations))]
      } else {
        selectedLocs = filter(tmp_loc => tmp_loc.parId !== id, state.selectedLocs)
      }
      state.selectedLocs = selectedLocs
      const selectedLocationIdInside = find((tmp_loc) => tmp_loc.locId === state.selectedLocationId , selectedLocs)
      if(!selectedLocationIdInside){
        state.selectedLocationId = null
      }
      const selectedLocIdOnMapInside = find((tmp_loc) => tmp_loc.locId === state.selectedLocIdOnMap , selectedLocs)
      if(!selectedLocIdOnMapInside){
        state.selectedLocIdOnMap = null
      }
    },
    unSelectAllLocations: (state) => {
      state.selectedLocs=[]
      state.selectedLocIdOnMap = null
    },
    selectAllLocations: (state) => {
      const allLocs = flow(
        map((ent) => map(gLoc => ({parId: ent.data.id, locId: gLoc.properties.entity_location_id}), Object.values(ent.data.geoLocations))),
        flatten)
        (Object.values(state.entities))
      state.selectedLocs = allLocs
    },
    selectLocation: (state, { payload: {entity_location_id, parentId} }) => {
      state.selectedLocationId = entity_location_id
      state.selectedLocationParentId = parentId
    },
    selectLocationIdOnMap: (state, { payload: {entity_location_id} }) => {
      state.selectedLocIdOnMap = entity_location_id
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
      
      if (state.entities[entity_id]?.data?.geoLocations) {
        const locationToFeedback = find(gLoc => gLoc?.properties['entity_location_id'] === entity_location_id, 
                                  state.entities[entity_id].data.geoLocations)
          if(locationToFeedback != null){
            locationToFeedback.properties = {
              ...locationToFeedback.properties,
                feedback,
            }
            return
          }
      }
      const message = 'Error recording feedback in store'
      console.error('message')
      state.issues.push({ entity_id, entity_location_id, feedback, message })
      return      
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
      state.selectedLocs = []
      state.selectedLocationId = null
      state.selectedLocIdOnMap = null
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
  const { loading, error, selectedId, relations, file, refresh, selectedLocs } = content
  const selectedEntity = keyedEntities[selectedId]
  const isLoading = loading === 'pending'
  const loaded = sortedEntities.length > 0 && loading === 'idle' && !error
  return {
    entities,
    sortedEntities,
    keyedEntities,
    ids,
    selectedId,
    selectedLocs,
    selectedLocIdOnMap: content.selectedLocIdOnMap,
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

export const selectLocations = (
  {content: { entities, selectedLocs }}
) => {
  let locations = []
  for (let index = 0; index < selectedLocs.length; index++) {
    const loc = selectedLocs[index]
    const geoLoc = entities[loc.parId].data.geoLocations[loc.locId];
    locations.push(geoLoc)
  }
  return locations
}

export const selectEntityById =
  id =>
  ({ content }) =>
    contentSelectors.selectById(content, id)

export const selectIds = ({ content }) => contentSelectors.selectIds(content)


export const selectSelectedLocation = (selectedLocationId) => ({content}) => {  
  const selectedEntity = contentSelectors.selectById(content, content.selectedLocationParentId)
  const geolocations = selectedEntity?.data?.geoLocations
  if(geolocations != null){
    const selectedLocation = geolocations[selectedLocationId]
    return selectedLocation
  }
  return null  
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
  unSelectAllLocations,
  selectAllLocations,
  selectLocation,
  selectLocationIdOnMap,
  selected,
  show,
  updateTag,
  setFile,
  requestRefresh,
  addIssue,
  updateFeedback,
} = actions

export default reducer