/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectSelectedLocation } from '../redux/content'
import { useMode } from '../utility/appUtilities'

import { useMap, Polygon, Polyline, Marker, Popup } from 'react-leaflet'
import isEqual from 'lodash.isequal'

import { flyToOptions } from './config'

// https://github.com/PaulLeCam/react-leaflet/issues/453
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css' // Re-uses images from ~leaflet package
import * as L from 'leaflet'
import 'leaflet-defaulticon-compatibility'

import FeatureDetails from './FeatureDetails'
import entityTypes from '../editor/entityTypes'
import useTheme from '../styling/useTheme'

// ! map nasty shaking issue
// To avoid nasty shaking of the map whenever an already displayed map feature is re-selected,
// 'flyTo'is prevented when the coordinates of selected feature are identical to the currently selected one,
// and/or the bounds are similar to the current map bounds.

const SelectedGeo = () => {
  const map = useMap()
  const theme = useTheme()
  const { mode } = useMode()

  // const selectedId = useSelector(selectSelectedId)
  const selectedLocationId = useSelector(store => store.content.selectedLocationId)
  const selectedLocation = useSelector(selectSelectedLocation(selectedLocationId))
  const { type, coordinates } = selectedLocation?.geometry || {}
  const positions = coordinates

  // const selectedRef = useRef()
  // const sameId = selectedId && selectedId === selectedRef.current?.selectedId
  // const sameCoordinates =
  //   coordinates?.length < 3 &&
  //   isEqual(coordinates, selectedRef.current?.coordinates)

  const polygon = useMemo(
    () => (type === 'Point' ? [coordinates] : coordinates),
    [coordinates, type]
  )

  useEffect(() => {
    if (
      !map ||
      // !selectedId ||
      !selectedLocation ||
      !coordinates?.length
      // prevent flying to same location / coordinates
      //  || sameId ||
      // sameCoordinates
    )
      return

    // selectedRef.current = { selectedId, coordinates }

    map.flyToBounds(L.polygon(polygon).getBounds(), flyToOptions)
  }, [
    map,
    // selectedId,
    selectedLocation,
    polygon,
    coordinates?.length,
    // sameId,
    // sameCoordinates,
    coordinates,
  ])

  // * Change popup container bg color
  // While mode change triggers FeatureDetails to re-render, the popup wrapper and tip aren't re-rendered.
  // The code below therefore imperatively changes the bg color of the wrapper and tip whenever mode changes.
  useEffect(() => {
    const popupWrappers = document.getElementsByClassName(
      'leaflet-popup-content-wrapper'
    )
    const popupTips = document.getElementsByClassName('leaflet-popup-tip')
    const popupWrapper =
      popupWrappers?.length === 1 ? popupWrappers[0] : undefined
    const popupTip = popupTips?.length === 1 ? popupTips[0] : undefined
    if (popupWrapper && popupTip) {
      popupWrapper.style.backgroundColor = theme.palette.background.paper
      popupTip.style.backgroundColor = theme.palette.background.paper
    }
  }, [mode, theme.palette.background.paper])

  if (!selectedLocation) return null

  const eventHandlers = {
    click: () => {},
  }

  const { details, entityType } = selectedLocation

  const styles = {
    pathOptions: { color: entityTypes[entityType]?.color },
    popup: theme => ({
      '& .leaflet-popup-content': {
        margin: '1.5rem 1rem 2.5rem',
        position: 'relative',
      },
      '& .leaflet-popup-content-wrapper': {
        backgroundColor: theme.palette.background.paper,
        color: 'pink',
      },
      '& .leaflet-popup-tip': {
        backgroundColor: theme.palette.background.paper,
      },
    }),
  }

  const { pathOptions } = styles

  // ! Popups vs. Tooltips
  // I am using popups rather than tooltips, since I want them to be scrollable.
  // Should I ever require tooltips instead of popups, scrolling tooltips requires:
  //  - Map to have scrollWheelZoom={false}
  //  - Tooltip here to have permanent={true}
  //  - tooltip scrolling.css
  //  - leaflet to fix its rtl bug (see css)
  // This way or the other scrolling tooltips is a bad UX.

  switch (type) {
    case 'Polygon':
      return (
        <Polygon {...{ positions, eventHandlers, pathOptions }}>
          <Popup direction="left" css={styles.popup}>
            <FeatureDetails {...{ details, entityType }} />
          </Popup>
        </Polygon>
      )
    case 'Point':
      return (
        <Marker {...{ position: positions, eventHandlers, pathOptions }}>
          <Popup direction="left" css={styles.popup}>
            <FeatureDetails {...{ details, entityType }} />
          </Popup>
        </Marker>
      )
    case 'LineString':
      return (
        <Polyline {...{ positions, eventHandlers, pathOptions }}>
          <Popup direction="left" css={styles.popup}>
            <FeatureDetails {...{ details, entityType }} />
          </Popup>
        </Polyline>
      )
    default:
      return (
        <Polygon {...{ positions, eventHandlers, pathOptions }}>
          <Popup direction="left" css={styles.popup}>
            <FeatureDetails {...{ details, entityType }} />
          </Popup>
        </Polygon>
      )
  }
}

export default SelectedGeo
