/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectEntityById } from '../redux/content'

import 'leaflet/dist/leaflet.css'
import {
  MapContainer,
  WMSTileLayer,
  LayersControl,
  Polygon,
  useMap,
} from 'react-leaflet'
import { tileProviders, locations, flyToOptions } from './config'

// ToDo: wrap and import
// fixing https://github.com/PaulLeCam/react-leaflet/issues/453
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

export const marker = L.marker

const styles = {
  map: {
    height: '100%',
    overflow: 'hidden',
  },
}

const Map = () => {
  const [map, setMap] = useState()
  console.log('Map rendered')
  const geoEntity = useSelector(({ content }) => {
    const { selected } = content
    if (!selected) return null
    const selectedEntity = selectEntityById(selected)({ content })
    const {
      data: { geoLocation },
    } = selectedEntity
    if (!geoLocation) return null
    return { geoLocation }
  })

  const {
    geoLocation: {
      properties: { name } = {},
      geometry: { type, coordinates } = {},
    } = {},
  } = geoEntity || {}

  useEffect(() => {
    if (!map || !coordinates) return

    // ToDo: make 'house', 'street', 'city', 'area' sub-types of Place, and change Tooltip to show sub-types (pills).
    switch (type) {
      case 'Polygon':
        map.flyToBounds(L.polygon(coordinates).getBounds(), flyToOptions)
        break
      case 'Point':
        map.flyTo(coordinates, flyToOptions)
        break
      case 'LineString':
        map.flyToBounds(L.polyline(coordinates).getBounds(), flyToOptions)
        break
      default:
        map.flyTo(coordinates, flyToOptions)
    }
  }, [coordinates, map, type])

  return (
    <MapContainer
      center={locations.home}
      zoom={11}
      scrollWheelZoom={false}
      whenCreated={createdMap => {
        setMap(createdMap)
      }}
      css={styles.map}
    >
      <LayersControl>
        {tileProviders.map(({ name, checked, args }) => (
          <LayersControl.BaseLayer {...{ name, checked }} key={name}>
            <WMSTileLayer {...{ ...args }} />
          </LayersControl.BaseLayer>
        ))}
      </LayersControl>
      {coordinates && <Polygon positions={coordinates} />}
    </MapContainer>
  )
}

export default Map
