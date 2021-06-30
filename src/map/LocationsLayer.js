/** @jsxImportSource @emotion/react */
import {flow, groupBy, maxBy, values, map, keyBy, getOr} from 'lodash/fp'
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
const colorToRGB = {
  red: '255,0,0',
  green: '0,255,0',
  blue: '0,0,255',
  gray:	'128,128,128',
  yellow: '255,255,0',
  purple: '128,0,128',
  orange: '255,165,0'
}

const markerStyle = `width: 1.5rem;
                    height: 1.5rem;
                    display: block;
                    position: relative;
                    border-radius: 3rem 3rem 0;
                    transform: rotate(45deg);
                    border: 1px solid black;`

const LocationsLayer = () => {
  const leafletMap = useMap()
  const dispatch = useDispatch()
  const selectedLocations = useSelector(selectLocations)
  const selectedLocs = useSelector((store) => store.content.selectedLocs)
  const [layerGroup, dummy] = useState(L.layerGroup())
  layerGroup.addTo(leafletMap)

  const getOptions = ({parId, loc}, color, maxScore) => {
    const relativeScore = loc.properties.score/maxScore
    const colorWithOpacity = `rgba(${colorToRGB[color]},${relativeScore})`
    if(loc.geometry.type === 'Polygon'){
      return {color: colorWithOpacity,properties: loc.properties}      
    }    
    const markerHtmlStyles = `background-color: ${colorWithOpacity}; ${markerStyle}`

    const icon = L.divIcon({
      className: "my-custom-pin",
      iconAnchor: [-5, 35],
      labelAnchor: [-6, 0],
      popupAnchor: [0, -35],
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
    // geoLayer.on('mouseout', () => {geoLayer.closePopup()})

    // mouse click - fire action
    geoLayer.on('click', (geoObj) =>{
      handleLocClicked(geoObj.target.options.properties.entity_location_id)
    })
  }

  useEffect(() => {
    layerGroup.clearLayers()
    const colorsToEntityId = {}
    const entityWithMaxScorePerEntityId = flow([
      groupBy('parId'),
      values,
      map((arr) => maxBy('loc.properties.score', arr)),
      keyBy('parId')
    ])(selectedLocations)
    for (let index = 0; index < selectedLocations.length; index++) {          
      const item = selectedLocations[index];
      const maxScorePerParEnt = getOr(1, 'loc.properties.score', entityWithMaxScorePerEntityId[item.parId])
      let color = colorsToEntityId.hasOwnProperty(item.parId) ? colorsToEntityId[item.parId] : colors[index%(colors.length)]
      colorsToEntityId[item.parId] = color
      const geoLayer = item.loc.geometry.type === 'Polygon' ? L.polygon(item.loc.geometry.coordinates, getOptions(item, color, maxScorePerParEnt)) :
                                                              L.marker(item.loc.geometry.coordinates, getOptions(item, color, maxScorePerParEnt))
      setupEvents(geoLayer, item.loc)
      layerGroup.addLayer(geoLayer)
    }
  },
  [selectedLocs, layerGroup])

  return null
  
}

export default LocationsLayer
