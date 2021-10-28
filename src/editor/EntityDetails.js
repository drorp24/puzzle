/** @jsxImportSource @emotion/react */
import { useSelector } from 'react-redux'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { selectEntityById } from '../redux/content'

import entityTypes from './entityTypes'
import useTheme from '../styling/useTheme'
import { useMode, useLocale, capitalize } from '../utility/appUtilities'
import useTranslation from '../i18n/useTranslation'
import noScrollbar from '../styling/noScrollbar'

import { ThemeProvider, makeStyles } from '@material-ui/core/styles'
import Divider from '@material-ui/core/Divider'

export const EntityDetails = ({ entity: { type, data }, entity_location_id }) => {  
  const { direction } = useMode()
  const { placement } = useLocale()
  const darkTheme = useTheme({ mode: 'dark', direction })  
  const t = useTranslation()

  const { color } = entityTypes[type]
  const { id } = data
  // 'entity' argument is only what draft.js holds for the entity. For the rest, redux should be called.
  const {
    data: { geoLocations },    
  } = useSelector(selectEntityById(id))
  const geoLocation = geoLocations[entity_location_id]
  const locationExists = geoLocation?.geometry?.coordinates?.length  
  const explanation = geoLocation?.properties?.explain 

  const styles = {
    root: {      
      backgroundColor: 'transparent !important',
    },            
    explainer: {
      width: '12rem',
      height: '8rem',
      padding: '0.5rem',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(256, 256, 256, 0.5)',
      borderRadius: '3px',
      marginTop: '1rem',
      overflow: 'scroll',
      ...noScrollbar,
      color: 'white',
    },
    modeColor: {
      color: darkTheme.palette.text.distinct,
    },
    locationIcon: {
      color: locationExists
        ? darkTheme.palette.text.distinct
        : darkTheme.palette.action.disabledBackground,
    },
    dividerSplitLine: {
      color: '#bdbdbd',
      '&::before, &::after': {
        borderColor: '#bdbdbd !important',
      },
    },
  }


  return (
    <ThemeProvider theme={darkTheme}>
      <Card elevation={0} css={styles.root}>
        <CardContent>
          <Divider css={{ ...styles.modeColor, ...styles.dividerSplitLine }}>
            {t('explainer')}
          </Divider>
          <div
            css={styles.explainer}
            dangerouslySetInnerHTML={{ __html: explanation }}
          ></div>
        </CardContent>        
      </Card>
    </ThemeProvider>
  )
}
