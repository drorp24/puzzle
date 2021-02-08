/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectContent } from '../redux/content'
import ReactFlow, { removeElements, addEdge, Handle } from 'react-flow-renderer'

const styles = {
  container: {
    height: '100%',
    width: '100%',
    position: 'fixed',
    left: '0',
    top: '0',
    boxSizing: 'border-box',
    border: '5px solid pink',
    pointerEvents: 'none',
  },
  node: {
    border: '1px solid',
  },
  relation: {
    color: 'black',
  },
}

const Node = ({ data: { name, inputs, outputs } }) => (
  <div>
    {outputs &&
      outputs.map(({ source, target, type }) => (
        <Handle type="target" id={`${source}-${target}-${type}`} key={target} />
      ))}
    <div>{name}</div>
    {inputs &&
      inputs.map(({ source, target, type }) => (
        <Handle type="source" id={`${target}-${source}-${type}`} key={source} />
      ))}
  </div>
)

const Relations = () => {
  const { entities, relations } = useSelector(selectContent)
  console.log('entities: ', entities)

  const [elements, setElements] = useState()

  const nodeTypes = { node: Node }

  const onElementsRemove = elementsToRemove =>
    setElements(els => removeElements(elementsToRemove, els))
  const onConnect = params => setElements(els => addEdge(params, els))
  const onLoad = reactFlowInstance => {
    window.rfi = reactFlowInstance // ToDo: remove
  }

  useEffect(() => {
    console.log('useEffect entered')
    console.log('useEffect. relations: ', relations)
    const { node, relation } = styles
    const elements = []

    entities.forEach(({ data, viewport: { x, y, width, height } = {} }) => {
      const { id } = data
      const element = {
        id,
        type: 'node',
        position: { x, y },
        style: { width: width, height: height, ...node },
        data,
      }
      elements.push(element)
    })
    relations &&
      relations.forEach(({ from, to, type }) => {
        const relation = {
          id: `${from}-${to}-${type}`,
          source: from,
          sourceHandle: `${from}-${to}-${type}`,
          target: to,
          targetHandle: `${to}-${from}-${type}`,
          label: type,
        }
        elements.push(relation)
        console.log('relation: ', relation)
      })

    setElements(elements)
  }, [entities, relations])

  return (
    <div css={styles.container}>
      <ReactFlow
        elements={elements}
        nodeTypes={nodeTypes}
        onElementsRemove={onElementsRemove}
        onConnect={onConnect}
        deleteKeyCode={46} /* 'delete'-key */
        onLoad={onLoad}
      />
    </div>
  )
}

export default Relations
