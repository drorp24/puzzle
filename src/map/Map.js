/** @jsxImportSource @emotion/react */
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { show } from '../redux/content'

import SelectedGeo from './SelectedGeo'

import 'leaflet/dist/leaflet.css'
import './leafletRtl.css'
import { MapContainer, WMSTileLayer, LayersControl } from 'react-leaflet'
import { tileProviders, locations } from './config'

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
      <SelectedGeo />
    </MapContainer>
  )
}

export default Map
