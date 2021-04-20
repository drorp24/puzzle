/** @jsxImportSource @emotion/react */
import { useState, useEffect, memo } from 'react'
import { useSelector } from 'react-redux'
import { selectEntities } from '../redux/content'
import ReactFlow, { removeElements, addEdge } from 'react-flow-renderer'

import { options, makeNode, makeRelation, relationOptions } from './flowOptions'
import { entityStyle } from '../editor/entityTypes'

import Node from './Node'

import useWindowResize from '../utility/useWindowResize'

export const styles = {
  container: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    left: '0',
    top: '0',
    pointerEvents: 'none',
    zIndex: '3',
    '& svg': {
      zIndex: '3',
    },
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

// ToDo: when 'editRelations' is on and 'showText' is off, text inside pills disappears
const Relations = () => {
  const [elements, setElements] = useState([])
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  console.log('Relations is rendered')

  const { entities, relations, selectedId } = useSelector(selectEntities)

  const {
    view: {
      editor: viewEditor,
      relations: viewRelations,
      connections: editRelations,
      exclusiveRelations,
    },
    // hide: { relations: hideRelations },
    editor: editorBox,
  } = useSelector(store => store.app)

  useWindowResize()

  const nodeTypes = { node: Node }
  // const { nodeStyle } = styles

  const onElementsRemove = elementsToRemove =>
    setElements(els => removeElements(elementsToRemove, els))

  const onConnect = params =>
    setElements(els => addEdge({ ...params, ...relationOptions('new') }, els))

  useEffect(() => {
    if (!Object.keys(entities).length) return

    console.log('Relations useEffect entered')
    const entityEntries = Object.entries(entities)
    if (!entityEntries.length) return

    const currentNodes = []
    const currentEdges = []

    entityEntries.forEach(([id, { type, data, entityRanges }]) => {
      entityRanges.forEach(({ position = {}, text }, index) => {
        const { x, y, width, height } = position
        if (!x || !y) return
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
        })
        currentNodes.push(node)
      })
    })

    if (!Object.keys(entities).length) return null

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
              selectedId,
              entityFromType: entities[from].type,
            })
            currentEdges.push(relation)
          })
        })
      })

    console.log('nodes: ', nodes)
    console.log('currentNodes: ', currentNodes)

    setNodes(currentNodes)
    setEdges(currentEdges)
    setElements([...nodes, ...edges])
  }, [
    viewEditor,
    editRelations,
    editorBox,
    entities,
    exclusiveRelations,
    relations,
    selectedId,
    nodes,
    edges,
  ])

  return (
    <div
      css={styles.container}
      style={{
        visibility:
          viewRelations || exclusiveRelations /* && !hideRelations */
            ? 'visible'
            : 'hidden',
        direction: 'ltr',
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
}

export default memo(Relations)
