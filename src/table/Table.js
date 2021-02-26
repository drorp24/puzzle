/** @jsxImportSource @emotion/react */
import { memo, useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectContent, updateTag, selectIds } from '../redux/content'
import { useDirection } from '../utility/appUtilities'

import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import ToggleButton from '@material-ui/core/ToggleButton'
import ToggleButtonGroup from '@material-ui/core/ToggleButtonGroup'
import Yes from '@material-ui/icons/ThumbUpOutlined'
import Maybe from '@material-ui/icons/HelpOutlineOutlined'
import No from '@material-ui/icons/ThumbDownOutlined'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import Info from '@material-ui/icons/InfoOutlined'
import IconButton from '@material-ui/core/IconButton'

import entityTypes from '../editor/entityTypes'
import { EntityDetails } from '../editor/EntityDetails'

import usePixels from '../utility/usePixels'
import noScrollbar from '../styling/noScrollbar'

const styles = {
  autoSizer: {
    width: '100%',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '7% 23% auto 7% 7% 23%',
    columnGap: '0.5rem',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  even: {
    backgroundColor: '#eee',
  },
  odd: {},
  header: {
    fontWeight: '500',
  },
  rowHover: {
    border: '3px solid rgba(0, 0, 0, 0.2)',
  },
  cell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    // border: '1px solid',
  },
  icon: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '3rem',
    width: '3rem',
    alignSelf: 'center',
  },
  typeIcon: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '0 1rem',
  },
  tagHeader: {
    textAlign: 'center',
  },
  buttonGroup: {
    height: '2rem',
    justifySelf: 'end',
    alignSelf: 'center',
    padding: '0 1rem',
    // border: '1px solid',
  },
  selected: {
    backgroundColor: 'rgba(0, 0, 0, 0.6) !important',
    color: '#fff !important',
  },
  unselected: {
    color: 'rgba(0, 0, 0, 0.1) !important',
  },
  tagIcon: {
    fontSize: '1rem',
  },
  table1: theme => ({
    // temporary right-to-left patch, waiting for
    // https://github.com/bvaughn/react-virtualized/issues/454
    '& .ReactVirtualized__Table__headerRow': {
      flip: false,
      paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined,
    },
  }),
}

// ToDo: make ToggleButtonGroup responsive

const Table = () => {
  // the 'entities' selector maintains entities' sort order
  const { entities, selected } = useSelector(selectContent)
  const ids = useSelector(selectIds)
  const itemCount = entities.length
  const itemSize = usePixels(4)
  const direction = useDirection()
  const outerRef = useRef()

  useEffect(() => {
    const scrollTo = entityId => {
      const index = ids.findIndex(id => id === entityId)
      const top = index * itemSize
      outerRef.current.scrollTo({ top, behavior: 'smooth' })
    }
    if (selected) scrollTo(selected)
  }, [ids, itemSize, selected])

  return (
    <AutoSizer style={styles.autoSizer}>
      {({ height, width }) => {
        height -= itemSize
        return (
          <>
            <Header
              style={{ ...styles.row, ...styles.header, height: itemSize }}
            />
            <List
              outerRef={outerRef}
              css={noScrollbar}
              {...{ height, width, itemCount, itemSize, direction }}
            >
              {Row}
            </List>
          </>
        )
      }}
    </AutoSizer>
  )
}

const Row = memo(({ index, style }) => {
  const { entities, selected } = useSelector(selectContent)
  const dispatch = useDispatch()

  const entity = entities[index]
  const {
    type,
    data: { id, score, geoLocation, tag: currentTag },
    entityRanges,
  } = entity

  const [tag, setTag] = useState(currentTag)

  const { icon, color } = entityTypes[type]
  const { text } = entityRanges[0]
  const place = geoLocation?.properties?.name || ''
  const bg = index % 2 ? styles.odd : styles.even
  const line = { lineHeight: `${style.height}px` }
  const selectedEntity =
    id === selected ? { border: '5px solid lightblue' } : {}

  const selectionState = {
    yes: 'unselected',
    maybe: 'unselected',
    no: 'unselected',
  }
  selectionState[tag] = 'selected'

  const tagClick = id => (e, tag) => {
    dispatch(updateTag({ id, tag }))
    setTag(tag)
  }

  return (
    <div
      css={{
        ...style,
        ...styles.row,
        ...bg,
        ...line,
        ...selectedEntity,
      }}
    >
      <Cell
        value={type}
        icon={icon}
        cellStyle={{ ...styles.typeIcon, color }}
      />
      <Cell value={text} />
      <Cell value={place} />
      <Cell value={score} />
      <Tooltip
        title={<EntityDetails {...{ entity }} />}
        arrow
        TransitionComponent={Zoom}
        disableFocusListener={true}
        placement="right"
      >
        <IconButton css={styles.icon}>
          <Info />
        </IconButton>
      </Tooltip>

      <ToggleButtonGroup
        value={tag}
        exclusive
        onChange={tagClick(id)}
        size="small"
        css={styles.buttonGroup}
      >
        <ToggleButton
          value="yes"
          title="Yes"
          css={styles[selectionState['yes']]}
        >
          <Yes css={styles.tagIcon} />
        </ToggleButton>
        <ToggleButton
          value="maybe"
          title="Maybe"
          css={styles[selectionState['maybe']]}
        >
          <Maybe css={styles.tagIcon} />
        </ToggleButton>
        <ToggleButton value="no" title="No" css={styles[selectionState['no']]}>
          <No css={styles.tagIcon} />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  )
})

const Header = memo(({ style }) => {
  const line = { lineHeight: `${style.height}px` }
  return (
    <div style={{ ...style, ...line }}>
      <Cell value="Type" />
      <Cell value="Entity" />
      <Cell value="Place" />
      <Cell value="Score" cellStyle={{ textAlign: 'right' }} />
      <Cell value="Info" cellStyle={{ textAlign: 'center' }} />
      <Cell value="Tag" cellStyle={styles.tagHeader} />
    </div>
  )
})

const Cell = ({ value, icon, cellStyle }) => {
  const alignment = typeof value === 'number' ? { textAlign: 'right' } : {}
  return (
    <div style={{ ...styles.cell, ...cellStyle, ...alignment }} title={value}>
      {icon || value}
    </div>
  )
}

export default Table
