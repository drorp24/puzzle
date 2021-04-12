import { useCallback } from 'react'
import { useIntl } from 'react-intl'

// If it wasn't for the useCallback, t would return a different reference with each call.
// This is usually not a problem, unless both of the following conditions occur:
// - 't' is called inside a useEffect (hence included in its dependency array)
// - a state is set in that useEffect that triggers the containing component to re-render
// While one of the depdencies protects the useEffect from being run again, it is the 't' that gets a new references
// every rerender, creating an endless loop
const useTranslation = () => {
  const intl = useIntl()
  const t = useCallback(phrase => intl.formatMessage({ id: phrase }), [intl])
  return t
}

export default useTranslation
