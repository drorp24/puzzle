/* eslint-disable no-undef */
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import useTranslation from '../i18n/useTranslation'

const useNotifications = setOpen => {
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('')
  const t = useTranslation()

  const userError = useSelector(store => store.users.error)
  const contentError = useSelector(
    store => store.content.error?.status && store.content.error.status !== 404
  )
  const feedbackError = useSelector(store => store.feedback.error)

  useEffect(() => {
    if (userError) {
      setOpen(true)
      setMessage(t('userError'))
      setSeverity('error')
    }

    if (contentError) {
      setOpen(true)
      setMessage(t('contentError'))
      setSeverity('error')
    }

    if (feedbackError) {
      setOpen(true)
      setMessage(t('feedbackError'))
      setSeverity('error')
    }
  }, [setOpen, userError, contentError, feedbackError, t])

  return { message, severity }
}

export default useNotifications
