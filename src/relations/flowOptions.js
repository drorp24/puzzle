import entityTypes, { relationTypes } from '../editor/entityTypes'
import ConnectionLine from './ConnectionLine'

export const options = {
  nodesDraggable: false,
  zoomOnScroll: false,
  zoomOnDoubleClick: false,
  paneMoveable: false,
  connectionMode: 'loose',
  connectionLineType: 'smoothstep',
  deleteKeyCode: 46,
  connectionLineComponent: ConnectionLine,
}

export const makeNode = ({
  id,
  type,
  data,
  index,
  x,
  y,
  width,
  height,
  nodeStyle,
  editRelations,
  text,
  isHidden,
}) => ({
  id: `${id}-${index}`,
  type: 'node',
  position: { x, y },
  style: {
    width,
    height,
    ...nodeStyle,
  },
  sourcePosition: 'right',
  targetPosition: 'left',
  data: { ...data, editRelations, type, index, text },
  isHidden,
})

export const relationOptions = type => ({
  label: type,
  type: 'smoothstep',
  style: {
    stroke: entityTypes[relationTypes[type].entity].color,
    strokeWidth: '4',
  },
  labelStyle: {
    fill: entityTypes[relationTypes[type].entity].color,
    fontSize: '1.1rem',
    fontWeight: '400',
  },
  labelBgStyle: {
    textAlign: 'center',
  },
  labelBgPadding: [4, 4],
  animated: true,
})

export const makeRelation = ({
  from,
  fromEntityRangeIndex,
  to,
  toEntityRangeIndex,
  type,
  exclusiveRelations,
  selected,
}) => {
  const source = `${from}-${fromEntityRangeIndex}`
  const target = `${to}-${toEntityRangeIndex}`
  const isHidden =
    exclusiveRelations && selected && selected !== from && selected !== to
  const relation = {
    id: `${source}-${target}-${type}`,
    source: `${source}`,
    sourceHandle: `${from}-${to}-${type}`,
    target: `${target}`,
    targetHandle: `${to}-${from}-${type}`,
    isHidden,
    ...relationOptions(type),
  }
  return relation
}
