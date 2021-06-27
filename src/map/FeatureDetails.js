/** @jsxImportSource @emotion/react */
// import { useRef } from 'react'

// import { useLocale, useMode } from '../utility/appUtilities'
import noScrollbar from '../styling/noScrollbar'

import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Divider from '@material-ui/core/Divider'
import grey from '@material-ui/core/colors/grey'
const Row = ({ a, b }) => {  
  const styles = {
    row: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      direction: 'rtl',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  }
  return (
    <div css={styles.row}>
      <span>{a}</span>
      <span style={{width:'30px'}}></span>
      <span>{b}</span>
    </div>
  )
}

const FeatureDetails = ({ properties: {details, headers, place_type, text} }) => {
  // const { direction } = useLocale()
  // const { light } = useMode()

  const styles = {
    container: {
      width:'100%',
      direction: 'rtl',
      maxHeight: '35vh',
      overflow: 'scroll',
      ...noScrollbar,
    },
    header: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      // position: 'absolute',
      direction: 'rtl',
      top: 0,
      width: '100%',
      height: '5rem',
      backgroundColor: grey[400],
      borderRadius: '5px',
      zIndex: 1,
      // marginTop: '-0.5rem',
      // '& + div': {
      //   marginTop: '5rem',
      // },
    },
    content:{
      width: '100%',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }
  }
  
  
  const normedHeaders = {...headers, place_type}   
  return (
    <div css={styles.container} >
      <Card elevation={0}>
        <CardHeader          
          title={text}
          css={styles.header}
        ></CardHeader>
        <CardContent css={styles.content}>
          {Object.keys(normedHeaders).map(key => (
            <Row key={key} b={key} a={normedHeaders[key]} />
          ))}
        </CardContent>
        <Divider/>
        <CardContent css={styles.content}>
          {Object.entries(details).map(([a, b]) => (
            <Row key={a} {...{ a: b, b: a }} />
          ))}
        </CardContent>       
      </Card>
    </div>
  )
}

export default FeatureDetails
