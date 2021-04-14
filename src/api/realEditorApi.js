import axios from 'axios'
import * as L from 'leaflet'

import objectify from '../utility/objectify'
import { keyProxy } from '../utility/proxies'
import getArrayDepth from '../utility/getArrayDepth'

// ToDo: remove
// const swapUsingL = ({ type, coordinates }) => {
//   const swapLngAndLat = ([lng, lat]) => [lat, lng]

//   let result
//   switch (type) {
//     case 'Point':
//       result = L.GeoJSON.coordsToLatLngs(coordinates, 0, swapLngAndLat)
//       console.log('Point. result: ', result)
//       return result
//     case 'Polygon':
//       result = L.GeoJSON.coordsToLatLngs(
//         coordinates,
//         getArrayDepth(coordinates),
//         swapLngAndLat
//       )
//       console.log('Polygon. result: ', result)
//       return result
//     default:
//       console.error(`>> Type ${type} is not recognized`)
//       return [null, null]
//   }
// }

// ToDo: remove getArrayDepth; depth should be derived from type;
// find out which types are supported
const swap = (id, { type, coordinates }) => {
  switch (type) {
    case 'Point':
      const [lng, lat] = coordinates
      return { type, coordinates: [lat, lng] }
    case 'Polygon':
      const depth = getArrayDepth(coordinates)
      const array = depth === 1 ? coordinates : coordinates[0]
      return { type, coordinates: array.map(([lng, lat]) => [lat, lng]) }
    default:
      const error = { id, field: 'type', value: type, issue: 'unrecognized' }
      console.error(error)
      return { type, coordinates: [], error }
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
  const errors = []

  Object.values(entities).forEach(
    ({ id, geolocation, score, sub_type_id, type_id, word }) => {
      const type = lists[type_id]?.value
      const mutability = 'IMMUTABLE'
      const geometry = swap(id, geolocation)
      const { error } = geometry
      if (error) errors.push(error)

      const data = {
        id,
        score,
        subTypes: [lists[sub_type_id[0]]?.value],
        word,
        geoLocation: { geometry },
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

  return { blocks, entityMap, relations, errors }
}

const realEditorApi = async fileId => {
  const analysis = `${process.env.REACT_APP_API_SERVER}${process.env.REACT_APP_ANALYSIS_ENDPOINT}${fileId}`
  const lists = `${process.env.REACT_APP_API_SERVER}${process.env.REACT_APP_LISTS_ENDPOINT}`

  const getAnalysis = () => axios.get(analysis)
  const getLists = () => axios.get(lists)

  // no catch statement, leaving error catching & handling to content.js
  return (
    Promise.all([getAnalysis(), getLists()])
      .then(([analysis, lists]) =>
        convertShayToRaw(analysis.data, keyProxy(objectify(lists.data)))
      )
      // no throwing (see content.js)
      .catch(error => {
        console.log(error)
      })
  )
}

export default realEditorApi
