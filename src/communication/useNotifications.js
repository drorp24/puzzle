import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const useNotifications = setOpen => {
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('')

  const userError = useSelector(store => store.users.error)
  const contentError = useSelector(store => store.content.error)

  useEffect(() => {
    if (userError) {
      setOpen(true)
      setMessage(userError || 'Something went wrong')
      setSeverity('error')
    }
    if (contentError) {
      setOpen(true)
      setMessage(contentError || 'Something went wrong')
      setSeverity('error')
    }
  }, [setOpen, userError, contentError])

  return { message, severity }
}

export default useNotifications
