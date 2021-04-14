/** @jsxImportSource @emotion/react */
import { useSelector } from 'react-redux'
import { useLocale, capitalize } from '../utility/appUtilities'

import Paper from '@material-ui/core/Paper'

import FileSelect from '../content/FileSelect'
import Editor from '../editor/Editor'
import Table from '../table/Table'
import Map from '../map/Map'
import noScrollbar from '../styling/noScrollbar'

const heights = {
  search: 6,
  editor: 46,
  gap: 4,
}
const Locations = () => {
  const relations = useSelector(store => store.app.view.relations)
  const { locale, placement } = useLocale()

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '50% 50%',
      overflow: 'scroll',
      ...noScrollbar,
    },
    paper: theme => ({
      height: '100%',
      zIndex: '401',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      paddingTop: relations ? 0 : '1rem',
      [`padding${capitalize(placement)}`]: '1rem',
      backgroundColor: `${theme.palette.background.backdrop} !important`,
    }),
    input: theme => ({
      height: relations
        ? `${heights.search + heights.gap}%`
        : `${heights.search}%`,
      border: theme.palette.border,
      borderRadius: '3px',
      justifyContent: 'space-between',
      padding: '0 0.75rem',
      backgroundColor: theme.palette.background.paper,
      zIndex: 1,
      textTransform: 'capitalize',
      fontSize: locale === 'he' ? '1rem' : '0.8125rem',
    }),
    editor: theme => ({
      height: relations
        ? `${100 - heights.search - heights.gap}%`
        : `${heights.editor}%`,
      transition: 'height 0.7s',
      border: theme.palette.border,
      lineHeight: relations ? '5' : '3.5',
      padding: '0 1rem',
      backgroundColor: theme.palette.background.paper,
      zIndex: 0,
    }),
    table: theme => ({
      height: relations
        ? 0
        : `${100 - heights.search - heights.editor - heights.gap}%`,
      transition: 'height 0.7s',
      border: theme.palette.border,
      padding: '0 1rem',
      backgroundColor: theme.palette.background.paper,
      zIndex: 0,
    }),
    map: {},
  }

  // styles.paper[`padding${capitalize(placement)}`] = '1rem'

  return (
    <div css={styles.container}>
      <Paper square elevation={4} css={styles.paper}>
        <div css={styles.input}>
          <FileSelect />
        </div>
        <div css={styles.editor}>
          <Editor />
        </div>
        <div css={styles.table}>
          <Table />
        </div>
      </Paper>
      <div css={styles.map}>
        <Map />
      </div>
    </div>
  )
}

export default Locations
