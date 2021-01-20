import React, { memo } from 'react'
import { useSelector } from 'react-redux'

import entityTypes, { selectedEntityTypes } from './entityTypes'

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
  comment: null,
}

const MySpeedDial = memo(({ sdOpen, uSetSdOpen, uSetUserData }) => {
  const classes = useStyles()
  const user = useSelector(store => store.users.loggedIn.username)

  const handleOpen = () => {
    uSetSdOpen(true)
  }

  const comment = 'Some entity information'

  const handleClose = entityType => () => {
    if (entityType)
      uSetUserData({
        user,
        entityType,
        comment,
      })
    uSetSdOpen(false)
  }

  return (
    <div className={classes.root}>
      <SpeedDial
        ariaLabel="SpeedDial uncontrolled open example"
        className={classes.speedDial}
        icon={<SpeedDialIcon />}
        onClose={handleClose(null)}
        onOpen={handleOpen}
        open={sdOpen}
        direction="down"
      >
        {selectedEntityTypes.map(entityType => (
          <SpeedDialAction
            key={entityType}
            icon={entityTypes[entityType].icon}
            tooltipTitle={entityType}
            onClick={handleClose(entityType)}
          />
        ))}
      </SpeedDial>
    </div>
  )
})

export default MySpeedDial
