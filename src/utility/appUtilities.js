import { useSelector } from 'react-redux'

export const directionByLocale = locale => (locale === 'he' ? 'rtl' : 'ltr')
export const otherMode = mode => (mode === 'light' ? 'dark' : 'light')

const dateTimeOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
}

export const useLocalDate = date => {
  const { locale } = useSelector(store => store.app)
  return /* date */ false // ToDo: fix. Throws for newly created entities.
    ? new Intl.DateTimeFormat(locale, dateTimeOptions).format(date)
    : 'no date recorded'
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
