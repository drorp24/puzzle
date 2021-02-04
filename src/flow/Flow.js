import { useState } from 'react'
import ReactFlow, { removeElements, addEdge } from 'react-flow-renderer'
const initialElements = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Input Node' },
    position: { x: 250, y: 25 },
  },
  { id: 'e1-2', source: '1', target: '2', animated: true },
  {
    id: '2',
    data: { label: 'Another Node' },
    position: { x: 0, y: 0 },
  },
]
const Flow = () => {
  const [elements, setElements] = useState(initialElements)
  const onElementsRemove = elementsToRemove =>
    setElements(els => removeElements(elementsToRemove, els))
  const onConnect = params => setElements(els => addEdge(params, els))
  const onLoad = reactFlowInstance => {
    window.rfi = reactFlowInstance
  }
  return (
    <div
      style={{
        height: 300,
        width: 1000,
        position: 'fixed',
        left: '0',
        top: '0',
      }}
    >
      <ReactFlow
        elements={elements}
        onElementsRemove={onElementsRemove}
        onConnect={onConnect}
        deleteKeyCode={46} /* 'delete'-key */
        onLoad={onLoad}
      />
    </div>
  )
}

export default Flow
