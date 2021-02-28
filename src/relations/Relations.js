/** @jsxImportSource @emotion/react */
import { useState, useEffect, memo } from 'react'
import { useSelector } from 'react-redux'
import { selectEntities } from '../redux/content'
import ReactFlow, { removeElements, addEdge } from 'react-flow-renderer'

import { options, makeNode, makeRelation, relationOptions } from './flowOptions'
import { entityStyle } from '../editor/entityTypes'

import { Node } from './Node'
import { inside } from '../../src/utility/appUtilities'

export const styles = {
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
  relationStyle: {
    color: 'black',
  },
  handleStyle: {
    width: '0.55rem',
    height: '0.55rem',
    border: '2px solid white',
  },
}

// ToDo: spread the handles so they don't overlap

// ToDo: makes edges connect to the handles
// ToDo: when 'editRelations' is on and 'showText' is off, text inside pills disappears
const Relations = memo(() => {
  const [elements, setElements] = useState([])

  const { entities, relations } = useSelector(selectEntities)
  const {
    relations: showRelations,
    connections: editRelations,
    exclusiveRelations,
  } = useSelector(store => store.app.view)
  const { editor: editorBox } = useSelector(store => store.app)
  const { selected } = useSelector(store => store.content)

  const nodeTypes = { node: Node }
  // const { nodeStyle } = styles

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
      entityRanges.forEach(({ position = {}, text }, index) => {
        const { x, y, width, height } = position
        const isHidden = !inside(editorBox, { ...position })
        const role = 'node'
        const nodeStyle = entityStyle({ type, role })
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
          text,
          isHidden,
        })
        nodes.push(node)
      })
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
    editorBox,
    entities,
    exclusiveRelations,
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
