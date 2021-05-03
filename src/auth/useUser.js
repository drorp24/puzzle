import { useSelector } from 'react-redux'

const useUser = () => {
  const username = useSelector(store => store.users.loggedIn?.username)
  return { username }
}

export default useUser
