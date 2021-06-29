import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectSelectedLocation } from '../redux/content'

import { useMap } from 'react-leaflet'

import { flyToOptions } from './config'

// https://github.com/PaulLeCam/react-leaflet/issues/453
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css' // Re-uses images from ~leaflet package
import * as L from 'leaflet'
import 'leaflet-defaulticon-compatibility'


const FlyToLocation = () => {
  const map = useMap()

  const selectedLocationId = useSelector(store => store.content.selectedLocationId)  
  const selectedLocation = useSelector(selectSelectedLocation(selectedLocationId))

  useEffect(() =>{
    if(selectedLocationId){
      const { type, coordinates } = selectedLocation?.geometry || {}
      const item = type === 'Polygon' ? L.polygon(coordinates) : L.polygon([coordinates])
      map.flyToBounds(item.getBounds(), flyToOptions)  
    }  
  }, [selectedLocationId, selectedLocation, map])  

  return null
}

export default FlyToLocation
