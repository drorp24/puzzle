/** @jsxImportSource @emotion/react */
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocale, capitalize } from '../utility/appUtilities'

import Paper from '@material-ui/core/Paper'

import FileSelect from '../content/FileSelect'
import InfoSelect from '../content/InfoSelect'
import Editor from '../editor/Editor'
import Table from '../table/Table'
import Map from '../map/Map'
import noScrollbar from '../styling/noScrollbar'

const heights = {
  search: 6,
  gap: 4,
  table: 40,
}
const searchHeight = heights.search + heights.gap
const fullHeight = 100 - searchHeight

const Locations = () => {
  const relations = useSelector(store => store.app.view.relations)
  const { locale, placement } = useLocale()
  const [info, setInfo] = useState(['text' /* , 'table' */])

  const tableHeight = info.includes('text')
    ? info.includes('table')
      ? heights.table
      : 0
    : info.includes('table')
    ? fullHeight
    : 0

  const tableTop = 100 - tableHeight

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
      position: 'relative',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateRows: `${heights.gap / 2}vh ${heights.search}vh ${
        heights.gap / 2
      }vh ${fullHeight}vh`,
      [`padding${capitalize(placement)}`]: '1rem',
      backgroundColor: `${theme.palette.background.backdrop} !important`,
    }),
    input: theme => ({
      height: `${heights.search}vh`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: theme.palette.border,
      borderRadius: '3px',
      padding: '0 0.75rem',
      backgroundColor: theme.palette.background.paper,
      zIndex: 1,
      textTransform: 'capitalize',
      fontSize: locale === 'he' ? '1rem' : '0.8125rem',
    }),
    editor: theme => ({
      height: `${fullHeight}vh`,
      transition: 'height 0.7s',
      border: theme.palette.border,
      lineHeight: /* relations ? '5' : */ '3.5',
      padding: '0 1rem',
      backgroundColor: theme.palette.background.paper,
      zIndex: 0,
    }),
    table: theme => ({
      position: 'absolute !important',
      height: `${fullHeight}vh`,
      transform: `translateY(${tableTop}vh)`,
      transition: 'transform 0.5s',
      width: 'calc(100% - 1rem)',
      border: theme.palette.border,
      padding: '0 1rem',
      backgroundColor: theme.palette.background.paper,
      zIndex: 0,
    }),
    map: {},
  }

  return (
    <div css={styles.container}>
      <Paper square elevation={4} css={styles.paper}>
        <div></div>
        <div css={styles.input}>
          <FileSelect />
          <InfoSelect {...{ info, setInfo }} />
        </div>
        <div></div>
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
