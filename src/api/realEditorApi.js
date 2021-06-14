// ? input structure
// draft - js('draft') is a famous library by Facebook that fits our needs perfectly.
// To be able to do its job, draft requires the following JSON structure, defined using Flow here:
// https://github.com/facebook/draft-js/blob/master/src/model/encoding/RawDraftContentState.js
//
// That input structure is normalized, so that the only data pertaining to entities' occurrences
// in the text is their offsets and lengths there,
// and the foreign key to the respective entity record, where the entity data is held.
//
// Thus draft implements the many-to-one relationship b/w entity occurrences in the text (e.g., "Moshe", "he")
// and their respective entity records.
//
// Accordingly, the structure has two main keys:
// - blocks: an array of text blocks. Each block has an array with entity occurrences ("entityRanges").
//   To keep it normalized, each occurrence has only 'offset', 'length' and 'key', pointing to 'entityMap's key.
// - entityMap: an object whose every key is an entity record, keyed by that referenced 'key'.
//
// draft ignores (= doesn't convert) any key in an entity record other than
// 'type', 'mutability' and 'data'. Even Id gets ignored!
// Hence anything we want to survive draft's conversion must sit in the 'data' object.
// One field we must include in the 'data' is the original key. Here's why.
//
// ? draft conversion
// To do its thing, draft has to convert the input JSON ("rawContent") into
// its own different (Immutable.js - based) structure.
// Oddly, the original 'keys' never make it into draft's converted structure.
// Instead they are replaced during conversion by ad-hoc generated IDs called 'entityKey's.
//
// In places where we use the draft's functionlity (e.g., decoratorComponents),
// what this means is we're getting draft's entityKeys rather than our original 'keys'.
//
// As the following paragrpha explain, we mostly need the original key rather than draft's entityKey,
// and that's why we need the original keys recorded on the entity's 'data' part.
//
// We will want the original keys whenever we are to retrieve or update an entity,
// since entities in redux are keyed by the original keys.
//
// One reason why redux keys entities by their original keys is the rendering of the relationship graph.
// To render it, we traverse the relations graph by nodes, which are identified by their original keys
// and update every such referenced entity node with the list of input and output nodes.
// This definitely calls for direct access by the original 'keys'.
//
// Another reason would be the need to click or hover a point on the map and get details about the
// entity represented by that point, using the original key again.
// I am sure there will be several more use cases going forward for this kind of keying.
//

import { axiosApiInstance } from './authApi'

import objectify from '../utility/objectify'
import { keyProxy } from '../utility/proxies'
import getArrayDepth from '../utility/getArrayDepth'

// ToDo: remove getArrayDepth; depth should be derived from type;
// find out which types are supported
const swap = (id, geolocation) => {
  const { type, coordinates } = geolocation?.geometry || {
    type: undefined,
    coordinates: undefined,
  }
  let issue = {}
  switch (type) {
    case 'Point':
      const [lng, lat] = coordinates
      return { type, coordinates: [lat, lng] }
    case 'Polygon':
      const depth = getArrayDepth(coordinates)
      const array = depth === 1 ? coordinates : coordinates[0]
      return { type, coordinates: array.map(([lng, lat]) => [lat, lng]) }
    case undefined:
      issue = {
        id,
        field: 'geolocation',
        value: 'undefined',
        issue: 'undefined',
      }
      return { type, coordinates: [], issue }
    default:
      issue = { id, field: 'type', value: type, issue: 'unrecognized' }
      return { type, coordinates: [], issue }
  }
}

const convertShayToRaw = (
  { entities, offsets, relations: sRelations, text },
  lists
) => {
  const entityMap = {}
  const blocks = [
    {
      key: 'b1',
      text,
      entityRanges: offsets.map(({ id, length, offset }) => ({
        key: id,
        length,
        offset,
      })),
    },
  ]
  const issues = []

  Object.values(entities).forEach(
    ({ id, geolocation = {}, score, sub_type_id, type_id, word }) => {
      const type = lists[type_id]?.value
      const mutability = 'IMMUTABLE'
      // if (id === '6644bd08-59d8-43c8-9919-4e069b7b91b0') geolocation = undefined // for tesing
      const geometry = swap(id, geolocation)
      const { issue } = geometry
      if (issue) issues.push(issue)

      // if (id === 'b7933af2-bf3f-40f6-8d5b-f178ce59c55b') {
      //   geolocation.properties.explain = undefined
      //   geolocation.properties.details = undefined
      //   geolocation.properties.entity_location_id = undefined
      // }

      const {
        properties = {
          explain: null,
          details: {},
          entity_location_id: null,
          feedback: null,
        },
      } = geolocation || {}

      // ToDo: make a function
      if (!Object.keys(properties).length) {
        issues.push({
          id,
          field: 'properties',
          value: 'undefined',
          issue: 'undefined',
        })
      } else if (!properties.entity_location_id) {
        properties.entity_location_id = null
        issues.push({
          id,
          field: 'entity_location_id',
          value: 'undefined',
          issue: 'undefined',
        })
      } else if (!properties.details) {
        properties.details = {}
        issues.push({
          id,
          field: 'details',
          value: 'undefined',
          issue: 'undefined',
        })
      }

      const data = {
        id,
        score,
        subTypes: [lists[sub_type_id[0]]?.value],
        word,
        geoLocation: { geometry, properties },
      }
      const entity = { type, mutability, data }
      entityMap[id] = entity
    }
  )

  const relations = sRelations.map(
    ({ from_entity_id, list_item_id, to_entity_id }) => ({
      from: from_entity_id,
      to: to_entity_id,
      type: lists[list_item_id]?.value,
    })
  )

  if (issues.length) {
    console.error('There are issues in the file. See redux content.issues')
  }
  return { blocks, entityMap, relations, issues }
}

const realEditorApi = async fileId => {
  const analysis = `${process.env.REACT_APP_API_SERVER}${process.env.REACT_APP_ANALYSIS_ENDPOINT}${fileId}/`
  const lists = `${process.env.REACT_APP_API_SERVER}${process.env.REACT_APP_LISTS_ENDPOINT}`

  const getAnalysis = () => axiosApiInstance.get(analysis)
  const getLists = () => axiosApiInstance.get(lists)

  return Promise.all([getAnalysis(), getLists()])
    .then(([analysis, lists]) =>
      convertShayToRaw(analysis.data, keyProxy(objectify(lists.data)))
    )
    .catch(error => {
      // eslint-disable-next-line no-throw-literal
      throw {
        source: 'realEditorApi',
        field: 'file',
        value: fileId,
        issue: error.response?.data?.error || 'No response from Api',
        status: error.response?.status,
      }
    })
}

export default realEditorApi
