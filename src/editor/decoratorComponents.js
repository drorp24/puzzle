/** @jsxImportSource @emotion/react */
import { memo, forwardRef, useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  updatePosition,
  selectContent,
  selectEntityById,
} from '../redux/content'

import { levelIconWithText } from '../editor/entityTypes'
import usePixels from '../utility/usePixels'
import { useMode, useLocale } from '../utility/appUtilities'

// import ClickAwayListener from '@material-ui/core/ClickAwayListener'
// import Tooltip from '@material-ui/core/Tooltip'
// import Zoom from '@material-ui/core/Zoom'
// import { EntityDetails } from './EntityDetails'

import entityTypes, {
  entityStyle,
  entityIconStyle,
  entityTextStyle,
} from './entityTypes'

export const TextSpan =
  type =>
  ({ children }) =>
    <span css={entityStyle(type)}>{children}</span>

// ! entities & ranges
// draft's text entities and reactflow's nodes are unaware of each other and render separately.
// In order to bring them together into one view, reactflow's nodes must follow the x/y coordinates of the entities.
//
// To achieve that, EntitySpan calls getBoundingClientRect on the ref of the native span whenever any of the useEffect's dependencies change,
// and reports it on the entity's respective entityRange.
// reactflow's nodes are built by scanning those entityRanges and then listen to their position changes, so that
// every change in each of the useEffect's dependencies will make the affected nodes move along with the respective text entity.
//
// The challenge is that draft doesnt maintain any id to uniquely identify an entityRange (occurrence) within an entity,
// so the only way of telling which entityRange is it whose position we need to update is by looking at the passed-in 'start' and 'end' props,
// and find the entityRange with the same start and end - but these will change if editing is ever allowed.
//
// This limitation of draft is a small price to pay for an otherwise very efficient character - entity - styling solution,
// and since no editing will probably ever be required, I disabled it, so that entityRanges would be found by their original offsets.
export const EntitySpan = ({
  contentState,
  entityKey,
  children,
  blockKey,
  start,
  end,
}) => {
  const ref = useRef()
  const entity = contentState.getEntity(entityKey)
  const { id } = entity.data

  const selectorEntity = useSelector(selectEntityById(id))
  const { loaded, entities } = useSelector(selectContent)
  const contentChanges = useSelector(store => store.content.changes)
  const { tags, relations } = useSelector(store => store.app.view)
  const {
    drawerOpen,
    editor: {
      x: editorX,
      y: editorY,
      width: editorWidth,
      height: editorHeight,
    },
  } = useSelector(store => store.app)
  const { height: windowHeight, width: windowWidth } = useSelector(
    store => store.app.window
  )
  const dispatch = useDispatch()
  const level = usePixels(levelIconWithText.y)

  const of =
    ({ blockKey, start, end }) =>
    item =>
      item.blockKey === blockKey &&
      item.offset === start &&
      item.length === end - start

  // if editing is ever allowed, this will break
  const entityRangeIndex =
    selectorEntity &&
    selectorEntity.entityRanges?.length &&
    selectorEntity.entityRanges.findIndex(of({ blockKey, start, end }))

  useEffect(() => {
    if (
      !loaded ||
      selectorEntity === undefined ||
      entityRangeIndex === undefined
    )
      return

    const reportIfPositionShifted = () => {
      const { width, height } = ref.current?.getBoundingClientRect() || {}
      // since flow entities & relations are absolutely positioned relative to their editor parent, offsets are used
      const x = ref.current.offsetLeft
      const y = ref.current.offsetTop + level

      if (x !== ref.current?.position?.x || y !== ref.current?.position?.y) {
        // keep prev position so only position changes would be reported
        const position = { x, y, width, height }
        ref.current.position = position

        // keep prev drawerOpen state and editor dimensions to detect changes that require setTimeout
        ref.current.drawerOpen = drawerOpen
        ref.current.editorX = editorX
        ref.current.editorY = editorY
        ref.current.editorWidth = editorWidth
        ref.current.editorHeight = editorHeight

        dispatch(updatePosition({ id, entityRangeIndex, position }))
      }
    }

    reportIfPositionShifted()

    // another, delayed position check is made when transitioning elements finish their transition
    if (
      // relations &&
      drawerOpen !== ref.current.drawerOpen ||
      editorX !== ref.current.editorX ||
      editorY !== ref.current.editorY ||
      editorWidth !== ref.current.editorWidth ||
      editorHeight !== ref.current.editorHeight
    ) {
      setTimeout(reportIfPositionShifted, 1000)
    }
  }, [
    loaded,
    entities.length,
    contentChanges,
    windowHeight,
    windowWidth,
    id,
    entityRangeIndex,
    selectorEntity,
    tags,
    drawerOpen,
    editorX,
    editorY,
    editorWidth,
    editorHeight,
    dispatch,
    // relations,
    level,
  ])

  return <Entity {...{ contentState, entityKey, children, tags, ref }} />
}

// ToDo: Remove Tooltip
// In the newer versions, text decorator components are never meant to be viewed anymore,
// and their sole purpose is to enable calculating nodes coordinates
// so they precisely fit the entities' positions within the text.
//
// Since that makes only nodes stick on the surface of the text,
// it's only those nodes that require tooltips to show when hovered.

// memo ensures position changes do not trigger unnecessary re-rendering
// forwardRef enables using this component's ref in parent component
const Entity = memo(
  forwardRef(({ contentState, entityKey, children, tags }, ref) => {
    // const [tooltipOpen, setTooltipOpen] = useState(false)
    const entity = contentState.getEntity(entityKey)
    const { type } = entity
    const { icon } = entityTypes[type]
    const role = 'text'
    const { mode } = useMode()
    const { capitalPlacement } = useLocale()
    const entityS = entityStyle({ type, role, mode })
    const iconS = entityIconStyle({ type, role, mode })
    const textS = entityTextStyle({ capitalPlacement, mode })

    // const openTooltip = () => {
    //   setTooltipOpen(true)
    // }
    // const closeTooltip = () => {
    //   setTooltipOpen(false)
    // }
    return (
      // <ClickAwayListener onClickAway={closeTooltip}>
      //   <Tooltip
      //     // open={
      //     //   entity.data.id === 'secondEntity' ||
      //     //   entity.data.id === 'ef9753ee-3c4b-4fb8-98f3-ef19ae6f5ed4'
      //     // }
      //     // * Uncomment to trigger by click
      //     // open={tooltipOpen}
      //     title={<EntityDetails {...{ entity }} />}
      //     arrow
      //     TransitionComponent={Zoom}
      //     disableFocusListener={true}
      //     placement="left"
      //     PopperProps={{ style: { width: '15rem' } }}
      //   >
      <span
        ref={ref}
        {...(tags && { style: entityS })} /* onClick={openTooltip} */
      >
        <span css={iconS}>{tags && icon}</span>
        <span css={textS}>{children}</span>
      </span>
      // </Tooltip>
      // </ClickAwayListener>
    )
  })
)
