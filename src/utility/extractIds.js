export const getEntityId = nodeId => {
  const index = nodeId.lastIndexOf('-')
  if (index === -1) console.error('invalid nodeId:', nodeId)
  const id = nodeId.substring(0, index)
  const entityRangeIndex = nodeId.substring(index + 1)
  return { id, entityRangeIndex }
}
