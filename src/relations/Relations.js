/** @jsxImportSource @emotion/react */
import { memo } from 'react'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectEntities } from '../redux/content'
import ReactFlow, { removeElements, addEdge, Handle } from 'react-flow-renderer'

import entityTypes, { relationTypes } from '../editor/entityTypes'
import { options, makeNode, makeRelation, relationOptions } from './flowOptions'

const styles = {
  container: {
    height: '100%',
    width: '100%',
    position: 'fixed',
    left: '0',
    top: '0',
    pointerEvents: 'none',
  },
  editMode: {
    zIndex: '1',
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
    width: '0.55rem',
    height: '0.55rem',
    border: '2px solid white',
  },
}

const Node = ({ id, data: { name, inputs, outputs, editRelations } }) => {
  const visibility = editRelations ? 'visible' : 'hidden'
  return (
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
              visibility,
            }}
          />
        ))}
      <Handle
        type="source"
        id="extraSource"
        key="extraSource"
        position="bottom"
        style={{ ...styles.handleStyle, backgroundColor: 'green', visibility }}
      />
      {!editRelations && <div>{name}</div>}
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
              visibility,
            }}
          />
        ))}
      <Handle
        type="target"
        id="extraTarget"
        key="extraTarget"
        position="top"
        style={{ ...styles.handleStyle, backgroundColor: 'red', visibility }}
      />
    </div>
  )
}

// ToDo:
// - ![DONE] implement a toggle button in the editor that, when clicked, shows relations and fades the entities decorators
//   [DONE] or, better yet: 2 toggle buttons, one showing/hiding the entities, the other showing/hiding the relations
// - [DONE] add an extra handle for online connections (something to demo)
// - [DONE] implement the connections button on the details hover card, so that it shows upon hover only the connection of this entity to others
// - spread the handles so they're not one on another
const Relations = memo(() => {
  const [elements, setElements] = useState([])

  const { entities, relations } = useSelector(selectEntities)
  const {
    relations: showRelations,
    connections: editRelations,
    exclusiveRelations,
  } = useSelector(store => store.app.view)
  const { selected } = useSelector(store => store.content)

  const nodeTypes = { node: Node }
  const { nodeStyle } = styles

  const onElementsRemove = elementsToRemove =>
    setElements(els => removeElements(elementsToRemove, els))

  const onConnect = params =>
    setElements(els => addEdge({ ...params, ...relationOptions('new') }, els))

  useEffect(() => {
    const entityEntries = Object.entries(entities)
    if (!entityEntries.length) return

    const nodes = []
    const edges = []

    entityEntries.forEach(([id, { type, data, entityRanges }]) => {
      entityRanges.forEach(
        ({ position: { x, y, width, height } = {} }, index) => {
          const node = makeNode({
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
          })
          nodes.push(node)
        }
      )
    })

    relations &&
      relations.forEach(({ from, to, type }) => {
        entities[from].entityRanges.forEach((_, fromEntityRangeIndex) => {
          entities[to].entityRanges.forEach((_, toEntityRangeIndex) => {
            const relation = makeRelation({
              from,
              fromEntityRangeIndex,
              to,
              toEntityRangeIndex,
              type,
              exclusiveRelations,
              selected,
            })
            edges.push(relation)
          })
        })
      })

    setElements([...nodes, ...edges])
  }, [
    editRelations,
    entities,
    exclusiveRelations,
    nodeStyle,
    relations,
    selected,
  ])

  return (
    <div
      css={styles.container}
      style={{
        visibility: showRelations || exclusiveRelations ? 'visible' : 'hidden',
        ...(editRelations && styles.editMode),
      }}
    >
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
