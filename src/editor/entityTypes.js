import { useMemo } from 'react'
import { keyProxy } from '../utility/proxies'

import Person from '@material-ui/icons/Person'
import LocationCity from '@material-ui/icons/LocationCity'
import AccessTime from '@material-ui/icons/WatchLater'
import Phone from '@material-ui/icons/Phone'
import NotListedIcon from '@material-ui/icons/HelpOutlined'

export const useColor = relationType =>
  useMemo(() => entityTypes[relationTypes[relationType].entity].color, [
    relationType,
  ])

export const relationTypes = keyProxy({
  son: {
    entity: 'Person',
  },
  brother: {
    entity: 'Person',
  },
  girlfriend: {
    entity: 'Person',
  },
  in: {
    entity: 'Place',
  },
  near: {
    entity: 'Place',
  },
  uses: {
    entity: 'Place',
  },
  Undefined: {
    entity: 'Undefined',
  },
})

const entityTypes = keyProxy({
  Person: {
    name: 'Person',
    mutability: 'IMMUTABLE',
    icon: <Person />,
    selector: true,
    color: 'orange',
  },
  Place: {
    name: 'Place',
    mutability: 'IMMUTABLE',
    icon: <LocationCity />,
    selector: true,
    color: 'deepskyblue',
  },
  Time: {
    name: 'Time',
    mutability: 'IMMUTABLE',
    icon: <AccessTime />,
    selector: true,
    color: 'aquamarine',
  },
  Device: {
    name: 'Device',
    mutability: 'IMMUTABLE',
    icon: <Phone />,
    selector: true,
    color: 'coral',
  },
  Mention: {
    name: 'Mention',
    mutability: 'IMMUTABLE',
    selector: false,
    color: 'lightgreen',
  },
  Hashtag: {
    name: 'Hashtag',
    mutability: 'IMMUTABLE',
    selector: false,
    color: 'pink',
  },
  Undefined: {
    name: 'Not listed',
    mutability: 'IMMUTABLE',
    icon: <NotListedIcon />,
    selector: false,
    color: 'rgba(0, 0, 0, 0.5)',
  },
})

export const entityStyle = entityType => ({
  backgroundColor: entityTypes[entityType].color,
  borderRadius: '1rem',
  // padding: '0.1rem 0.5rem',
  display: 'inline-flex',
  alignItems: 'center',
  // position: entityTypes[entityType].icon ? 'relative' : 'static',
  top: '0.2rem',
  left: '0',
})
export const entityIconStyle = entityType => ({
  marginRight: '0.25rem',
  fontSize: '1.25rem',
  color: 'rgba(0, 0, 0, 0.5)',
})

export default entityTypes
