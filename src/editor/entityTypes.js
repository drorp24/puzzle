export const validEntityTypes = [
  'PERSON',
  'PLACE',
  'MENTION',
  'HASHTAG',
  'OTHER',
  'ANOTHER',
]

const entityTypes = {
  PERSON: {
    name: 'Person',
    mutability: 'IMMUTABLE',
    style: {
      backgroundColor: 'orange',
    },
  },
  PLACE: {
    name: 'Place',
    mutability: 'IMMUTABLE',
    style: {
      backgroundColor: 'deepskyblue',
    },
  },
  MENTION: {
    name: 'Mention',
    mutability: 'IMMUTABLE',
    style: {
      backgroundColor: 'lightgreen',
    },
  },
  HASHTAG: {
    name: 'Hashtag',
    mutability: 'IMMUTABLE',
    style: {
      backgroundColor: 'pink',
    },
  },
  OTHER: {
    name: 'Hashtag',
    mutability: 'IMMUTABLE',
    style: {
      backgroundColor: 'yellow',
    },
  },
  ANOTHER: {
    name: 'Hashtag',
    mutability: 'IMMUTABLE',
    style: {
      backgroundColor: 'brown',
    },
  },
  UNDEFINED: {
    name: 'Undefined',
    mutability: 'IMMUTABLE',
    style: {
      backgroundColor: 'lightgrey',
    },
  },
}

const handler = {
  get(target, property) {
    return validEntityTypes.includes(property)
      ? target[property]
      : target['UNDEFINED']
  },
}

export default new Proxy(entityTypes, handler)
