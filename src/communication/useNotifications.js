import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const useNotifications = setOpen => {
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('')

  const { error } = useSelector(store => store.users)

  useEffect(() => {
    if (error) {
      setOpen(true)
      setMessage(error || 'Something went wrong')
      setSeverity('error')
    }
  }, [error, setOpen])

  return { message, severity }
}

export default useNotifications
