/** @jsxImportSource @emotion/react */
import { useState, useEffect, useRef, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectEntities, selectRelations, positionShifted, addIssue } from '../redux/content'
import ReactFlow, { removeElements, addEdge } from 'react-flow-renderer'

import { options, makeNode, makeRelation, relationOptions } from './flowOptions'
import { entityStyle } from '../editor/entityTypes'

import Node from './Node'

import useWindowResize from '../utility/useWindowResize'
import { getEntityId } from '../utility/extractIds'

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

const Relations = () => {
  const [elements, setElements] = useState([])
  const dispatch = useDispatch()
  console.log('Relations is rendered')

  const entities = useSelector(selectEntities)
  const relations = useSelector(selectRelations)

  const {
    editor: viewEditor,
    tags: viewTags,
    relations: viewRelations,
    connections: editRelations,
    exclusiveRelations,
  } = useSelector(store => store.app.view)

  useWindowResize()

  const nodeTypes = { node: Node }
  // const { nodeStyle } = styles

  const onElementsRemove = elementsToRemove =>
    setElements(els => removeElements(elementsToRemove, els))

  const onConnect = params =>
    setElements(els => addEdge({ ...params, ...relationOptions('new') }, els))

  // ToDo: This repositions the element back into place *regardless of x, y values* - check why
  const onNodeDragStop = (event, node) => {
    setElements(elements =>
      elements.map(element => {
        if (element.id === node.id) element.position = { x: 0, y: 0 }
        return element
      })
    )

    const { id, entityRangeIndex } = getEntityId(node.id)
    const shifted = true

    dispatch(positionShifted({ id, entityRangeIndex, shifted }))
  }

  useEffect(() => {
    try {
      const entityEntries = Object.entries(entities)
      if (!entityEntries.length) return

      const nodes = []
      const edges = []
      const shiftedNodes = {}

      entityEntries.forEach(([id, { type, data, entityRanges }]) => {
        entityRanges &&
          entityRanges.forEach(({ position = {}, text }, index) => {
            const { x, y, width, height, shifted } = position

            if (shifted) {
              const nodeId = `${id}-${index}`
              shiftedNodes[nodeId] = { index, position }
            }

            // ToDo: skip when positions are still empty
            // next line saves nodes creation when positions aren't ready yet
            // however it makes next (edges) section log "couldn't create edge" warnings
            // as there aren't any nodes that match the edge; fix along with the corrupted data fix
            // if (!x || !y) return
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
            nodes.push(node)
            // setElements(els => [...els, node])
          })
      })

      if (!entityEntries.length) return null

      relations &&
        relations.forEach(({ from, to, type }) => {
          entities[from] &&
            entities[from].entityRanges.forEach((_, fromEntityRangeIndex) => {
              entities[to] &&
                entities[to].entityRanges.forEach((_, toEntityRangeIndex) => {
                  const relation = makeRelation({
                    from,
                    fromEntityRangeIndex,
                    to,
                    toEntityRangeIndex,
                    type,
                    exclusiveRelations,
                    entityFromType: entities[from].type,
                    viewRelations,
                  })
                  edges.push(relation)
                  // setElements(els => [...els, relation])
                })
            })
        })

      setElements([...nodes, ...edges])
    } catch (error) {
      console.error(error.name)
      const component = 'Relations'
      const { name, message } = error
      const issue = { component, name, message }
      dispatch(addIssue(issue))
    }
  }, [
    entities,
    relations,
    exclusiveRelations,
    editRelations,
    viewRelations,
  ])

  // allow enough time for nodes & relations' positions to be calculated before revealing them
  const visibilityRef = useRef()
  const [visibility, setVisibility] = useState('visible')
  useEffect(() => {
    visibilityRef.current = visibilityRef.current || {}
    if (!viewTags) {
      setVisibility('hidden')
      visibilityRef.current.viewTags = false
    } else if (
      visibilityRef.current?.viewTags === false &&
      !visibilityRef.current?.timer
    ) {
      visibilityRef.current.timer = setTimeout(() => {
        setVisibility('visible')
        visibilityRef.current.viewTags = true
        visibilityRef.current.timer = null
      }, 500)
    }
  }, [viewTags, visibility])

  return (
    <div
      css={styles.container}
      style={{
        visibility,
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
          onNodeDragStop,
          ...options,
          nodesDraggable: !viewEditor,
          nodesConnectable: editRelations,
        }}
      />
    </div>
  )
}

export default memo(Relations)
