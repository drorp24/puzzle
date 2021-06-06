/** @jsxImportSource @emotion/react */
import { useState, useRef } from 'react'

import { useLocale, useMode } from '../utility/appUtilities'
import entityTypes from '../editor/entityTypes'
import noScrollbar from '../styling/noScrollbar'
import { atScrollBottom } from '../utility/scrollPositions'

import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Divider from '@material-ui/core/Divider'
import Avatar from '@material-ui/core/Avatar'
import grey from '@material-ui/core/colors/grey'

const Row = ({ a, b }) => {
  const styles = {
    row: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  }
  return (
    <div css={styles.row}>
      <span>{a}</span>
      <span>{b}</span>
    </div>
  )
}

const FeatureDetails = ({ details = {}, entityType }) => {
  const { direction } = useLocale()
  const { light } = useMode()
  const { icon, color } = entityTypes[entityType]

  const styles = {
    container: {
      direction,
      maxHeight: '35vh',
      overflow: 'scroll',
      ...noScrollbar,
    },
    avatar: {
      backgroundColor: `${color} !important`,
      color: '#fff',
    },
    header: {
      position: 'absolute',
      top: 0,
      width: '100%',
      height: '5rem',
      backgroundColor: light ? grey[400] : grey[900],
      borderRadius: '5px',
      zIndex: 1,
      marginTop: '-0.5rem',
      '& + div': {
        marginTop: '5rem',
      },
    },
    divider: {
      '&::before': {
        zIndex: '-1',
      },
      '&::after': {
        zIndex: '-1',
      },
    },
    more: {
      position: 'fixed',
      bottom: '1rem',
      width: '100%',
      marginRight: '-1rem',
      fontSize: '1rem',
      textAlign: 'center',
      color,
      direction: 'ltr', // temporary
    },
  }

  const [bottom, setBottom] = useState()
  const ref = useRef()
  const handleScroll = () => {
    if (!ref.current) return
    setBottom(atScrollBottom(ref.current))
  }

  return (
    <div css={styles.container} onScroll={handleScroll} ref={ref}>
      <Card elevation={0}>
        <CardHeader
          title="Title"
          subheader="Subtitle"
          avatar={<Avatar css={styles.avatar}>{icon}</Avatar>}
          css={styles.header}
        ></CardHeader>
        <CardContent>
          {[1, 2, 3].map(n => (
            <Row key={n} b={`named field ${n}`} a={`value ${n}`} />
          ))}
        </CardContent>
        <Divider>Key Value</Divider>
        <CardContent>
          {Object.entries(details).map(([a, b]) => (
            <Row key={a} {...{ a: b, b: a }} />
          ))}
        </CardContent>
        {!bottom && <div css={styles.more}>more...</div>}
      </Card>
    </div>
  )
}

export default FeatureDetails
