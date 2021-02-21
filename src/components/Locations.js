/** @jsxImportSource @emotion/react */
import { useSelector } from 'react-redux'

import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'

import Editor from '../editor/Editor'
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
      gridTemplateColumns: '40% 60%',
      overflow: 'scroll',
    },
    paper: {
      height: '100%',
      zIndex: '401',
    },
    input: {
      height: `${heights.search}%`,
    },
    editor: {
      height: relations ? `${100 - heights.search}%` : `${heights.editor}%`,
      transition: 'height 0.3s',
    },
    table: {
      height: `${100 - heights.search - heights.editor}%`,
      display: relations ? 'none' : 'flex',
    },
    map: {},
  }

  return (
    <div css={styles.container}>
      <Paper elevation={4} css={styles.paper}>
        <div css={styles.input}>input</div>
        <Divider />
        <div css={styles.editor}>
          <Editor />
          <Divider />
        </div>
        <div css={styles.table}>table</div>
      </Paper>
      <div css={styles.map}>
        <Map />
      </div>
    </div>
  )
}

export default Locations
