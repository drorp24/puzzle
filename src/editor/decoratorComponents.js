/** @jsxImportSource @emotion/react */

import entityTypes from './entityTypes'
import { getEntityType } from './entities'

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
  const entityType = getEntityType({ contentState, entityKey })
  const style = entityTypes[entityType].style
  return <span css={style}>{children}</span>
}
