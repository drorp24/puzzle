import Person from '@material-ui/icons/Person'
import LocationCity from '@material-ui/icons/LocationCity'
import AccessTime from '@material-ui/icons/AccessTime'
import Phone from '@material-ui/icons/Phone'

export const validEntityTypes = [
  'PERSON',
  'PLACE',
  'OTHER',
  'ANOTHER',
  'MENTION',
  'HASHTAG',
]

export const selectedEntityTypes = ['PERSON', 'PLACE', 'OTHER', 'ANOTHER']

const entityTypes = {
  PERSON: {
    name: 'Person',
    mutability: 'IMMUTABLE',
    icon: <Person />,
    color: 'orange',
    style: {
      backgroundColor: 'orange',
    },
  },
  PLACE: {
    name: 'Place',
    mutability: 'IMMUTABLE',
    icon: <LocationCity />,
    color: 'deepskyblue',
    style: {
      backgroundColor: 'deepskyblue',
    },
  },
  OTHER: {
    name: 'Mention',
    mutability: 'IMMUTABLE',
    icon: <AccessTime />,
    color: 'aquamarine',
    style: {
      backgroundColor: 'aquamarine',
    },
  },
  ANOTHER: {
    name: 'Hashtag',
    mutability: 'IMMUTABLE',
    icon: <Phone />,
    color: 'coral',
    style: {
      backgroundColor: 'coral',
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
