/** @jsxImportSource @emotion/react */
import { useRef } from 'react'

import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'

import entityTypes, { entityStyle } from './entityTypes'
import { EntityDetails } from './EntityDetails'

export const TextSpan = type => ({ children }) => (
  <span css={entityStyle(type)}>{children}</span>
)

export const EntitySpan = ({ contentState, entityKey, children }) => {
  const entity = contentState.getEntity(entityKey)
  const { type } = entity
  const { icon } = entityTypes[type]
  const css = entityStyle(type)
  const ref = useRef()

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
}
