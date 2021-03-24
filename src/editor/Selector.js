/** @jsxImportSource @emotion/react */
import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import entityTypes from './entityTypes'
import { useLocale, useLocaleDate, capitalize } from '../utility/appUtilities'

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

  const styles = {
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
    },
  }

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
    <div css={styles.root}>
      <SpeedDial
        ariaLabel="SpeedDial uncontrolled open example"
        css={styles.speedDial}
        icon={<SpeedDialIcon />}
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
