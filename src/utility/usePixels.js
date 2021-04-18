import { useMemo } from 'react'
import _memoize from 'lodash/memoize'

const usePixels = rem =>
  useMemo(
    () => rem * parseFloat(getComputedStyle(document.documentElement).fontSize),
    [rem]
  )

export const calcPixels = rem =>
  _memoize(
    () => rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
  )

window.calcPixels = calcPixels

export default usePixels
