/** @jsxImportSource @emotion/react */
import { useEffect, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectSelectedId,
  selectShowId,
  selectSelectedEntity,
  selectShowEntity,
  selected,
} from '../redux/content'

import {
  useMap,
  Polygon,
  Polyline,
  Marker,
  Popup,
  Tooltip,
} from 'react-leaflet'
import { flyToOptions } from './config'

// https://github.com/PaulLeCam/react-leaflet/issues/453
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css' // Re-uses images from ~leaflet package
import * as L from 'leaflet'
import 'leaflet-defaulticon-compatibility'

import FeatureDetails from './FeatureDetails'
import entityTypes from '../editor/entityTypes'
import noScrollbar from '../styling/noScrollbar'

// ! re-rendering issue
//
// ?Issue:
// Irrelant redux changes, such as any movement in Home component (e.g., extending editor),
// make SelectedGeo re-render many (12 or 13) times (that number isn't fixed), resulting in the map shiverring.
//
// Since SelectedGeo is depdenant only on selectedId and showId, the immediate suspects are the
// selectSelectedId and selectShowId selectors, which use destructuring. That destructuring might be the cause why
// changes outside of select/showId and completely irrelevant to SelectedGeo still trigger it to re-render.
//
// As long as the above isn't fixed, the entire SelectGeo component gets re-rendered. The fact that
// selectedEntity and showEntity in its useEffects are both objects are probably the reason why the useEffects
// also get called with each and every re-render of selectedGeo. Since each includes a 'flyTo', that is probably
// the cause of that map shiverring.
//
// Even after the Home re-rendering gets fixed, both useEffects should be immune to re-renders of their component
// by checking, for instance at the beginning of the respective useEffect, whether the id has changed from previous one,
// or by any other way.
//
// A different solution would be to pass the show/selected Id as a prop into SelectedGeo then surround SelectedGeo with memo.
// That way, the entire SelectedGeo component won't even get re-rendered unless either of those id change.
// But that would mean Map would have to be re-rendered evey time in order to check if the Id has changed,
// instead of leaving that check to the least child in the tree.
//
// ToDo: Two temporary workarounds to fix:
//
// 1. selectedId/Entity
//
// Since selectedEntity gets a new reference even though neither of its 3 properties changed,
// I cheat useMemo here to depend only on selectedId in spite of returning the selectedEntity object.
// This forces memoizedSelectedEntity to maintain the same reference, dependent only on selectedId.
//
// It's done to avoid re-rendering SelectedGeo unless selected entity has changed;
// which, besides being wasteful, makes the map shiver.
//
// 2. showId/Entity
//
// Same solution (memoization) prevents that 12-13 re-renderings, but then the flyTo doesn't work even initially.
// As a temp workaround I have a non-memoized useEffect running initially, then the memoized version takes over.
// The memoized version is currently commented, but should be used as soon as users can change selection.
//
// ToDo: remove 'showEntity', leaving only selectedEntity
// Programmatically select the first point on the map, if need to

const SelectedGeo = () => {
  const map = useMap()
  const selectedId = useSelector(selectSelectedId)
  const showId = useSelector(selectShowId)
  const selectedEntity = useSelector(selectSelectedEntity)
  const showEntity = useSelector(selectShowEntity)
  const memoizedSelectedEntity = useMemo(() => selectedEntity, [selectedId])
  const memoizedShowEntity = useMemo(() => showEntity, [showId])
  const showEntityRef = useRef()
  const selectedEntityRef = useRef()
  const dispatch = useDispatch()

  useEffect(() => {
    if (
      showEntityRef.current?.nonMemoizedShowEntityRan ||
      !map ||
      !showId ||
      !showEntity
    )
      return

    console.log('non memoized showEntity, for the flyTo')

    const { type, coordinates } = showEntity
    const polygon = type === 'Point' ? [coordinates] : coordinates

    showEntityRef.current = { nonMemoizedShowEntityRan: true }

    map.flyToBounds(L.polygon(polygon).getBounds(), flyToOptions)
  }, [map, showEntity, showId])

  // useEffect(() => {
  //   if (
  //     !ref.current?.nonMemoizedShowEntityRan ||
  //     !map ||
  //     !showId ||
  //     !memoizedShowEntity
  //   )
  //     return

  //   console.log('memoized showEntity, no flyTo')

  //   const { type, coordinates } = memoizedShowEntity
  //   const polygon = type === 'Point' ? [coordinates] : coordinates

  //   map.flyToBounds(L.polygon(polygon).getBounds(), flyToOptions)
  // }, [map, memoizedShowEntity, showId])

  useEffect(() => {
    if (
      selectedEntityRef.current?.nonMemoizedSelectedEntityRan ||
      !map ||
      !selectedId ||
      !selectedEntity
    )
      return

    console.log('non memoized selectedEntity, for the flyTo')

    const { type, coordinates } = selectedEntity
    const polygon = type === 'Point' ? [coordinates] : coordinates

    selectedEntityRef.current = { nonMemoizedSelectedEntityRan: true }

    map.flyToBounds(L.polygon(polygon).getBounds(), flyToOptions)
  }, [map, selectedId, selectedEntity])

  useEffect(() => {
    if (!map || !selectedId || !memoizedSelectedEntity) return

    const { type, coordinates } = memoizedSelectedEntity
    const polygon = type === 'Point' ? [coordinates] : coordinates

    map.flyToBounds(L.polygon(polygon).getBounds(), flyToOptions)
  }, [map, selectedId, memoizedSelectedEntity])

  if (!selectedEntity && !showEntity) return null
  const { id, type, coordinates } = selectedEntity || showEntity

  const positions = coordinates

  const eventHandlers = {
    click: () => {
      console.log(`${id} clicked`)
      dispatch(selected(id))
    },
  }

  const { details, entityType } = selectedEntity

  console.log('type: ', type)
  const styles = {
    pathOptions: { color: entityTypes[entityType]?.color },
  }

  const { pathOptions } = styles

  // ! Tooltips overflow
  // Extremely large tooltips (over page height) will be partly hidden.
  // Should I ever require it, scrolling tooltips requires:
  //  - Map to have scrollWheelZoom={false}
  //  - Tooltip here to have permanent={true}
  //  - tooltip scrolling.css
  //  - leaflet to fix its rtl bug (see css)
  // This way or the other scrolling tooltips is a bad UX. Such data requires its own pane.

  switch (type) {
    case 'Polygon':
      return (
        <Polygon {...{ positions, eventHandlers, pathOptions }}>
          <Tooltip sticky direction="left">
            <FeatureDetails {...{ details }} />
          </Tooltip>
        </Polygon>
      )
    case 'Point':
      return (
        <Marker {...{ position: positions, eventHandlers, pathOptions }}>
          <Tooltip sticky direction="left" style={styles.tooltip}>
            <FeatureDetails {...{ details }} />
          </Tooltip>
        </Marker>
      )
    case 'LineString':
      return (
        <Polyline {...{ positions, eventHandlers, pathOptions }}>
          <Tooltip sticky direction="left" style={styles.tooltip}>
            <FeatureDetails {...{ details }} />
          </Tooltip>
        </Polyline>
      )
    default:
      return (
        <Polygon {...{ positions, eventHandlers, pathOptions }}>
          <Tooltip sticky direction="left" style={styles.tooltip}>
            <FeatureDetails {...{ details }} />
          </Tooltip>
        </Polygon>
      )
  }
}

export default SelectedGeo
