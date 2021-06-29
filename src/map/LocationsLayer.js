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

const colors = ['red', 'green', 'blue', 'gray', 'yellow', 'purple', 'orange']
const markerStyle = `width: 1.5rem;
                    height: 1.5rem;
                    display: block;
                    position: relative;
                    border-radius: 3rem 3rem 0;
                    transform: rotate(45deg);
                    border: 1px solid #FFFFFF`

const LocationsLayer = () => {
  const map = useMap()
  const dispatch = useDispatch()
  const selectedLocations = useSelector(selectLocations)
  const selectedLocs = useSelector((store) => store.content.selectedLocs)
  const [layerGroup, dummy] = useState(L.layerGroup())
  layerGroup.addTo(map)

  const getOptions = ({parId, loc}, color) => {
    if(loc.geometry.type === 'Polygon'){
      return {color,properties: loc.properties}      
    }
    const markerHtmlStyles = `background-color: ${color}; ${markerStyle}`

    const icon = L.divIcon({
      className: "my-custom-pin",
      iconAnchor: [0, 24],
      labelAnchor: [-6, 0],
      popupAnchor: [-6, -20],
      html: `<span style="${markerHtmlStyles}" />`
    })
    return {icon,properties: loc.properties}
  }

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

  useEffect(() => {
    layerGroup.clearLayers()
    const colorsToEntId = {}
    for (let index = 0; index < selectedLocations.length; index++) {    
      const item = selectedLocations[index];
      let color = colorsToEntId.hasOwnProperty(item.parId) ? colorsToEntId[item.parId] : colors[index%(colors.length)]
      colorsToEntId[item.parId] = color
      const geoLayer = item.loc.geometry.type === 'Polygon' ? L.polygon(item.loc.geometry.coordinates, getOptions(item, color)) :
                                                              L.marker(item.loc.geometry.coordinates, getOptions(item, color))
      setupEvents(geoLayer, item.loc)
      layerGroup.addLayer(geoLayer)
    }
  },
  [selectedLocs, layerGroup])

  return null
  
}

export default LocationsLayer
