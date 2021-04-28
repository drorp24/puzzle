import { useEffect, useRef } from 'react'

const useMouse = () => {
  const displacementRef = useRef()

  const firstTooltip = document.querySelector('g.react-flow__edge g')
  useEffect(() => {
    if (!firstTooltip) return

    // ToDo: wrap with try / catch
    const calcDisplacement = () => {
      if (typeof displacementRef.current?.disX !== 'undefined') return

      const transform = firstTooltip.getAttribute('transform')
      if (!transform) return { disX: undefined, disY: undefined }

      const [transformX, transformY] = transform
        .split('translate')
        .pop()
        .split('(')
        .pop()
        .split(')')[0]
        .split(' ')

      const { x, y } = firstTooltip.getBoundingClientRect()

      const [disX, disY] = [x - transformX, y - transformY]

      return { disX, disY }
    }

    const { disX, disY } = calcDisplacement()
    displacementRef.current = { disX, disY }

    function highlightTooltip({ target, clientX, clientY }) {
      const edge = target.closest('g.react-flow__edge')
      if (!edge) return

      const path = edge.querySelector('path')
      const tooltip = edge.querySelector('g')
      const rect = tooltip.querySelector('rect')
      const text = tooltip.querySelector('text')

      const tX = clientX - disX
      const tY = clientY - disY
      tooltip.style.transform = `translate(${tX}px, ${tY}px)`

      // ToDo: make a general function
      if (!path.getAttribute('data-stroke'))
        path.setAttribute('data-stroke', path.style.stroke)
      path.style.stroke = 'purple'

      if (!path.getAttribute('data-stroke-width'))
        path.setAttribute('data-stroke-width', path.style.strokeWidth)
      path.style.strokeWidth = 5

      if (!rect.getAttribute('data-fill'))
        rect.setAttribute('data-fill', rect.style.fill)
      rect.style.fill = 'purple'

      if (!text.getAttribute('data-fill'))
        text.setAttribute('data-fill', text.style.fill)
      text.style.fill = 'white'
    }

    function unHighlightTooltip({ target, clientX, clientY }) {
      const edge = target.closest('g.react-flow__edge')
      if (!edge) return

      const path = edge.querySelector('path')
      const tooltip = edge.querySelector('g')
      const rect = tooltip.querySelector('rect')
      const text = tooltip.querySelector('text')

      path.style.stroke = path.getAttribute('data-stroke')
      path.style.strokeWidth = path.getAttribute('data-stroke-width')
      rect.style.fill = rect.getAttribute('data-fill')
      text.style.fill = text.getAttribute('data-fill')
    }

    const edgeEls = document.querySelectorAll('g.react-flow__edge')
    edgeEls.forEach(edgeEl => {
      edgeEl.addEventListener('mousemove', highlightTooltip)
      edgeEl.addEventListener('mouseleave', unHighlightTooltip)
    })
  }, [firstTooltip])
}

export default useMouse
