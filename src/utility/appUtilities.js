import { useSelector } from 'react-redux'

// ! use these custom hooks, do not destructure
// destructuring any { key } out of store.app will make the component re-render
// every time *any* value in store.app changes

export const useMode = () => {
  const mode = useSelector(store => store.app.mode)
  const otherMode = mode === 'light' ? 'dark' : 'light'
  const light = mode === 'light'
  return { mode, otherMode, light }
}

// deprecated
export const useDirection = () => {
  const locale = useSelector(store => store.app.locale)
  return locale === 'he' ? 'rtl' : 'ltr'
}

// use this intead
export const useLocale = () => {
  const locale = useSelector(store => store.app.locale)
  const direction = locale === 'he' ? 'rtl' : 'ltr'
  const rtl = direction === 'rtl'
  const ltr = direction === 'ltr'
  const placement = rtl ? 'left' : 'right'
  const antiPlacement = rtl ? 'right' : 'left'
  const capitalPlacement = capitalize(placement)
  const capitalAntiPlacement = capitalize(antiPlacement)
  return {
    locale,
    direction,
    rtl,
    ltr,
    placement,
    antiPlacement,
    capitalPlacement,
    capitalAntiPlacement,
  }
}

const dateOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}

// const dateTimeOptions = {
//   ...dateOptions,
//   hour: 'numeric',
//   minute: 'numeric',
//   hour12: true,
// }

export const useLocaleDate = date => {
  const locale = useSelector(store => store.app.locale)
  const dateFormat = new Date(date)

  return dateFormat.toLocaleDateString(locale, dateOptions)
}

export const capitalize = s => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const humanize = s => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace(/_/g, ' ')
}

// assumption: element is smaller than box
export const inside = (box, element) => {
  if (!Object.values(element).length) return false

  const elementX1 = element.x + element.width
  const elementY1 = element.y + element.height
  const boxX1 = box.x + box.width
  const boxY1 = box.y + box.height

  const result =
    ((elementX1 < boxX1 && elementX1 > box.x) ||
      (element.x < boxX1 && element.x > box.x)) &&
    ((elementY1 < boxY1 && elementY1 > box.y) ||
      (element.y < boxY1 && element.y > box.y))

  return result
}
