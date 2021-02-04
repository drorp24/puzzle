import React, { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import entityTypes from './entityTypes'
import { useLocalDate } from '../utility/appUtilities'

import { makeStyles } from '@material-ui/core/styles'
import SpeedDial from '@material-ui/core/SpeedDial'
import SpeedDialIcon from '@material-ui/core/SpeedDialIcon'
import SpeedDialAction from '@material-ui/core/SpeedDialAction'

const useStyles = makeStyles(theme => ({
  root: {
    height: 320,
    transform: 'translateZ(0px)',
  },
  speedDial: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}))

// only this component should control the structure of userData
export const emptyUserData = {
  user: null,
  entityType: null,
  entitySubTypes: [],
  score: null,
  created: null,
}

const Selector = memo(({ uSelectorOpen, uSetSelectorOpen, uSetUserData }) => {
  const classes = useStyles()

  const user = useSelector(store => store.users.loggedIn.username)
  const created = useLocalDate(new Date())

  const handleOpen = () => {
    uSetSelectorOpen(true)
  }

  const handleClose = entityType => () => {
    if (entityType)
      uSetUserData({
        ...emptyUserData,
        user,
        entityType,
        created,
      })

    uSetSelectorOpen(false)
  }

  const selectedTypes = useMemo(
    () => Object.values(entityTypes).filter(t => t.selector),
    []
  )

  return (
    <div className={classes.root}>
      <SpeedDial
        ariaLabel="SpeedDial uncontrolled open example"
        className={classes.speedDial}
        icon={<SpeedDialIcon />}
        onClose={handleClose(null)}
        onOpen={handleOpen}
        open={uSelectorOpen}
        direction="down"
      >
        {selectedTypes.map(({ name, icon }) => (
          <SpeedDialAction
            key={name}
            icon={icon}
            tooltipTitle={name}
            onClick={handleClose(name)}
          />
        ))}
      </SpeedDial>
    </div>
  )
})

export default Selector
