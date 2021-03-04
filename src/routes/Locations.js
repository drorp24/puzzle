/** @jsxImportSource @emotion/react */
import { useSelector } from 'react-redux'

import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'

import { FormattedMessage } from 'react-intl'

import Editor from '../editor/Editor'
import Table from '../table/Table'
import Map from '../map/Map'
import noScrollbar from '../styling/noScrollbar'

const heights = {
  search: 6,
  editor: 50,
}
const Locations = () => {
  const { relations } = useSelector(store => store.app.view)
  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '50% 50%',
      overflow: 'scroll',
      ...noScrollbar,
    },
    paper: {
      height: '100%',
      zIndex: '401',
      overflow: 'hidden',
    },
    input: {
      height: `${heights.search}%`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 1.5rem',
    },
    editor: {
      height: relations ? `${100 - heights.search}%` : `${heights.editor}%`,
      transition: 'height 0.7s',
      padding: '1rem',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    table: {
      height: `${100 - heights.search - heights.editor}%`,
      padding: '0 1rem',
    },
    map: {},
  }

  return (
    <div css={styles.container}>
      <Paper square elevation={4} css={styles.paper}>
        <div css={styles.input}>
          <div>
            <FormattedMessage id="fileId" />
          </div>
          <div>
            <FormattedMessage id="userId" />
          </div>
        </div>
        <Divider />
        <div css={styles.editor}>
          <Editor />
        </div>
        <Divider />
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
