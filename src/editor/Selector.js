/** @jsxImportSource @emotion/react */
import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import entityTypes from './entityTypes'
import { useLocale, useLocaleDate, capitalize } from '../utility/appUtilities'

import { makeStyles } from '@material-ui/core/styles'
import SpeedDial from '@material-ui/core/SpeedDial'
import SpeedDialIcon from '@material-ui/core/SpeedDialIcon'
import SpeedDialAction from '@material-ui/core/SpeedDialAction'

export const emptyData = {
  user: null,
  subTypes: [],
  score: null,
  created: null,
}

const Selector = memo(({ uSelectorOpen, uSetSelectorOpen, uSetData }) => {
  const { placement } = useLocale()

  // SpeedDial requires mui's v4 makeStyles hook format to work properly
  const useStyles = makeStyles(theme => ({
    root: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingTop: '0.5rem',
      [`padding${capitalize(placement)}`]: '0.5rem',
    },
    speedDial: {},
    icon: {
      backgroundColor: 'black',
      color: 'white',
    },
  }))

  const classes = useStyles()

  const user = useSelector(store => store.users.loggedIn.username)
  const created = useLocaleDate(new Date())

  const handleOpen = () => {
    uSetSelectorOpen(true)
  }

  const handleClose = entityType => () => {
    if (entityType)
      uSetData({
        ...emptyData,
        entityType,
        user,
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
        icon={<SpeedDialIcon className={classes.icon} />}
        onClose={handleClose(null)}
        onOpen={handleOpen}
        open={uSelectorOpen}
        direction="down"
        FabProps={{ style: { backgroundColor: 'black' }, size: 'small' }}
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
