/** @jsxImportSource @emotion/react */
import { useState, useEffect, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectEntities, positionShifted, addIssue } from '../redux/content'
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

// ToDo: when 'editRelations' is on and 'showText' is off, text inside pills disappears
const Relations = () => {
  const [elements, setElements] = useState([])
  const dispatch = useDispatch()
  console.log('Relations is rendered')

  const { entities, relations, selectedId } = useSelector(selectEntities)

  const {
    editor: viewEditor,
    connections: editRelations,
    relations: viewRelations,
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

  const onLoad = reactFlowInstance => {
    const els = reactFlowInstance.getElements()
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
                    selectedId,
                    entityFromType: entities[from].type,
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

    // ToDo: re-position shifted nodes back to place whenever viewEditor is on
    // Though setElements gets an entirely new array, with the correct positioning,
    // nothing seems to make react-flow rerender shifted nodes.
    // As a temporary workaround, the dragStop event returns the shifted node back to place.
    // The following code was an attempt to make it work. It didn't.

    // setElements(elements =>
    //   elements.map(element => {
    //     const shiftedNode = element.type === 'node' && shiftedNodes[element.id]

    //     if (shiftedNode) {
    //       console.log('shiftedNode: ', shiftedNode)
    //       const {
    //         index,
    //         position: { x, y },
    //       } = shiftedNode
    //       element.position = { x, y }

    //       // ToDo: this makes FileSelect re-render
    //       // dispatch(
    //       //   positionShifted({
    //       //     id: element.id,
    //       //     entityRangeIndex: index,
    //       //     shifted: false,
    //       //   })
    //       // )
    //       return { ...element, position: { x, y } }
    //     }
    //     return element
    //   })
    // )

    // })

    // This is left here since it did succeed in positioning a node
    // though it looks equivalent to the setElements attempts above, that didn't do the job.
    // setElements(elements =>
    //   elements.map(element => {
    //     if (element.id === '6644bd08-59d8-43c8-9919-4e069b7b91b0-0') {
    //       element.position = { x: 0, y: 0 }
    //     }
    //     return element
    //   })
    // )
  }, [
    entities,
    relations,
    exclusiveRelations,
    editRelations,
    selectedId,
    dispatch,
  ])

  return (
    <div
      css={styles.container}
      style={{
        visibility: viewRelations || exclusiveRelations ? 'visible' : 'hidden',
        direction: 'ltr',
        ...(editRelations && styles.editMode),
      }}
    >
      <ReactFlow
        {...{
          elements,
          nodeTypes,
          onLoad,
          onElementsRemove,
          onConnect,
          onNodeDragStop,
          ...options,
          nodesDraggable: !viewEditor,
        }}
      />
    </div>
  )
}

export default memo(Relations)
