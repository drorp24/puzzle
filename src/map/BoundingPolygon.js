/** @jsxImportSource @emotion/react */
// import {map} from "lodash/fp"
import { useEffect, useState} from 'react'
import { useSelector } from 'react-redux'
import { useMap } from 'react-leaflet'

// // https://github.com/PaulLeCam/react-leaflet/issues/453
// import 'leaflet/dist/leaflet.css'
// import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css' // Re-uses images from ~leaflet package
// import 'leaflet-defaulticon-compatibility'
import * as L from 'leaflet'


const BoundingPolygon = () => {
  const leafletMap = useMap()
  // const selectedLocs = useSelector(store)
  const [layerGroup, dummy] = useState(L.layerGroup())
  layerGroup.addTo(leafletMap) // TODO check if every render it add the same layer again? if yes - use useEffect to do it once

  const showBoundingPolygon = useSelector((store) => store.content.showBoundingPolygon)
  const allEntities = useSelector((store) => store.content.entities)

  useEffect(()=>{    
    if(!showBoundingPolygon){
      layerGroup.clearLayers()
    } else {
            
      let allLayers = []
      const entKeys = Object.keys(allEntities)
      for (let index = 0; index < entKeys.length; index++) {
        const entity = allEntities[entKeys[index]]
        const entityLocs = Object.values(entity.data.geoLocations)
        for (let index = 0; index < entityLocs.length; index++) {
          const geoLoc = entityLocs[index];
          const geoLayer = geoLoc.geometry.type === 'Polygon' ? L.polygon(geoLoc.geometry.coordinates) : 
                                                                L.marker(geoLoc.geometry.coordinates)
          allLayers.push(geoLayer)                    
        }        
      }
      const featureGroup = L.featureGroup(allLayers)
      const bounds = featureGroup.getBounds()
      const boundingPolygonLayer = L.polygon([
        bounds.getNorthWest(),bounds.getNorthEast(),
        bounds.getSouthEast(), bounds.getSouthWest(),
        bounds.getNorthWest()])
      layerGroup.addLayer(boundingPolygonLayer)
    }
  }, [showBoundingPolygon, allEntities, layerGroup])

  return null
  
}

export default BoundingPolygon
