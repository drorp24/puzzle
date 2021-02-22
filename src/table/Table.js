/** @jsxImportSource @emotion/react */
import { memo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectContent, updateTag } from '../redux/content'
import { useDirection } from '../utility/appUtilities'

import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import IconButton from '@material-ui/core/IconButton'
import Yes from '@material-ui/icons/ThumbUpOutlined'
import Maybe from '@material-ui/icons/HelpOutlineOutlined'
import No from '@material-ui/icons/ThumbDownOutlined'
import red from '@material-ui/core/colors/red'
import lightGreen from '@material-ui/core/colors/lightGreen'
import orange from '@material-ui/core/colors/orange'

import entityTypes from '../editor/entityTypes'

import usePixels from '../utility/usePixels'

const styles = {
  autoSizer: {
    width: '100%',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '7% 25% auto 10% 25%',
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
    // border: '1px solid',
  },
  typeIcon: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    textAlign: 'center',
  },
  tagCell: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    // border: '1px solid blue',
  },
  tagButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6) !important',
    // opacity: '0.5 !important',
    padding: '0.4rem !important',
    '&:hover': {
      opacity: '0.8',
    },
  },
  tagIcon: {
    fontSize: '1.35rem',
  },
  // flexContainer: {
  //   display: 'flex',
  //   alignItems: 'center',
  //   boxSizing: 'border-box',
  // },
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

  const { icon } = entityTypes[type]
  const { text } = entityRanges[0]
  const place = geoLocation?.properties?.name || ''
  const bg = index % 2 ? styles.odd : styles.even
  const line = { lineHeight: `${style.height}px` }

  const noOpacity = { opacity: 0 }
  const opacity = { yes: noOpacity, maybe: noOpacity, no: noOpacity }
  opacity[tag] = { opacity: 0.8 }

  const tagClick = ({ id, tag }) => e => {
    dispatch(updateTag({ id, tag }))
    setTag(tag)
  }

  return (
    <div style={{ ...style, ...styles.row, ...bg, ...line }}>
      <Cell value={type} icon={icon} cellStyle={styles.typeIcon} />
      <Cell value={text} />
      <Cell value={place} />
      <Cell value={score} />
      <div style={styles.tagCell}>
        <IconButton
          css={{ ...styles.tagButton, ...opacity.yes }}
          onClick={tagClick({ id, tag: 'yes' })}
        >
          <Yes style={{ ...styles.tagIcon, color: lightGreen[300] }} />
        </IconButton>
        <IconButton
          css={{ ...styles.tagButton, ...opacity.maybe }}
          onClick={tagClick({ id, tag: 'maybe' })}
        >
          <Maybe style={{ ...styles.tagIcon, color: orange['A200'] }} />
        </IconButton>
        <IconButton
          css={{ ...styles.tagButton, ...opacity.no }}
          onClick={tagClick({ id, tag: 'no' })}
        >
          <No style={{ ...styles.tagIcon, color: red['A200'] }} />
        </IconButton>
      </div>
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
      <Cell value={'Tag'} cellStyle={styles.tag} />
    </div>
  )
})

const Cell = ({ value, icon, cellStyle }) => {
  const alignment = typeof value === 'number' ? { textAlign: 'right' } : []
  return (
    <div style={{ ...styles.cell, ...cellStyle, ...alignment }} title={value}>
      {icon || value}
    </div>
  )
}

export default Table
