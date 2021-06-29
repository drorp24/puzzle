/** @jsxImportSource @emotion/react */
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { show } from '../redux/content'

import FlyToLocation from './FlyToLocation'

import 'leaflet/dist/leaflet.css'
import './leafletRtl.css'
import { MapContainer, WMSTileLayer, LayersControl, LayerGroup } from 'react-leaflet'
import { tileProviders, locations } from './config'
import LocationsLayer from './LocationsLayer'
import BoundingPolygon from './BoundingPolygon'

const styles = {
  map: {
    height: '100%',
    overflow: 'hidden',
  },
}

const Map = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(show('eighthEntity'))
  }, [dispatch])

  return (
    <MapContainer center={locations.home} zoom={11} css={styles.map}>
      <LayersControl>
        {tileProviders.map(({ name, checked, args }) => (
          <LayersControl.BaseLayer {...{ name, checked }} key={name}>
            <WMSTileLayer {...{ ...args }} />
          </LayersControl.BaseLayer>
        ))}
      </LayersControl>
      <FlyToLocation/>
      <LocationsLayer/>
      <BoundingPolygon/>
    </MapContainer>
  )
}

export default Map
