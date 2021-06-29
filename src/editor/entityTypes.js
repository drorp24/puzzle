import { useMemo } from 'react'
import { keyProxy } from '../utility/proxies'

import PersonIcon from '@material-ui/icons/PermIdentityOutlined'
import LocationIcon from '@material-ui/icons/HomeOutlined'
import TimeIcon from '@material-ui/icons/AccessTimeOutlined'
import DeviceIcon from '@material-ui/icons/DevicesOtherOutlined'
import NotListedIcon from '@material-ui/icons/HelpOutlined'
import OrganizationIcon from '@material-ui/icons/GroupsOutlined'

export const useColor = relationType =>
  useMemo(
    () => entityTypes[relationTypes[relationType].entity].color,
    [relationType]
  )

export const relationTypes = keyProxy({
  son: {
    entity: 'PERSON',
  },
  brother: {
    entity: 'PERSON',
  },
  girlfriend: {
    entity: 'PERSON',
  },
  in: {
    entity: 'LOCATION',
  },
  near: {
    entity: 'LOCATION',
  },
  uses: {
    entity: 'LOCATION',
  },
  UNDEFINED: {
    entity: 'UNDEFINED',
  },
})

const entityTypes = keyProxy({
  PERSON: {
    name: 'PERSON',
    mutability: 'IMMUTABLE',
    icon: <PersonIcon />,
    selector: true,
    color: 'orange',
  },
  LOCATION: {
    name: 'LOCATION',
    mutability: 'IMMUTABLE',
    icon: <LocationIcon />,
    selector: true,
    color: 'coral',
  },
  ORGANIZATION: {
    name: 'ORGANIZATION',
    mutability: 'IMMUTABLE',
    icon: <OrganizationIcon />,
    selector: true,
    color: 'springgreen',
  },
  TIME: {
    name: 'TIME',
    mutability: 'IMMUTABLE',
    icon: <TimeIcon />,
    selector: false,
    color: 'aquamarine',
  },
  DEVICE: {
    name: 'DEVICE',
    mutability: 'IMMUTABLE',
    icon: <DeviceIcon />,
    selector: true,
    color: 'deepskyblue',
  },
  MENTION: {
    name: 'MENTION',
    mutability: 'IMMUTABLE',
    selector: false,
    color: 'lightgreen',
  },
  HASHTAG: {
    name: 'HASHTAG',
    mutability: 'IMMUTABLE',
    selector: false,
    color: 'pink',
  },
  UNDEFINED: {
    name: 'Not listed',
    mutability: 'IMMUTABLE',
    icon: <NotListedIcon />,
    selector: false,
    color: '#76ff03',
  },
})

export const levelIconWithText = { x: -0.05, y: 0.285 }

// ! node & text styling
// Since they overlap, both draft.js spans and react-flow's nodes use identical styling rules
// - type: entity type
// - role: 'text' (draft) or 'node' (flow)
// - element: 'node' (react-flow's entire node element) or 'span' (react-flow's text span element)
// - mode: 'light' or 'dark' (currently not in use)
// - id: left for debugging purposes
export const entityStyle = ({ type, role, element, mode, id, isSelected }) => ({
  backgroundColor: isSelected ? 'gray' : element === 'span' ? 'none' : entityTypes[type].color,
  borderRadius: '1rem',
  display: 'inline-flex',
  flexDirection: role === 'text' ? 'row-reverse' : 'row',
  justifyContent: 'center',
  padding: '0 0.5rem',
  alignItems: 'center',
  cursor:'pointer',
  lineHeight: '1',
  ...(role === 'text' && {
    transform: entityTypes[type].icon
      ? `translate(${levelIconWithText.x}rem, ${levelIconWithText.y}rem)`
      : '(0,0)',
  }),
})
export const entityIconStyle = ({ type, role, mode = 'light' }) => ({
  display: 'inline-flex',
  color: 'white',
  '& svg': {
    fontSize: '1.2rem',
  },
})
export const entityTextStyle = ({
  type,
  role,
  mode = 'light',
  capitalPlacement,
  capitalAntiPlacement,
}) => ({
  [`margin${capitalPlacement || capitalAntiPlacement}`]: '0.4rem',
  color: mode === 'light' ? 'black' : 'white',
})
export default entityTypes
