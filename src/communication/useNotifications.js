/* eslint-disable no-undef */
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { notified as contentErrorNotified } from '../redux/content'
import { notified as feedbackErrorNotified } from '../redux/feedback'
import { notified as usersErrorNotified } from '../redux/users'

import useTranslation from '../i18n/useTranslation'
import statusToText from '../content/statusToText'

const useNotifications = setOpen => {
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('')
  const t = useTranslation()
  const dispatch = useDispatch()

  // ToDo: That should be the standard
  // If expression is truthy then there is an error and the value can be fed into statusToText.
  // contentError should be amended accordingly:
  // currently, if there's hard failure (e.g., n/w fault) with no status then no message is shown.
  const userError = useSelector(
    store =>
      store.users.error &&
      !store.users.error?.notified &&
      (store.users.error.status || 999)
  )

  const contentError = useSelector(
    store =>
      store.content.error?.status &&
      !store.content.error?.notified &&
      store.content.error.status !== 404 && // wrong file input does not warrant a snackbar msg
      store.content.error?.status
  )
  const feedbackError = useSelector(
    store => store.feedback.error && !store.feedback.error?.notified
  )
  const feedbackIssue = feedbackError?.issue

  useEffect(() => {
    if (userError) {
      setOpen(true)
      setMessage(t(statusToText(userError)))
      setSeverity('error')
      dispatch(usersErrorNotified())
    }

    if (contentError) {
      setOpen(true)
      setMessage(t(statusToText(contentError)))
      setSeverity('error')
      dispatch(contentErrorNotified())
    }

    if (feedbackError) {
      setOpen(true)
      setMessage(
        feedbackIssue === 'Missing data' ? t('missingData') : t('feedbackError')
      )
      setSeverity('error')
      dispatch(feedbackErrorNotified())
    }
  }, [
    setOpen,
    userError,
    contentError,
    feedbackError,
    feedbackIssue,
    t,
    dispatch,
  ])

  return { message, severity }
}

export default useNotifications
