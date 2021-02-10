/** @jsxImportSource @emotion/react */
import { memo } from 'react'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectEntities } from '../redux/content'
import ReactFlow, { removeElements, addEdge, Handle } from 'react-flow-renderer'

import entityTypes, { relationTypes } from '../../src/editor/entityTypes'

const styles = {
  container: {
    height: '100%',
    width: '100%',
    position: 'fixed',
    left: '-5px',
    top: '-5px',
    boxSizing: 'border-box',
    border: '5px solid pink',
    pointerEvents: 'none',
  },
  nodeStyle: {
    borderRadius: '1rem',
    padding: '0 1rem',
    border: '1px solid',
    color: 'rgba(0, 0, 0, 0.65)',
  },
  relationStyle: {
    color: 'black',
  },
  handleStyle: {
    width: '0.5rem',
    height: '0.5rem',
    border: '1px solid black',
  },
}

const Node = ({ id, data: { name, inputs, outputs } }) => (
  <div>
    {outputs &&
      outputs.map(({ source, target, type }) => (
        <Handle
          type="source"
          id={`${source}-${target}-${type}`}
          key={target}
          position="right"
          style={{
            ...styles.handleStyle,
            backgroundColor: entityTypes[relationTypes[type].entity].color,
          }}
        />
      ))}
    <div>{name}</div>
    {inputs &&
      inputs.map(({ source, target, type }) => (
        <Handle
          type="target"
          id={`${target}-${source}-${type}`}
          key={source}
          position="left"
          style={{
            ...styles.handleStyle,
            backgroundColor: entityTypes[relationTypes[type].entity].color,
          }}
        />
      ))}
  </div>
)

// ToDo:
// - ![DONE] implement a toggle button in the editor that, when clicked, shows relations and fades the entities decorators
//   [DONE] or, better yet: 2 toggle buttons, one showing/hiding the entities, the other showing/hiding the relations
// - add an extra handle for online connections (something to demo)
// - implement the connections button on the details hover card, so that it shows upon hover only the connection of this entity to others
// - spread the handles so they're not one on another
const Relations = memo(({ showRelations }) => {
  const visibility = showRelations ? 'visible' : 'hidden'
  console.log('visibility: ', visibility)
  const [elements, setElements] = useState([])

  const { entities, relations } = useSelector(selectEntities)

  const nodeTypes = { node: Node }
  const { nodeStyle } = styles

  const onElementsRemove = elementsToRemove =>
    setElements(els => removeElements(elementsToRemove, els))

  const onConnect = params => {
    return setElements(els => addEdge(params, els))
  }

  const options = {
    nodesDraggable: false,
    zoomOnScroll: false,
    zoomOnDoubleClick: false,
    paneMoveable: false,
    connectionMode: 'loose',
    connectionLineType: 'smoothstep',
    deleteKeyCode: 46,
  }

  useEffect(() => {
    const entityEntries = Object.entries(entities)
    if (!entityEntries.length) return

    const nodes = []
    const edges = []

    entityEntries.forEach(([id, { type, data, entityRanges }]) => {
      entityRanges.forEach(
        ({ position: { x, y, width, height } = {} }, index) => {
          const node = {
            id: `${id}-${index}`,
            type: 'node',
            position: { x, y },
            style: {
              width,
              height,
              ...nodeStyle,
              borderColor: entityTypes[type].color,
            },
            sourcePosition: 'right',
            targetPosition: 'left',
            data,
          }
          nodes.push(node)
        }
      )
    })

    relations &&
      relations.forEach(({ from, to, type }) => {
        entities[from].entityRanges.forEach((_, fromEntityRangeIndex) => {
          entities[to].entityRanges.forEach((_, toEntityRangeIndex) => {
            const source = `${from}-${fromEntityRangeIndex}`
            const target = `${to}-${toEntityRangeIndex}`
            const relation = {
              id: `${source}-${target}-${type}`,
              source: `${source}`,
              sourceHandle: `${from}-${to}-${type}`,
              target: `${target}`,
              targetHandle: `${to}-${from}-${type}`,
              label: type,
              // type: 'smoothstep',
              arrowHeadType: 'arrowclosed',
              style: {
                stroke: entityTypes[relationTypes[type].entity].color,
                strokeWidth: '4',
              },
              labelStyle: {
                fill: entityTypes[relationTypes[type].entity].color,
                fontSize: '0.8rem',
              },
              labelBgStyle: {
                fill: 'black',
                // stroke: entityTypes[relationTypes[type].entity].color,
                strokeWidth: '3',
                textAlign: 'center',
              },
              labelBgPadding: [4, 4],
              animated: true,
            }
            edges.push(relation)
          })
        })
      })

    setElements([...nodes, ...edges])
  }, [entities, nodeStyle, relations])

  return (
    <div css={styles.container} style={{ visibility }}>
      <ReactFlow
        {...{
          elements,
          nodeTypes,
          onElementsRemove,
          onConnect,
          ...options,
        }}
      />
    </div>
  )
})

export default Relations
