/* eslint-disable no-undef */
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import useTranslation from '../i18n/useTranslation'
import statusToText from '../content/statusToText'

const useNotifications = setOpen => {
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('')
  const t = useTranslation()

  // ToDo: That should be the standard
  // If expression is truthy then there is an error and the value can be fed into statusToText.
  // contentError should be amended accordingly:
  // currently, if there's hard failure (e.g., n/w fault) with no status then no message is shown.
  const userError = useSelector(
    store => store.users.error && (store.users.error.status || 999)
  )

  const contentError = useSelector(
    store =>
      store.content.error?.status &&
      store.content.error.status !== 404 && // wrong file input does not warrant a snackbar msg
      store.content.error?.status
  )
  const feedbackError = useSelector(store => store.feedback.error)
  const feedbackIssue = feedbackError?.issue

  useEffect(() => {
    if (userError) {
      setOpen(true)
      setMessage(t(statusToText(userError)))
      setSeverity('error')
    }

    if (contentError) {
      setOpen(true)
      setMessage(t(statusToText(contentError)))
      setSeverity('error')
    }

    if (feedbackError) {
      setOpen(true)
      setMessage(
        feedbackIssue === 'Missing data' ? t('missingData') : t('feedbackError')
      )
      setSeverity('error')
    }
  }, [setOpen, userError, contentError, feedbackError, t, feedbackIssue])

  return { message, severity }
}

export default useNotifications
