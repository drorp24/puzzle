/** @jsxImportSource @emotion/react */
import { useSelector } from 'react-redux'

import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'

import Editor from '../editor/Editor'
import Table from '../table/Table'
import Map from '../map/Map'

const heights = {
  search: 6,
  editor: 57,
}
const Locations = () => {
  const { relations } = useSelector(store => store.app.view)
  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '45% 55%',
      overflow: 'scroll',
    },
    paper: {
      height: '100%',
      zIndex: '401',
      overflow: 'hidden',
    },
    input: {
      height: `${heights.search}%`,
      padding: '1rem',
    },
    editor: {
      height: relations ? `${100 - heights.search}%` : `${heights.editor}%`,
      transition: 'height 0.7s',
      padding: '1rem',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    table: {
      height: `${100 - heights.search - heights.editor}%`,
      padding: '1rem',
    },
    map: {},
  }

  return (
    <div css={styles.container}>
      <Paper elevation={4} css={styles.paper}>
        <div css={styles.input}>search</div>
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
