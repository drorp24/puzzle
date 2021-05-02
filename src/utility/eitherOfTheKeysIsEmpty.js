const eitherOfTheKeysIsEmpty = obj =>
  !Object.values(obj).reduce((acc, value) => acc && value, true)

export default eitherOfTheKeysIsEmpty
