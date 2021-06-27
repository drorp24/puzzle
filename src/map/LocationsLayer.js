/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react'
import ReactDOMServer from 'react-dom/server';
import { useSelector, useDispatch } from 'react-redux'
import { useMap } from 'react-leaflet'
import { selectLocations, selectLocationIdOnMap } from '../redux/content'
import FeatureDetails from './FeatureDetails'

// https://github.com/PaulLeCam/react-leaflet/issues/453
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css' // Re-uses images from ~leaflet package
import * as L from 'leaflet'
import 'leaflet-defaulticon-compatibility'

const LocationsLayer = () => {
  const map = useMap()
  const dispatch = useDispatch()
  const selectedLocs = useSelector(selectLocations)
  const [layerGroup, dummy] = useState(L.layerGroup())
  layerGroup.addTo(map)

  const handleLocClicked = (entity_location_id) => {
    if(entity_location_id !== null){
      dispatch(selectLocationIdOnMap({entity_location_id}))
    }    
  }

  const setupEvents = (geoLayer, geoLoc) => {
    // mouse over - show popup
    const popupString = ReactDOMServer.renderToString(FeatureDetails(geoLoc))
    geoLayer.bindPopup(popupString)
    geoLayer.on('mouseover', () => {
      geoLayer.openPopup()
    })
    // point.on('mouseout', () => {point.closePopup()})

    // mouse click - fire action
    geoLayer.on('click', (geoObj) =>{
      handleLocClicked(geoObj.target.options.properties.entity_location_id)
    })
  }

  layerGroup.clearLayers()
  for (let index = 0; index < selectedLocs.length; index++) {
    const geoLoc = selectedLocs[index];
    const geoLayer = geoLoc.geometry.type === 'Polygon' ? L.polygon(geoLoc.geometry.coordinates, {properties: geoLoc.properties }) : 
                                                          L.marker(geoLoc.geometry.coordinates, {properties: geoLoc.properties })
    setupEvents(geoLayer, geoLoc)
    layerGroup.addLayer(geoLayer)      
  }

  return null
  
}

export default LocationsLayer
