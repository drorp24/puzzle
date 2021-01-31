const undefinedKeyHandler = {
  get(target, property) {
    return target[property]
      ? target[property]
      : target['Undefined']
      ? target['Undefined']
      : undefined
  },
}

export const keyProxy = obj => new Proxy(obj, undefinedKeyHandler)
