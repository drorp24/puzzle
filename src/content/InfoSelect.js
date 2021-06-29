/** @jsxImportSource @emotion/react */
import { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleBoundingPolygon, unSelectAllLocations } from '../redux/content'
import useTranslation from '../i18n/useTranslation'

import ToggleButton from '@material-ui/core/ToggleButton'
import ToggleButtonGroup from '@material-ui/core/ToggleButtonGroup'
import TextIcon from '@material-ui/icons/ChatOutlined'
import TableIcon from '@material-ui/icons/TableChartOutlined'
// import DoneAllIcon from '@material-ui/icons/DoneAll'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import CropDin from '@material-ui/icons/CropDin'

const styles = {
  infoSelection: {
    height: '75%',
  },
  buttonGroup: {
    height: '100%',
  },
  button: {
    '& svg': {
      fontSize: '1.2rem',
    },
  },
  deleteAll: {
    height: '80%',
    marginRight: '5px',
    cursor: 'pointer'
  }
}

const InfoSelect = ({ info, setInfo, heights, setListHeight }) => {
  const showBoundingPolygon = useSelector((store) => store.content.showBoundingPolygon)
  const file = useSelector((store) => store.content.file)
  const t = useTranslation()
  const timerRef = useRef()
  const dispatch = useDispatch()

  const handleInfoSelection = (event, newInfo) => {
    const listHeight = selection =>
      selection.includes('text')
        ? selection.includes('table')
          ? heights.table
          : heights.table
        : selection.includes('table')
        ? heights.full
        : heights.table

    const curListHeight = listHeight(info)
    const newListHeight = listHeight(newInfo)

    if (newListHeight < curListHeight) {
      timerRef.current = setTimeout(() => {
        setListHeight(newListHeight)
      }, 1000)
    } else {
      // clear pending shrink requests
      clearTimeout(timerRef.current)
      setListHeight(newListHeight)
    }

    setInfo(newInfo)
  }

  const handleToggleAllLocs  =() => {    
    dispatch(toggleBoundingPolygon())
  }

  const handleUnselectAll  =() => {    
    dispatch(unSelectAllLocations())    
  }
  return (
    <div css={styles.infoSelection}>
      <ToggleButtonGroup
        value={info}
        onChange={handleInfoSelection}
        size="small"
        css={styles.buttonGroup}>        
        <ToggleButton value="text" css={styles.button} title={t('text')}>
          <TextIcon css={styles.textIcon} />
        </ToggleButton>
        <ToggleButton value="table" css={styles.button} title={t('table')}>
          <TableIcon />
        </ToggleButton>
        <ToggleButton disabled={!file} selected={showBoundingPolygon} css={styles.button} title={t('bounding polygon')}>
          <CropDin css={styles.textIcon} onClick={handleToggleAllLocs}/>
        </ToggleButton>
      </ToggleButtonGroup>
      <DeleteOutlineIcon css={styles.deleteAll} onClick={handleUnselectAll}/>
    </div>
  )
}

export default InfoSelect
