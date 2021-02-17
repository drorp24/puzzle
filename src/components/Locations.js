/** @jsxImportSource @emotion/react */
import { useSelector } from 'react-redux'

import Editor from '../editor/Editor'

const Locations = () => {
  const { relations } = useSelector(store => store.app.view)
  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '40% 60%',
      overflow: 'hidden', // ToDo: remove
    },

    input: {
      border: '1px solid',
      height: '10%',
    },
    editor: {
      border: '1px solid',
      height: relations ? '90%' : '50%',
      transition: 'height 0.5s',
    },
    table: {
      border: '1px solid',
      height: relations ? '0' : '40%',
    },
    map: {
      border: '1px solid',
    },
  }

  return (
    <div css={styles.container}>
      <div>
        <div css={styles.input}>input</div>
        <div css={styles.editor}>
          <Editor />
        </div>
        {relations && <div css={styles.table}>table</div>}
      </div>
      <div css={styles.map}>map</div>
    </div>
  )
}

export default Locations
