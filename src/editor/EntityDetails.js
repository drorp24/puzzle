/** @jsxImportSource @emotion/react */
import { useSelector, useDispatch } from 'react-redux'
import { selected, selectEntityById } from '../redux/content'
import { view } from '../redux/app'

import entityTypes from './entityTypes'
import useTheme from '../styling/useTheme'
import { useMode, useLocale, capitalize } from '../utility/appUtilities'

import { ThemeProvider, makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'
import AccountTreeIcon from '@material-ui/icons/AccountTree'
import RoomIcon from '@material-ui/icons/Room'
import TableIcon from '@material-ui/icons/TableChartOutlined'
import Divider from '@material-ui/core/Divider'
import Avatar from '@material-ui/core/Avatar'

export const EntityDetails = ({ entity: { type, data } }) => {
  const { tags: tagsShown } = useSelector(store => store.app.view)
  const { direction } = useMode()
  const { placement } = useLocale()
  const darkTheme = useTheme({ mode: 'dark', direction })
  const dispatch = useDispatch(0)

  const { icon, color } = entityTypes[type]
  const { id, subTypes } = data
  const { entityRanges } = useSelector(selectEntityById(id))
  const name = entityRanges[0]?.text

  // ToDo: pills' cancel icon ('x') will eventually enable to remove sub-types
  const handleDelete = () => {}

  const useStyles = makeStyles(darkTheme => ({
    icon: {
      color: 'rgba(0, 0, 0, 0.4)',
    },
    label: {
      color: 'rgba(0, 0, 0, 0.6)',
    },
    deleteIcon: {
      color: 'rgba(0, 0, 0, 0.4)',
    },
    title: {
      color: `${color} !important`,
      fontWeight: '500',
      textTransform: 'uppercase',
      fontStretch: 'extra-expanded',
    },
    content: {
      display: 'flex',
      flexDirection: 'column-reverse',
    },
    subheader: {
      color: 'white',
      fontSize: '1.5rem',
    },
    avatar: {
      margin: 0,
    },
  }))

  const classes = useStyles()

  const styles = {
    root: {
      backgroundColor: 'transparent !important',
      minWidth: '15rem',
    },
    entityType: {
      backgroundColor: `${color} !important`,
    },
    avatar: {
      backgroundColor: `${color} !important`,
      color: 'rgba(0, 0, 0, 0.6)',
      [`margin${capitalize(placement)}`]: '1rem',
    },
    details: {
      fontWeight: '100',
      fontSize: '0.8rem',
      textAlign: 'center',
    },
    divider: {
      backgroundColor: `${color} !important`,
    },
    subTypes: {
      padding: '1rem',
      '& > div': {
        margin: '0 0.5rem',
        direction,
      },
    },
    explainer: {
      height: '8rem',
      backgroundColor: 'rgba(256, 256, 256, 0.1)',
      marginTop: '1rem',
    },
    modeColor: {
      color: darkTheme.palette.text.distinct,
    },
    dividerSplitLine: {
      color: '#bdbdbd',
      '&::before, &::after': {
        borderColor: '#bdbdbd !important',
      },
    },
  }

  const showRelationsOf = id => () => {
    dispatch(selected(id))
    dispatch(view({ exclusiveRelations: true }))
  }

  const markSelected = id => () => {
    dispatch(selected(id))
  }

  const { title, content, subheader, avatar } = classes

  return (
    <ThemeProvider theme={darkTheme}>
      <Card elevation={0} css={styles.root}>
        <CardHeader
          avatar={<Avatar css={styles.avatar}>{icon}</Avatar>}
          title={type}
          subheader={name}
          classes={{ title, content, subheader, avatar }}
        />
        <Divider css={styles.divider} />
        <div css={styles.subTypes}>
          {subTypes &&
            subTypes.map(
              subType =>
                subType && (
                  <Chip
                    size="small"
                    label={subType}
                    css={styles.entityType}
                    onDelete={handleDelete}
                    key={subType}
                    classes={{
                      icon: classes.icon,
                      label: classes.label,
                      deleteIcon: classes.deleteIcon,
                    }}
                  />
                )
            )}
        </div>
        <CardContent>
          <Divider css={{ ...styles.modeColor, ...styles.dividerSplitLine }}>
            Explainer
          </Divider>
          <div css={styles.explainer}></div>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton onClick={showRelationsOf(id)} disabled={!tagsShown}>
            <AccountTreeIcon css={styles.modeColor} />
          </IconButton>
          <IconButton onClick={markSelected(id)}>
            <RoomIcon css={styles.modeColor} />
          </IconButton>
          <IconButton>
            <TableIcon css={styles.modeColor} />
          </IconButton>
        </CardActions>
      </Card>
    </ThemeProvider>
  )
}
