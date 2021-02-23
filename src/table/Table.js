/** @jsxImportSource @emotion/react */
import { memo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectContent, updateTag } from '../redux/content'
import { useDirection } from '../utility/appUtilities'

import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import ToggleButton from '@material-ui/core/ToggleButton'
import ToggleButtonGroup from '@material-ui/core/ToggleButtonGroup'
import Yes from '@material-ui/icons/ThumbUpOutlined'
import Maybe from '@material-ui/icons/HelpOutlineOutlined'
import No from '@material-ui/icons/ThumbDownOutlined'

import entityTypes from '../editor/entityTypes'

import usePixels from '../utility/usePixels'

const styles = {
  autoSizer: {
    width: '100%',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '7% 23% auto 10% 27%',
    columnGap: '0.5rem',
    boxSizing: 'border-box',
  },
  even: {
    backgroundColor: '#eee',
  },
  odd: {},
  header: {
    fontWeight: '500',
  },
  cell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  table: theme => ({
    // temporary right-to-left patch, waiting for
    // https://github.com/bvaughn/react-virtualized/issues/454
    '& .ReactVirtualized__Table__headerRow': {
      flip: false,
      paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined,
    },
  }),
  // tableRow: {
  //   cursor: 'pointer',
  // },
  // tableRowHover: theme => ({
  //   '&:hover': {
  //     backgroundColor: theme.palette.grey[200],
  //   },
  // }),
  // tableCell: {
  //   flex: 1,
  // },
  // noClick: {
  //   cursor: 'initial',
  // },
}

// ToDo: ask Shay to include properties.name in the geoLocation when populated

const Table = () => {
  // the 'entities' selector maintains entities' sort order
  const { entities } = useSelector(selectContent)
  const itemCount = entities.length
  const itemSize = usePixels(4)
  const direction = useDirection()

  return (
    <AutoSizer style={styles.autoSizer}>
      {({ height, width }) => {
        height -= itemSize
        return (
          <>
            <Header
              style={{ ...styles.row, ...styles.header, height: itemSize }}
            />
            <List {...{ height, width, itemCount, itemSize, direction }}>
              {Row}
            </List>
          </>
        )
      }}
    </AutoSizer>
  )
}

const Row = memo(({ index, style }) => {
  const { entities } = useSelector(selectContent)
  const dispatch = useDispatch()

  const {
    type,
    data: { id, score, geoLocation, tag: currentTag },
    entityRanges,
  } = entities[index]

  const [tag, setTag] = useState(currentTag)

  const { icon, color } = entityTypes[type]
  const { text } = entityRanges[0]
  const place = geoLocation?.properties?.name || ''
  const bg = index % 2 ? styles.odd : styles.even
  const line = { lineHeight: `${style.height}px` }

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
    <div style={{ ...style, ...styles.row, ...bg, ...line }}>
      <Cell
        value={type}
        icon={icon}
        cellStyle={{ ...styles.typeIcon, color }}
      />
      <Cell value={text} />
      <Cell value={place} />
      <Cell value={score} />

      <ToggleButtonGroup
        value={tag}
        exclusive
        onChange={tagClick(id)}
        size="small"
        css={styles.buttonGroup}
      >
        <ToggleButton value="yes" css={styles[selectionState['yes']]}>
          <Yes css={styles.tagIcon} />
        </ToggleButton>
        <ToggleButton value="maybe" css={styles[selectionState['maybe']]}>
          <Maybe css={styles.tagIcon} />
        </ToggleButton>
        <ToggleButton value="no" css={styles[selectionState['no']]}>
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
      <Cell value={'Type'} cellStyle={styles.icon} />
      <Cell value={'Entity'} />
      <Cell value={'Place'} />
      <Cell value={'Score'} cellStyle={{ textAlign: 'right' }} />
      <Cell value={'Tag'} cellStyle={styles.tagHeader} />
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
