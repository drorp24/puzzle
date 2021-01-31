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
  return date
    ? new Intl.DateTimeFormat(locale, dateTimeOptions).format(date)
    : 'no date recorded'
}
