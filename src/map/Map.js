/** @jsxImportSource @emotion/react */

import 'leaflet/dist/leaflet.css'
import { MapContainer, WMSTileLayer, LayersControl } from 'react-leaflet'
import { tileProviders, locations } from './config'

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
  return (
    <MapContainer
      center={locations.home}
      zoom={11}
      scrollWheelZoom={false}
      css={styles.map}
    >
      <LayersControl>
        {tileProviders.map(({ name, checked, args }) => (
          <LayersControl.BaseLayer {...{ name, checked }} key={name}>
            <WMSTileLayer {...{ ...args }} />
          </LayersControl.BaseLayer>
        ))}
      </LayersControl>
    </MapContainer>
  )
}

export default Map
