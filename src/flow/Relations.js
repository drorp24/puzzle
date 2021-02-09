/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectEntities } from '../redux/content'
import ReactFlow, {
  removeElements,
  addEdge,
  Handle,
  // MiniMap,
  Controls,
} from 'react-flow-renderer'

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
    zIndex: '1',
  },
  nodeStyle: {
    // border: '5px solid white',
    borderRadius: '1rem',
    padding: '0 1rem',
  },
  relationStyle: {
    color: 'black',
  },
  handleStyle: {
    width: '0.5rem',
    height: '0.5rem',
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
    {/* <div>{name}</div> */}
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
// - ! implement a toggle button in the editor that, when clicked, shows relations and fades the entities decorators
//   or, better yet: 2 toggle buttons, one showing/hiding the entities, the other showing/hiding the relations
// - add an extra handle for online connections (something to demo)
// - spread the handles so they're not one on another
// - implement the connections button on the details hover card, so that it shows upon hover only the connection of this entity to others
const Relations = () => {
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

    entityEntries.forEach(([id, { data, entityRanges }]) => {
      entityRanges.forEach(
        ({ position: { x, y, width, height } = {} }, index) => {
          const node = {
            id: `${id}-${index}`,
            type: 'node',
            position: { x, y },
            style: { width: width, height: height, ...nodeStyle },
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
              arrowHeadType: 'arrow',
            }
            edges.push(relation)
          })
        })
      })

    setElements([...nodes, ...edges])
  }, [entities, nodeStyle, relations])

  return (
    <div css={styles.container}>
      <ReactFlow
        {...{
          elements,
          nodeTypes,
          onElementsRemove,
          onConnect,
          ...options,
        }}
      >
        {/* <MiniMap /> */}
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default Relations
