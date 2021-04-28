import axios from 'axios'

import objectify from '../utility/objectify'
import { keyProxy } from '../utility/proxies'
import getArrayDepth from '../utility/getArrayDepth'

// ToDo: remove getArrayDepth; depth should be derived from type;
// find out which types are supported
const swap = (id, geolocation) => {
  const { type, coordinates } = geolocation || {
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
      const { entity_location_id, feedback } = geolocation || {} // extra protection for testing
      const properties = { entity_location_id, feedback }

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
  const analysis = `${process.env.REACT_APP_API_SERVER}${process.env.REACT_APP_ANALYSIS_ENDPOINT}${fileId}`
  const lists = `${process.env.REACT_APP_API_SERVER}${process.env.REACT_APP_LISTS_ENDPOINT}`

  const getAnalysis = () => axios.get(analysis)
  const getLists = () => axios.get(lists)

  return Promise.all([getAnalysis(), getLists()])
    .then(([analysis, lists]) =>
      convertShayToRaw(analysis.data, keyProxy(objectify(lists.data)))
    )
    .catch(error => {
      // eslint-disable-next-line no-throw-literal
      throw {
        field: 'file',
        value: fileId,
        issue: error.response?.data?.error || 'Invalid file',
        status: error.response?.status,
      }
    })
}

export default realEditorApi
