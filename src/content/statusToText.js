const statusToText = status => {
  switch (status) {
    case 200:
      return '' // safeguard only; this function is invoked upon error only
    case 401:
      return 'noAuth'
    case 403:
      return 'tokenExpired'
    case 404:
      return 'noSuchFile'
    case 999:
      return 'hardFailure'
    default:
      return 'contentError'
  }
}

export default statusToText
