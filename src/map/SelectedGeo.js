/** @jsxImportSource @emotion/react */
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectEntityById } from '../redux/content'

import { useMap, Polygon, Polyline, Marker } from 'react-leaflet'
import { flyToOptions } from './config'

// https://github.com/PaulLeCam/react-leaflet/issues/453
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css' // Re-uses images from ~leaflet package
import * as L from 'leaflet'
import 'leaflet-defaulticon-compatibility'

const styles = {
  root: theme => ({}),
}

// ToDo: make 'house', 'street', 'city', 'area' sub-types of Place, and change Tooltip to show sub-types (pills).

const SelectedGeo = () => {
  const map = useMap()

  const selectedEntity = useSelector(({ content }) => {
    const { selected } = content
    if (!selected) return null
    const selectedE = selectEntityById(selected)({ content })
    if (!selectedE?.data?.geoLocation) return null
    const id = selected

    const {
      data: {
        geoLocation: {
          properties: { name },
          geometry: { type, coordinates },
        },
      },
    } = selectedE
    return { id, name, type, coordinates }
  })

  useEffect(() => {
    if (!map || !selectedEntity) return

    const { type, coordinates } = selectedEntity
    const polygon = type === 'Point' ? [coordinates] : coordinates

    map.flyToBounds(L.polygon(polygon).getBounds(), flyToOptions)
  }, [map, selectedEntity])

  if (!selectedEntity) return null
  const { id, name, type, coordinates } = selectedEntity
  const positions = coordinates
  const eventHandlers = {
    click: () => {
      console.log(`${id} clicked`)
    },
  }

  switch (type) {
    case 'Polygon':
      return <Polygon {...{ positions, eventHandlers }} />
    case 'Point':
      return <Marker {...{ position: positions, eventHandlers }} />
    case 'LineString':
      return <Polyline {...{ positions, eventHandlers }} />
    default:
      return <Polygon {...{ positions, eventHandlers }} />
  }
}

export default SelectedGeo
