/** @jsxImportSource @emotion/react */
import { memo, forwardRef } from 'react'
import { useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { update, selectContent } from '../redux/content'

import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import { EntityDetails } from './EntityDetails'

import entityTypes, { entityStyle } from './entityTypes'

export const TextSpan = type => ({ children }) => (
  <span css={entityStyle(type)}>{children}</span>
)

export const EntitySpan = ({ contentState, entityKey, children }) => {
  const ref = useRef()
  const entity = contentState.getEntity(entityKey)
  const id = entity.data.id || entityKey // see note on content.js

  const contentLoaded = useSelector(store => selectContent(store).loaded)
  const contentChanges = useSelector(store => store.content.changes)
  const { height: windowHeight, width: windowWidth } = useSelector(
    store => store.app.window
  )

  const dispatch = useDispatch()

  useEffect(() => {
    if (!contentLoaded) return

    const { x, y, width, height } = ref.current?.getBoundingClientRect() || {}

    // only report position changes, keeping previous position in ref
    if (x !== ref.current.viewport?.x || y !== ref.current.viewport?.y) {
      const viewport = { x, y, width, height }
      ref.current.viewport = viewport
      dispatch(update({ id, changes: { viewport } }))
    }
  }, [
    contentLoaded,
    contentChanges,
    windowHeight,
    windowWidth,
    dispatch,
    entityKey,
    id,
  ])

  return <Entity {...{ contentState, entityKey, children, ref }} />
}

// memo ensures position changes do not trigger unnecessary re-rendering
// forwardRef enables using this component's ref in parent component
const Entity = memo(
  forwardRef(({ contentState, entityKey, children }, ref) => {
    const entity = contentState.getEntity(entityKey)
    const { type } = entity
    const { icon } = entityTypes[type]
    const css = entityStyle(type)

    return (
      <Tooltip
        title={<EntityDetails {...{ entity }} />}
        arrow
        TransitionComponent={Zoom}
        disableFocusListener={true}
      >
        <span {...{ css, ref }}>
          {icon}
          {children}
        </span>
      </Tooltip>
    )
  })
)
