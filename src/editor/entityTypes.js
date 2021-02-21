import { useMemo } from 'react'
import { keyProxy } from '../utility/proxies'

import PersonIcon from '@material-ui/icons/PermIdentityOutlined'
import PlaceIcon from '@material-ui/icons/PlaceOutlined'
import TimeIcon from '@material-ui/icons/AccessTimeOutlined'
import DeviceIcon from '@material-ui/icons/PhoneOutlined'
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
    icon: <PersonIcon />,
    selector: true,
    color: 'orange',
  },
  Place: {
    name: 'Place',
    mutability: 'IMMUTABLE',
    icon: <PlaceIcon />,
    selector: true,
    color: 'deepskyblue',
  },
  Time: {
    name: 'Time',
    mutability: 'IMMUTABLE',
    icon: <TimeIcon />,
    selector: false,
    color: 'aquamarine',
  },
  Device: {
    name: 'Device',
    mutability: 'IMMUTABLE',
    icon: <DeviceIcon />,
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

export const entityStyle = ({ type, role }) => ({
  backgroundColor: role === 'text' ? entityTypes[type].color : 'none',
  border: role === 'text' ? 'none' : `1px solid ${entityTypes[type].color}`,
  borderRadius: '1rem',
  display: 'inline-flex',
  justifyContent: 'center',
  padding: '0.1rem 0.5rem',
  alignItems: 'center',
  ...(role === 'text' && {
    transform: `translateY(${entityTypes[type].icon ? '0.4rem' : '0'}`,
  }),
  whiteSpace: 'nowrap',
})
export const entityIconStyle = ({ type, role }) => ({
  display: 'inline-flex',
  marginRight: '0.25rem',
  fontSize: '1rem',
  color: 'rgba(0, 0, 0, 0.6)',
})

export default entityTypes
