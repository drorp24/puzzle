/** @jsxImportSource @emotion/react */
import { useSelector } from 'react-redux'

import entityTypes from './entityTypes'
import useTheme from '../styling/useTheme'
import {
  directionByLocale,
  otherMode,
  useLocalDate,
} from '../utility/appUtilities'

import { ThemeProvider, makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import AccountTreeIcon from '@material-ui/icons/AccountTree'
import RoomIcon from '@material-ui/icons/Room'
import InfoIcon from '@material-ui/icons/Info'
import Divider from '@material-ui/core/Divider'

export const EntityDetails = ({ entity }) => {
  const { mode, locale } = useSelector(store => store.app)
  const direction = directionByLocale(locale)
  const inverseMode = otherMode(mode)
  const theme = useTheme({ mode: inverseMode, direction })

  const { name, icon, color } = entityTypes[entity.type]
  const { userData, created } = entity.data
  const { user, comment } = userData || {}

  const handleDelete = () => {}

  const useStyles = makeStyles(theme => ({
    icon: {
      color: 'rgba(0, 0, 0, 0.4)',
    },
    label: {
      color: 'rgba(0, 0, 0, 0.5)',
    },
    deleteIcon: {
      color: 'rgba(0, 0, 0, 0.4)',
    },
  }))

  const classes = useStyles()

  const styles = {
    root: {
      backgroundColor: 'transparent !important',
    },

    entityType: {
      backgroundColor: `${color} !important`,
    },
    details: {
      fontWeight: '100',
      fontSize: '0.8rem',
      textAlign: 'center',
    },
  }

  return (
    <ThemeProvider theme={theme}>
      <Card elevation={0} css={styles.root}>
        <CardHeader
          // avatar={<Avatar css={styles.avatar}>{icon}</Avatar>}
          title={
            <Chip
              icon={icon}
              size="small"
              label={name}
              css={styles.entityType}
              onDelete={handleDelete}
              classes={{
                icon: classes.icon,
                label: classes.label,
                deleteIcon: classes.deleteIcon,
              }}
            />
          }
          subheader={useLocalDate(created)}
        />
        <Divider />
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            {comment || 'No information recorded'}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {user || 'No user recorded'}
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton>
            <AccountTreeIcon />
          </IconButton>
          <IconButton>
            <RoomIcon />
          </IconButton>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </CardActions>
      </Card>
    </ThemeProvider>
  )
}
