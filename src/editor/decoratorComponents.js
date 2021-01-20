/** @jsxImportSource @emotion/react */
import { useRef } from 'react'

import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'

import entityTypes from './entityTypes'
import { EntityDetails } from './EntityDetails'

export const HandleSpan = ({ children }) => {
  const style = entityTypes['MENTION'].style
  console.log('style: ', style)
  return <span css={style}>{children}</span>
}

export const HashtagSpan = ({ children }) => {
  const style = entityTypes['HASHTAG'].style
  return <span css={style}>{children}</span>
}

export const EntitySpan = ({ contentState, entityKey, children }) => {
  const entity = contentState.getEntity(entityKey)
  const {
    data: {
      userData: { entityType },
    },
  } = entity
  const style = entityTypes[entityType].style
  const ref = useRef()

  return (
    <Tooltip
      title={<EntityDetails {...{ entity }} />}
      arrow
      TransitionComponent={Zoom}
    >
      <span css={style} ref={ref}>
        {children}
      </span>
    </Tooltip>
  )
}
